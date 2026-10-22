# Windows Cloud PC deployment

Implemented: Windows 11 QEMU/KVM guest with named persistent disk; Caddy HTTPS and Basic Auth; private console port; loopback disk API; bootstrap with random credentials; web UI only connects to a deployed VM. No real host/client PC directories are mounted into the guest.

Required: Linux x86_64 host with working KVM/TUN, sufficient RAM/SSD, public DNS and open ports 80/443. GitHub/Vercel do not provision the host. GPU passthrough is not enabled; gaming performance requires compatible GPU hardware and additional setup. Use valid Windows licensing/activation.
