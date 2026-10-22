# Development notes

## Local server
From the repository root, run:

```sh
python -m http.server 8080
```

Open `http://localhost:8080`. A secure context (HTTPS or localhost) is required for File System Access features. Direct `file://` use is not the supported test path.

## Script dependency order on `pc.html`
1. `assets/games.js` publishes `window.MYO_GAMES`.
2. `assets/pc-storage.js` publishes `window.MYOPCStorage`.
3. `assets/pc-apps.js` publishes app renderers and profile label maps.
4. `assets/pc-browser.js` publishes the browser-style URL launcher.
5. `assets/pc-explorer.js` publishes local-directory interactions.
6. `assets/pc.js` wires the page together.
7. `assets/pwa.js` registers the service worker after page load.

Keep these files as classic scripts (not ES modules) unless updating the HTML imports and service-worker cache list accordingly.

## Check changes
Run `node scripts/smoke-test.mjs`. GitHub Actions also invokes the smoke test on pushes and pull requests to `main`.

## Add a game
Add one entry to `assets/games.js`. Required fields: `id`, `name`, `genre`, `icon`, `tone`, `description`, `requirements`, `publisher`, and `source`. Use a direct HTTPS page belonging to the publisher or a recognised store, not a guessed download mirror. The UI intentionally routes the user to the real source rather than pretending to host the installer.
