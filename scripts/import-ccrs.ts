/**
 * Fast CCRS import: downloads each yearly CSV once, stream-parses with a
 * SoCal filter, and bulk-inserts in batches.
 *
 * Usage:
 *   npm run db:import                          # all years 2024-2026
 *   npm run db:import -- --years=2024,2025     # subset of years
 *   npm run db:import -- --years=2024 --limit=2000   # smoke test (limits rows per file)
 *   npm run db:import -- --batch=2000          # rows per INSERT chunk
 *   npm run db:import -- --redownload          # re-download cached CSVs
 *
 * Each year's rows are wiped first (cleanYear), so reruns are idempotent.
 */
import { db } from "../lib/db";
import { parse } from "csv-parse";
import {
	createReadStream,
	createWriteStream,
	existsSync,
	mkdirSync,
	statSync,
} from "fs";
import { once } from "events";
import { tmpdir } from "os";
import { join } from "path";

// SoCal county codes (sequential in CCRS, not FIPS)
const SOCAL_COUNTIES: Record<number, string> = {
	13: "Imperial",
	15: "Kern",
	19: "Los Angeles",
	30: "Orange",
	33: "Riverside",
	36: "San Bernardino",
	37: "San Diego",
	40: "San Luis Obispo",
	42: "Santa Barbara",
	56: "Ventura",
};
const SOCAL_CODES = new Set(Object.keys(SOCAL_COUNTIES).map(Number));

const BASE =
	"https://data.ca.gov/dataset/80c6a49d-c6b3-40ba-86d8-379c9741b4be/resource";
const FILES: Record<
	number,
	{ crashes: string; parties: string; victims: string }
> = {
	2024: {
		crashes: `${BASE}/f775df59-b89b-4f82-bd3d-8807fa3a22a0/download/crashes_2024.csv`,
		parties: `${BASE}/93892d36-017b-4a2a-bc0b-f1f385060b96/download/parties_2024.csv`,
		victims: `${BASE}/a36a0078-d7e1-4244-8337-0a59433c9b84/download/injuredwitnesspassengers_2024.csv`,
	},
	2025: {
		crashes: `${BASE}/9f4fc839-122d-4595-a146-43bc4ed16f46/download/crashes_2025.csv`,
		parties: `${BASE}/a2676918-a825-4b77-8e5c-6eadb38d6b1a/download/parties_2025.csv`,
		victims: `${BASE}/10184ea3-7411-42d8-87a6-17039b58f04b/download/injuredwitnesspassengers_2025.csv`,
	},
	2026: {
		crashes: `${BASE}/b8ce0ca4-b4e9-490d-b4d1-1f4ec48cbefb/download/crashes_2026.csv`,
		parties: `${BASE}/348a4266-bbb6-439f-b6c7-0018cc79f0fe/download/parties_2026.csv`,
		victims: `${BASE}/bbe0c38e-d0eb-4152-86e2-0b0895e66ba9/download/injuredwitnesspassengers_2026.csv`,
	},
};

// ---- CLI args ----
const argv = Object.fromEntries(
	process.argv.slice(2).map((a) => {
		const [k, v] = a.replace(/^--/, "").split("=");
		return [k, v ?? "true"];
	}),
);
const YEARS = String(argv.years ?? "2024,2025,2026")
	.split(",")
	.map(Number)
	.filter((y) => FILES[y]);
const LIMIT = argv.limit ? Number(argv.limit) : Infinity;
const BATCH = Number(argv.batch ?? 1000);
const REDOWNLOAD = argv.redownload === "true";
const DATA_DIR = String(argv["data-dir"] ?? join(tmpdir(), "calsafe-ccrs"));

// ---- formatting / progress ----
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");
const fmtMB = (b: number) => `${(b / 1048576).toFixed(1)}MB`;
function fmtDur(ms: number) {
	const s = Math.floor(ms / 1000);
	const p = (n: number) => String(n).padStart(2, "0");
	if (s < 60) return `${s}s`;
	const m = Math.floor(s / 60);
	if (m < 60) return `${m}:${p(s % 60)}`;
	return `${Math.floor(m / 60)}:${p(m % 60)}:${p(s % 60)}`;
}

class Meter {
	private t0 = Date.now();
	private last = 0;
	n = 0;
	constructor(
		private label: string,
		private total = 0,
	) {}
	add(k = 1) {
		this.n += k;
		const now = Date.now();
		if (now - this.last > 3000) {
			this.last = now;
			this.log(false);
		}
	}
	private log(final: boolean) {
		const el = Date.now() - this.t0;
		const rate = this.n / Math.max(el / 1000, 0.001);
		const pct =
			this.total > 0 ? ` ${(100 * (this.n / this.total)).toFixed(1)}%` : "";
		const eta =
			final || this.total <= 0 || this.n <= 0
				? ""
				: ` ETA ${fmtDur(((this.total - this.n) / rate) * 1000)}`;
		const total = this.total > 0 ? `/${fmtInt(this.total)}` : "";
		console.log(
			`[${this.label}] ${fmtInt(this.n)}${total}${pct} @ ${fmtInt(rate)}/s elapsed ${fmtDur(el)}${eta}${final ? " DONE" : ""}`,
		);
	}
	done() {
		this.log(true);
	}
}

// ---- value mappings (CCRS -> legacy schema) ----
const weatherMap: Record<string, string> = {
	CLEAR: "A",
	CLOUDY: "B",
	OVERCAST: "B",
	RAINING: "C",
	SNOWING: "D",
	FOG: "E",
	OTHER: "G",
	WIND: "H",
};
const dayOfWeekMap: Record<string, string> = {
	Sunday: "1",
	Monday: "2",
	Tuesday: "3",
	Wednesday: "4",
	Thursday: "5",
	Friday: "6",
	Saturday: "7",
};
const partyTypeMap: Record<string, string> = {
	Driver: "1",
	Pedestrian: "2",
	"Parked Vehicle": "3",
	Bicyclist: "4",
	Other: "5",
};
const injuryDegreeMap: Record<string, string> = {
	Killed: "1",
	SevereInjury: "2",
	VisibleInjury: "3",
	ComplaintOfPain: "4",
	PossibleInjury: "7",
	NoInjury: "0",
};

function weatherToCode(weather: string): string {
	const t = weather.trim().toUpperCase();
	for (const [key, val] of Object.entries(weatherMap)) {
		if (t.includes(key)) return val;
	}
	return "G";
}
function safeStr(val: unknown, fallback = ""): string {
	if (val === null || val === undefined) return fallback;
	const s = String(val).trim();
	return s === "" ? fallback : s;
}
function safeNum(val: unknown): number | null {
	if (val === null || val === undefined || val === "") return null;
	const n = Number(val);
	return isNaN(n) ? null : n;
}

// Crash timestamps arrive in whatever format CCRS currently uses (observed:
// ISO "YYYY-MM-DDTHH:MM:SS" and US "MM/DD/YYYY HH:MM"). Anything else, or any
// out-of-range component, yields nulls rather than a bad row.
function parseCrashDateTime(raw: string): {
	date: string | null;
	time: string | null;
} {
	const s = raw.trim();
	if (!s) return { date: null, time: null };
	const valid = (
		Y: string,
		Mo: string,
		D: string,
		h?: string,
		mi?: string,
		sec?: string,
	) => {
		if (Number(Mo) < 1 || Number(Mo) > 12 || Number(D) < 1 || Number(D) > 31)
			return null;
		const date = `${Y}-${Mo.padStart(2, "0")}-${D.padStart(2, "0")}`;
		let time: string | null = null;
		if (
			h !== undefined &&
			mi !== undefined &&
			Number(h) <= 23 &&
			Number(mi) <= 59
		) {
			time = `${h.padStart(2, "0")}:${mi}:${sec ?? "00"}`;
		}
		return { date, time };
	};
	let m = s.match(
		/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/,
	);
	if (m)
		return (
			valid(m[1], m[2], m[3], m[4], m[5], m[6]) ?? { date: null, time: null }
		);
	m = s.match(
		/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?: (\d{1,2}):(\d{2})(?::(\d{2}))?)?/,
	);
	if (m)
		return (
			valid(m[3], m[1], m[2], m[4], m[5], m[6]) ?? { date: null, time: null }
		);
	return { date: null, time: null };
}

// Count of rows whose date field was unparseable (reported per year).
let badDates = 0;
// Truncate to fit CHAR(1) / CHAR(2) columns (CCRS sometimes has longer codes).
function c1(val: unknown, fallback: string | null = "N"): string | null {
	const s = safeStr(val);
	return s ? s.charAt(0) : fallback;
}
// Header-tolerant field access: matches "Collision Id" and "CollisionId" alike.
const normKey = (k: string) =>
	k
		.trim()
		.toLowerCase()
		.replace(/[\s_]+/g, "");
function get(
	row: Record<string, unknown>,
	cache: Map<string, string>,
	...names: string[]
): string {
	for (const n of names) {
		const actual = cache.get(normKey(n));
		if (actual !== undefined) {
			const v = row[actual];
			if (v !== null && v !== undefined && String(v) !== "")
				return String(v).trim();
		}
	}
	return "";
}
function getNum(
	row: Record<string, unknown>,
	cache: Map<string, string>,
	...names: string[]
): number | null {
	return safeNum(get(row, cache, ...names) || undefined);
}

// ---- download (streamed, with progress + resume) ----
async function fetchRetry(url: string, attempts = 3): Promise<Response> {
	let lastErr: unknown;
	for (let i = 0; i < attempts; i++) {
		try {
			const res = await fetch(url);
			if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
			return res;
		} catch (e) {
			lastErr = e;
			console.log(
				`  download attempt ${i + 1}/${attempts} failed: ${e}. retrying...`,
			);
			await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
		}
	}
	throw lastErr;
}

async function download(
	url: string,
	dest: string,
	label: string,
): Promise<void> {
	if (!REDOWNLOAD && existsSync(dest) && statSync(dest).size > 0) {
		console.log(
			`[${label}] reusing cached ${fmtMB(statSync(dest).size)} (${dest})`,
		);
		return;
	}
	const res = await fetchRetry(url);
	const total = Number(res.headers.get("content-length") ?? 0);
	const file = createWriteStream(dest);
	const reader = res.body!.getReader();
	const meter = new Meter(`${label} ↓`, total);
	let got = 0;
	try {
		for (;;) {
			const { done, value } = await reader.read();
			if (done) break;
			got += value.length;
			if (!file.write(value)) await once(file, "drain");
			meter.add(value.length);
			if (total > 0) {
				// show MB progress on one updating line via periodic logs instead
			}
		}
	} finally {
		reader.releaseLock();
	}
	file.end();
	await once(file, "close");
	meter.done();
	console.log(`[${label}] downloaded ${fmtMB(got)} -> ${dest}`);
}

// ---- streaming CSV ----
async function* readCsv(
	path: string,
	maxRows: number,
): AsyncGenerator<{
	row: Record<string, unknown>;
	keyCache: Map<string, string>;
}> {
	const parser = createReadStream(path).pipe(
		parse({
			columns: true,
			trim: true,
			skip_empty_lines: true,
			relax_quotes: true,
			relax_column_count: true,
		}),
	);
	let keyCache: Map<string, string> | null = null;
	let loggedHeaders = false;
	let n = 0;
	try {
		for await (const rec of parser as AsyncIterable<Record<string, unknown>>) {
			if (!keyCache) {
				keyCache = new Map(Object.keys(rec).map((k) => [normKey(k), k]));
			}
			if (!loggedHeaders) {
				loggedHeaders = true;
				console.log(
					`  headers: ${Object.keys(rec).slice(0, 8).join(" | ")} ... (${Object.keys(rec).length} cols)`,
				);
			}
			yield { row: rec, keyCache };
			if (++n >= maxRows) break;
		}
	} finally {
		parser.destroy();
	}
}

// libsql value type for inserts
type Val = string | number | null;

// ---- batched executor: many single-row statements per HTTP round trip ----
const STATEMENTS_PER_BATCH = 1000;
async function execBatch(
	label: string,
	stmts: { sql: string; args: Val[] }[],
): Promise<{ rows: Record<string, unknown>[] }[]> {
	const out: { rows: Record<string, unknown>[] }[] = [];
	for (let i = 0; i < stmts.length; i += STATEMENTS_PER_BATCH) {
		const slice = stmts.slice(i, i + STATEMENTS_PER_BATCH);
		try {
			const results = await db.batch(slice);
			for (const res of results)
				out.push({ rows: res.rows as Record<string, unknown>[] });
		} catch (e) {
			throw new Error(
				`${label} failed (statements ${i}-${i + slice.length}): ${e}`,
			);
		}
	}
	return out;
}

// ---- bulk insert helper built on execBatch ----
async function insertBatch(
	table: string,
	cols: string[],
	rows: Val[][],
	returning?: string,
): Promise<Record<string, unknown>[]> {
	if (rows.length === 0) return [];
	const single = `INSERT INTO ${table} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})${returning ? ` RETURNING ${returning}` : ""}`;
	const results = await execBatch(
		`insert into ${table}`,
		rows.map((r) => ({ sql: single, args: r })),
	);
	return results.flatMap((r) => r.rows);
}

// ---- idempotent reruns: wipe one year's rows (children first) ----
// Deletes run in small chunks: a single giant DELETE on a full table holds
// the HTTP round trip open past the client's response timeout (observed on
// low-power hardware). Chunking keeps every statement fast.
const DELETE_CHUNK = 10000;
async function deleteChunked(
	table: string,
	where: string,
	args: Val[],
): Promise<number> {
	let deleted = 0;
	for (;;) {
		const res = await db.execute({
			sql: `DELETE FROM ${table} WHERE rowid IN (SELECT rowid FROM ${table} WHERE ${where} LIMIT ${DELETE_CHUNK})`,
			args,
		});
		const n = res.rowsAffected ?? 0;
		deleted += n;
		if (n === 0) break;
	}
	return deleted;
}

async function cleanYear(year: number): Promise<void> {
	const steps: [string, string, Val[]][] = [
		[
			"victims",
			"case_id IN (SELECT case_id FROM accidents WHERE accident_year = ?)",
			[year],
		],
		[
			"parties",
			"case_id IN (SELECT case_id FROM accidents WHERE accident_year = ?)",
			[year],
		],
		["accidents", "accident_year = ?", [year]],
		["location", "location_id NOT IN (SELECT location_id FROM accidents)", []],
		["severity", "severity_id NOT IN (SELECT severity_id FROM accidents)", []],
		[
			"environment",
			"environment_id NOT IN (SELECT environment_id FROM accidents)",
			[],
		],
	];
	for (const [table, where, args] of steps) {
		const n = await deleteChunked(table, where, args);
		if (n > 0) console.log(`[${year}] cleaned ${fmtInt(n)} rows from ${table}`);
	}
}

const LOC_COLS = [
	"primary_rd",
	"secondary_rd",
	"city",
	"county",
	"point_x",
	"point_y",
];
const SEV_COLS = [
	"collision_severity",
	"number_killed",
	"number_injured",
	"count_severe_inj",
	"count_visible_inj",
	"count_complaint_pain",
];
const ENV_COLS = [
	"weather_1",
	"road_surface",
	"road_cond_1",
	"lighting",
	"state_hwy_ind",
];
const ACC_COLS = [
	"case_id",
	"accident_year",
	"collision_date",
	"collision_time",
	"location_id",
	"severity_id",
	"environment_id",
	"hit_and_run",
	"type_of_collision",
	"pedestrian_accident",
	"bicycle_accident",
	"motorcycle_accident",
	"truck_accident",
	"alcohol_involved",
	"day_of_week",
];
const PARTY_COLS = [
	"case_id",
	"party_number",
	"party_type",
	"at_fault",
	"party_sex",
	"party_age",
	"party_sobriety",
	"party_drug_physical",
	"party_safety_equip_1",
	"finan_respons",
	"vehicle_year",
	"vehicle_make",
	"stwd_vehicle_type",
	"inattention",
	"race",
	"move_pre_acc",
];
const VICTIM_COLS = [
	"case_id",
	"victim_role",
	"victim_sex",
	"victim_age",
	"victim_degree_of_injury",
	"victim_seating_position",
	"victim_safety_equip_1",
	"victim_ejected",
];

interface CrashAccum {
	loc: Val[];
	sev: Val[];
	env: Val[];
	acc: Val[];
	id: number;
}

function transformCrash(
	row: Record<string, unknown>,
	keyCache: Map<string, string>,
	year: number,
): CrashAccum | null {
	const countyCode = Number(get(row, keyCache, "County Code", "CountyCode"));
	if (!SOCAL_CODES.has(countyCode)) return null;
	if (get(row, keyCache, "IsDeleted").toLowerCase() === "true") return null;
	const collisionId = safeNum(
		get(row, keyCache, "Collision Id", "CollisionId"),
	);
	if (collisionId === null) return null;

	const countyName = SOCAL_COUNTIES[countyCode];
	const numKilled = getNum(row, keyCache, "NumberKilled") || 0;
	const numInjured = getNum(row, keyCache, "NumberInjured") || 0;
	let severityCode = "5";
	if (numKilled > 0) severityCode = "1";
	else if (numInjured >= 4) severityCode = "2";
	else if (numInjured >= 1) severityCode = "3";

	const { date: crashDate, time: stampTime } = parseCrashDateTime(
		get(row, keyCache, "Crash Date Time", "CrashDateTime"),
	);
	let crashTime = stampTime;
	if (!crashTime) {
		const timeDesc = get(
			row,
			keyCache,
			"Crash Time Description",
			"CrashTimeDescription",
		);
		if (/^\d{3,4}$/.test(timeDesc)) {
			const t = timeDesc.padStart(4, "0");
			const hh = Number(t.slice(0, 2));
			const mm = Number(t.slice(2));
			if (hh <= 23 && mm <= 59) crashTime = `${t.slice(0, 2)}:${t.slice(2)}:00`;
		}
	}
	if (!crashDate) badDates++;

	const hitRunRaw = get(row, keyCache, "HitRun");
	const hitAndRun = hitRunRaw === "M" || hitRunRaw === "F" ? hitRunRaw : "N";

	return {
		id: collisionId,
		loc: [
			get(row, keyCache, "PrimaryRoad").slice(0, 50) || null,
			get(row, keyCache, "SecondaryRoad").slice(0, 50) || null,
			get(row, keyCache, "City Name", "CityName").slice(0, 30) || null,
			countyName,
			getNum(row, keyCache, "Longitude"), // point_x = longitude
			getNum(row, keyCache, "Latitude"), // point_y = latitude
		],
		sev: [severityCode, numKilled, numInjured, 0, 0, 0],
		env: [
			weatherToCode(get(row, keyCache, "Weather 1", "Weather1") || "N"),
			c1(get(row, keyCache, "RoadwaySurfaceCode")),
			"H",
			c1(get(row, keyCache, "LightingCode")),
			get(row, keyCache, "IsHighwayRelated").toLowerCase() === "true"
				? "Y"
				: "N",
		],
		acc: [
			collisionId,
			year,
			crashDate,
			crashTime,
			-1, // location_id (patched after RETURNING)
			-1, // severity_id
			-1, // environment_id
			hitAndRun,
			c1(get(row, keyCache, "Collision Type Code", "CollisionTypeCode"), "O"),
			"N",
			"N",
			"N",
			"N", // ped/bike/moto/truck flags patched later
			"N", // alcohol patched later
			c1(dayOfWeekMap[get(row, keyCache, "Day Of Week", "DayOfWeek")]),
		],
	};
}

async function flushCrashChunk(chunk: CrashAccum[]): Promise<void> {
	// Each batch is atomic; a failed chunk aborts the run (reset via db:setup, then rerun).
	const locIds = (
		await insertBatch(
			"location",
			LOC_COLS,
			chunk.map((c) => c.loc),
			"location_id",
		)
	).map((r) => r.location_id);
	const sevIds = (
		await insertBatch(
			"severity",
			SEV_COLS,
			chunk.map((c) => c.sev),
			"severity_id",
		)
	).map((r) => r.severity_id);
	const envIds = (
		await insertBatch(
			"environment",
			ENV_COLS,
			chunk.map((c) => c.env),
			"environment_id",
		)
	).map((r) => r.environment_id);
	const accRows = chunk.map((c, i) => {
		const a = [...c.acc];
		a[4] = locIds[i] as number;
		a[5] = sevIds[i] as number;
		a[6] = envIds[i] as number;
		return a;
	});
	await insertBatch("accidents", ACC_COLS, accRows);
}

interface PartyFlags {
	ped: string;
	bike: string;
	moto: string;
	truck: string;
	alc: string;
	cnt: number;
}

async function importYear(year: number): Promise<void> {
	console.log(`\n===== ${year} =====`);
	const files = FILES[year];
	if (!files) throw new Error(`No CCRS file URLs configured for ${year}`);
	mkdirSync(DATA_DIR, { recursive: true });
	const paths = {
		crashes: join(DATA_DIR, `crashes_${year}.csv`),
		parties: join(DATA_DIR, `parties_${year}.csv`),
		victims: join(DATA_DIR, `victims_${year}.csv`),
	};

	await download(files.crashes, paths.crashes, `${year}/crashes`);
	await download(files.parties, paths.parties, `${year}/parties`);
	await download(files.victims, paths.victims, `${year}/victims`);

	// Idempotent reruns: wipe this year's rows first (cheap on first run).
	console.log(`[${year}] cleaning any existing rows for idempotent rerun...`);
	await cleanYear(year);

	const socalIds = new Set<number>();
	{
		// ---- crashes ----
		console.log(`[${year}/crashes] parsing + inserting...`);
		const parseMeter = new Meter(`${year}/crashes parse`);
		const insertMeter = new Meter(`${year}/crashes insert`);
		let chunk: CrashAccum[] = [];
		let kept = 0;
		badDates = 0;
		for await (const { row, keyCache } of readCsv(paths.crashes, LIMIT)) {
			parseMeter.add();
			const t = transformCrash(row, keyCache, year);
			if (!t) continue;
			kept++;
			socalIds.add(t.id);
			chunk.push(t);
			if (chunk.length >= BATCH) {
				await flushCrashChunk(chunk);
				insertMeter.add(chunk.length);
				chunk = [];
			}
		}
		if (chunk.length > 0) {
			await flushCrashChunk(chunk);
			insertMeter.add(chunk.length);
		}
		parseMeter.done();
		insertMeter.done();
		console.log(`[${year}/crashes] kept ${fmtInt(kept)} SoCal crashes`);
		if (badDates > 0) {
			console.log(
				`[${year}/crashes] WARNING: ${fmtInt(badDates)} rows had unparseable dates (stored as NULL)`,
			);
		}

		// ---- parties ----
		console.log(`[${year}/parties] parsing + inserting...`);
		const pParse = new Meter(`${year}/parties parse`);
		const pInsert = new Meter(`${year}/parties insert`);
		const flags = new Map<number, PartyFlags>();
		let pChunk: Val[][] = [];
		const flushParties = async () => {
			if (pChunk.length === 0) return;
			await insertBatch("parties", PARTY_COLS, pChunk);
			pInsert.add(pChunk.length);
			pChunk = [];
		};
		for await (const { row, keyCache } of readCsv(paths.parties, LIMIT)) {
			pParse.add();
			const cid = safeNum(get(row, keyCache, "CollisionId", "Collision Id"));
			if (cid === null || !socalIds.has(cid)) continue;
			const pType = get(row, keyCache, "PartyType");
			const vehDesc = get(row, keyCache, "Vehicle1TypeDesc").toLowerCase();
			const sob1 = get(row, keyCache, "SobrietyDrugPhysicalCode1");
			const f = flags.get(cid) ?? {
				ped: "N",
				bike: "N",
				moto: "N",
				truck: "N",
				alc: "N",
				cnt: 0,
			};
			if (pType === "Pedestrian") f.ped = "Y";
			if (pType === "Bicyclist") f.bike = "Y";
			if (vehDesc.includes("motorcycle")) f.moto = "Y";
			if (vehDesc.includes("truck")) f.truck = "Y";
			if (/^[BCD]$/.test(sob1)) f.alc = "Y";
			f.cnt++;
			flags.set(cid, f);
			pChunk.push([
				cid,
				getNum(row, keyCache, "PartyNumber"),
				c1(partyTypeMap[pType], "5"),
				get(row, keyCache, "IsAtFault").toLowerCase() === "true" ? "Y" : "N",
				c1(get(row, keyCache, "GenderCode"), null),
				getNum(row, keyCache, "StatedAge"),
				c1(sob1, null),
				c1(get(row, keyCache, "SobrietyDrugPhysicalCode2"), null),
				c1(get(row, keyCache, "SafetyEquipmentCode"), null),
				"N",
				getNum(row, keyCache, "Vehicle1Year"),
				get(row, keyCache, "Vehicle1Make").slice(0, 50) || null,
				c1(get(row, keyCache, "Vehicle1TypeId"), null),
				"N",
				c1(get(row, keyCache, "RaceCode"), null),
				c1(get(row, keyCache, "MovementPrecCollCode"), null),
			]);
			if (pChunk.length >= BATCH) await flushParties();
		}
		await flushParties();
		pParse.done();
		pInsert.done();

		// ---- victims ----
		console.log(`[${year}/victims] parsing + inserting...`);
		const vParse = new Meter(`${year}/victims parse`);
		const vInsert = new Meter(`${year}/victims insert`);
		let vChunk: Val[][] = [];
		const flushVictims = async () => {
			if (vChunk.length === 0) return;
			await insertBatch("victims", VICTIM_COLS, vChunk);
			vInsert.add(vChunk.length);
			vChunk = [];
		};
		for await (const { row, keyCache } of readCsv(paths.victims, LIMIT)) {
			vParse.add();
			const cid = safeNum(get(row, keyCache, "CollisionId", "Collision Id"));
			if (cid === null || !socalIds.has(cid)) continue;
			const role = get(row, keyCache, "InjuredPersonType");
			const ejected = get(row, keyCache, "Ejected");
			vChunk.push([
				cid,
				role === "Driver"
					? "1"
					: role === "Passenger"
						? "2"
						: role === "Pedestrian"
							? "3"
							: role === "Bicyclist"
								? "4"
								: "5",
				c1(get(row, keyCache, "Gender"), null),
				getNum(row, keyCache, "StatedAge"),
				c1(injuryDegreeMap[get(row, keyCache, "ExtentOfInjuryCode")], "0"),
				get(row, keyCache, "SeatPosition") === "Driver" ? "1" : "2",
				c1(get(row, keyCache, "SafetyEquipmentCode"), null),
				ejected === "NotEjected"
					? "0"
					: ejected === "FullyEjected"
						? "1"
						: ejected === "PartiallyEjected"
							? "2"
							: "N",
			]);
			if (vChunk.length >= BATCH) await flushVictims();
		}
		await flushVictims();
		vParse.done();
		vInsert.done();

		// ---- flag backfill: one UPDATE per crash with parties (batched) ----
		console.log(
			`[${year}] backfilling flags for ${fmtInt(flags.size)} crashes...`,
		);
		const t0 = Date.now();
		const updateMeter = new Meter(`${year}/backfill`);
		const flagSql = `UPDATE accidents SET pedestrian_accident = ?, bicycle_accident = ?, motorcycle_accident = ?, truck_accident = ?, alcohol_involved = ? WHERE case_id = ?`;
		const flagStmts = Array.from(flags.entries()).map(([id, f]) => ({
			sql: flagSql,
			args: [f.ped, f.bike, f.moto, f.truck, f.alc, id] as Val[],
		}));
		for (let i = 0; i < flagStmts.length; i += STATEMENTS_PER_BATCH) {
			await execBatch(
				`backfill ${year}`,
				flagStmts.slice(i, i + STATEMENTS_PER_BATCH),
			);
			updateMeter.add(Math.min(STATEMENTS_PER_BATCH, flagStmts.length - i));
		}
		updateMeter.done();
		console.log(`[${year}] backfill done in ${fmtDur(Date.now() - t0)}`);
	}
	console.log(`===== ${year} complete: ${fmtInt(socalIds.size)} crashes =====`);
}

async function main() {
	console.log(
		`Importing years: ${YEARS.join(", ")} (batch=${BATCH}, limit=${LIMIT === Infinity ? "none" : LIMIT})`,
	);
	console.log(`Cache dir: ${DATA_DIR}`);
	const t0 = Date.now();
	for (const year of YEARS) {
		await importYear(year);
	}
	console.log(`\nAll done in ${fmtDur(Date.now() - t0)}.`);
	db.close();
}

main().catch((err) => {
	console.error("Import failed:", err);
	db.close();
	process.exit(1);
});
