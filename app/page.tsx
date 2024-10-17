// app/page.tsx
"use client";

import { useState } from "react";

interface Location {
	primary_rd: string;
	secondary_rd: string;
	distance: number;
	direction: string;
	intersection: string;
	city: string;
	county: string;
	point_x: number;
	point_y: number;
}

interface Severity {
	collision_severity: string;
	number_killed: number;
	number_injured: number;
	count_severe_inj: number;
	count_visible_inj: number;
	count_complaint_pain: number;
	count_ped_killed: number;
	count_ped_injured: number;
	count_bicyclist_killed: number;
	count_bicyclist_injured: number;
	count_mc_killed: number;
	count_mc_injured: number;
}

interface Environment {
	weather_1: string;
	weather_2: string;
	road_surface: string;
	road_cond_1: string;
	road_cond_2: string;
	lighting: string;
	state_hwy_ind: string;
}

interface Party {
	party_number: number;
	party_type: string;
	at_fault: string;
	party_age: number;
	party_sex: string;
	party_sobriety: string;
	party_drug_physical: string;
	dir_of_travel: string;
	party_safety_equip_1: string;
	party_safety_equip_2: string;
	finan_respons: string;
	vehicle_year: number;
	vehicle_make: string;
	stwd_vehicle_type: string;
	inattention: string;
	race: string;
	move_pre_acc: string;
}

interface Victim {
	victim_role: string;
	victim_sex: string;
	victim_age: number;
	victim_degree_of_injury: string;
	victim_seating_position: string;
	victim_safety_equip_1: string;
	victim_safety_equip_2: string;
	victim_ejected: string;
}

interface Accident {
	case_id: number;
	accident_year: number;
	collision_date: string;
	collision_time: string;
	location: Location;
	severity: Severity;
	environment: Environment;
	parties: Party[];
	victims: Victim[];
	hit_and_run: string;
	type_of_collision: string;
	pedestrian_accident: string;
	bicycle_accident: string;
	motorcycle_accident: string;
	truck_accident: string;
	alcohol_involved: string;
}

// List of Southern California counties
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

// Helper functions to generate year, month, and day options
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generateYears = () => {
	const years = [];
	for (let i = 2018; i <= 2023; i++) {
		years.push(i);
	}
	return years;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generateMonths = () => {
	return [
		{ value: "01", label: "January" },
		{ value: "02", label: "February" },
		{ value: "03", label: "March" },
		{ value: "04", label: "April" },
		{ value: "05", label: "May" },
		{ value: "06", label: "June" },
		{ value: "07", label: "July" },
		{ value: "08", label: "August" },
		{ value: "09", label: "September" },
		{ value: "10", label: "October" },
		{ value: "11", label: "November" },
		{ value: "12", label: "December" },
	];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generateDays = () => {
	const days = [];
	for (let i = 1; i <= 31; i++) {
		days.push(i < 10 ? `0${i}` : `${i}`); // Add leading zero for single digits
	}
	return days;
};

const AccidentQueryPage = () => {
	// State for date selections
	const [startYear, setStartYear] = useState("2018");
	const [startMonth, setStartMonth] = useState("01");
	const [startDay, setStartDay] = useState("01");

	const [endYear, setEndYear] = useState("2023");
	const [endMonth, setEndMonth] = useState("12");
	const [endDay, setEndDay] = useState("31");

	// State for county
	const [county, setCounty] = useState("");
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// Track the expanded item
	const [expanded, setExpanded] = useState<number | null>(null);

	// Combine the dropdown values into a single date string (YYYY-MM-DD)
	const buildDate = (year: string, month: string, day: string) =>
		`${year}-${month}-${day}`;

	// Function to handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(""); // Reset error

		const startDate = buildDate(startYear, startMonth, startDay);
		const endDate = buildDate(endYear, endMonth, endDay);

		// Construct the base query URL
		const queryUrl = `http://localhost:8000/api/accidents/?start_date=${startDate}&end_date=${endDate}&county=${county}`;
		console.log("Query URL:", queryUrl);

		try {
			const response = await fetch(queryUrl);

			// Handle 404 errors
			if (response.status === 404) {
				setError("No accident data found for the specified query.");
				setResults([]);
				return;
			}

			if (!response.ok) {
				throw new Error(`Error: ${response.statusText}`);
			}

			const data = await response.json();
			setResults(data);
		} catch (err) {
			setError("An error occurred while fetching the data.");
			console.error("Fetch error:", err);
		} finally {
			setLoading(false); // Stop loading spinner
		}
	};

	// Function to toggle expansion of a specific data point
	const toggleExpand = (index: number) => {
		setExpanded(expanded === index ? null : index); // Collapse if already expanded
	};

	return (
		<div>
			<h1>Accident Query Form</h1>
			<form onSubmit={handleSubmit}>
				{/* Start Date */}
				<div>
					<label>Start Date:</label>
					<select
						value={startYear}
						onChange={(e) => setStartYear(e.target.value)}
					>
						{[2018, 2019, 2020, 2021, 2022, 2023].map((year) => (
							<option key={year} value={year}>
								{year}
							</option>
						))}
					</select>
					<select
						value={startMonth}
						onChange={(e) => setStartMonth(e.target.value)}
					>
						{[
							"01",
							"02",
							"03",
							"04",
							"05",
							"06",
							"07",
							"08",
							"09",
							"10",
							"11",
							"12",
						].map((month) => (
							<option key={month} value={month}>
								{month}
							</option>
						))}
					</select>
					<select
						value={startDay}
						onChange={(e) => setStartDay(e.target.value)}
					>
						{[...Array(31)].map((_, i) => (
							<option key={i + 1} value={String(i + 1).padStart(2, "0")}>
								{i + 1}
							</option>
						))}
					</select>
				</div>

				{/* End Date */}
				<div>
					<label>End Date:</label>
					<select value={endYear} onChange={(e) => setEndYear(e.target.value)}>
						{[2018, 2019, 2020, 2021, 2022, 2023].map((year) => (
							<option key={year} value={year}>
								{year}
							</option>
						))}
					</select>
					<select
						value={endMonth}
						onChange={(e) => setEndMonth(e.target.value)}
					>
						{[
							"01",
							"02",
							"03",
							"04",
							"05",
							"06",
							"07",
							"08",
							"09",
							"10",
							"11",
							"12",
						].map((month) => (
							<option key={month} value={month}>
								{month}
							</option>
						))}
					</select>
					<select value={endDay} onChange={(e) => setEndDay(e.target.value)}>
						{[...Array(31)].map((_, i) => (
							<option key={i + 1} value={String(i + 1).padStart(2, "0")}>
								{i + 1}
							</option>
						))}
					</select>
				</div>

				{/* County */}
				<div>
					<label>County:</label>
					<select value={county} onChange={(e) => setCounty(e.target.value)}>
						<option value="">Select a county</option>
						{southernCaliforniaCounties.map((countyName) => (
							<option key={countyName} value={countyName}>
								{countyName}
							</option>
						))}
					</select>
				</div>
				<button type="submit">Search</button>
			</form>

			{loading && <p>Loading...</p>}
			{error && <p style={{ color: "red" }}>{error}</p>}

			<div className="flex flex-col gap-5">
				<h2>Results:</h2>
				{results.length > 0 ? (
					<ul>
						{results.map((result: Accident, index) => (
							<li
								key={index}
								className="mb-4 rounded-lg border bg-slate-200 p-4 shadow-md"
								onClick={() => toggleExpand(index)}
								style={{ cursor: "pointer" }}
							>
								<p className="mx-1">
									<strong>Date:</strong> {result.collision_date}
									<br />
									<strong>Location:</strong> {result.location.city},{" "}
									{result.location.county}
									<br />
									<strong>Severity:</strong>{" "}
									{result.severity.collision_severity}
								</p>

								{/* Conditionally render more details if this item is expanded */}
								{expanded === index && (
									<div className="mt-3 border-l-4 border-slate-400 pl-3">
										<h3 className="mb-3 text-lg">Location Details</h3>
										<p className="mx-1">
											<strong>Primary Road:</strong>{" "}
											{result.location.primary_rd}
										</p>
										<p className="mx-1">
											<strong>Secondary Road:</strong>{" "}
											{result.location.secondary_rd}
										</p>
										<p className="mx-1">
											<strong>City:</strong> {result.location.city}
										</p>
										<p className="mx-1">
											<strong>County:</strong> {result.location.county}
										</p>
										<p className="mx-1">
											<strong>Point X:</strong> {result.location.point_x}
										</p>
										<p className="mx-1">
											<strong>Point Y:</strong> {result.location.point_y}
										</p>

										<h3 className="mb-3 text-lg">Severity Details</h3>
										<p className="mx-1">
											<strong>Collision Severity:</strong>{" "}
											{result.severity.collision_severity}
										</p>
										<p className="mx-1">
											<strong>Number Killed:</strong>{" "}
											{result.severity.number_killed}
										</p>
										<p className="mx-1">
											<strong>Number Injured:</strong>{" "}
											{result.severity.number_injured}
										</p>
										<p className="mx-1">
											<strong>Severe Injuries:</strong>{" "}
											{result.severity.count_severe_inj}
										</p>
										<p className="mx-1">
											<strong>Visible Injuries:</strong>{" "}
											{result.severity.count_visible_inj}
										</p>
										<p className="mx-1">
											<strong>Complaint of Pain Injuries:</strong>{" "}
											{result.severity.count_complaint_pain}
										</p>

										<h3 className="mb-3 text-lg">Accident Details</h3>
										<p className="mx-1">
											<strong>Accident Year:</strong> {result.accident_year}
										</p>
										<p className="mx-1">
											<strong>Collision Time:</strong> {result.collision_time}
										</p>
										<p className="mx-1">
											<strong>Type of Collision:</strong>{" "}
											{result.type_of_collision}
										</p>
										<p className="mx-1">
											<strong>Hit and Run:</strong>{" "}
											{result.hit_and_run === "Y" ? "Yes" : "No"}
										</p>
										<p className="mx-1">
											<strong>Pedestrian Involved:</strong>{" "}
											{result.pedestrian_accident === "Y" ? "Yes" : "No"}
										</p>
										<p className="mx-1">
											<strong>Bicycle Involved:</strong>{" "}
											{result.bicycle_accident === "Y" ? "Yes" : "No"}
										</p>
										<p className="mx-1">
											<strong>Motorcycle Involved:</strong>{" "}
											{result.motorcycle_accident === "Y" ? "Yes" : "No"}
										</p>
										<p className="mx-1">
											<strong>Truck Involved:</strong>{" "}
											{result.truck_accident === "Y" ? "Yes" : "No"}
										</p>
										<p className="mx-1">
											<strong>Alcohol Involved:</strong>{" "}
											{result.alcohol_involved === "Y" ? "Yes" : "No"}
										</p>

										<h3 className="mb-3 text-lg">Environment Details</h3>
										<p className="mx-1">
											<strong>Weather 1:</strong> {result.environment.weather_1}
										</p>
										<p className="mx-1">
											<strong>Weather 2:</strong> {result.environment.weather_2}
										</p>
										<p className="mx-1">
											<strong>Road Surface:</strong>{" "}
											{result.environment.road_surface}
										</p>
										<p className="mx-1">
											<strong>Lighting:</strong> {result.environment.lighting}
										</p>
										<p className="mx-1">
											<strong>State Highway Indicator:</strong>{" "}
											{result.environment.state_hwy_ind}
										</p>

										<h3 className="mb-3 text-lg">Party Details</h3>
										{result.parties && result.parties.length > 0 ? (
											result.parties.map((party: Party, idx: number) => (
												<div
													key={idx}
													className="mt-3 border-l-4 border-slate-200 pl-3"
												>
													<p className="mx-1">
														<strong>Party Number:</strong> {party.party_number}
													</p>
													<p className="mx-1">
														<strong>Party Type:</strong> {party.party_type}
													</p>
													<p className="mx-1">
														<strong>At Fault:</strong>{" "}
														{party.at_fault === "Y" ? "Yes" : "No"}
													</p>
													<p className="mx-1">
														<strong>Party Age:</strong> {party.party_age}
													</p>
													<p className="mx-1">
														<strong>Party Sex:</strong> {party.party_sex}
													</p>
												</div>
											))
										) : (
											<p className="mx-1">
												No party data available for this accident.
											</p>
										)}

										<h3 className="mb-3 text-lg">Victim Details</h3>
										{result.victims && result.victims.length > 0 ? (
											result.victims.map((victim, idx: number) => (
												<div
													key={idx}
													className="mt-3 border-l-4 border-slate-200 pl-3"
												>
													<p className="mx-1">
														<strong>Victim Role:</strong> {victim.victim_role}
													</p>
													<p className="mx-1">
														<strong>Victim Age:</strong> {victim.victim_age}
													</p>
													<p className="mx-1">
														<strong>Victim Sex:</strong> {victim.victim_sex}
													</p>
													<p className="mx-1">
														<strong>Degree of Injury:</strong>{" "}
														{victim.victim_degree_of_injury}
													</p>
												</div>
											))
										) : (
											<p className="mx-1">
												No victim data available for this accident.
											</p>
										)}
									</div>
								)}
							</li>
						))}
					</ul>
				) : (
					!loading && (
						<p className="mx-1">No results found for the specified query.</p>
					)
				)}
			</div>
		</div>
	);
};

export default AccidentQueryPage;
