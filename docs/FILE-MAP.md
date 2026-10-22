# File map

- `index.html` — Windows VPS overview and connection portal.
- `pc.html` — endpoint form and cloud-host installation guide for the real Windows VM.
- `manifest.webmanifest`, `sw.js`, `assets/pwa.js` — installable website metadata and static cache.
- `compose.yaml` — Windows 11 KVM VM and the protected HTTPS gateway.
- `cloud-pc/Caddyfile` — HTTPS reverse proxy and gateway authentication.
- `cloud-pc/WINDOWS-VPS.md` — host requirements, deployment, persistence and security.
- `install-vps.sh` — one-command installer that runs on a supported Linux cloud VPS.
- `scripts/bootstrap-windows-pc.sh` — generates private credentials and starts the real VM stack.
- `downloads/software-catalog.json`, `downloads/apps/` — official links to common Windows utilities; no installer binaries.

No browser-side virtual disk or fake desktop modules are used as the Windows operating system.
