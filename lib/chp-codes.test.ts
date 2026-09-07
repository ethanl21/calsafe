import { describe, it, expect } from "vitest";
import {
	safetyEquipMap,
	finanResponsMap,
	partySobrietyMap,
	partyDrugPhysicalMap,
	vehicleTypeMap,
	inattentionMap,
	movePreAccMap,
	victimDegreeMap,
} from "./chp-codes";

describe("chp-codes", () => {
	it("spot-checks each exported map", () => {
		expect(safetyEquipMap["G"]).toBe("Lap/Shoulder Harness Used");
		expect(finanResponsMap["Y"]).toBe("Yes, Proof of Insurance Obtained");
		expect(partySobrietyMap["A"]).toBe("Had Not Been Drinking");
		expect(partyDrugPhysicalMap["E"]).toBe("Under Drug Influence");
		expect(vehicleTypeMap["C"]).toBe("Motorcycle/Scooter");
		expect(inattentionMap["A"]).toBe("Cell Phone Handheld (7/1/03)");
		expect(movePreAccMap["B"]).toBe("Proceeding Straight");
		expect(victimDegreeMap["1"]).toBe("Fatal");
	});

	it("provides '' fallbacks where defined", () => {
		expect(safetyEquipMap[""]).toBe("Not Stated");
		expect(finanResponsMap[""]).toBe("Not Stated");
		expect(partyDrugPhysicalMap[""]).toBe("Not Stated");
		expect(vehicleTypeMap[""]).toBe("Not Stated");
		expect(inattentionMap[""]).toBe("Not Stated");
		expect(movePreAccMap[""]).toBe("Not Stated");
		expect(victimDegreeMap[""]).toBe("Unknown");
	});

	it("has non-empty maps with non-empty labels", () => {
		const maps = [
			safetyEquipMap,
			finanResponsMap,
			partySobrietyMap,
			partyDrugPhysicalMap,
			vehicleTypeMap,
			inattentionMap,
			movePreAccMap,
			victimDegreeMap,
		];
		for (const map of maps) {
			expect(Object.keys(map).length).toBeGreaterThan(0);
			for (const value of Object.values(map)) {
				expect(value.length).toBeGreaterThan(0);
			}
		}
	});
});
