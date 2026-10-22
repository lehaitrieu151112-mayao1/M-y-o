# File map

## Web application
- `index.html` — game catalogue.
- `pc.html` — endpoint connection form; opens a deployed remote desktop in the same tab and contains no fake desktop.
- `assets/styles.css`, `assets/games.js`, `assets/app.js` — catalogue interface and game data.
- `manifest.webmanifest`, `sw.js`, `assets/pwa.js` — installable website shell.

## Real server
- `compose.yaml` — starts persistent disk API and remote Linux desktop.
- `cloud-pc/Dockerfile` — XFCE/Webtop image with browser and download/terminal utilities.
- `cloud-pc/Caddyfile.example` — HTTPS reverse-proxy example.
- `cloud-pc/README.md` — setup, connection, operation and backup instructions.
- `scripts/bootstrap-cloud-pc.sh` — creates private credentials and starts services.
- `.env.example` — placeholders only; keep live credentials in ignored `.env`.
- `server/index.mjs` — authenticated persistent disk API with path normalization and quota checks.
- `server/Dockerfile` and `server/test/api.test.mjs` — container image and API integration tests.

## Validation
- `scripts/smoke-test.mjs` — checks the connection page, deployment files and absence of legacy simulated PC assets.
- `.github/workflows/validate.yml` — static smoke tests, disk API tests and Compose config validation.
