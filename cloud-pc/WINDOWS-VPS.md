# M-Y-O Windows Cloud PC (KVM/QEMU)

A real Windows 11 guest VM via QEMU/KVM, with a persistent virtual disk and a browser-accessible console. This is not an HTML desktop simulation.

## Host requirements
- Linux x86_64 with `/dev/kvm` and `/dev/net/tun`; provider must permit hardware/nested virtualization.
- About 8 GB RAM available to the default guest plus host overhead, sufficient physical disk, Docker Engine and Compose v2.
- Public DNS pointing at the VPS and inbound TCP 80/443.

GitHub/Vercel do not supply the VM host.

## Deploy
Run on the Linux VPS from the repository root:

```bash
chmod +x scripts/bootstrap-windows-pc.sh
./scripts/bootstrap-windows-pc.sh pc.example.com
```

The script validates the domain/KVM devices, generates credentials in private `.env` (mode 600), hashes the gateway password, validates Compose and launches the services. Save the gateway and Windows credentials printed to the host terminal.

First boot downloads Windows setup media and can take 10–40 minutes or longer. Follow `docker compose logs -f windows-vm`. When Windows is ready, open `https://pc.example.com`, authenticate at the gateway, then use the remote console.

## Files stay in the remote PC
The VM disk lives in named volume `myo_windows_storage`. No host home/Downloads folders or the user's local Windows filesystem are mounted into the guest. Downloads made in the Windows guest browser stay on its virtual disk. The web page navigates to the remote console in the same tab.

Only Caddy's ports 80/443 are published. Port 8006 stays inside Docker's private bridge. The disk API binds to host loopback. Do not add host-folder bind mounts to `windows-vm`.

## Persistence and limits
`docker compose down` preserves named volumes; `docker compose down -v` deletes the Windows disk. Back up `myo_windows_storage` before risky changes. GPU PCI passthrough is not configured, so 3D games can perform poorly without compatible hardware/host setup. Windows activation/licensing remains your responsibility. This is one VM, not a multi-tenant platform.
