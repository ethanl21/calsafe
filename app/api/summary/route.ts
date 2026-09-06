import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
	try {
		const result = await db.execute(`
			SELECT
				a.accident_year AS year,
				COUNT(a.case_id) AS total_crashes,
				COALESCE(SUM(s.number_injured), 0) AS total_injuries,
				COALESCE(SUM(s.number_killed), 0) AS total_fatalities,
				SUM(CASE WHEN a.pedestrian_accident = 'Y' THEN 1 ELSE 0 END) AS pedestrian_accidents,
				SUM(CASE WHEN a.bicycle_accident = 'Y' THEN 1 ELSE 0 END) AS bicycle_accidents,
				SUM(CASE WHEN a.motorcycle_accident = 'Y' THEN 1 ELSE 0 END) AS motorcycle_accidents,
				SUM(CASE WHEN a.truck_accident = 'Y' THEN 1 ELSE 0 END) AS truck_accidents,
				SUM(CASE WHEN a.alcohol_involved = 'Y' THEN 1 ELSE 0 END) AS alcohol_related
			FROM accidents a
			JOIN severity s ON a.severity_id = s.severity_id
			GROUP BY a.accident_year
			ORDER BY a.accident_year
		`);

		const summary = result.rows.map((row) => ({
			year: Number(row.year),
			data: {
				total_crashes: Number(row.total_crashes),
				total_injuries: Number(row.total_injuries),
				total_fatalities: Number(row.total_fatalities),
				pedestrian_accidents: Number(row.pedestrian_accidents),
				bicycle_accidents: Number(row.bicycle_accidents),
				motorcycle_accidents: Number(row.motorcycle_accidents),
				truck_accidents: Number(row.truck_accidents),
				alcohol_related: Number(row.alcohol_related),
			},
		}));

		return NextResponse.json(summary);
	} catch (error) {
		console.error("Database query error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
