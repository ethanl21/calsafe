// components/NavBar.tsx

"use client";

import Link from "next/link";

const NavBar = () => {
	return (
		<nav className="bg-slate-700 p-2">
			<ul className="m-0 flex list-none justify-around p-0">
				<li className="my-2">
					<Link href="/" className="font-bold text-white no-underline">
						Query
					</Link>
				</li>
				<li className="my-2">
					<Link href="/map" className="font-bold text-white no-underline">
						Map
					</Link>
				</li>
				<li className="my-2">
					<Link
						href="/statistics"
						className="font-bold text-white no-underline"
					>
						Statistics
					</Link>
				</li>
			</ul>
		</nav>
	);
};

export default NavBar;
