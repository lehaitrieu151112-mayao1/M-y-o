# Contributing

1. Keep the project focused on a secure, general-purpose Windows VPS connection portal.
2. Keep deployment scripts explicit about real host prerequisites and do not imply GitHub/Vercel provides CPU, RAM or a VM.
3. Keep UI behavior accessible: semantic buttons, labels for controls, keyboard focus and clear feedback.
4. Keep passwords, tokens and private configuration out of commits.
5. Do not mount host or client user folders into the Windows guest.
6. Update `docs/FILE-MAP.md` and `CHANGELOG.md` when adding or moving modules.
7. Run `node scripts/smoke-test.mjs` and `npm --prefix server run check` before submitting changes.
