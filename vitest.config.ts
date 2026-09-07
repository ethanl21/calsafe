import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: { "@": path.resolve("./") },
	},
	test: {
		environment: "node",
		include: [
			"lib/**/*.test.ts",
			"app/**/*.test.tsx",
			"components/**/*.test.tsx",
		],
		passWithNoTests: true,
	},
});
