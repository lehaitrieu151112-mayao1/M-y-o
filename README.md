# M-Y-O Game Hub — PC Windows

M-Y-O is a Vietnamese-first web application with a PC game catalogue and an interactive desktop-style workspace.

## Start here
- Homepage / real game-source catalogue: `index.html`
- PC provisioning form and desktop workspace: `pc.html`
- Game records with official publisher/store URLs: `assets/games.js`

## Features implemented
- Search and filter a curated starter catalogue of PC games.
- Game detail cards and official publisher/store links.
- “Create PC” flow with Windows target, CPU/GPU/RAM/SSD profiles, target resolution and wallpaper.
- Saved PC profiles in browser local storage.
- Desktop window manager with Start menu, taskbar, draggable/resizable/maximizable windows.
- Chrome-style home page which opens real web URLs in a new browser tab (websites are not embedded because many block iframes).
- Browser Fullscreen API buttons for the workspace/window.
- PC settings and system-info panel that reads only browser-exposed information from the actual local device.
- File Explorer: virtual workspace shortcuts, user-selected local files, and (in supporting secure-context browsers) a directory picker with explicit permission for reading/writing files inside the selected directory.
- Notepad storing text locally, downloading `.txt` files, or saving through an explicit file-save dialog.
- Installable/offline-capable PWA shell via web manifest and service worker.

## Important capability boundary
The “Create PC” page currently creates a **local browser profile and simulated desktop**, not a real Windows VPS. The selected vCPU/GPU/RAM/SSD values are a configuration profile only; they do not allocate compute, create a Windows installation, or run Windows executables. A real cloud gaming VPS needs a GPU-capable host, Windows image/licensing, networking/remote display/input, storage, access controls, and spending limits. No paid compute is provisioned by this repository.

The Chrome-style window opens actual websites in your browser's own tabs. It is not a bundled Chromium executable and cannot turn the browser into a remote Windows PC. Game download buttons open official publishers/stores; downloads and installation remain governed by those services.

## Run locally
Use a static web server, for example:
```sh
python -m http.server 8080
```
Then open `http://localhost:8080`. Secure browser capabilities such as the File System Access API work only in supported browsers and secure contexts (HTTPS or localhost). Opening the HTML with `file://` may disable some capabilities.

## Check the project
```sh
node scripts/smoke-test.mjs
```
The check validates app file references, JavaScript syntax, manifest JSON, cache entries, and the presence of HTTPS game links.

See `docs/FILE-MAP.md`, `docs/USAGE.md` and `docs/REAL-VPS-ROADMAP.md`.
