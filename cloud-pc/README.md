# M-Y-O Cloud PC — remote Linux desktop

This stack runs an actual XFCE desktop inside a Linux container and streams it to a browser using LinuxServer Webtop/KasmVNC. The browser, file manager, terminal, archive tools and downloads run **inside the remote host**. The desktop profile and downloads live in persistent Docker volumes.

This replaces the former HTML/CSS simulated desktop. It is a real Linux desktop session when deployed, not a Windows VM.

## Deploy on an existing Linux VPS

Requirements: a Linux server you control, Docker Engine, Docker Compose v2, and enough disk/RAM for a desktop session. For Internet access, use a domain and HTTPS reverse proxy.

From the repository root:

```bash
chmod +x scripts/bootstrap-cloud-pc.sh
./scripts/bootstrap-cloud-pc.sh
```

The script creates `.env` with random secrets if absent, sets permissions to `600`, builds the desktop image and launches the desktop and persistent disk API. It prints credentials only when generating a new `.env`. Keep `.env` private and never commit it.

The desktop listens on `127.0.0.1:13000`; the disk API listens on `127.0.0.1:8787`. Both ports are loopback-only by default.

## Configure HTTPS

1. Point a domain such as `pc.example.com` to the VPS public IP.
2. Install Caddy on the host.
3. Copy `cloud-pc/Caddyfile.example` to Caddy's config and replace `pc.example.com` with your domain.
4. Allow inbound ports 80 and 443 in the VPS firewall, then reload Caddy.
5. Open `https://pc.example.com` and sign in with the credentials from the private `.env` file.

Caddy supports the WebSocket traffic required by the remote desktop. Do not expose ports 3000/13000 or the disk API directly to the public Internet. Keep authentication enabled, use HTTPS and rotate credentials if leaked.

## Inside the PC

Use the browser inside the remote desktop to access websites and download files. Configure the browser download directory to `/config/Downloads`; this path is stored in `myo_pc_config`. The `/shared` directory is a second persistent volume for files you deliberately place there.

The desktop image includes download/archive/terminal utilities such as `git`, `curl`, `wget`, `aria2`, editors and system tools. Available applications depend on the base image and host policy.

## Operate and back up

```bash
docker compose ps
docker compose logs -f myo-linux-pc
docker compose restart myo-linux-pc
docker compose up -d --build myo-linux-pc
```

Named volumes `myo_pc_config` and `myo_pc_shared` survive ordinary container recreation. Back them up regularly. **Do not use `docker compose down -v` unless you intend to delete persistent data.**

## Boundaries

- This is Linux, not Windows. It can download Windows `.exe` installers as files, but many Windows programs and games do not run natively on Linux.
- The code does not rent a server, supply unlimited CPU/RAM/storage, install a Windows licence or create GPU acceleration. It uses the real host's resources.
- The `pc.html` page is now only a connection form; it no longer draws a pretend desktop. The endpoint must point at a deployed instance.
- Windows cloud gaming requires a separate Windows-capable host, permitted licensing, remote display/input and usually paid GPU compute.
