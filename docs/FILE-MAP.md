# File map

## Pages
- `index.html` — public-facing game discovery, search, filters, game introductions and the “Create PC” entry point.
- `pc.html` — VPS-style configuration form and desktop workspace.

## Front-end assets
- `assets/styles.css` — catalogue page design.
- `assets/games.js` — curated game catalogue. Each record stores a verified-format HTTPS publisher/store URL (availability and exact PC compatibility still require checking at source).
- `assets/app.js` — catalogue search/filter and game-introduction modal.
- `assets/pc.css` — PC setup screen, desktop, taskbar, window chrome, Chrome-like UI, File Explorer and responsive styling.
- `assets/pc-storage.js` — versionable storage helpers for saved profiles, settings, notes and visited sites using browser local storage.
- `assets/pc-apps.js` — rendering for Settings, Task Manager, Game Hub, This PC, Notepad and informational panels.
- `assets/pc-browser.js` — Chrome-style launcher, search form and bookmarks; opens external websites in real browser tabs.
- `assets/pc-explorer.js` — File Explorer virtual shortcuts and explicit user-authorised local folder/file operations.
- `assets/pc.js` — setup flow, saved PC profiles, window manager, Start menu, taskbar, fullscreen and app interactions.
- `assets/pwa.js` — service-worker registration.
- `assets/app-icon.svg` — application icon.
- `manifest.webmanifest` — installable web app metadata.
- `sw.js` — cache-first app shell for offline reopening.

## Documentation and checks
- `docs/USAGE.md` — how to try the app and understand each operation.
- `docs/REAL-VPS-ROADMAP.md` — requirements to move from local simulation to a real remote PC.
- `scripts/smoke-test.mjs` — static sanity checks.
- `.github/workflows/validate.yml` — runs the sanity checks on pushes and pull requests.
