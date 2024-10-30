// app/layout.tsx

import "./globals.css";
import "leaflet/dist/leaflet.css";
import NavBar from "../components/NavBar";
import "modern-normalize";

export const metadata = {
	title: "CalSafe",
	description: "A map showing traffic data",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<NavBar />
				{children}
			</body>
		</html>
	);
}
