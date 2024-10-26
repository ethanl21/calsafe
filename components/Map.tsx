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
			"http://localhost:8000/api/accidents/?start_date=2021-11-01&end_date=2021-12-31&county=Orange",
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
						<strong>Severity:</strong> {accident.severity.collision_severity == "1" ? "Fatal" :
						 	accident.severity.collision_severity == "2" ? "Severe Injury" : 
							accident.severity.collision_severity == "3" ? "Minor/Visible Injury" :
							accident.severity.collision_severity == "4" ? "Complaint of Pain" : "Property Damage Only"}
						<br />
						<strong>Number Killed:</strong> {accident.severity.number_killed}
						<br />
						<strong>Number Injured:</strong> {accident.severity.number_injured}
						<br />
						<strong>Weather Conditions:</strong>{" "}
						{accident.environment.weather_1 == "A" ? "Clear" :
						 	accident.environment.weather_1 == "C" ? "Raining" :
							accident.environment.weather_1 == "E" ? "Fog" : 
							accident.environment.weather_1 == "D" ? "Snowing" : "Other"}
						<br />
						<strong>Road Conditions:</strong> {accident.environment.road_cond_1 == "A" ? "Potholes" : 
							accident.environment.road_cond_1 == "B" ? "Loose Materials on Road" : 
							accident.environment.road_cond_1 == "C" ? "Obstruction on Road" :
							accident.environment.road_cond_1 == "D" ? "Construction Zone" :
							accident.environment.road_cond_1 == "E" ? "Reduced Width" :
							accident.environment.road_cond_1 == "F" ? "Flooded" :
							accident.environment.road_cond_1 == "H" ? "No Unsual Conditions" : "Other/Not Stated"}
						<br />
						<strong>Road Surface:</strong> {accident.environment.road_surface == "A" ? "Dry" :
							accident.environment.road_surface == "B" ? "Wet" :
							accident.environment.road_surface == "C" ? "Snowy or Icy" :
							accident.environment.road_surface == "D" ? "Slippery (Muddy, Oily, etc.)" : "Not Stated"}
						<br />
						<strong>Road Lighting:</strong> {accident.environment.lighting == "A" ? "Daylight" :
							accident.environment.lighting == "B" ? "Dawn/Dusk" :
							accident.environment.lighting == "C" ? "Dark w/ Street Lamps" :
							accident.environment.lighting == "D" ? "Dark w/o Street Lamps" :
							accident.environment.lighting == "E" ? "Dark w/ Inoperable Lamps" : "Not Stated"}
						<br />
						<strong>Location:</strong> {accident.location.primary_rd} and{" "}
							{accident.location.secondary_rd}
						<br />
						<strong>City:</strong> {accident.location.city}
						<br />
						<strong>Hit and Run:</strong>{" "}
						{accident.hit_and_run === "M" ? "Misdemeanor" : accident.hit_and_run === "F" ? "Felony" : "No"}
						<br />
						<strong>Type of Collision:</strong>{" "}
						{accident.type_of_collision === "A" ? "Head-On" :
						 	accident.type_of_collision === "B" ? "Sideswipe" :
							accident.type_of_collision === "C" ? "Rear-End" : 
							accident.type_of_collision === "D" ? "Broadside" :
							accident.type_of_collision === "E" ? "Hit Object" : 
							accident.type_of_collision === "F" ? "Roll-Over" : 
							accident.type_of_collision === "G" ? "Vehicle/Pedestrian" : "Other or Not Stated"}
						<br />
						<strong>Alcohol Involved:</strong>{" "}
						{accident.alcohol_involved === "Y" ? "Yes" : "No"}
						<br />
						<strong>Pedestrian Involved:</strong>{" "}
						{accident.pedestrian_accident === "Y" ? "Yes" : "No"}
						<br />
						<strong>Motorcycle Involved:</strong>{" "}
						{accident.motorcycle_accident === "Y" ? "Yes" : "No"}
						<br />
						<strong>Bicycle Involved:</strong>{" "}
						{accident.bicycle_accident === "Y" ? "Yes" : "No"}
						<br />
						<strong>Truck Involved:</strong>{" "}
						{accident.truck_accident === "Y" ? "Yes" : "No"}
						<br />
					</Popup>
				</Marker>
			))}
		</MapContainer>
	);
};

export default AccidentMap;
