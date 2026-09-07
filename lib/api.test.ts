import { describe, it, expect, vi, afterEach } from "vitest";
import { getSearchParams, fetchAccidents } from "./api";
import { DEFAULT_FILTERS, DEFAULT_CONDITIONS } from "./types";

const start = new Date("2024-01-01");
const end = new Date("2024-02-15");

describe("getSearchParams", () => {
	it("formats dates as YYYY-MM-DD and passes city/county through", () => {
		const params = new URLSearchParams(
			getSearchParams(
				DEFAULT_FILTERS,
				DEFAULT_CONDITIONS,
				"Los Angeles",
				"Los Angeles",
				start,
				end,
			),
		);
		expect(params.get("city")).toBe("Los Angeles");
		expect(params.get("county")).toBe("Los Angeles");
		expect(params.get("start_date")).toBe("2024-01-01");
		expect(params.get("end_date")).toBe("2024-02-15");
	});

	it("maps each filter flag to its query param", () => {
		const cases = [
			[{ ...DEFAULT_FILTERS, fatal: true }, "collision_severity", "1"],
			[{ ...DEFAULT_FILTERS, hitAndRun: true }, "hit_and_run", "M,F"],
			[{ ...DEFAULT_FILTERS, alcohol: true }, "alcohol_involved", "Y"],
			[{ ...DEFAULT_FILTERS, motorcycle: true }, "motorcycle_accident", "Y"],
			[{ ...DEFAULT_FILTERS, bicycleAccident: true }, "bicycle_accident", "Y"],
			[
				{ ...DEFAULT_FILTERS, pedestrianAccident: true },
				"pedestrian_accident",
				"Y",
			],
			[{ ...DEFAULT_FILTERS, truckAccident: true }, "truck_accident", "Y"],
			[{ ...DEFAULT_FILTERS, stateHighway: true }, "state_hwy_ind", "Y"],
		] as const;
		for (const [filters, key, value] of cases) {
			const params = new URLSearchParams(
				getSearchParams(filters, DEFAULT_CONDITIONS, "", "", start, end),
			);
			expect(params.get(key)).toBe(value);
		}
	});

	it("omits empty/'all' conditions and appends real values", () => {
		const omitted = new URLSearchParams(
			getSearchParams(
				DEFAULT_FILTERS,
				{
					weather: "all",
					collisionType: "all",
					lighting: "all",
					roadSurface: "all",
					roadCondition: "all",
				},
				"",
				"",
				start,
				end,
			),
		);
		for (const key of [
			"weather_1",
			"type_of_collision",
			"lighting",
			"road_surface",
			"road_cond_1",
		]) {
			expect(omitted.has(key)).toBe(false);
		}

		const appended = new URLSearchParams(
			getSearchParams(
				DEFAULT_FILTERS,
				{
					weather: "A",
					collisionType: "B",
					lighting: "C",
					roadSurface: "D",
					roadCondition: "E",
				},
				"",
				"",
				start,
				end,
			),
		);
		expect(appended.get("weather_1")).toBe("A");
		expect(appended.get("type_of_collision")).toBe("B");
		expect(appended.get("lighting")).toBe("C");
		expect(appended.get("road_surface")).toBe("D");
		expect(appended.get("road_cond_1")).toBe("E");
	});
});

describe("fetchAccidents", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	const stubFetch = (json: unknown, totalCount: string | null) => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			statusText: "OK",
			json: async () => json,
			headers: { get: () => totalCount },
		});
		vi.stubGlobal("fetch", fetchMock);
		return fetchMock;
	};

	it("appends limit and offset to the query", async () => {
		const fetchMock = stubFetch([], "0");
		await fetchAccidents("city=X", 30, 60);
		expect(fetchMock).toHaveBeenCalledOnce();
		const url = new URL(fetchMock.mock.calls[0][0], "http://localhost");
		expect(url.searchParams.get("limit")).toBe("30");
		expect(url.searchParams.get("offset")).toBe("60");
		expect(url.searchParams.get("city")).toBe("X");
	});

	it("defaults offset to 0 and leaves params untouched without limit", async () => {
		const fetchMock = stubFetch([], "0");
		await fetchAccidents("city=X", 30);
		const url = new URL(fetchMock.mock.calls[0][0], "http://localhost");
		expect(url.searchParams.get("offset")).toBe("0");

		const bareMock = stubFetch([], "0");
		await fetchAccidents("city=X");
		const bare = new URL(bareMock.mock.calls[0][0], "http://localhost");
		expect(bare.searchParams.has("limit")).toBe(false);
		expect(bare.searchParams.has("offset")).toBe(false);
	});

	it("returns accidents with total from X-Total-Count", async () => {
		stubFetch([{ case_id: 1 }], "1234");
		const result = await fetchAccidents("city=X", 30, 0);
		expect(result.accidents).toEqual([{ case_id: 1 }]);
		expect(result.total).toBe(1234);
	});

	it("falls back to payload length when the header is missing", async () => {
		stubFetch([{ case_id: 1 }, { case_id: 2 }], null);
		const result = await fetchAccidents("city=X", 30, 0);
		expect(result.total).toBe(2);
	});

	it("throws on failed responses and non-array payloads", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({ ok: false, statusText: "Boom" }),
		);
		await expect(fetchAccidents("city=X", 30, 0)).rejects.toThrow(
			"Failed to fetch accidents: Boom",
		);

		stubFetch({ error: "nope" }, null);
		await expect(fetchAccidents("city=X", 30, 0)).rejects.toThrow(
			"Unexpected response format",
		);
	});
});
