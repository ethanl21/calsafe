// @vitest-environment jsdom
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AreaSelector } from "./area-selector";

afterEach(cleanup);

const locations = [{ name: "Orange", cities: ["Irvine", "Anaheim"] }];

// Mirrors production: page-level state flows back in as props,
// so item keys regenerate on every selection (nanoid).
function StatefulAreaSelector() {
	const [location, setLocation] = useState({ county: "", city: "" });
	return (
		<AreaSelector
			locations={locations}
			currentLocation={location}
			setCurrentLocation={setLocation}
		/>
	);
}

describe("AreaSelector county select", () => {
	it("commits a county selection on a realistic click sequence", async () => {
		const user = userEvent.setup();
		const setCurrentLocation = vi.fn();
		render(
			<AreaSelector
				locations={locations}
				currentLocation={{ county: "", city: "" }}
				setCurrentLocation={setCurrentLocation}
			/>,
		);
		await user.click(screen.getByText("Select a county"));
		await user.click(await screen.findByText("Orange"));
		expect(setCurrentLocation).toHaveBeenCalledWith({
			county: "Orange",
			city: "",
		});
	});

	it("shows the selected county in the trigger after the popup closes", async () => {
		const user = userEvent.setup();
		render(<StatefulAreaSelector />);
		await user.click(screen.getByText("Select a county"));
		await user.click(await screen.findByText("Orange"));
		// The placeholder must be gone and the trigger itself must display
		// the selection (queried by its label-associated name, independent
		// of when the closing popup unmounts, which needs real CSS transitions).
		expect(screen.queryByText("Select a county")).toBeNull();
		const trigger = screen.getByRole("combobox", { name: "County" });
		expect(trigger.textContent).toContain("Orange");
	});
});
