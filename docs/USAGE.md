# Usage

Deploy on a Linux x86_64 host with KVM/TUN and public DNS/ports 80/443. Run `chmod +x scripts/bootstrap-windows-pc.sh` and `./scripts/bootstrap-windows-pc.sh pc.example.com` from repo root. Save both sets of credentials printed by the script.

Open the domain over HTTPS, authenticate at the gateway, then use the remote Windows console. The guest browser and downloads run inside Windows. Its disk is volume `myo_windows_storage`; no client PC folder is mounted. Routine `docker compose down` preserves volumes; never run `docker compose down -v` unless intentionally deleting data.

KVM is required. GPU passthrough is not preconfigured and Windows activation must be legitimate. GitHub/Vercel serve source/site but do not provision the VM host.
