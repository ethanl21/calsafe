import { FilterCol } from "./(components)/filter-col";
import { VehicleSelector } from "./(components)/vehicle-selector";

export default function Page() {
	return (
		<>
			<div className="flex size-full gap-2 px-2">
				<aside className="w-fit">
					<FilterCol />
				</aside>

				<div className="flex grow flex-col">
					<div className="h-full grow rounded-sm border-2">map goes here</div>
					<div className="h-fit shrink">
						<VehicleSelector />
					</div>
				</div>
			</div>
		</>
	);
}
