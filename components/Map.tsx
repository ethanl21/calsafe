// components/Map.tsx

"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

//Fix for default icon issues with Leaflet in Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		typeof window !== "undefined"
			? require("leaflet/dist/images/marker-icon-2x.png")
			: "",
	iconUrl:
		typeof window !== "undefined"
			? require("leaflet/dist/images/marker-icon.png")
			: "",
	shadowUrl:
		typeof window !== "undefined"
			? require("leaflet/dist/images/marker-shadow.png")
			: "",
});

const AccidentMap = () => {
	const [accidents, setAccidents] = useState([]);

	useEffect(() => {
		fetch(
			"http://localhost:8000/api/accidents/?start_date=2021-01-01&end_date=2021-12-31&county=Orange",
		)
			.then((response) => response.json())
			.then((data) => {
				const validData = data
					.filter(
						(accident) =>
							accident.location &&
							accident.location.point_x !== null &&
							accident.location.point_y !== null &&
							!isNaN(accident.location.point_x) &&
							!isNaN(accident.location.point_y) &&
							accident.location.point_y >= -90 &&
							accident.location.point_y <= 90 &&
							accident.location.point_x >= -180 &&
							accident.location.point_x <= 180,
					)
					.slice(0, 10000);
				setAccidents(validData);
			})
			.catch((error) => console.error("Error fetching accident data:", error));
	}, []);

	return (
		<MapContainer
			center={[34.055, -118.24]}
			zoom={10}
			style={{ height: "100vh", width: "100%" }}
		>
			<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
			{accidents.map((accident, index) => (
				<Marker
					key={index}
					position={[accident.location.point_y, accident.location.point_x]}
				>
					<Popup>
						<strong>Date:</strong>{" "}
						{new Date(accident.collision_date).toLocaleDateString()}
						<br />
						<strong>Time:</strong> {accident.collision_time}
						<br />
						<strong>Severity:</strong> {accident.severity.collision_severity}
						<br />
						<strong>Number Killed:</strong> {accident.severity.number_killed}
						<br />
						<strong>Number Injured:</strong> {accident.severity.number_injured}
						<br />
						<strong>Weather Conditions:</strong>{" "}
						{accident.environment.weather_1}
						<br />
						<strong>Road Conditions:</strong> {accident.environment.road_cond_1}
						<br />
						<strong>Location:</strong> {accident.location.primary_rd} and{" "}
						{accident.location.secondary_rd}
						<br />
						<strong>Hit and Run:</strong>{" "}
						{accident.hit_and_run === "Y" ? "Yes" : "No"}
						<br />
						<strong>Alcohol Involved:</strong>{" "}
						{accident.alcohol_involved === "Y" ? "Yes" : "No"}
						<br />
					</Popup>
				</Marker>
			))}
		</MapContainer>
	);
};

export default AccidentMap;
