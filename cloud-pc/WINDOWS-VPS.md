# M-Y-O Windows VPS (KVM/QEMU)

This stack runs an actual Windows 11 guest VM on a Linux cloud server and starts a host-side manager for additional VMs. The webpage is a connection portal; Windows and applications run inside real VMs, not in a browser simulation.

## Host requirements

- Linux x86_64 with `/dev/kvm` and `/dev/net/tun`; the provider must allow KVM or nested virtualization.
- Default guest allocation: 6 vCPU, 16 GB RAM, 256 GB virtual disk.
- Recommended physical host: at least 32 GB RAM, 8 vCPU or more, and adequate SSD headroom.
- Docker Engine and Docker Compose v2.
- A public DNS hostname pointing to the server and inbound TCP 80/443 plus UDP 443.

Neither GitHub nor Vercel supplies the Windows VM host.

## Install directly on the cloud server

Open the provider's web console or SSH terminal for the Linux VPS. Run these commands in that remote shell, not on your personal PC:

```bash
curl -fsSLO https://raw.githubusercontent.com/lehaitrieu151112-mayao1/M-y-o/main/install-vps.sh
sudo bash install-vps.sh pc.example.com
```

Replace the example hostname with your actual DNS name. The installer checks KVM/TUN and host capacity, installs Docker on supported Ubuntu/Debian hosts if needed, fetches this repo, and calls the credential/bootstrap script. It will stop with an error instead of removing conflicting container packages or taking over occupied ports.

Save both credential pairs printed in the remote terminal. The first Windows setup can take 10–40 minutes or longer. Follow logs with `cd /opt/myo-windows-vps && docker compose logs -f windows-vm`.

## Manage additional real PCs

Create a wildcard DNS record such as `*.pc.example.com` pointing to this VPS public IP (assuming the base hostname is `pc.example.com`). Open `https://pc.example.com/manage/`, sign in with the gateway credentials, and submit the PC form. The manager checks current CPU/RAM capacity, creates a Docker Windows container with a separate persistent volume, and adds a per-PC Caddy HTTPS route. Each machine is reachable at its own `https://pc-<id>.pc.example.com/` hostname. The machines all run in this host's region; selecting another region requires another KVM host.

The manager has access to the Docker socket and can create/delete host containers, so its service port is not published to the internet. Caddy authenticates incoming requests and injects the private `MYO_MANAGER_TOKEN` only for requests to the internal manager.

## Connect and use Windows

Open `https://pc.example.com`, sign in to the gateway, and interact with the default Windows console in your browser. Managed PCs open from their individual links in the manager. Windows, browser sessions, installed applications, and downloaded files live on the cloud VM.

## Persistent disk and safety

- The guest system disk is the named volume `myo_windows_storage`.
- No local computer directories are mounted into the guest.
- `docker compose down` preserves named volumes. `docker compose down -v` deletes the Windows disk.
- Port 8006 stays on Docker's private network; only Caddy's HTTPS gateway is published.
- Keep `.env` credentials private. Do not commit them.
- GPU passthrough is not set up. This configuration is a general-purpose remote desktop, not a GPU workstation or multi-tenant provider.
- Removing a managed PC also deletes its named Windows volume; this permanently deletes its files and installed applications.
- Use legally licensed Windows media and activation.
