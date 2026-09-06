import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);

	const conditions: string[] = [];
	const values: (string | number | null)[] = [];

	const addFilter = (clause: string, value: string) => {
		conditions.push(clause);
		values.push(value);
	};

	const startDate = searchParams.get("start_date");
	const endDate = searchParams.get("end_date");
	if (startDate && endDate) {
		addFilter(`a.collision_date >= ?`, startDate);
		addFilter(`a.collision_date <= ?`, endDate);
	} else if (startDate) {
		addFilter(`a.collision_date >= ?`, startDate);
	} else if (endDate) {
		addFilter(`a.collision_date <= ?`, endDate);
	}

	const county = searchParams.get("county");
	if (county) addFilter(`l.county LIKE '%' || ? || '%'`, county);

	const city = searchParams.get("city");
	if (city) addFilter(`l.city LIKE '%' || ? || '%'`, city);

	const collisionSeverity = searchParams.get("collision_severity");
	if (collisionSeverity)
		addFilter(`s.collision_severity = ?`, collisionSeverity);

	const numberKilled = searchParams.get("number_killed");
	if (numberKilled) addFilter(`s.number_killed >= ?`, numberKilled);

	const numberInjured = searchParams.get("number_injured");
	if (numberInjured) addFilter(`s.number_injured >= ?`, numberInjured);

	const countSevereInj = searchParams.get("count_severe_inj");
	if (countSevereInj) addFilter(`s.count_severe_inj >= ?`, countSevereInj);

	const countVisibleInj = searchParams.get("count_visible_inj");
	if (countVisibleInj) addFilter(`s.count_visible_inj >= ?`, countVisibleInj);

	const countComplaintPain = searchParams.get("count_complaint_pain");
	if (countComplaintPain)
		addFilter(`s.count_complaint_pain >= ?`, countComplaintPain);

	const hitAndRun = searchParams.get("hit_and_run");
	if (hitAndRun) {
		const codes = hitAndRun.split(",");
		conditions.push(`a.hit_and_run IN (${codes.map(() => "?").join(",")})`);
		values.push(...codes);
	}

	const typeOfCollision = searchParams.get("type_of_collision");
	if (typeOfCollision)
		addFilter(`a.type_of_collision LIKE '%' || ? || '%'`, typeOfCollision);

	const pedestrianAccident = searchParams.get("pedestrian_accident");
	if (pedestrianAccident)
		addFilter(`a.pedestrian_accident = ?`, pedestrianAccident);

	const bicycleAccident = searchParams.get("bicycle_accident");
	if (bicycleAccident) addFilter(`a.bicycle_accident = ?`, bicycleAccident);

	const motorcycleAccident = searchParams.get("motorcycle_accident");
	if (motorcycleAccident)
		addFilter(`a.motorcycle_accident = ?`, motorcycleAccident);

	const truckAccident = searchParams.get("truck_accident");
	if (truckAccident) addFilter(`a.truck_accident = ?`, truckAccident);

	const alcoholInvolved = searchParams.get("alcohol_involved");
	if (alcoholInvolved) addFilter(`a.alcohol_involved = ?`, alcoholInvolved);

	const dayOfWeek = searchParams.get("day_of_week");
	if (dayOfWeek) addFilter(`a.day_of_week = ?`, dayOfWeek);

	const weather1 = searchParams.get("weather_1");
	if (weather1) addFilter(`e.weather_1 = ?`, weather1);

	const roadSurface = searchParams.get("road_surface");
	if (roadSurface) addFilter(`e.road_surface = ?`, roadSurface);

	const roadCond1 = searchParams.get("road_cond_1");
	if (roadCond1) addFilter(`e.road_cond_1 = ?`, roadCond1);

	const lighting = searchParams.get("lighting");
	if (lighting) addFilter(`e.lighting = ?`, lighting);

	const stateHwyInd = searchParams.get("state_hwy_ind");
	if (stateHwyInd) addFilter(`e.state_hwy_ind = ?`, stateHwyInd);

	const limit = Math.min(
		Math.max(parseInt(searchParams.get("limit") || "500", 10) || 500, 1),
		2000,
	);
	const offset = Math.max(
		parseInt(searchParams.get("offset") || "0", 10) || 0,
		0,
	);

	const whereClause =
		conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

	const mainQuery = `
		SELECT
			a.case_id, a.accident_year, a.collision_date, a.collision_time,
			a.hit_and_run, a.type_of_collision, a.pedestrian_accident, a.bicycle_accident,
			a.motorcycle_accident, a.truck_accident, a.alcohol_involved, a.day_of_week,
			l.location_id, l.primary_rd, l.secondary_rd, l.city, l.county, l.point_x, l.point_y,
			s.severity_id, s.collision_severity, s.number_killed, s.number_injured,
			s.count_severe_inj, s.count_visible_inj, s.count_complaint_pain,
			e.environment_id, e.weather_1, e.road_surface, e.road_cond_1,
			e.lighting, e.state_hwy_ind
		FROM accidents a
		JOIN location l ON a.location_id = l.location_id
		JOIN severity s ON a.severity_id = s.severity_id
		JOIN environment e ON a.environment_id = e.environment_id
		${whereClause}
		ORDER BY a.collision_date DESC
		LIMIT ? OFFSET ?
	`;

	try {
		const countResult = await db.execute({
			sql: `SELECT COUNT(*) AS total FROM accidents a
				JOIN location l ON a.location_id = l.location_id
				JOIN severity s ON a.severity_id = s.severity_id
				JOIN environment e ON a.environment_id = e.environment_id
				${whereClause}`,
			args: values,
		});
		const total = Number(
			(countResult.rows[0] as Record<string, unknown> | undefined)?.total ?? 0,
		);
		values.push(limit, offset);
		const result = await db.execute({ sql: mainQuery, args: values });

		const accidents = await Promise.all(
			result.rows.map(async (row) => {
				const [partiesResult, victimsResult] = await Promise.all([
					db.execute({
						sql: `SELECT * FROM parties WHERE case_id = ?`,
						args: [row.case_id as number],
					}),
					db.execute({
						sql: `SELECT * FROM victims WHERE case_id = ?`,
						args: [row.case_id as number],
					}),
				]);

				return {
					case_id: row.case_id,
					accident_year: row.accident_year,
					collision_date: row.collision_date,
					collision_time: row.collision_time,
					hit_and_run: row.hit_and_run,
					type_of_collision: row.type_of_collision,
					pedestrian_accident: row.pedestrian_accident,
					bicycle_accident: row.bicycle_accident,
					motorcycle_accident: row.motorcycle_accident,
					truck_accident: row.truck_accident,
					alcohol_involved: row.alcohol_involved,
					day_of_week: row.day_of_week,
					location: {
						location_id: row.location_id,
						primary_rd: row.primary_rd,
						secondary_rd: row.secondary_rd,
						city: row.city,
						county: row.county,
						point_x: row.point_x,
						point_y: row.point_y,
					},
					severity: {
						severity_id: row.severity_id,
						collision_severity: row.collision_severity,
						number_killed: row.number_killed,
						number_injured: row.number_injured,
						count_severe_inj: row.count_severe_inj,
						count_visible_inj: row.count_visible_inj,
						count_complaint_pain: row.count_complaint_pain,
					},
					environment: {
						environment_id: row.environment_id,
						weather_1: row.weather_1,
						road_surface: row.road_surface,
						road_cond_1: row.road_cond_1,
						lighting: row.lighting,
						state_hwy_ind: row.state_hwy_ind,
					},
					parties: partiesResult.rows,
					victims: victimsResult.rows,
				};
			}),
		);

		const res = NextResponse.json(accidents);
		res.headers.set("X-Total-Count", String(total));
		return res;
	} catch (error) {
		console.error("Database query error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
