# Front-end assets

- `styles.css` and `app.js` control the public catalogue page.
- `games.js` contains the catalogue records and official source URLs.
- `pc.css` controls the PC setup and desktop experience.
- `pc-storage.js` handles local settings, profiles, notes and recents.
- `pc-apps.js` renders individual desktop apps.
- `pc-browser.js` opens actual web destinations in external browser tabs.
- `pc-explorer.js` handles user-authorised local directory/file access.
- `pc.js` is the UI controller for saved profiles, desktop windows, fullscreen and keyboard/taskbar actions.
- `pwa.js` registers the service worker.

These are plain browser scripts, deliberately avoiding a dependency/build toolchain in the starter version.

- `software-apps.js` contains official Windows software links.
- `pc-downloads.js` manages local download metadata, generated Internet Shortcuts, user-selected-file metadata imports and JSON exports.
