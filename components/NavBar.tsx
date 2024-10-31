"use server";

import { NavLink } from "@/components/nav-link";
import {
	NavigationMenu,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";

export const NavBar = () => {
	return (
		<header className="">
			<div className="mx-auto w-fit rounded-md border-2">
				<NavigationMenu>
					<NavigationMenuList className="flex justify-between">
						<NavLink href="/map">Map</NavLink>
						<NavLink href="/statistics">Statistical Analysis</NavLink>
						<NavLink href="">Prediction</NavLink>
						<NavLink href="">Summary</NavLink>
						<NavLink href="">Graphs</NavLink>
						<NavLink href="">Tools</NavLink>
					</NavigationMenuList>
				</NavigationMenu>
			</div>
		</header>
	);
};
