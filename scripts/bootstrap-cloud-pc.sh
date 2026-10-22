#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

command -v docker >/dev/null 2>&1 || { echo "Docker Engine is required; install Docker first." >&2; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "Docker Compose v2 is required." >&2; exit 1; }
command -v openssl >/dev/null 2>&1 || { echo "openssl is required to generate credentials." >&2; exit 1; }

created_env=0
if [[ ! -f .env ]]; then
  umask 077
  puid="$(id -u)"; pgid="$(id -g)"
  [[ "$puid" != "0" ]] || puid=1000
  [[ "$pgid" != "0" ]] || pgid=1000
  cat > .env <<EOF
MYO_SERVER_TOKEN=$(openssl rand -hex 32)
MYO_CORS_ORIGIN=
MYO_MAX_FILE_BYTES=67108864
MYO_DEFAULT_DISK_QUOTA_BYTES=1073741824
MYO_PC_USER=myo
MYO_PC_PASSWORD=$(openssl rand -hex 24)
MYO_PC_PORT=13000
PUID=$puid
PGID=$pgid
TZ=Asia/Ho_Chi_Minh
EOF
  chmod 600 .env
  created_env=1
fi

if grep -Eq '^MYO_SERVER_TOKEN=(REPLACE_|CHANGE_ME|)$|^MYO_PC_PASSWORD=(REPLACE_|CHANGE_ME|)$' .env; then
  echo "Refusing to start with placeholder secrets. Remove .env and rerun to generate secrets, or edit .env securely." >&2
  exit 1
fi

echo "Building and starting the persistent disk API and Linux desktop..."
docker compose --project-directory "$ROOT" -f "$ROOT/compose.yaml" up -d --build
echo
docker compose --project-directory "$ROOT" -f "$ROOT/compose.yaml" ps
echo
echo "Private desktop listener: http://127.0.0.1:$(sed -n 's/^MYO_PC_PORT=//p' .env | tail -n1)"
echo "Configure Caddy/HTTPS before exposing the desktop. Never expose the raw port directly to the Internet."
if [[ "$created_env" == "1" ]]; then
  pc_user="$(sed -n 's/^MYO_PC_USER=//p' .env | tail -n1)"
  pc_password="$(sed -n 's/^MYO_PC_PASSWORD=//p' .env | tail -n1)"
  echo
  echo "FIRST-SETUP LOGIN — save privately:"
  echo "Username: $pc_user"
  echo "Password: $pc_password"
  echo "Secrets are stored in .env (permission 600). Never commit or share that file."
fi
