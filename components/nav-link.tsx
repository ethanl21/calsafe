"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";
import {
	NavigationMenuItem,
	NavigationMenuLink,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { clsx } from "cn";

interface NavLinkProps extends PropsWithChildren {
	href: string;
}
export const NavLink = ({ href, children }: NavLinkProps) => {
	const pathname = usePathname();

	return (
		<NavigationMenuItem>
			<NavigationMenuLink
				render={<Link href={href} />}
				className={clsx([
					navigationMenuTriggerStyle(),

					{
						"font-extrabold": pathname === href,
					},
				])}
			>
				{children}
			</NavigationMenuLink>
		</NavigationMenuItem>
	);
};
