#!/usr/bin/env bash
set -Eeuo pipefail

# M-Y-O Windows VPS installer.
# Run on the Linux VPS itself, not on Vercel and not on the user's desktop.
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
info() { printf '\n==> %s\n' "$*"; }

[[ "$EUID" -eq 0 ]] || die "Run as root on the VPS: sudo bash install-vps.sh pc.example.com"
[[ "$#" -eq 1 ]] || die "Usage: sudo bash install-vps.sh pc.example.com"
DOMAIN="$1"
[[ "$DOMAIN" != *"://"* && "$DOMAIN" != */* && "$DOMAIN" != *:* && "$DOMAIN" == *.* ]] || die "Give a DNS hostname only (no https://, port or path)."
[[ "${#DOMAIN}" -le 253 ]] || die "Domain is too long."
IFS='.' read -r -a labels <<< "$DOMAIN"
for label in "${labels[@]}"; do
  [[ "$label" =~ ^[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?$ ]] || die "Invalid DNS label: $label"
done

[[ "$(uname -m)" == "x86_64" ]] || die "This Windows VM setup requires an x86_64 Linux host."
[[ -e /dev/kvm ]] || die "/dev/kvm is missing. The VPS provider must enable KVM or nested virtualization."
[[ -e /dev/net/tun ]] || die "/dev/net/tun is missing. Ask your provider to enable TUN."

[[ -r /etc/os-release ]] || die "Cannot identify Linux distribution."
. /etc/os-release
case "${ID:-}" in
  ubuntu|debian) ;;
  *) die "Automatic Docker setup supports Ubuntu/Debian. Detected: ${PRETTY_NAME:-unknown}." ;;
esac
command -v apt-get >/dev/null 2>&1 || die "apt-get is required for automatic setup."

info "Checking host resources"
mem_kb="$(awk '/MemTotal:/ {print $2}' /proc/meminfo)"
mem_gib=$((mem_kb / 1024 / 1024))
cpu_count="$(nproc)"
free_gib="$(df -Pk / | awk 'NR==2 {printf "%d", $4/1024/1024}')"
printf 'Architecture: %s | RAM: %s GiB | logical CPUs: %s | free root disk: %s GiB\n' "$(uname -m)" "$mem_gib" "$cpu_count" "$free_gib"
(( mem_gib >= 20 )) || die "This setup defaults to a 16 GiB Windows VM and needs host overhead. Use a host with at least 20 GiB RAM (32 GiB recommended)."
(( cpu_count >= 6 )) || die "This setup defaults to 6 vCPU. Use a host with at least 6 logical CPUs (8+ recommended)."
(( free_gib >= 40 )) || die "At least 40 GiB free disk is recommended before setup. Add SSD storage and retry."

info "Installing OS prerequisites"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl git gnupg openssl

if ! command -v docker >/dev/null 2>&1; then
  # Do not remove a pre-existing Docker/Podman stack automatically.
  if dpkg-query -W -f='${db:Status-Abbrev} ${binary:Package}\n' docker.io docker-compose docker-compose-v2 docker-doc docker-buildx podman-docker containerd runc 2>/dev/null | grep -q '^ii '; then
    die "A conflicting container package is installed. Inspect the existing Docker/Podman setup first; this script will not uninstall it automatically."
  fi

  info "Adding Docker's official apt repository"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL "https://download.docker.com/linux/$ID/gpg" -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  if [[ "$ID" == "ubuntu" ]]; then
    suite="${UBUNTU_CODENAME:-$VERSION_CODENAME}"
  else
    suite="$VERSION_CODENAME"
  fi
  arch="$(dpkg --print-architecture)"
  cat > /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/$ID
Suites: $suite
Components: stable
Architectures: $arch
Signed-By: /etc/apt/keyrings/docker.asc
EOF
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

command -v docker >/dev/null 2>&1 || die "Docker Engine installation did not produce a docker command."
docker compose version >/dev/null 2>&1 || die "Docker Compose v2 is missing. Install the official docker-compose-plugin package."
systemctl enable --now docker
docker info >/dev/null 2>&1 || die "Docker daemon did not start correctly."

info "Preparing M-Y-O source code"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_DIR/compose.yaml" && -f "$SCRIPT_DIR/scripts/bootstrap-windows-pc.sh" ]]; then
  ROOT="$SCRIPT_DIR"
else
  ROOT="/opt/myo-windows-vps"
  if [[ -d "$ROOT/.git" ]]; then
    origin="$(git -C "$ROOT" remote get-url origin 2>/dev/null || true)"
    [[ "$origin" == *"lehaitrieu151112-mayao1/M-y-o"* ]] || die "$ROOT exists but is not the expected M-Y-O Git repository."
    [[ -z "$(git -C "$ROOT" status --porcelain)" ]] || die "$ROOT has local changes. Back them up/commit them before updating."
    git -C "$ROOT" fetch origin main
    git -C "$ROOT" merge --ff-only origin/main
  elif [[ -e "$ROOT" ]]; then
    die "$ROOT already exists and is not a Git clone. Move it aside or set up the repo manually."
  else
    git clone --branch main --single-branch https://github.com/lehaitrieu151112-mayao1/M-y-o.git "$ROOT"
  fi
fi

[[ -f "$ROOT/scripts/bootstrap-windows-pc.sh" && -f "$ROOT/compose.yaml" ]] || die "M-Y-O Windows VPS deployment files are missing."
cd "$ROOT"

info "Checking public DNS and web ports"
if command -v getent >/dev/null 2>&1; then
  getent ahosts "$DOMAIN" >/dev/null || die "$DOMAIN does not resolve. Create a DNS A/AAAA record pointing to this VPS, then retry."
fi
if command -v ss >/dev/null 2>&1; then
  if ss -ltn '( sport = :80 or sport = :443 )' | grep -q LISTEN; then
    die "TCP 80 or 443 is already in use. Resolve the port conflict before deploying; the script will not stop existing services."
  fi
fi

cat <<EOF

Host checks passed.
Before browser access, ensure your provider firewall/security group allows:
  TCP 80, TCP 443, UDP 443
Do not expose TCP 8006; it stays private behind Caddy HTTPS + Basic Auth.
EOF

info "Starting Windows 11 VM and secure gateway"
chmod +x scripts/bootstrap-windows-pc.sh
bash scripts/bootstrap-windows-pc.sh "$DOMAIN"

cat <<EOF

M-Y-O Windows VPS launch was requested.
Gateway: https://$DOMAIN
First Windows boot may take 10–40 minutes or longer.
Watch setup: cd "$ROOT" && docker compose logs -f windows-vm
Credentials were printed by the bootstrap script above. Save them privately.
Persistent Windows data: Docker volume myo_windows_storage
Do not run 'docker compose down -v' unless you intentionally want to delete the VM disk and other persistent volumes.
EOF
