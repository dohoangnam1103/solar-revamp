#!/usr/bin/env bash
#
# Run drizzle migrations + superadmin seed against the MiniPC Postgres
# via an SSH tunnel from this Mac. The MiniPC Postgres binds to
# 127.0.0.1:5432 on the MiniPC (per docker-compose.yml), so we tunnel a
# local port through SSH and point DATABASE_URL at it.
#
# Usage:
#   ./scripts/migrate-minipc.sh

set -euo pipefail

MINIPC_HOST="${MINIPC_HOST:-namdo@192.168.0.77}"
LOCAL_PORT="${LOCAL_PORT:-15432}"
REMOTE_DB_PORT="${REMOTE_DB_PORT:-15433}"
ENV_FILE="${ENV_FILE:-.env.minipc}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "✗ $ENV_FILE not found." >&2
  exit 1
fi

# Read POSTGRES_* from the minipc env so the tunneled DATABASE_URL matches.
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

POSTGRES_DB="${POSTGRES_DB:-soliq}"
POSTGRES_USER="${POSTGRES_USER:-soliq}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-soliq-db-password}"

echo "→ Opening SSH tunnel localhost:$LOCAL_PORT → $MINIPC_HOST:$REMOTE_DB_PORT..."
ssh -fN -L "$LOCAL_PORT:127.0.0.1:$REMOTE_DB_PORT" "$MINIPC_HOST"
tunnel_pid=$(pgrep -f "ssh -fN -L $LOCAL_PORT:127.0.0.1:$REMOTE_DB_PORT $MINIPC_HOST" | head -n 1 || true)

cleanup() {
  if [[ -n "${tunnel_pid:-}" ]]; then
    kill "$tunnel_pid" 2>/dev/null || true
    echo "→ Tunnel closed (pid $tunnel_pid)"
  fi
}
trap cleanup EXIT

# Wait briefly for the tunnel to be ready.
for i in $(seq 1 10); do
  if nc -z 127.0.0.1 "$LOCAL_PORT" 2>/dev/null; then break; fi
  sleep 0.3
done

export DATABASE_URL="postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@127.0.0.1:$LOCAL_PORT/$POSTGRES_DB"

echo "→ Running drizzle push (sync schema to MiniPC Postgres)..."
# push is safer than migrate for an empty DB and avoids the dev-DB migration tracking issue.
npx drizzle-kit push --config drizzle.config.ts < /dev/null

echo "→ Running seed (superadmin + settings + articles)..."
npm run db:seed

echo "✓ Migrations + seed complete on MiniPC."
