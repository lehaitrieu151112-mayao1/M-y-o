# Windows VPS deployment

Implemented: Windows 11 QEMU/KVM guest with persistent named disk; Caddy HTTPS + Basic Auth; private console port; loopback disk API; bootstrap-generated credentials; website portal that connects to an already deployed VM. No host/client PC directories are mounted into the Windows guest.

Default guest allocation: 6 vCPU, 16 GB RAM and a 256 GB virtual disk. Recommended physical host: Linux x86_64 with KVM/TUN and roughly 32 GB RAM or more, 8 vCPU or more, ample SSD, public DNS and TCP ports 80/443. Adjust the guest allocation in `.env` to fit the host.

GitHub/Vercel do not provision the host machine. GPU passthrough is not configured. Windows activation/licensing must be legitimate.
