import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@libsql/client";

config({ path: resolve(process.cwd(), ".env.local") });

// Falls back to localhost so `next build` passes without credentials;
// real queries fail fast with connection refused instead.
const url = process.env.LIBSQL_URL ?? "http://localhost:8080";

// HTTP-based client: no connection pooling issues on serverless or Docker.
export const db = createClient({
	url,
	authToken: process.env.LIBSQL_AUTH_TOKEN,
});
