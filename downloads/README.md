# M-Y-O official source shortcuts

This folder stores **link shortcuts and metadata**, not game binaries or installers.

- `software-catalog.json`: curated list of Windows applications with official source URLs.
- `games-catalog.json`: starter catalogue of PC games and publisher/store URLs.
- `apps/*.url`: Windows Internet Shortcut files for official application pages.
- `games/*.url`: Windows Internet Shortcut files for game pages.

The PC Downloads manager records the fact that a source page was opened, then lets the user import metadata about an actual downloaded file. Website scripts cannot silently intercept downloads from another tab or copy an installer from the user's Downloads folder. Real files remain on the user's PC unless they explicitly select a local directory/file and grant permission.

**Executables are deliberately not committed to GitHub.** They may be large, licensed, publisher-controlled binaries and may change version. Use the official source URL in each shortcut to download the current release. Personal download logs remain local unless the user explicitly exports `myo-download-manifest.json` and uploads that metadata file to their repository.
