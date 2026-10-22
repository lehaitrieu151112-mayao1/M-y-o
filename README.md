# M-Y-O Game Hub + Windows Cloud PC

This repo now contains code for a real Windows 11 VM via QEMU/KVM. The HTML desktop simulation has been removed.

On a Linux x86_64 VPS with KVM, public DNS and ports 80/443 available, install Docker + Compose v2, then run:

```bash
chmod +x scripts/bootstrap-windows-pc.sh
./scripts/bootstrap-windows-pc.sh pc.example.com
```

The script generates gateway and Windows credentials in private `.env`, starts the VM + Caddy HTTPS gateway, and prints credentials to the host terminal. Windows first boot can take 10–40 minutes or longer.

The web page only connects to the remote console. Downloaded files stay on the guest virtual disk; no host home/Downloads or client Windows filesystem is mounted. The VM disk volume is `myo_windows_storage`. Port 8006 is internal-only behind HTTPS + Basic Auth.

GitHub/Vercel do not provision the host. The VM requires KVM/TUN. GPU passthrough is not configured, and Windows activation/licensing remains the owner's responsibility. See `cloud-pc/WINDOWS-VPS.md`.
