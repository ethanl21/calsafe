"use client";

import { AccidentsByYear } from "./charts/AccidentsByYear";
import { YearlyData } from "@/lib/types";

interface YearlyChartsProps {
	data: YearlyData[];
	loading?: boolean;
}

export function YearlyCharts({ data, loading }: YearlyChartsProps) {
	if (data.length === 0) {
		return loading ? null : (
			<p className="flex justify-center">
				No statistics available for the specified query.
			</p>
		);
	}

	return (
		<div className="columns-2">
			<div>
				<h1 className="mb-2 flex justify-center text-2xl font-bold">
					Accidents by Year
				</h1>
				<AccidentsByYear
					data={data.map((d) => ({
						year: d.year,
						total: d.data.total_crashes,
					}))}
				/>
			</div>
			<div>
				<h1 className="mb-2 flex justify-center text-2xl font-bold">
					Motorcycle Accidents
				</h1>
				<AccidentsByYear
					data={data.map((d) => ({
						year: d.year,
						total: d.data.motorcycle_accidents,
					}))}
				/>
			</div>
			<div>
				<h1 className="mb-2 flex justify-center text-2xl font-bold">
					Traffic Injuries
				</h1>
				<AccidentsByYear
					data={data.map((d) => ({
						year: d.year,
						total: d.data.total_injuries,
					}))}
				/>
			</div>
			<div>
				<h1 className="mb-2 flex justify-center text-2xl font-bold">
					Pedestrians Involved
				</h1>
				<AccidentsByYear
					data={data.map((d) => ({
						year: d.year,
						total: d.data.pedestrian_accidents,
					}))}
				/>
			</div>
		</div>
	);
}
