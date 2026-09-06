import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);

	const startDate = searchParams.get("start_date");
	const endDate = searchParams.get("end_date");
	const county = searchParams.get("county");
	const city = searchParams.get("city");

	const conditions: string[] = [];
	const values: (string | number | null)[] = [];

	const addFilter = (clause: string, value: string) => {
		conditions.push(clause);
		values.push(value);
	};

	if (startDate && endDate) {
		addFilter(`a.collision_date >= ?`, startDate);
		addFilter(`a.collision_date <= ?`, endDate);
	} else if (startDate) {
		addFilter(`a.collision_date >= ?`, startDate);
	} else if (endDate) {
		addFilter(`a.collision_date <= ?`, endDate);
	}

	if (county) addFilter(`l.county LIKE '%' || ? || '%'`, county);
	if (city) addFilter(`l.city LIKE '%' || ? || '%'`, city);

	const whereClause =
		conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
	const baseFrom = `
		FROM accidents a
		JOIN location l ON a.location_id = l.location_id
		JOIN severity s ON a.severity_id = s.severity_id
		${whereClause}
	`;

	try {
		const [statsResult, cityResult, roadResult, dayResult] = await Promise.all([
			db.execute({
				sql: `SELECT
					COUNT(a.case_id) AS total_crashes,
					COALESCE(SUM(s.number_injured), 0) AS total_injuries,
					COALESCE(SUM(s.number_killed), 0) AS total_fatalities,
					SUM(CASE WHEN a.pedestrian_accident = 'Y' THEN 1 ELSE 0 END) AS pedestrian_accidents,
					SUM(CASE WHEN a.bicycle_accident = 'Y' THEN 1 ELSE 0 END) AS bicycle_accidents,
					SUM(CASE WHEN a.motorcycle_accident = 'Y' THEN 1 ELSE 0 END) AS motorcycle_accidents,
					SUM(CASE WHEN a.truck_accident = 'Y' THEN 1 ELSE 0 END) AS truck_accidents,
					SUM(CASE WHEN a.alcohol_involved = 'Y' THEN 1 ELSE 0 END) AS alcohol_related,
					SUM(CASE WHEN a.hit_and_run IN ('M', 'F') THEN 1 ELSE 0 END) AS hit_and_run,
					SUM(CASE WHEN a.type_of_collision = 'D' THEN 1 ELSE 0 END) AS broadside,
					SUM(CASE WHEN a.type_of_collision = 'A' THEN 1 ELSE 0 END) AS head_on,
					SUM(CASE WHEN a.type_of_collision = 'B' THEN 1 ELSE 0 END) AS sideswipe,
					SUM(CASE WHEN a.type_of_collision = 'C' THEN 1 ELSE 0 END) AS rear_end,
					SUM(CASE WHEN a.type_of_collision = 'E' THEN 1 ELSE 0 END) AS hit_object,
					SUM(CASE WHEN a.type_of_collision = 'F' THEN 1 ELSE 0 END) AS roll_over
				${baseFrom}`,
				args: values,
			}),
			db.execute({
				sql: `SELECT l.city, COUNT(a.case_id) AS accident_count ${baseFrom} GROUP BY l.city ORDER BY accident_count DESC LIMIT 1`,
				args: values,
			}),
			db.execute({
				sql: `SELECT l.primary_rd, l.secondary_rd, COUNT(a.case_id) AS count ${baseFrom} GROUP BY l.primary_rd, l.secondary_rd ORDER BY count DESC LIMIT 1`,
				args: values,
			}),
			db.execute({
				sql: `SELECT a.day_of_week, COUNT(a.case_id) AS count ${baseFrom} GROUP BY a.day_of_week ORDER BY count DESC LIMIT 1`,
				args: values,
			}),
		]);

		const stats = statsResult.rows[0] as Record<string, number>;
		const cityRow = cityResult.rows[0] as Record<string, unknown> | undefined;
		const roadRow = roadResult.rows[0] as Record<string, unknown> | undefined;
		const dayRow = dayResult.rows[0] as Record<string, unknown> | undefined;

		return NextResponse.json({
			total_crashes: Number(stats.total_crashes),
			total_injuries: Number(stats.total_injuries),
			total_fatalities: Number(stats.total_fatalities),
			pedestrian_accidents: Number(stats.pedestrian_accidents),
			bicycle_accidents: Number(stats.bicycle_accidents),
			motorcycle_accidents: Number(stats.motorcycle_accidents),
			truck_accidents: Number(stats.truck_accidents),
			alcohol_related: Number(stats.alcohol_related),
			hit_and_run: Number(stats.hit_and_run),
			broadside: Number(stats.broadside),
			head_on: Number(stats.head_on),
			sideswipe: Number(stats.sideswipe),
			rear_end: Number(stats.rear_end),
			hit_object: Number(stats.hit_object),
			roll_over: Number(stats.roll_over),
			most_accidents_city: cityRow
				? { city: cityRow.city, accident_count: Number(cityRow.accident_count) }
				: null,
			most_common_road_pair: roadRow
				? {
						primary_rd: roadRow.primary_rd,
						secondary_rd: roadRow.secondary_rd,
						count: Number(roadRow.count),
					}
				: null,
			most_common_day: dayRow
				? { day: dayRow.day_of_week, count: Number(dayRow.count) }
				: null,
		});
	} catch (error) {
		console.error("Database query error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
