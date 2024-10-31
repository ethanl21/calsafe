import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const FilterCol = () => {
	return (
		<>
			<Card>
				<CardHeader className="mb-0 border-b-2 px-2 py-1">
					<h1 className="m-0 text-2xl font-bold">Filters</h1>
				</CardHeader>

				<CardContent className="p-0">
					<ScrollArea className="h-96">
						<div
							className="grid h-full gap-2 px-5 py-2"
							style={{
								gridTemplateColumns: "1fr min-content",
							}}
						>
							<Label htmlFor="alcohol-toggle">Alcohol</Label>
							<Switch id="alcohol-toggle"></Switch>

							<Label htmlFor="fatal-toggle">Fatal</Label>
							<Switch id="fatal-toggle"></Switch>

							<Label htmlFor="distracted-driving-toggle">
								Distracted Driving
							</Label>
							<Switch id="distracted-driving-toggle"></Switch>

							<Label htmlFor="single-vehicle-toggle">Single Vehicle</Label>
							<Switch id="single-vehicle-toggle"></Switch>

							<Label htmlFor="motorcycle-toggle">Motorcycle</Label>
							<Switch id="motorcycle-toggle"></Switch>

							<Label htmlFor="injuries-toggle">Injuries</Label>
							<Switch id="injuries-toggle"></Switch>

							<Label htmlFor="no-injuries-toggle">No Injuries</Label>
							<Switch id="no-injuries-toggle"></Switch>

							<Label htmlFor="severe-injury-toggle">Severe Injury</Label>
							<Switch id="severe-injury-toggle"></Switch>

							<Label htmlFor="property-damage-toggle">Property Damage</Label>
							<Switch id="property-damage-toggle"></Switch>

							<Label htmlFor="drugs-toggle">Drugs</Label>
							<Switch id="drugs-toggle"></Switch>

							<Label htmlFor="hit-and-run-toggle">Hit and Run</Label>
							<Switch id="hit-and-run-toggle"></Switch>

							<Label htmlFor="t-bone-toggle">T-Bone</Label>
							<Switch id="t-bone-toggle"></Switch>

							<Label htmlFor="head-on-toggle">Head-on</Label>
							<Switch id="head-on-toggle"></Switch>

							<Label htmlFor="rear-end-toggle">Rear-end</Label>
							<Switch id="rear-end-toggle"></Switch>

							<Label htmlFor="3-plus-vehicles-toggle">3+ Vehicles</Label>
							<Switch id="3-plus-vehicles-toggle"></Switch>
						</div>
					</ScrollArea>
				</CardContent>

				<CardFooter className="flex flex-row justify-end gap-2 border-t-2 p-2">
					<Button variant="destructive">Clear</Button>
					<Button>Update</Button>
				</CardFooter>
			</Card>
		</>
	);
};
