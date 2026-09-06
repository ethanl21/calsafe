import { describe, it, expect } from "vitest";
import { getSearchParams } from "./api";
import { DEFAULT_FILTERS, DEFAULT_CONDITIONS } from "./types";

const start = new Date("2024-01-01");
const end = new Date("2024-02-15");

describe("getSearchParams", () => {
	it("formats dates as YYYY-MM-DD and passes city/county through", () => {
		const params = new URLSearchParams(
			getSearchParams(
				DEFAULT_FILTERS,
				DEFAULT_CONDITIONS,
				"Los Angeles",
				"Los Angeles",
				start,
				end,
			),
		);
		expect(params.get("city")).toBe("Los Angeles");
		expect(params.get("county")).toBe("Los Angeles");
		expect(params.get("start_date")).toBe("2024-01-01");
		expect(params.get("end_date")).toBe("2024-02-15");
	});

	it("maps each filter flag to its query param", () => {
		const cases = [
			[{ ...DEFAULT_FILTERS, fatal: true }, "collision_severity", "1"],
			[{ ...DEFAULT_FILTERS, hitAndRun: true }, "hit_and_run", "M,F"],
			[{ ...DEFAULT_FILTERS, alcohol: true }, "alcohol_involved", "Y"],
			[{ ...DEFAULT_FILTERS, motorcycle: true }, "motorcycle_accident", "Y"],
			[{ ...DEFAULT_FILTERS, bicycleAccident: true }, "bicycle_accident", "Y"],
			[
				{ ...DEFAULT_FILTERS, pedestrianAccident: true },
				"pedestrian_accident",
				"Y",
			],
			[{ ...DEFAULT_FILTERS, truckAccident: true }, "truck_accident", "Y"],
			[{ ...DEFAULT_FILTERS, stateHighway: true }, "state_hwy_ind", "Y"],
		] as const;
		for (const [filters, key, value] of cases) {
			const params = new URLSearchParams(
				getSearchParams(filters, DEFAULT_CONDITIONS, "", "", start, end),
			);
			expect(params.get(key)).toBe(value);
		}
	});

	it("omits empty/'all' conditions and appends real values", () => {
		const omitted = new URLSearchParams(
			getSearchParams(
				DEFAULT_FILTERS,
				{
					weather: "all",
					collisionType: "all",
					lighting: "all",
					roadSurface: "all",
					roadCondition: "all",
				},
				"",
				"",
				start,
				end,
			),
		);
		for (const key of [
			"weather_1",
			"type_of_collision",
			"lighting",
			"road_surface",
			"road_cond_1",
		]) {
			expect(omitted.has(key)).toBe(false);
		}

		const appended = new URLSearchParams(
			getSearchParams(
				DEFAULT_FILTERS,
				{
					weather: "A",
					collisionType: "B",
					lighting: "C",
					roadSurface: "D",
					roadCondition: "E",
				},
				"",
				"",
				start,
				end,
			),
		);
		expect(appended.get("weather_1")).toBe("A");
		expect(appended.get("type_of_collision")).toBe("B");
		expect(appended.get("lighting")).toBe("C");
		expect(appended.get("road_surface")).toBe("D");
		expect(appended.get("road_cond_1")).toBe("E");
	});
});
