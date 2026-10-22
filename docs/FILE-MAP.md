# File map

- `index.html` — game catalogue and Windows VM status.
- `pc.html` — connection form for deployed Windows VM; no fake desktop/local filesystem access.
- `assets/` — catalogue and web UI assets.
- `compose.yaml` — Windows 11 KVM VM, Caddy HTTPS/Basic Auth, disk API.
- `cloud-pc/Caddyfile` — private reverse proxy to Windows console.
- `cloud-pc/WINDOWS-VPS.md` — prerequisites, deployment, persistence and limits.
- `scripts/bootstrap-windows-pc.sh` — validates KVM/domain, generates secrets, launches services.
- `server/` — authenticated persistent disk API and tests.
