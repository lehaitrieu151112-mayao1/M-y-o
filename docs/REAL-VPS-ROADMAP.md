# Real remote PC deployment

## Implemented in this repository
- Linux desktop container based on LinuxServer Webtop/XFCE, served to a browser through a remote desktop protocol.
- Persistent Docker volumes for desktop profile/downloads and a shared directory.
- Password-protected desktop login, loopback-only published ports, environment-based secrets and a sample HTTPS Caddy reverse proxy.
- Separate authenticated disk API with a persistent named volume.
- Bootstrap script that generates random credentials and starts services.
- Connection page that no longer draws or claims to start a simulated desktop.

## Deployment requirement
The code must run on a Linux host you control or a rented Linux VPS. GitHub hosts source code; a static Vercel deployment hosts the website. Neither automatically creates a persistent desktop container or supplies its CPU/RAM/storage. No VPS host has been provisioned by this repository.

## Remaining work for Windows cloud gaming
A Windows gaming VM requires a Windows-capable provider/VM, compliant Windows licensing, suitable GPU hardware, remote streaming/input, access controls, monitoring, budget limits and automated shutdown. This Linux desktop must not be described as a Windows gaming VPS.
