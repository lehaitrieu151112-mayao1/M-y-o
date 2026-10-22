# M-Y-O Disk API (self-hosted server source)

This service is the backend source for a persistent virtual file disk. It is **not running just because these files are in GitHub**; deploy it on a server/container host with a persistent volume to make the API available.

## Run on a server you control
1. Install Docker Engine and Docker Compose on a Linux host.
2. Copy `.env.example` to `.env` and generate a private token, e.g. `openssl rand -hex 32`.
3. Run `docker compose up -d --build`.
4. Keep port 8787 bound to loopback and place a TLS reverse proxy (Caddy/Nginx) with HTTPS and rate limiting in front. Do not publish the raw API directly to the internet.
5. Check `GET /health`. Authenticated disk routes require `Authorization: Bearer <MYO_SERVER_TOKEN>`.

## API
- `GET /health` — public readiness/status. It explicitly reports `windowsGamingHost: not-provisioned`.
- `GET /api/v1/disks` — list virtual disks.
- `POST /api/v1/disks` — create one, body `{"name":"MYO-C","quotaBytes":1073741824}`.
- `GET /api/v1/disks/:id/files?path=/` — list a directory, or download a file when `path` points to a file.
- `PUT /api/v1/disks/:id/files?path=/Downloads/example.txt` — write raw request bytes to a file.
- `POST /api/v1/disks/:id/folders` — create folder, body `{"path":"/Downloads"}`.
- `DELETE /api/v1/disks/:id/files?path=/Downloads/example.txt` — delete a file.
- `DELETE /api/v1/disks/:id` — delete a disk and all data. Treat as destructive.

All disk routes require the server token. Data is stored under `MYO_DATA_DIR` and survives container restarts when backed by the named volume. Use TLS, keep the token out of the browser bundle, and put a trusted authenticated API gateway in front before serving multiple users.

## Important
This service only provides disk storage. It does **not** create a Windows VM, GPU, Windows licence, remote desktop stream or game execution host. Those require a separately provisioned cloud VM (often chargeable). Never commit the real `.env` or the token to GitHub.
