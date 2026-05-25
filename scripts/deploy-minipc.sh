#!/usr/bin/env bash
#
# Build the SOLIQ web image on Mac (linux/amd64), transfer to the MiniPC over SSH,
# and bring up the docker compose stack on the MiniPC.
#
# Usage:
#   ./scripts/deploy-minipc.sh
#
# Expects a .env.minipc file in the repo root (copy from .env.minipc.example).

set -euo pipefail

MINIPC_HOST="${MINIPC_HOST:-namdo@192.168.0.77}"
REMOTE_DIR="${REMOTE_DIR:-/home/namdo/soliq}"
IMAGE_NAME="${IMAGE_NAME:-soliq-web}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
ENV_FILE="${ENV_FILE:-.env.minipc}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "✗ $ENV_FILE not found. Copy .env.minipc.example to $ENV_FILE and fill in values." >&2
  exit 1
fi

if ! docker info > /dev/null 2>&1; then
  echo "✗ Docker Desktop is not running. Start it and retry." >&2
  exit 1
fi

# Load env so build args can be passed (only NEXT_PUBLIC_* values are baked in).
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

echo "→ Building $IMAGE_NAME:$IMAGE_TAG for linux/amd64..."
docker buildx build \
  --platform linux/amd64 \
  --target runner \
  --build-arg "NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-https://soliq.com.vn}" \
  --build-arg "NEXT_PUBLIC_SITE_NAME=${NEXT_PUBLIC_SITE_NAME:-SOLIQ ENERGY}" \
  --build-arg "NEXT_PUBLIC_GTM_ID=${NEXT_PUBLIC_GTM_ID:-}" \
  --build-arg "NEXT_PUBLIC_META_PIXEL_ID=${NEXT_PUBLIC_META_PIXEL_ID:-}" \
  --build-arg "ENABLE_STRICT_HTTPS_HEADERS=${ENABLE_STRICT_HTTPS_HEADERS:-1}" \
  -t "$IMAGE_NAME:$IMAGE_TAG" \
  --load \
  .

echo "→ Ensuring remote directory exists: $REMOTE_DIR"
ssh "$MINIPC_HOST" "mkdir -p '$REMOTE_DIR/deploy/minipc'"

echo "→ Syncing compose, env, and Caddyfile to MiniPC..."
scp docker-compose.yml "$MINIPC_HOST:$REMOTE_DIR/docker-compose.yml"
scp "$ENV_FILE" "$MINIPC_HOST:$REMOTE_DIR/.env"
scp deploy/minipc/Caddyfile "$MINIPC_HOST:$REMOTE_DIR/deploy/minipc/Caddyfile"

echo "→ Transferring image $IMAGE_NAME:$IMAGE_TAG to MiniPC (gzipped)..."
docker save "$IMAGE_NAME:$IMAGE_TAG" | gzip | ssh "$MINIPC_HOST" 'gunzip | docker load'

echo "→ Bringing up the stack on MiniPC..."
ssh "$MINIPC_HOST" "cd '$REMOTE_DIR' && ENABLE_STRICT_HTTPS_HEADERS='${ENABLE_STRICT_HTTPS_HEADERS:-1}' docker compose up -d db web"

echo "→ Waiting for web container to become healthy..."
ssh "$MINIPC_HOST" "cd '$REMOTE_DIR' && \
  for i in \$(seq 1 30); do \
    state=\$(docker compose ps --format json web | head -n 1); \
    if echo \"\$state\" | grep -q '\"Health\":\"healthy\"'; then echo '✓ web is healthy'; exit 0; fi; \
    sleep 3; \
  done; \
  echo '✗ web did not become healthy in 90s'; exit 1"

echo ""
echo "✓ Deploy finished. Next steps:"
echo "  1. Run migrations + seed:   ./scripts/migrate-minipc.sh"
echo "  2. App is reachable on the MiniPC at http://127.0.0.1:3000 (bound to loopback)"
echo "  3. To enable Caddy proxy:   ssh $MINIPC_HOST 'cd $REMOTE_DIR && docker compose --profile proxy up -d'"
