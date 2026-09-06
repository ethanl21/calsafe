// app/graphs/page.tsx
"use client";

import React, { useState } from "react";
import { YearlyCharts } from "../(components)/yearly-charts";
import { YearlyData } from "@/lib/types";

const southernCaliforniaCounties = [
	"San Luis Obispo",
	"Kern",
	"San Bernardino",
	"Ventura",
	"Los Angeles",
	"Orange",
	"Riverside",
	"San Diego",
	"Imperial",
];

const GraphsPage = () => {
	const [county, setCounty] = useState("");
	const [countyByYearData, setCountyByYearData] = useState<YearlyData[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const countySubmit = async (e: React.FormEvent) => {
		setCountyByYearData([]);
		e.preventDefault();
		setError("");

		const url = county
			? `/api/summaryByCounty?county=${county}`
			: "/api/summary";
		setLoading(true);
		try {
			const response = await fetch(url);
			if (response.status === 404) {
				setError("No accident data found for the specified query.");
				setCountyByYearData([]);
				return;
			}
			if (!response.ok) throw new Error(response.statusText);
			setCountyByYearData(await response.json());
		} catch (err) {
			setError("An error occurred while fetching the data.");
			console.error("Fetch error:", err);
		} finally {
			setLoading(false);
		}
	};

	if (loading) return <p>Loading...</p>;
	if (error) return <p style={{ color: "red" }}>{error}</p>;

	return (
		<div className="container mx-auto">
			<div className="flex items-center font-mono">
				<form onSubmit={countySubmit} className="w-1/2">
					<label className="w-20">County:</label>
					<select
						className="block w-48 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
						value={county}
						onChange={(e) => setCounty(e.target.value)}
					>
						<option value="">All</option>
						{southernCaliforniaCounties.map((countyName) => (
							<option key={countyName} value={countyName}>
								{countyName}
							</option>
						))}
					</select>
					<button
						className="block w-48 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
						type="submit"
					>
						Submit
					</button>
				</form>
			</div>
			<br />
			<YearlyCharts data={countyByYearData} />
		</div>
	);
};

export default GraphsPage;
