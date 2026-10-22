# M-Y-O Windows VPS

M-Y-O is a browser-accessible Windows 11 virtual machine hosted on a cloud Linux server with KVM/QEMU. The remote desktop is the actual Windows VM, not an HTML desktop simulation. This repository provides the website portal, host installer, persistent VM disks, authenticated HTTPS gateway, and a host-side API/UI for creating and controlling multiple Windows VMs.

## Default Windows VM resources

- 6 virtual CPU cores
- 16 GB guest RAM
- 256 GB persistent virtual disk
- Windows 11, accessed through the browser over HTTPS

These are VM allocations, not resources provided by GitHub or Vercel. Recommended host: Linux x86_64 with KVM/TUN, at least 32 GB physical RAM, 8 vCPU or more and sufficient SSD. Select a provider that explicitly permits KVM/nested virtualization.

## Install directly on the cloud server

1. Rent a Linux VPS that supports KVM and TUN. Make sure its public IP is assigned and the provider firewall allows TCP 80/443 and UDP 443.
2. Point a DNS hostname such as `pc.example.com` to the VPS public IP.
3. Connect to the Linux VPS using its provider console or SSH (this shell is on the cloud server, not on your local PC), then run:

   ```bash
   curl -fsSLO https://raw.githubusercontent.com/lehaitrieu151112-mayao1/M-y-o/main/install-vps.sh
   sudo bash install-vps.sh pc.example.com
   ```

The installer checks the host resources and KVM/TUN, installs Docker on supported Ubuntu/Debian hosts when needed, fetches this repository, creates private random credentials, and launches the Windows 11 VM plus HTTPS gateway. It refuses to uninstall conflicting container packages or stop services already using web ports.

Save the gateway and Windows credentials printed in the cloud server terminal. First boot may take 10–40 minutes or longer. Then open `https://pc.example.com`, sign in to the gateway, and use the Windows desktop presented by the actual VM.

## Persistence and security

- Windows files and installed applications live on the named Docker volume `myo_windows_storage`.
- No folder from your local computer is mounted into the Windows VM.
- `docker compose down` retains named volumes. **Do not run `docker compose down -v`** unless you explicitly want to delete the Windows disk.
- Console port 8006 is private to Docker. Only Caddy's HTTPS gateway is exposed.
- Generated credentials stay in the cloud host's private `.env` file (mode 600). Never commit or share it.
- The host manager can create up to 10 additional PCs by default (configurable with `MYO_MAX_PCS`); they all run on this same host and compete for its CPU/RAM/disk. It checks reported CPU and RAM capacity before creating a VM.
- The manager controls Docker through the host's Docker socket, which is effectively root-level access. It is reachable only through Caddy's Basic Auth gateway and a private injected token; do not publish the manager container's port or Docker socket.
- Deleting a managed PC deletes its container, per-PC Windows disk, and generated Caddy route. This is irreversible.
- GPU passthrough is not configured; general-purpose CPU desktop only. Windows activation/licensing remains the owner's responsibility.

## Important limits

A script cannot create compute capacity from nothing. Vercel serves the web portal; it does not run KVM Windows VMs. A real cloud host with KVM must exist and the installer must run there before a real Windows desktop or VM manager can start. Cloud VM cost and Windows licence cost depend on the selected provider/licence.

## Checks

```bash
node scripts/smoke-test.mjs
bash -n install-vps.sh
bash -n scripts/bootstrap-windows-pc.sh
docker compose config --quiet
```
