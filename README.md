# M-Y-O Game Hub + Cloud PC

M-Y-O is a Vietnamese-first game catalogue plus deployment code for a real remote Linux desktop.

## Files

- `index.html` — game catalogue and entry point.
- `pc.html` — connection page for a deployed remote desktop; no simulated desktop UI.
- `cloud-pc/Dockerfile` — Linux XFCE desktop image with browser and file/download utilities.
- `cloud-pc/README.md` — deployment, HTTPS, login and backup instructions.
- `compose.yaml` — persistent disk API and actual Linux desktop container.
- `server/` — authenticated persistent virtual-disk API.
- `scripts/bootstrap-cloud-pc.sh` — generates secrets and starts the services.

## Run the real desktop on a Linux server

On a Linux VPS or server you control, install Docker Engine and Compose v2, then run from the repository root:

```bash
chmod +x scripts/bootstrap-cloud-pc.sh
./scripts/bootstrap-cloud-pc.sh
```

The script creates private secrets if `.env` does not exist. The desktop listens at `127.0.0.1:13000` by default and stores profile/downloads in persistent volumes. Configure Caddy HTTPS using `cloud-pc/Caddyfile.example` before Internet access.

The PC connection page asks for the domain of a real deployed desktop and navigates to it in the same tab. It no longer simulates CPU/GPU/RAM or claims to have started a VM.

## Honest capability limits

This is a real remote **Linux** desktop when started on a Linux host. It does not provision a host by itself and does not become a Windows VPS because this repository is on GitHub or Vercel. Windows installers can be downloaded as files, but most Windows programs and games do not run natively on Linux. True Windows cloud gaming requires a Windows-capable provider, compliant licensing, remote streaming/input and often paid GPU compute.

## Validate

```sh
node scripts/smoke-test.mjs
npm --prefix server run check
docker compose config --quiet
```
