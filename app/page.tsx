import { AreaSelector } from "./(components)/area-selector";
import { FilterCol } from "./(components)/filter-col";
import { VehicleSelector } from "./(components)/vehicle-selector";
import { DialogTrigger } from "./(components)/dialog-trigger";
import { InfoCard } from "./(components)/info-card";

export default function Page() {
	return (
		<>
			<div className="flex size-full gap-2 px-2">
				<aside className="w-fit">
					<FilterCol />
				</aside>

				<div className="flex grow flex-col space-y-1">
					<div className="h-full grow rounded-sm border-2">map goes here</div>
					<div className="flex h-fit shrink space-x-2">
						<VehicleSelector />
						<AreaSelector />
						<div className="flex flex-col space-y-1">
							<InfoCard
								num_datapoints={100}
								start_date={new Date()}
								end_date={new Date()}
							/>
							<DialogTrigger />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
