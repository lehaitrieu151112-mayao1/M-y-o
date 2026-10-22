# Usage

1. Rent a Linux x86_64 VPS that explicitly supports KVM/nested virtualization and TUN. For the default 16 GB RAM guest, aim for a physical host with 32 GB RAM or more and 8 vCPU or more.
2. Point a public DNS name (for example `pc.example.com`) at the host's public IP. Permit inbound TCP 80 and 443 in both provider and host firewalls.
3. Install Docker Engine and Docker Compose v2, then run from the repository root:

   ```bash
   chmod +x scripts/bootstrap-windows-pc.sh
   ./scripts/bootstrap-windows-pc.sh pc.example.com
   ```

4. Save both credential pairs printed by the script. Open the domain over HTTPS, authenticate at the gateway, then use the Windows console.

The guest disk is the Docker volume `myo_windows_storage`; downloaded files live inside Windows VM storage. Routine `docker compose down` preserves volumes. Never run `docker compose down -v` unless intentionally deleting all named-volume data.

This repository does not rent or provision the physical VPS. KVM/TUN support is required. GPU passthrough is not preconfigured, and Windows activation/licensing must be legitimate.
