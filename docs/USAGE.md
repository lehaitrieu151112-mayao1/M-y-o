# Usage — Windows VPS

## Install on the cloud host

Use a Linux VPS provider that explicitly supports KVM and TUN. Recommended physical host resources for the default guest: 32 GB RAM, 8 vCPU or more, and sufficient SSD. Point public DNS to its IP and allow TCP 80/443 plus UDP 443.

Open an SSH session or the provider's web console for the Linux VPS. These commands execute on the cloud host, not on your local PC:

```bash
curl -fsSLO https://raw.githubusercontent.com/lehaitrieu151112-mayao1/M-y-o/main/install-vps.sh
sudo bash install-vps.sh pc.example.com
```

Replace `pc.example.com` with the real hostname. The installer verifies the machine, installs Docker on supported Ubuntu/Debian servers if needed, downloads the project, then configures Windows 11, the persistent virtual disk, and the HTTPS gateway.

## Connect

After the installer finishes, save both credential pairs printed in the remote terminal. Wait for Windows first boot to finish, then open `https://pc.example.com`. Sign in to the gateway and use the real Windows desktop console.

## Storage and safe operation

Windows files and installed apps live on the named volume `myo_windows_storage`. No files from your local PC are shared automatically. Routine `docker compose down` preserves volumes; `docker compose down -v` is destructive and deletes the virtual disk. Keep `.env` private and never expose port 8006 directly to the public internet.

Vercel/GitHub host the portal/source only. They do not supply the persistent KVM machine. GPU passthrough is not preconfigured.
