import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const DialogTrigger = () => {
	return (
		<>
			<Card className="h-fit">
				<CardContent className="m-0 p-0">
					<div className="grid grid-cols-2 gap-1 p-4">
						<Button>Options</Button>
						<Button>Filters</Button>
						<Button>Layers</Button>
						<Button>Basemaps</Button>
					</div>
				</CardContent>
			</Card>
		</>
	);
};
