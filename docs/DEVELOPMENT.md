# Development notes

## Local portal

From the repository root, run:

```sh
python -m http.server 8080
```

Open `http://localhost:8080`. The portal and connection form can be reviewed without starting a VM. Entering a public VPS address only works after the Windows VM host has been deployed and HTTPS is available.

## Windows VM deployment

- `compose.yaml` defines the Windows 11 VM, private Caddy gateway and persistent disk API.
- `scripts/bootstrap-windows-pc.sh` checks prerequisites, writes private credentials to `.env`, validates Compose and starts the services.
- `cloud-pc/WINDOWS-VPS.md` lists host requirements, data persistence and security limits.

## Checks

Run `node scripts/smoke-test.mjs`, `npm --prefix server run check`, and `docker compose config --quiet`. GitHub Actions runs the source checks and Compose validation on pushes and pull requests to `main`.
