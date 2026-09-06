# CalSafe

Traffic accident visualization and analysis for Southern California. There is an interactive map with clustered crash markers, a paginated query view, aggregated statistics dashboards, and yearly trend charts. The data comes from the California Highway Patrol.

## Data

Crash records come from the [California Crash Reporting System (CCRS)](https://data.ca.gov/dataset/ccrs), which updates daily. The app covers 10 Southern California counties (Imperial, Kern, Los Angeles, Orange, Riverside, San Bernardino, San Diego, San Luis Obispo, Santa Barbara, Ventura) for 2024-2026. Figures for 2026 are provisional and fill in as reports arrive. Raw CSVs are fetched at import time and never committed.

## Stack

The frontend is Next.js 14 (App Router) with React 18, TypeScript, Tailwind CSS and shadcn/ui. Leaflet renders the map on the client with marker clustering, Recharts draws the charts, and next-themes handles light/dark mode. Four route handlers under `app/api/` (`accidents`, `statistics`, `summary`, `summaryByCounty`) form the API, so there is no separate backend. Storage is libSQL/SQLite through `@libsql/client`, self-hosted with `sqld` in Docker; pointing the same client at a Turso cloud URL is all a cloud move would take. All calls are plain `fetch` against same-origin `/api/*` routes.

## Project structure

```
app/                  # Pages: / (map), /query, /statistics, /graphs, /summary, /predictions (placeholder)
app/api/              # API routes (accidents, statistics, summary, summaryByCounty)
app/(components)/     # Page-level UI (filters, selectors, charts, yearly-charts)
components/           # Shared UI (Map, header, footer, shadcn/ui)
lib/                  # db.ts (libsql client), api.ts, types.ts, constants.ts (data window), chp-codes.ts, utils.ts
scripts/              # setup-db.ts (schema), import-ccrs.ts (CCRS fetch + import)
```

The database is a normalized 6-table schema (`accidents`, `location`, `severity`, `environment`, `parties`, `victims`) holding only columns the UI actually reads.

## Run locally

Requires a reachable libSQL server (see Deployment, or point at any `libsql://` URL):

```bash
npm install
cp .env.example .env.local   # set LIBSQL_URL (e.g. http://<server-lan-ip>:8080)
npm run dev                  # http://localhost:3000
```

## Import data

```bash
npm run db:setup                                        # create tables (destructive)
npm run db:import                                        # all years 2024-2026
npm run db:import -- --years=2024 --limit=2000          # smoke test
npm run db:import -- --years=2026 --batch=2000          # subset / tuning
npm run db:import -- --redownload                       # re-fetch cached CSVs
```

The importer downloads each yearly CSV once (cached outside the repo) and stream-parses it with a SoCal-county filter, then bulk-inserts in batches with progress output before backfilling per-accident flags. Each year's rows get wiped first, so a rerun never duplicates anything.

## Deployment (self-hosted)

```bash
git clone <repo> /opt/calsafe && cd /opt/calsafe
docker compose up -d db
docker compose --profile tools run --rm importer scripts/setup-db.ts
docker compose --profile tools run --rm importer scripts/import-ccrs.ts --years=2024,2025,2026 --data-dir=/cache
docker compose up -d --build app
```

- App: `http://<server-lan-ip>:3000`; DB reachable at `<server-lan-ip>:8080` (LAN only; not exposed publicly).
- Public URL: add an Nginx Proxy Manager host (`calsafe.<domain>` → `http://app:3000`, shared `proxy` network preferred) plus a Cloudflare A record on existing dynamic DNS.
- Monthly refresh (current year only): cron `cd /opt/calsafe && git pull --ff-only -q && docker compose --profile tools run --rm importer scripts/import-ccrs.ts --years=$(date +\%Y) --data-dir=/cache`.
- Each January, add the new year's 3 CCRS URLs to `FILES` in `scripts/import-ccrs.ts`.

## Deployment (Turso cloud)

No code changes are needed to use Turso cloud instead. The same `@libsql/client` code works with a `libsql://` URL, so only the connection details change.

```bash
# one-time: create account, database, and token (dashboard, or Turso CLI)
turso db create calsafe
turso db show calsafe --url
turso db tokens create calsafe
```

```bash
# point the scripts at Turso (in .env.local, or export inline)
LIBSQL_URL="libsql://<db>.<region>.turso.io"
LIBSQL_AUTH_TOKEN="<token>"

npm run db:setup                                        # create tables (destructive)
npm run db:import -- --years=2024 --limit=2000          # smoke test (~8K writes)
npm run db:import -- --years=2024,2025,2026             # full import
```

Watch the write quota. The free tier allows 10M rows written per month and 5GB of storage. The 2024-2026 import lands around 6M writes and ~1GB. Check the Turso dashboard after the smoke test and again after the full import. Stop if projections pass ~9M. Monthly refresh imports the current year only, around 1.5M writes, well under the cap. Reruns are idempotent per year, but each rerun spends quota, so avoid blind repeats.

For the frontend, Vercel's hobby tier pairs well. Connect the repo and set `LIBSQL_URL` and `LIBSQL_AUTH_TOKEN` in the project environment, then deploy. You don't need connection pooling or driver changes.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `LIBSQL_URL` | libSQL server URL (`http://db:8080` in compose, `http://<lan-ip>:8080` for local dev, `libsql://…` for Turso cloud) |
| `LIBSQL_AUTH_TOKEN` | Only if server auth is enabled (not needed by default) |
