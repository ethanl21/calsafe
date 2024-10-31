import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const VehicleSelector = () => {
	return (
		<>
			<Card className="w-fit">
				<CardHeader>
					<h1 className="m-0 text-2xl font-bold">Vehicle Type</h1>
				</CardHeader>

				<CardContent>
					<RadioGroup className="flex">
						<div className="space-y-1">
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="pedestrian" id="vehicle-pedestrian" />
								<Label htmlFor="vehicle-pedestrian">Pedestrian</Label>
							</div>

							<div className="flex items-center space-x-2">
								<RadioGroupItem value="motorcycle" id="vehicle-motorcycle" />
								<Label htmlFor="vehicle-motorcycle">Motorcycle</Label>
							</div>

							<div className="flex items-center space-x-2">
								<RadioGroupItem value="automobile" id="vehicle-automobile" />
								<Label htmlFor="vehicle-automobile">Automobile</Label>
							</div>
						</div>

						<div className="space-y-1">
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="truck" id="vehicle-truck" />
								<Label htmlFor="vehicle-truck">Truck</Label>
							</div>

							<div className="flex items-center space-x-2">
								<RadioGroupItem value="cyclist" id="vehicle-cyclist" />
								<Label htmlFor="vehicle-cyclist">Cyclist</Label>
							</div>
						</div>
					</RadioGroup>
				</CardContent>
			</Card>
		</>
	);
};
