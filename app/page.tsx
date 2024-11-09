"use client";

import { AreaSelector } from "./(components)/area-selector";
import { FilterCol } from "./(components)/filter-col";
import { DateSelector } from "./(components)/date-selector";
import { ConditionsSelector } from "./(components)/conditions-selector";
import { InfoCard } from "./(components)/info-card";
import { useState } from "react";

export default function Page() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [city, setCity] = useState("");
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [county, setCounty] = useState("");
	const [start_date, setStartDate] = useState(new Date());
	const [end_date, setEndDate] = useState(new Date());

	const [filters, setFilters] = useState({
		alcohol: false,
		motorcycle: false,
		hitAndRun: false,
		fatal: false,
		bicycleAccident: false,
		pedestrianAccident: false,
		truckAccident: false,
		stateHighway: false,
	});

	return (
		<>
			<div className="flex gap-2 px-2">
				<aside className="w-fit">
					<FilterCol filters={filters} setFilters={setFilters} />
				</aside>

				<div className="flex grow flex-col space-y-1">
					<div className="h-full grow rounded-sm border-2">map goes here</div>
					<div className="flex h-fit shrink space-x-2">
						<div className="flex flex-col space-y-1">
							<DateSelector
								startDate={start_date}
								setStartDate={setStartDate}
								endDate={end_date}
								setEndDate={setEndDate}
							/>
							<InfoCard
								num_datapoints={100}
								start_date={new Date()}
								end_date={new Date()}
							/>
						</div>
						<AreaSelector />
						<ConditionsSelector />
					</div>
				</div>
			</div>
		</>
	);
}
