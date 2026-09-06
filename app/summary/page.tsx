// app/summary/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { SummaryItem } from "../(components)/summary-item";
import { nanoid } from "nanoid";
import { YearlyData } from "@/lib/types";

const SummaryPage = () => {
	const [summaryData, setSummaryData] = useState<YearlyData[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [yearRange, setYearRange] = useState<number[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const response = await fetch("/api/summary");
				if (!response.ok) throw new Error(response.statusText);
				const data: YearlyData[] = await response.json();
				setSummaryData(data);
				const minYear = Math.min(...data.map((yearData) => yearData.year));
				const maxYear = Math.max(...data.map((yearData) => yearData.year));
				setYearRange([minYear, maxYear]);
			} catch (err) {
				setError("An error occurred while fetching the summary data.");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	if (loading) return <p>Loading...</p>;
	if (error) return <p style={{ color: "red" }}>{error}</p>;

	return (
		<div className="container mx-auto">
			<h1 className="mb-4 text-2xl font-bold">
				Yearly Statewide Accident Summary ({yearRange[0]} - {yearRange[1]})
			</h1>
			<div className="grid gap-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				{summaryData.map((yearData) => (
					<SummaryItem key={nanoid()} yearData={yearData} />
				))}
			</div>
		</div>
	);
};

export default SummaryPage;
