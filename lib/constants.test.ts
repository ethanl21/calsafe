import { describe, it, expect } from "vitest";
import {
	DATA_START_DATE,
	DATA_END_DATE,
	DATA_START_YEAR,
	DATA_END_YEAR,
	DATA_YEAR_RANGE_LABEL,
} from "./constants";

describe("constants", () => {
	it("pins the crash data coverage window", () => {
		expect(DATA_START_YEAR).toBe(2024);
		expect(DATA_END_YEAR).toBe(2026);
		expect(DATA_START_DATE).toBe("2024-01-01");
		expect(DATA_END_DATE).toBe("2026-12-31");
	});

	it("labels the year range", () => {
		expect(DATA_YEAR_RANGE_LABEL).toContain(String(DATA_START_YEAR));
		expect(DATA_YEAR_RANGE_LABEL).toContain(String(DATA_END_YEAR));
	});
});
