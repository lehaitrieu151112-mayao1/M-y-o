# Usage guide

## Browse games
Open `index.html` to search the PC game catalogue and view official publisher/store links.

## Connect to a real remote desktop
1. Deploy the stack on a Linux server you control, following `cloud-pc/README.md`.
2. Configure HTTPS for the desktop domain.
3. Open `pc.html`, enter the deployed HTTPS domain and click **Kết nối PC**. It opens the remote desktop in the same tab.
4. Sign in using credentials created by the setup script.
5. Use the browser and file manager inside the remote Linux desktop. Downloads remain on the server in persistent volumes, not on the local Windows machine.

## Persistent data
The desktop's `/config` and `/shared` paths use named Docker volumes. Ordinary container restarts/rebuilds preserve data. Back up these volumes. Never use `docker compose down -v` unless you intend to delete the stored data.

## Security
- Keep `.env` private and never commit it.
- Do not expose the desktop or disk API ports directly on the public network.
- Use HTTPS and strong credentials, configure firewall rules, update the host and images, and back up important files.
- A basic desktop login does not replace host hardening or multi-user isolation.

## Actual capability limits
This is a real Linux desktop once deployed, not a Windows VM. It can download Windows installers, but cannot guarantee running them. A real Windows gaming PC needs a Windows-capable provider, licensing and remote-display software; GPU gaming generally adds hardware cost. The website does not provision hardware by itself.
