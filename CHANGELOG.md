# Changelog

## 2026-10-22 — Windows VPS deployment
- Set the site focus to a real Windows 11 VM running on a separate KVM-capable cloud host.
- Added a cloud-host installer and documented resource requirements, HTTPS gateway, private credentials and persistent Windows storage.
- Set the default guest allocation to 6 vCPU, 16 GB RAM and a 256 GB disk.
- Removed unused browser-only disk simulation and storage API source from the deployment stack.
- Updated tests and workflow to validate the real VM configuration and installer.
