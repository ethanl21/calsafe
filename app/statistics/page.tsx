"use client";

import { useState } from "react";
import { AreaSelector } from "../(components)/area-selector";
import { DateSelector } from "../(components)/date-selector";
import { SummaryItem } from "../(components)/summary-item";
import { StatCard } from "../(components)/stat-card";
import { YearlyCharts } from "../(components)/yearly-charts";
import { nanoid } from "nanoid";

import locations from "../locations.json";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader, LoaderCircle } from "lucide-react";
import { format } from "date-fns";
import { YearlyData, type StatisticsResponse } from "@/lib/types";
import {
	DATA_START_DATE,
	DATA_END_DATE,
	DATA_YEAR_RANGE_LABEL,
	DATA_END_YEAR,
} from "@/lib/constants";

const getDayName = (dayIndex: number) => {
	const date = new Date(1970, 0, 4 + dayIndex);
	return format(date, "EEEE");
};

const StatisticsPage = () => {
	const [startDate, setStartDate] = useState(new Date(DATA_START_DATE));
	const [endDate, setEndDate] = useState(new Date(DATA_END_DATE));
	const [county, setCounty] = useState("");
	const [city, setCity] = useState("");
	const [countyByYearData, setCountyByYearData] = useState<YearlyData[]>([]);
	const [summaryData, setSummaryData] = useState<YearlyData[]>([]);
	const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const fetchStatistics = async () => {
		if (!county) {
			setError("Please select a county.");
			return;
		}
		setError("");
		setLoading(true);

		const params = new URLSearchParams({
			start_date: startDate.toISOString().slice(0, 10),
			end_date: endDate.toISOString().slice(0, 10),
			county,
		});
		if (city) params.append("city", city);

		try {
			const response = await fetch(`/api/statistics?${params}`);
			if (!response.ok) {
				setError(
					response.status === 404
						? "No accident data found."
						: `Error: ${response.statusText}`,
				);
				setStatistics(null);
				return;
			}
			setStatistics((await response.json()) as StatisticsResponse);
		} catch (err) {
			setError("An error occurred while fetching the data.");
			console.error("Fetch error:", err);
		} finally {
			setLoading(false);
		}
	};

	const countySubmit = async () => {
		setCountyByYearData([]);
		setError("");
		const url = county
			? `/api/summaryByCounty?county=${county}`
			: "/api/summary";
		try {
			const response = await fetch(url);
			if (response.status === 404) {
				setError("No accident data found.");
				return;
			}
			if (!response.ok) throw new Error(response.statusText);
			setCountyByYearData(await response.json());
		} catch (err) {
			setError("An error occurred while fetching the data.");
			console.error("Fetch error:", err);
		}
	};

	const fetchSummaryData = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/summary");
			if (!response.ok) throw new Error(response.statusText);
			setSummaryData(await response.json());
		} catch (err) {
			setError("An error occurred while fetching the summary data.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const runAllQueries = async () => {
		await fetchStatistics();
		await countySubmit();
		await fetchSummaryData();
	};

	return (
		<div className="p-6">
			<header className="mb-6 text-center">
				<h1 className="text-3xl font-semibold">CalSafe Statistics</h1>
				<p className="text-gray-500">Enter details below to get started</p>
			</header>

			<div className="mx-auto flex w-fit flex-col gap-2">
				<div className="flex flex-row gap-2">
					<DateSelector
						startDate={startDate}
						setStartDate={setStartDate}
						endDate={endDate}
						setEndDate={setEndDate}
					/>
					<AreaSelector
						locations={Object.values(locations.counties) as County[]}
						currentLocation={{ county, city }}
						setCurrentLocation={({ city, county }) => {
							setCity(city);
							setCounty(county);
						}}
					/>
				</div>
				<Button onClick={runAllQueries}>
					<Loader /> Fetch Statistics
				</Button>
			</div>
			<div>
				<div>
					<Separator className="my-4" />

					<div className="mx-auto w-fit">
						{loading && (
							<div className="text-blue-500">
								<div className="flex flex-row items-center gap-2">
									<LoaderCircle className="animate-spin" />
									<h3 className="text-2xl">Loading statistics...</h3>
								</div>
							</div>
						)}
						{error && <p className="text-red-500">{error}</p>}

						{statistics && (
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
								<StatCard title="Total Crashes">
									<p>{statistics.total_crashes}</p>
								</StatCard>
								<StatCard title="Total Injuries">
									<p>{statistics.total_injuries}</p>
								</StatCard>
								<StatCard title="Total Fatalities">
									<p>{statistics.total_fatalities}</p>
								</StatCard>
								<StatCard title="Pedestrian Accidents">
									<p>{statistics.pedestrian_accidents}</p>
								</StatCard>
								<StatCard title="Bicycle Accidents">
									<p>{statistics.bicycle_accidents}</p>
								</StatCard>
								<StatCard title="Motorcycle Accidents">
									<p>{statistics.motorcycle_accidents}</p>
								</StatCard>
								<StatCard title="Truck Accidents">
									<p>{statistics.truck_accidents}</p>
								</StatCard>
								<StatCard title="Alcohol-Related Accidents">
									<p>{statistics.alcohol_related}</p>
								</StatCard>
								<StatCard title="Hit and Run Accidents">
									<p>{statistics.hit_and_run}</p>
								</StatCard>
								<StatCard title="Head On Accidents">
									<p>{statistics.head_on}</p>
								</StatCard>
								<StatCard title="Sideswipe Accidents">
									<p>{statistics.sideswipe}</p>
								</StatCard>
								<StatCard title="Rear End Accidents">
									<p>{statistics.rear_end}</p>
								</StatCard>
								<StatCard title="Object Hit Accidents">
									<p>{statistics.hit_object}</p>
								</StatCard>
								<StatCard title="Roll-over Accidents">
									<p>{statistics.roll_over}</p>
								</StatCard>
								<StatCard title="City with Most Accidents">
									<p>{statistics.most_accidents_city?.city}</p>
									<p>
										Accident Count:{" "}
										{statistics.most_accidents_city?.accident_count}
									</p>
								</StatCard>
								<StatCard title="Intersection with Most Accidents">
									<p>
										Primary Road: {statistics.most_common_road_pair?.primary_rd}
									</p>
									<p>
										Secondary Road:{" "}
										{statistics.most_common_road_pair?.secondary_rd}
									</p>
									<p>Accidents: {statistics.most_common_road_pair?.count}</p>
								</StatCard>
								<StatCard title="Road with Most Accidents">
									<p>
										{
											(
												statistics as StatisticsResponse & {
													most_common_primary_road?: {
														primary_rd: string;
														count: number;
													};
												}
											).most_common_primary_road?.primary_rd
										}
									</p>
									<p>
										Accidents:{" "}
										{
											(
												statistics as StatisticsResponse & {
													most_common_primary_road?: {
														primary_rd: string;
														count: number;
													};
												}
											).most_common_primary_road?.count
										}
									</p>
								</StatCard>
								<StatCard title="Most Common Day for Accidents">
									<p>
										Day:{" "}
										{statistics.most_common_day
											? getDayName(
													Number.parseInt(statistics.most_common_day.day),
												)
											: null}
									</p>
									<p>Count: {statistics.most_common_day?.count}</p>
								</StatCard>
							</div>
						)}
					</div>
				</div>
			</div>

			<h1 className="m-5 mb-2 flex justify-center text-4xl font-bold">
				Year to Date Graphs
			</h1>
			<p className="flex justify-center text-gray-500">
				For the specified county
			</p>
			<div className="container mx-auto">
				<YearlyCharts data={countyByYearData} loading={loading} />
			</div>

			<h1 className="m-5 mb-2 flex justify-center text-4xl font-bold">
				Southern California Statistics
			</h1>
			<p className="mb-2 flex justify-center text-gray-500">
				{DATA_YEAR_RANGE_LABEL}
			</p>
			<p className="mb-2 flex justify-center text-sm text-gray-500">
				{DATA_END_YEAR} data is provisional and updates as reports arrive
			</p>
			<div className="container mx-auto">
				<div className="grid gap-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
					{summaryData.map((yearData) => (
						<SummaryItem key={nanoid()} yearData={yearData} />
					))}
				</div>
			</div>
		</div>
	);
};

export default StatisticsPage;
