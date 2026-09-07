export interface Filters {
	alcohol: boolean;
	motorcycle: boolean;
	hitAndRun: boolean;
	fatal: boolean;
	bicycleAccident: boolean;
	pedestrianAccident: boolean;
	truckAccident: boolean;
	stateHighway: boolean;
	usePredictions: boolean;
}

export const DEFAULT_FILTERS: Filters = {
	alcohol: false,
	motorcycle: false,
	hitAndRun: false,
	fatal: false,
	bicycleAccident: false,
	pedestrianAccident: false,
	truckAccident: false,
	stateHighway: false,
	usePredictions: false,
};

export interface Conditions {
	weather: string;
	lighting: string;
	collisionType: string;
	roadSurface: string;
	roadCondition: string;
}

export const DEFAULT_CONDITIONS: Conditions = {
	weather: "",
	lighting: "",
	collisionType: "",
	roadSurface: "",
	roadCondition: "",
};

export interface YearlyData {
	year: number;
	data: {
		total_crashes: number;
		total_injuries: number | null;
		total_fatalities: number | null;
		pedestrian_accidents: number;
		bicycle_accidents: number;
		motorcycle_accidents: number;
		truck_accidents: number;
		alcohol_related: number;
	};
}

export interface StatisticsResponse {
	total_crashes: number;
	total_injuries: number;
	total_fatalities: number;
	pedestrian_accidents: number;
	bicycle_accidents: number;
	motorcycle_accidents: number;
	truck_accidents: number;
	alcohol_related: number;
	hit_and_run: number;
	broadside: number;
	head_on: number;
	sideswipe: number;
	rear_end: number;
	hit_object: number;
	roll_over: number;
	most_accidents_city: { city: string; accident_count: number } | null;
	most_common_road_pair: {
		primary_rd: string;
		secondary_rd: string;
		count: number;
	} | null;
	most_common_day: { day: string; count: number } | null;
}
