import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger } from "@/components/ui/select";

export const AreaSelector = () => {
	return (
		<>
			<Card className="w-fit">
				<CardHeader>
					<h1 className="m-0 text-2xl font-bold">Location</h1>
				</CardHeader>

				<CardContent>
					<Label htmlFor="county-select">County</Label>
					<Select>
						<SelectTrigger id="county-select">Select a county</SelectTrigger>
					</Select>

					<Label htmlFor="city-select">City</Label>
					<Select>
						<SelectTrigger id="city-select">Select a city</SelectTrigger>
					</Select>
				</CardContent>
			</Card>
		</>
	);
};
