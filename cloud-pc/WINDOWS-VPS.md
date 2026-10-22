# M-Y-O Windows VPS (KVM/QEMU)

This stack runs an actual Windows 11 guest VM on a Linux cloud server. The webpage is a connection portal; the Windows operating system and applications run inside the VM, not inside the browser page.

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

## Connect and use Windows

Open `https://pc.example.com`, sign in to the gateway, and interact with the actual Windows console in your browser. Windows, browser sessions, installed applications, and downloaded files live on the cloud VM.

## Persistent disk and safety

- The guest system disk is the named volume `myo_windows_storage`.
- No local computer directories are mounted into the guest.
- `docker compose down` preserves named volumes. `docker compose down -v` deletes the Windows disk.
- Port 8006 stays on Docker's private network; only Caddy's HTTPS gateway is published.
- Keep `.env` credentials private. Do not commit them.
- GPU passthrough is not set up. This configuration is a general-purpose remote desktop, not a GPU workstation or multi-tenant provider.
- Use legally licensed Windows media and activation.
