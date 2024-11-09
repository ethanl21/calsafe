import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export const ConditionsSelector = () => {
	return (
		<>
			<Card>
				<CardHeader>
					<h1 className="m-0 text-2xl font-bold">Conditions</h1>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-2">
						<Label>Weather</Label>
						<Select>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Clear" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="clear">Clear</SelectItem>
								<SelectItem value="cloudy">Cloudy</SelectItem>
								<SelectItem value="raining">Raining</SelectItem>
								<SelectItem value="snowing">Snowing</SelectItem>
								<SelectItem value="fog">Fog</SelectItem>
								<SelectItem value="wind">Wind</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>

						<Label>Lighting</Label>
						<Select>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Daylight" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="daylight">Daylight</SelectItem>
								<SelectItem value="dusk_dawn">Dusk/Dawn</SelectItem>
								<SelectItem value="dark">Dark (w/o Street Lights)</SelectItem>
								<SelectItem value="dark-lights">
									Dark (w/ Street Lights)
								</SelectItem>
								<SelectItem value="dark-malfunction">
									Dark (w/ Malfunctioning Street Lights)
								</SelectItem>
							</SelectContent>
						</Select>

						<Label>Collision Type</Label>
						<Select>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Head-On" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="head-on">Head-On</SelectItem>
								<SelectItem value="sideswipe">Sideswipe</SelectItem>
								<SelectItem value="rear-end">Rear-end</SelectItem>
								<SelectItem value="broadside">Broadside</SelectItem>
								<SelectItem value="hit-object">Hit Object</SelectItem>
								<SelectItem value="overturned">Overturned</SelectItem>
								<SelectItem value="vehicle-pedestrian">
									Vehicle/Pedestrian
								</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>
		</>
	);
};
