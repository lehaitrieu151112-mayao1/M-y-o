# Security notes

- Do not commit passwords, API keys, provider tokens, session cookies or real user credentials.
- The web app has no server-side credential vault and does not need a game-store password.
- External game pages are opened on the official publisher/store site. M-Y-O does not collect publisher passwords or bypass licensing/payment.
- Local profiles, notes and recent URL metadata are stored in the browser's local storage for that browser profile. Avoid shared/public browser profiles when storing private notes.
- File Explorer only reads a real local directory after the user invokes the picker and grants permission. It cannot silently enumerate arbitrary local paths from a web page.
- Only save new files inside the directory the user explicitly selected, or through the browser's explicit Save File dialog.
- The desktop is a browser app, not a remote OS sandbox. Never upload sensitive files to an untrusted site.
- A future real VPS needs authentication, least-privilege access, firewalling, short-lived connection credentials, audit logging, quotas and automatic idle shutdown before public use.

- The download manager stores only URLs and metadata locally; it does not read or upload the content of an installer automatically.
- Download records are per-browser by default. Exported JSON contains source URLs, labels and any file metadata selected by the user; review it before committing publicly to GitHub.
- Never commit installers, licensed game binaries, or personal download logs to a public repository. Public GitHub catalog files contain only source links and shortcut text.
