# Development notes

## Review the website

The static pages can be previewed locally with `python -m http.server 8080`, but that only previews the website and does not start Windows. An actual Windows desktop needs the cloud-host install below.

## Run on the cloud host

Use Ubuntu/Debian Linux x86_64 from a provider that permits KVM and TUN. Point a public DNS hostname to its public IP; allow inbound TCP 80/443 and UDP 443. From that host's SSH/web console:

```bash
curl -fsSLO https://raw.githubusercontent.com/lehaitrieu151112-mayao1/M-y-o/main/install-vps.sh
sudo bash install-vps.sh pc.example.com
```

The script checks the physical host, installs Docker if needed, downloads this repo and starts the real Windows 11 VM with a persistent guest disk and an authenticated HTTPS gateway.

## Checks

```bash
node scripts/smoke-test.mjs
bash -n install-vps.sh
bash -n scripts/bootstrap-windows-pc.sh
docker compose config --quiet
```

GitHub Actions runs source validation after pushes to `main`.
