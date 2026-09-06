"use client";

import { AreaSelector } from "./(components)/area-selector";
import { FilterCol } from "./(components)/filter-col";
import { DateSelector } from "./(components)/date-selector";
import { ConditionsSelector } from "./(components)/conditions-selector";
import { InfoCard } from "./(components)/info-card";
import { useState } from "react";

import locations from "./locations.json";
import centroidData from "./centroidData.json";
import dynamic from "next/dynamic";
import {
	Filters,
	Conditions,
	DEFAULT_FILTERS,
	DEFAULT_CONDITIONS,
} from "@/lib/types";
import { DATA_START_DATE, DATA_END_DATE } from "@/lib/constants";
import { getSearchParams } from "@/lib/api";

const Map = dynamic(() => import("../components/Map"), { ssr: false });

export default function Page() {
	const [city, setCity] = useState("");
	const [county, setCounty] = useState("");
	const [start_date, setStartDate] = useState(new Date(DATA_START_DATE));
	const [end_date, setEndDate] = useState(new Date(DATA_END_DATE));

	const [accidents, setAccidents] = useState<Accident[] | undefined>();
	const [totalResults, setTotalResults] = useState<number | undefined>();
	const [predictions, setPredictions] = useState<Predictions[] | undefined>();
	const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
	const [conditions, setConditions] = useState<Conditions>(DEFAULT_CONDITIONS);

	const handleSearch = () => {
		setPredictions(undefined);
		setTotalResults(undefined);
		const params = getSearchParams(
			filters,
			conditions,
			city,
			county,
			start_date,
			end_date,
		);

		if (filters.usePredictions && county !== "") {
			const kind = county as keyof typeof centroidData;
			setPredictions(centroidData[kind].Precision[4]);
		}

		fetch(`/api/accidents?${params}&limit=2000`)
			.then((res) => {
				if (!res.ok) throw new Error(res.statusText);
				setTotalResults(Number(res.headers.get("X-Total-Count") ?? 0));
				return res.json();
			})
			.then((data) => {
				if (Array.isArray(data)) setAccidents(data);
			})
			.catch((err) => console.error("Error fetching accidents:", err));
	};

	const clearFilters = () => {
		setFilters(DEFAULT_FILTERS);
	};

	const setCurrentLocation = (location: CountyAndCity) => {
		setCity(location.city);
		setCounty(location.county);
	};

	return (
		<>
			<div className="flex gap-2 px-2">
				<aside className="sticky top-10 size-fit">
					<FilterCol
						filters={filters}
						setFilters={setFilters}
						clearFilters={clearFilters}
						updateFilters={handleSearch}
					/>
					<InfoCard
						num_datapoints={accidents?.length || 0}
						start_date={start_date}
						end_date={end_date}
					/>
				</aside>

				<div className="flex grow flex-col space-y-1">
					{totalResults !== undefined &&
						accidents &&
						totalResults > accidents.length && (
							<p className="rounded-sm border px-2 py-1 text-sm text-gray-600 dark:text-gray-300">
								Showing {accidents.length} of {totalResults} most recent. Narrow
								your filters to see more.
							</p>
						)}
					<div className="z-10 h-full grow rounded-sm border-2">
						<Map accidents={accidents} predictions={predictions} />
					</div>
					<div className="flex h-fit shrink space-x-2">
						<div className="flex flex-col space-y-1">
							<DateSelector
								startDate={start_date}
								setStartDate={(date) => setStartDate(date)}
								endDate={end_date}
								setEndDate={(date) => setEndDate(date)}
							/>
						</div>
						<AreaSelector
							locations={Object.values(locations.counties) as County[]}
							currentLocation={{ county: county, city: city }}
							setCurrentLocation={(l) => setCurrentLocation(l)}
						/>
						<ConditionsSelector
							conditions={conditions}
							setConditions={setConditions}
						/>
					</div>
				</div>
			</div>
		</>
	);
}
