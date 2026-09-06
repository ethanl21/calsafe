import { Filters, Conditions } from "./types";

export function getSearchParams(
	filters: Filters,
	conditions: Conditions,
	city: string,
	county: string,
	startDate: Date,
	endDate: Date,
): string {
	const params = new URLSearchParams();
	params.append("city", city);
	params.append("county", county);
	params.append("start_date", startDate.toISOString().slice(0, 10));
	params.append("end_date", endDate.toISOString().slice(0, 10));

	if (filters.fatal) params.append("collision_severity", "1");
	if (filters.hitAndRun) params.append("hit_and_run", "M,F");
	if (filters.alcohol) params.append("alcohol_involved", "Y");
	if (filters.motorcycle) params.append("motorcycle_accident", "Y");
	if (filters.bicycleAccident) params.append("bicycle_accident", "Y");
	if (filters.pedestrianAccident) params.append("pedestrian_accident", "Y");
	if (filters.truckAccident) params.append("truck_accident", "Y");
	if (filters.stateHighway) params.append("state_hwy_ind", "Y");

	if (conditions.weather && conditions.weather !== "all") {
		params.append("weather_1", conditions.weather);
	}
	if (conditions.collisionType && conditions.collisionType !== "all") {
		params.append("type_of_collision", conditions.collisionType);
	}
	if (conditions.lighting && conditions.lighting !== "all") {
		params.append("lighting", conditions.lighting);
	}
	if (conditions.roadSurface && conditions.roadSurface !== "all") {
		params.append("road_surface", conditions.roadSurface);
	}
	if (conditions.roadCondition && conditions.roadCondition !== "all") {
		params.append("road_cond_1", conditions.roadCondition);
	}

	return params.toString();
}

export async function fetchAccidents(params: string): Promise<unknown[]> {
	const res = await fetch(`/api/accidents?${params}`);
	if (!res.ok) {
		throw new Error(`Failed to fetch accidents: ${res.statusText}`);
	}
	const data = await res.json();
	if (!Array.isArray(data)) {
		throw new Error("Unexpected response format");
	}
	return data;
}
