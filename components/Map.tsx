/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";

import MarkerClusterGroup from "react-leaflet-markercluster";
import {
	safetyEquipMap,
	finanResponsMap,
	partySobrietyMap,
	partyDrugPhysicalMap,
	vehicleTypeMap,
	inattentionMap,
	movePreAccMap,
	victimDegreeMap,
} from "@/lib/chp-codes";

L.Icon.Default.mergeOptions({
	iconUrl: "/images/leaflet/marker-icon.png",
	iconRetinaUrl: "/images/leaflet/marker-icon-2x.png",
	shadowUrl: "/images/leaflet/marker-shadow.png",
});

interface MapProps {
	accidents?: Accident[];
	predictions?: Predictions[];
}

const Map: React.FC<MapProps> = ({ accidents, predictions }) => {
	const defaultCenter: [number, number] = [34.055, -118.24];
	const defaultZoom = 10;

	return (
		<MapContainer
			center={defaultCenter}
			zoom={defaultZoom}
			style={{ height: "75vh", width: "100%" }}
		>
			<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
			<MarkerClusterGroup {...(undefined as any)}>
				{accidents &&
					accidents
						.filter(
							(accident) =>
								accident.location.point_x &&
								accident.location.point_y &&
								!isNaN(accident.location.point_x) &&
								!isNaN(accident.location.point_y) &&
								accident.location.point_y >= -90 &&
								accident.location.point_y <= 90 &&
								accident.location.point_x >= -180 &&
								accident.location.point_x <= 180,
						)
						.map((accident) => {
							const {
								case_id,
								collision_date,
								collision_time,
								location,
								severity,
								environment,
								hit_and_run,
								type_of_collision,
								pedestrian_accident,
								bicycle_accident,
								motorcycle_accident,
								truck_accident,
								alcohol_involved,
							} = accident;

							const { point_x, point_y, primary_rd, secondary_rd, city } =
								location;

							return (
								<Marker
									key={case_id}
									position={[point_y as number, point_x as number]}
								>
									<Popup>
										<div
											style={{
												maxWidth: "400px",
												maxHeight: "400px",
												overflowY: "auto",
												backgroundColor: "rgba(255, 255, 255, 0.8)",
												padding: "10px",
												borderRadius: "8px",
												boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
											}}
										>
											<div>
												<strong>Date:</strong>{" "}
												{new Date(collision_date).toLocaleDateString()}
												<br />
												<strong>Time:</strong> {collision_time || "Unknown"}
												<br />
												<strong>Severity:</strong>{" "}
												{severity.collision_severity === "1"
													? "Fatal"
													: severity.collision_severity === "2"
														? "Severe Injury"
														: severity.collision_severity === "3"
															? "Minor/Visible Injury"
															: severity.collision_severity === "4"
																? "Complaint of Pain"
																: "Property Damage Only"}
												<br />
												<strong>Number Killed:</strong>{" "}
												{severity.number_killed || 0}
												<br />
												<strong>Number Injured:</strong>{" "}
												{severity.number_injured || 0}
												<br />
												<strong>Weather Conditions:</strong>{" "}
												{environment.weather_1 === "A"
													? "Clear"
													: environment.weather_1 === "C"
														? "Raining"
														: environment.weather_1 === "E"
															? "Fog"
															: environment.weather_1 === "D"
																? "Snowing"
																: "Other"}
												<br />
												<strong>Road Surface:</strong>{" "}
												{environment.road_surface === "A"
													? "Dry"
													: environment.road_surface === "B"
														? "Wet"
														: environment.road_surface === "C"
															? "Snowy or Icy"
															: environment.road_surface === "D"
																? "Slippery (Muddy, Oily, etc.)"
																: "Not Stated"}
												<br />
												<strong>Road Conditions:</strong>{" "}
												{environment.road_cond_1 == "A"
													? "Potholes"
													: environment.road_cond_1 == "B"
														? "Loose Materials on Road"
														: environment.road_cond_1 == "C"
															? "Obstruction on Road"
															: environment.road_cond_1 == "D"
																? "Construction Zone"
																: environment.road_cond_1 == "E"
																	? "Reduced Width"
																	: environment.road_cond_1 == "F"
																		? "Flooded"
																		: environment.road_cond_1 == "H"
																			? "No Unsual Conditions"
																			: "Other/Not Stated"}
												<br />
												<strong>Road Lighting:</strong>{" "}
												{environment.lighting === "A"
													? "Daylight"
													: environment.lighting === "B"
														? "Dawn/Dusk"
														: environment.lighting === "C"
															? "Dark w/ Street Lamps"
															: environment.lighting === "D"
																? "Dark w/o Street Lamps"
																: environment.lighting === "E"
																	? "Dark w/ Inoperable Lamps"
																	: "Not Stated"}
												<br />
												<strong>Location:</strong> {primary_rd || "Unknown"} and{" "}
												{secondary_rd || "Unknown"}
												<br />
												<strong>City:</strong> {city || "Unknown"}
												<br />
												<strong>Hit and Run:</strong>{" "}
												{hit_and_run === "M"
													? "Misdemeanor"
													: hit_and_run === "F"
														? "Felony"
														: "No"}
												<br />
												<strong>Type of Collision:</strong>{" "}
												{type_of_collision === "A"
													? "Head-On"
													: type_of_collision === "B"
														? "Sideswipe"
														: type_of_collision === "C"
															? "Rear-End"
															: type_of_collision === "D"
																? "Broadside"
																: type_of_collision === "E"
																	? "Hit Object"
																	: type_of_collision === "F"
																		? "Roll-Over"
																		: type_of_collision === "G"
																			? "Vehicle/Pedestrian"
																			: "Other or Not Stated"}
												<br />
												<strong>Alcohol Involved:</strong>{" "}
												{alcohol_involved === "Y" ? "Yes" : "No"}
												<br />
												<strong>Pedestrian Involved:</strong>{" "}
												{pedestrian_accident === "Y" ? "Yes" : "No"}
												<br />
												<strong>Motorcycle Involved:</strong>{" "}
												{motorcycle_accident === "Y" ? "Yes" : "No"}
												<br />
												<strong>Bicycle Involved:</strong>{" "}
												{bicycle_accident === "Y" ? "Yes" : "No"}
												<br />
												<strong>Truck Involved:</strong>{" "}
												{truck_accident === "Y" ? "Yes" : "No"}
											</div>

											<hr
												style={{
													margin: "10px 0",
													borderColor: "rgba(0, 0, 0, 0.2)",
												}}
											/>

											<br />
											<br />
											{accident.victims && accident.victims.length > 0 && (
												<>
													<div>
														<strong>Victims:</strong>
														<ul>
															{accident.victims.map((victim, index) => (
																<li key={index}>
																	<br />
																	<strong>Victim Role:</strong>{" "}
																	{victim.victim_role === "1"
																		? "Driver"
																		: victim.victim_role === "2"
																			? "Passenger"
																			: victim.victim_role === "3"
																				? "Pedestrian"
																				: victim.victim_role === "4"
																					? "Bicyclist"
																					: victim.victim_role === "5"
																						? "Other"
																						: victim.victim_role === "6"
																							? "Non-Injured Party"
																							: "Unknown"}
																	<br />
																	<strong>Victim Age:</strong>{" "}
																	{victim.victim_age}
																	<br />
																	<strong>Victim Sex:</strong>{" "}
																	{victim.victim_sex}
																	<br />
																	<strong>Degree of Injury:</strong>{" "}
																	{victim.victim_degree_of_injury
																		? victimDegreeMap[
																				victim.victim_degree_of_injury
																			]
																		: "Unknown"}
																	<br />
																	<strong>Safety Equipment:</strong>{" "}
																	{safetyEquipMap[
																		victim.victim_safety_equip_1 ?? ""
																	] || "Unknown"}
																	<br />
																	<strong>Victim Ejected:</strong>{" "}
																	{victim.victim_ejected === "0"
																		? "Not Ejected"
																		: victim.victim_ejected === "1"
																			? "Fully Ejected"
																			: victim.victim_ejected === "2"
																				? "Partially Ejected"
																				: "Unknown"}
																	<br />
																</li>
															))}
														</ul>
													</div>

													<hr
														style={{
															margin: "10px 0",
															borderColor: "rgba(0, 0, 0, 0.2)",
														}}
													/>
												</>
											)}
											<br />
											{accident.parties && accident.parties.length > 0 && (
												<>
													<div>
														<strong>Parties:</strong>
														<ul>
															{accident.parties.map((party, index) => (
																<li key={index}>
																	<br />
																	<strong>Party Type:</strong>{" "}
																	{party.party_type === "1"
																		? "Driver (including Hit and Run)"
																		: party.party_type === "2"
																			? "Pedestrian"
																			: party.party_type === "3"
																				? "Parked Vehicle"
																				: party.party_type === "4"
																					? "Bicyclist"
																					: party.party_type === "5"
																						? "Other"
																						: party.party_type === "6"
																							? "Operator"
																							: "Unknown"}
																	<br />
																	<strong>At Fault:</strong>{" "}
																	{party.at_fault === "Y" ? "Yes" : "No"}
																	<br />
																	<strong>Party Age:</strong> {party.party_age}
																	<br />
																	<strong>Party Sex:</strong> {party.party_sex}
																	<br />
																	<strong>Party Race:</strong>{" "}
																	{party.race == "A"
																		? "Asian"
																		: party.race == "B"
																			? "Black"
																			: party.race == "H"
																				? "Hispanic"
																				: party.race == "W"
																					? "White"
																					: "Other"}
																	<br />
																	<strong>Vehicle Year/Make:</strong>{" "}
																	{party.vehicle_year} {party.vehicle_make}
																	<br />
																	<strong>Vehicle Type:</strong>{" "}
																	{party.stwd_vehicle_type
																		? vehicleTypeMap[party.stwd_vehicle_type]
																		: "Unknown"}
																	<br />
																	<strong>Sobriety:</strong>{" "}
																	{party.party_sobriety
																		? partySobrietyMap[party.party_sobriety]
																		: "Unknown"}
																	<br />
																	<strong>
																		Drug/Physical Impairment:
																	</strong>{" "}
																	{party.party_drug_physical
																		? partyDrugPhysicalMap[
																				party.party_drug_physical
																			]
																		: "Unknown"}
																	<br />
																	<strong>Safety Equipment:</strong>{" "}
																	{party.party_safety_equip_1
																		? safetyEquipMap[party.party_safety_equip_1]
																		: "Unknown"}
																	<br />
																	<strong>
																		Financial Responsibility:
																	</strong>{" "}
																	{party.finan_respons
																		? finanResponsMap[party.finan_respons]
																		: "Unknown"}
																	<br />
																	<strong>Inattention:</strong>{" "}
																	{party.inattention
																		? inattentionMap[party.inattention]
																		: "Unknown"}
																	<br />
																	<strong>
																		Movement Preceding Accident:
																	</strong>{" "}
																	{party.move_pre_acc
																		? movePreAccMap[party.move_pre_acc]
																		: "Unknown"}
																</li>
															))}
														</ul>
													</div>
												</>
											)}
										</div>
									</Popup>
								</Marker>
							);
						})}
			</MarkerClusterGroup>

			<MarkerClusterGroup {...(undefined as any)}>
				{predictions &&
					predictions.map((prediction, index) => {
						const { lat, lon, rad } = prediction;
						return (
							<Circle
								key={index}
								center={[lat as number, lon as number]}
								radius={rad as number}
								color="#ff0000"
							/>
						);
					})}
			</MarkerClusterGroup>
		</MapContainer>
	);
};

export default Map;
