# Deploying CalSafe to a self-hosted server

Target: Debian with Docker + compose plugin, ~5GB free disk, on the same LAN as your development machine (or otherwise reachable by it). All commands below run on the server unless noted.

## 0. Pre-flight (server)

```bash
git --version; docker --version; docker compose version; uname -m; df -h /opt | tail -1
```

Expect: git present, Docker + compose plugin present, `x86_64` (ARM images are unverified for `sqld`), ~5GB free. Also confirm TCP 3000 and 8080 are free (`ss -ltn | grep -E ':3000|:8080'` should print nothing).

## 1. Clone

```bash
git clone -b main https://github.com/ethanl21/calsafe.git /opt/calsafe && cd /opt/calsafe
```

Private repo over SSH instead: `git clone -b main git@github.com:ethanl21/calsafe.git /opt/calsafe` (requires a key authorized on the account).

## 2. Reverse-proxy network (only if proxying via container name)

If Nginx Proxy Manager runs in Docker and you want to forward to `http://app:3000`, both projects must share a network:

```bash
docker network create proxy
```

Then attach the NPM container to the `proxy` network (Portainer: container details → Networks → join `proxy`; or add it to NPM's own compose file). Skip this if you forward NPM to `<server-lan-ip>:3000` instead.

## 3. Database up

```bash
docker compose up -d db
docker compose ps
docker compose logs db --tail 5
```

Expect `sqld` listening on `0.0.0.0:8080`. The data volume is `sqld-data`.

## 4. Schema

```bash
docker compose --profile tools run --rm importer scripts/setup-db.ts
```

Expect `Tables created successfully.` This is destructive: it drops and recreates all tables.

## 5. Smoke import

```bash
docker compose --profile tools run --rm importer scripts/import-ccrs.ts --years=2024 --limit=2000 --data-dir=/cache
```

Expect ~1K kept SoCal crashes with parse/insert rates in the output. Fast (<1 min after CSVs are cached in the `ccrs-cache` volume).

## 6. Full import

```bash
docker compose --profile tools run --rm importer scripts/import-ccrs.ts --years=2024,2025,2026 --data-dir=/cache
```

Expect ~20–40 min unattended, progress every few seconds, roughly 250–300K crashes/yr for 2024/2025 and ~150K+ for 2026. Reruns wipe each year first, so an aborted run simply restarts. Use `tmux`/`screen` if SSH drops easily.

## 7. App up + verify

```bash
docker compose up -d --build app
curl -s localhost:3000/api/summary | head -c 500
```

Open `http://<server-lan-ip>:3000` and walk map/query/statistics/summary/graphs. The summary endpoint should show per-year totals for 2024–2026.

## 8. Public URL

Nginx Proxy Manager: new proxy host `calsafe.<domain>` → `http://app:3000` (or fallback `http://<server-lan-ip>:3000`), SSL via existing Let's Encrypt setup, plus a Cloudflare A record on existing dynamic DNS. Open the public URL and confirm pages render with data.

## 9. Monthly refresh (current year only)

Server crontab:

```cron
0 3 1 * * cd /opt/calsafe && git pull --ff-only -q && docker compose --profile tools run --rm importer scripts/import-ccrs.ts --years=$(date +\%Y) --data-dir=/cache
```

Verify with `crontab -l`. If cron can't find `docker`, use its full path (check with `which docker`). Every January, add the new year's 3 CCRS URLs to `FILES` in `scripts/import-ccrs.ts` and push.

## Troubleshooting

- `proxy` network missing → Step 2 creates it; or use the LAN-port fallback.
- Port conflict on 3000/8080 → change the published ports in `docker-compose.yml`.
- App build runs out of memory on a small box → build on a bigger machine and transfer: `docker build -t calsafe-app:latest . && docker save calsafe-app:latest | ssh <server> docker load`, then `docker compose up -d app` on the server (no `--build`).
- Import stalls >10 min with no new output → abort and rerun (idempotent).
- Code updates later → `git pull && docker compose up -d --build app`.
