#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
die() { echo "ERROR: $*" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || die "Docker Engine is required."
docker compose version >/dev/null 2>&1 || die "Docker Compose v2 is required."
command -v openssl >/dev/null 2>&1 || die "openssl is required."
DOMAIN="${1:-}"
[[ -n "$DOMAIN" ]] || die "Usage: ./scripts/bootstrap-windows-pc.sh pc.example.com"
[[ "${#DOMAIN}" -le 253 ]] || die "Domain is too long."
[[ "$DOMAIN" != *"://"* && "$DOMAIN" != */* && "$DOMAIN" != *:* && "$DOMAIN" == *.* ]] || die "Pass a public DNS hostname only, without scheme, port or path."
IFS='.' read -r -a LABELS <<< "$DOMAIN"
for label in "${LABELS[@]}"; do [[ "$label" =~ ^[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?$ ]] || die "Invalid DNS label: $label"; done
[[ -e /dev/kvm ]] || die "/dev/kvm missing. Use a Linux x86_64 host with KVM/nested virtualization enabled."
[[ -e /dev/net/tun ]] || die "/dev/net/tun missing. Enable TUN on this host."

umask 077
touch .env
chmod 600 .env
set_env() {
  local key="$1" value="$2" tmp
  tmp="$(mktemp)"
  grep -v "^${key}=" .env > "$tmp" 2>/dev/null || true
  printf "%s='%s'\n" "$key" "$value" >> "$tmp"
  cat "$tmp" > .env; rm -f "$tmp"; chmod 600 .env
}
ensure_env() { local key="$1" value="$2"; grep -q "^${key}=" .env || set_env "$key" "$value"; }
read_env() {
  local key="$1" value
  value="$(grep -m1 "^${key}=" .env | cut -d= -f2- || true)"
  value="${value#\'}"; value="${value%\'}"; value="${value#\"}"; value="${value%\"}"
  printf "%s" "$value"
}
ensure_env MYO_SERVER_TOKEN "$(openssl rand -hex 32)"
ensure_env MYO_CORS_ORIGIN ""
ensure_env MYO_MAX_FILE_BYTES 67108864
ensure_env MYO_DEFAULT_DISK_QUOTA_BYTES 1073741824
ensure_env MYO_PROXY_USER myo
ensure_env MYO_PROXY_PASSWORD "$(openssl rand -hex 24)"
ensure_env MYO_WINDOWS_USER myo
ensure_env MYO_WINDOWS_PASSWORD "$(openssl rand -hex 24)"
ensure_env MYO_VM_RAM 8G
ensure_env MYO_VM_CPU_CORES 4
ensure_env MYO_VM_DISK_SIZE 128G
ensure_env MYO_WINDOWS_LANGUAGE English
ensure_env MYO_WINDOWS_REGION en-US
ensure_env MYO_WINDOWS_KEYBOARD en-US
ensure_env TZ Asia/Ho_Chi_Minh
set_env MYO_DOMAIN "$DOMAIN"
proxy_user="$(read_env MYO_PROXY_USER)"
proxy_password="$(read_env MYO_PROXY_PASSWORD)"
windows_user="$(read_env MYO_WINDOWS_USER)"
windows_password="$(read_env MYO_WINDOWS_PASSWORD)"
[[ "$proxy_user" =~ ^[A-Za-z0-9._-]{1,64}$ ]] || die "MYO_PROXY_USER format invalid."
[[ "${#proxy_password}" -ge 20 && "$proxy_password" != "REPLACE_WITH_RANDOM_SECRET" ]] || die "MYO_PROXY_PASSWORD is invalid; replace placeholder in .env."
[[ "${#windows_password}" -ge 16 && "$windows_password" != "REPLACE_WITH_RANDOM_SECRET" ]] || die "MYO_WINDOWS_PASSWORD is invalid; replace placeholder in .env."
echo "Generating gateway password hash..."
proxy_hash="$(docker run --rm caddy:2-alpine caddy hash-password --plaintext "$proxy_password" | tail -n1)"
[[ "$proxy_hash" == '$2'* ]] || die "Could not generate Caddy password hash."
set_env MYO_PROXY_PASSWORD_HASH "$proxy_hash"
set_env MYO_DOMAIN "$DOMAIN"
echo "Validating Compose..."
docker compose --project-directory "$ROOT" -f "$ROOT/compose.yaml" config --quiet
echo "Starting Windows VM, HTTPS gateway and persistent disk API..."
docker compose --project-directory "$ROOT" -f "$ROOT/compose.yaml" up -d
echo
docker compose --project-directory "$ROOT" -f "$ROOT/compose.yaml" ps
echo
echo "Windows VM: https://$DOMAIN"
echo "Gateway user: $proxy_user"
echo "Gateway password: $proxy_password"
echo "Windows guest user: $windows_user"
echo "Windows guest password: $windows_password"
echo "First Windows installation may take 10–40 minutes. Follow: docker compose logs -f windows-vm"
echo "Guest files persist in myo_windows_storage. No host/client folders are mounted."
echo "Keep .env and these credentials private."
