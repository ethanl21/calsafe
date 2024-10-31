"use server";

import { NavLink } from "@/components/nav-link";
import {
	NavigationMenu,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { CircleHelp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export const Header = () => {
	return (
		<header className="flex flex-col gap-2 px-6 py-4">
			<div className="flex justify-between">
				<h1 className="self-end text-5xl font-extrabold">CalSafe</h1>

				<div className="flex flex-col gap-5">
					<div className="flex gap-3">
						<NavigationMenu className="mx-auto w-fit">
							<NavigationMenuList className="flex justify-between">
								<NavLink href="">Civilian</NavLink>
								<NavLink href="">Law Enforcement</NavLink>
								<NavLink href="">Engineer</NavLink>
							</NavigationMenuList>
						</NavigationMenu>

						<Button size="icon">
							<CircleHelp size={36} />
						</Button>
					</div>

					<div className="flex gap-3">
						{/* might need to extract this into a client component later */}
						<div className="relative w-full">
							<Input placeholder="Search"></Input>
							<Search className="absolute inset-y-0 right-2 h-full opacity-50" />
						</div>

						<div className="flex gap-2">
							<Link href="" className={buttonVariants({ variant: "default" })}>
								Sign Up
							</Link>
							<Link href="" className={buttonVariants({ variant: "default" })}>
								Log In
							</Link>
						</div>
					</div>
				</div>
			</div>

			<Separator className="mt-3" />

			<NavigationMenu className="mx-auto my-3 w-fit rounded-md border-2">
				<NavigationMenuList className="flex justify-between">
					<NavLink href="/map">
						<span className="text-2xl">Map</span>
					</NavLink>
					<NavLink href="/statistics">
						<span className="text-2xl">Statistical Analysis</span>
					</NavLink>
					<NavLink href="">
						<span className="text-2xl">Prediction</span>
					</NavLink>
					<NavLink href="">
						<span className="text-2xl">Summary</span>
					</NavLink>
					<NavLink href="">
						<span className="text-2xl">Graphs</span>
					</NavLink>
					<NavLink href="">
						<span className="text-2xl">Tools</span>
					</NavLink>
				</NavigationMenuList>
			</NavigationMenu>
		</header>
	);
};
