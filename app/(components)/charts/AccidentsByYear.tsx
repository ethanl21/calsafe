import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";

type AccidentData = {
	data: {
		year: number;
		total: number | null;
	}[];
};

const chartConfig = {
	total: {
		label: "Total",
		color: "#3f77d1",
	},
} satisfies ChartConfig;

export function AccidentsByYear({ data }: AccidentData) {
	return (
		<ChartContainer config={chartConfig} className="min-h-[300px] w-full">
			<AreaChart
				accessibilityLayer
				data={data}
				margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
			>
				<defs>
					<linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
						<stop
							offset="5%"
							stopColor="var(--color-total)"
							stopOpacity={0.8}
						/>
						<stop offset="95%" stopColor="var(--color-total)" stopOpacity={0} />
					</linearGradient>
				</defs>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="year" />
				<YAxis
					type="number"
					domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
				/>
				<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
				<Area
					dataKey="total"
					type="monotone"
					stroke="var(--color-total)"
					fillOpacity={1}
					fill="url(#fill)"
				/>
			</AreaChart>
		</ChartContainer>
	);
}
