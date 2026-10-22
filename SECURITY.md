# Security notes

- Do not commit passwords, API keys, provider tokens, session cookies or real user credentials.
- The web portal only stores the VPS endpoint in local storage; never put passwords or tokens in the endpoint field.
- Public access to the Windows console must stay behind Caddy HTTPS and Basic Auth. Do not expose port 8006 directly to the Internet.
- Keep `.env` private (the bootstrap script sets mode 600). Never publish the generated gateway password or Windows password.
- The VM disk is stored in the named volume `myo_windows_storage`. Back it up before risky changes; `docker compose down -v` is destructive.
- No host Home/Downloads directories or local client filesystem are mounted into the Windows guest. Do not add such bind mounts.
- The disk API is bound to host loopback and requires a bearer token. Keep `MYO_SERVER_TOKEN` out of browser bundles and Git.
- A single VM is not a multi-tenant VPS platform. Before serving other users, add account isolation, audit logging, quotas, backups, monitoring and an appropriate abuse response process.
- Use supported Windows media and maintain valid activation/licensing.
