# M-Y-O Windows VPS (KVM/QEMU)

This project starts a real Windows 11 guest VM with a persistent virtual disk and a browser-accessible console. The website is a portal; it does not itself rent, create or power the physical VPS.

## Host requirements

- Linux x86_64 with `/dev/kvm` and `/dev/net/tun`; the provider must allow hardware or nested virtualization.
- Default guest allocation is 6 vCPU, 16 GB RAM and a 256 GB virtual disk. Reserve extra resources for the Linux host; a host with about 32 GB RAM, 8 vCPU or more and ample SSD is recommended.
- Docker Engine and Docker Compose v2.
- A public DNS record pointing to the VPS, and inbound TCP 80/443 allowed by provider and host firewall.

GitHub/Vercel do not supply the VM host.

## Deploy

Run on your Linux VPS from the repository root:

```bash
chmod +x scripts/bootstrap-windows-pc.sh
./scripts/bootstrap-windows-pc.sh pc.example.com
```

Replace `pc.example.com` with your real public hostname. The script checks KVM/TUN, generates credentials into a private `.env` file (mode 600), hashes the gateway password, validates Compose and launches the services. Save the gateway and Windows credentials printed to the host terminal.

First boot downloads Windows setup media and can take 10–40 minutes or longer. Follow `docker compose logs -f windows-vm`. When Windows is ready, open `https://pc.example.com`, authenticate at the gateway, then use the remote console.

## Files stay in the remote PC

The VM disk lives in named volume `myo_windows_storage`. No host home/Downloads folders or the user's local Windows filesystem are mounted into the guest. Files downloaded inside the Windows VM stay on its virtual disk.

Only Caddy's ports 80/443 are published. Port 8006 stays inside Docker's private bridge. The disk API binds to host loopback. Do not add host-folder bind mounts to `windows-vm`.

## Persistence and limits

`docker compose down` preserves named volumes; `docker compose down -v` deletes the Windows disk and other named-volume data. Back up `myo_windows_storage` before risky changes.

GPU passthrough is not configured; this setup is intended as a general-purpose remote Windows desktop, not a high-performance GPU workstation. Windows activation/licensing remains the owner's responsibility. This is one personal VM, not a multi-tenant VPS platform.
