# Windows VPS

The intended runtime is a real Windows 11 guest, started by Docker/QEMU with KVM on a cloud Linux host. The webpage only routes the user to the remote console; it is not an OS emulator and does not provide compute by itself.

## Runtime configuration

- Guest allocation: 6 vCPU, 16 GB RAM and a 256 GB persistent virtual disk.
- Linux host: x86_64; KVM and TUN device nodes required.
- Remote connection: Caddy HTTPS + Basic Auth; the Windows console port remains private.
- Data: Windows apps and files live on named volume `myo_windows_storage`.
- Installation: `install-vps.sh` runs on the cloud Linux host and invokes the bootstrap script.

## Important constraints

A KVM-capable cloud server must be provisioned through an infrastructure provider. Vercel's website hosting is separate and cannot turn the web project into a Windows VM. GPU passthrough and multi-user hosting are outside this setup.
