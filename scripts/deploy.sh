#!/usr/bin/env bash
#
# Build the SOLIQ web image on Mac (linux/amd64), transfer to the VPS over SSH,
# and bring up the docker compose stack.
#
# Usage:
#   ./scripts/deploy.sh             # full deploy (build + upload + restart)
#   ./scripts/deploy.sh --fast      # skip rebuild if image already exists
#   ./scripts/deploy.sh --no-build  # skip build entirely (assume image is fresh)
#
# Reads VPS connection from environment or scripts/deploy.env.

set -euo pipefail

# ─── Config ──────────────────────────────────────────────────────────────────
VPS_HOST="${VPS_HOST:-root@103.179.189.210}"
VPS_PASSWORD="${VPS_PASSWORD:-j9Jt72fe411gZ95O}"
REMOTE_DIR="${REMOTE_DIR:-/root/soliq}"
IMAGE_NAME="${IMAGE_NAME:-soliq-web}"
IMAGE_TAG="${IMAGE_TAG:-amd64}"
ENV_FILE="${ENV_FILE:-.env.vps}"
NEXT_PUBLIC_SITE_URL_DEFAULT="${NEXT_PUBLIC_SITE_URL_DEFAULT:-https://soliq2.solarcheck.best}"

# ─── Args ────────────────────────────────────────────────────────────────────
FAST=0
SKIP_BUILD=0
for arg in "$@"; do
  case "$arg" in
    --fast) FAST=1 ;;
    --no-build) SKIP_BUILD=1 ;;
    *) echo "Unknown arg: $arg" >&2; exit 1 ;;
  esac
done

# ─── Helpers ─────────────────────────────────────────────────────────────────
say() { printf '\033[1;32m→ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m! %s\033[0m\n' "$*"; }
die() { printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

# Use sshpass if available + password set, otherwise rely on SSH agent / key.
SSH_CMD=(ssh -o StrictHostKeyChecking=accept-new -o LogLevel=ERROR)
SCP_CMD=(scp -o StrictHostKeyChecking=accept-new -o LogLevel=ERROR)
if [[ -n "${VPS_PASSWORD:-}" ]] && command -v sshpass > /dev/null 2>&1; then
  SSH_CMD=(sshpass -p "$VPS_PASSWORD" "${SSH_CMD[@]}")
  SCP_CMD=(sshpass -p "$VPS_PASSWORD" "${SCP_CMD[@]}")
fi

# ─── Pre-flight ──────────────────────────────────────────────────────────────
if ! docker info > /dev/null 2>&1; then
  die "Docker Desktop is not running. Start it and retry."
fi

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

# ─── Build ───────────────────────────────────────────────────────────────────
if [[ "$SKIP_BUILD" -eq 1 ]]; then
  say "Skipping build (--no-build)"
elif [[ "$FAST" -eq 1 ]] && docker image inspect "$IMAGE_NAME:$IMAGE_TAG" > /dev/null 2>&1; then
  say "Reusing existing image $IMAGE_NAME:$IMAGE_TAG (--fast)"
else
  say "Building $IMAGE_NAME:$IMAGE_TAG for linux/amd64..."
  docker buildx build \
    --platform linux/amd64 \
    --target runner \
    --build-arg "NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-$NEXT_PUBLIC_SITE_URL_DEFAULT}" \
    --build-arg "NEXT_PUBLIC_SITE_NAME=${NEXT_PUBLIC_SITE_NAME:-SOLIQ ENERGY}" \
    --build-arg "NEXT_PUBLIC_GTM_ID=${NEXT_PUBLIC_GTM_ID:-}" \
    --build-arg "NEXT_PUBLIC_META_PIXEL_ID=${NEXT_PUBLIC_META_PIXEL_ID:-}" \
    --build-arg "ENABLE_STRICT_HTTPS_HEADERS=${ENABLE_STRICT_HTTPS_HEADERS:-1}" \
    -t "$IMAGE_NAME:$IMAGE_TAG" \
    --load \
    .
fi

# ─── Transfer ────────────────────────────────────────────────────────────────
say "Ensuring remote directory exists: $REMOTE_DIR"
"${SSH_CMD[@]}" "$VPS_HOST" "mkdir -p '$REMOTE_DIR/deploy/minipc'"

say "Syncing docker-compose and Caddyfile to VPS..."
"${SCP_CMD[@]}" docker-compose.yml "$VPS_HOST:$REMOTE_DIR/docker-compose.yml"
"${SCP_CMD[@]}" deploy/minipc/Caddyfile "$VPS_HOST:$REMOTE_DIR/deploy/minipc/Caddyfile" 2>/dev/null || warn "Caddyfile not found, skipping"

# Sync env if local copy exists, otherwise leave the remote .env untouched.
if [[ -f "$ENV_FILE" ]]; then
  say "Syncing $ENV_FILE → $VPS_HOST:$REMOTE_DIR/.env"
  "${SCP_CMD[@]}" "$ENV_FILE" "$VPS_HOST:$REMOTE_DIR/.env"
else
  warn "$ENV_FILE not found locally → leaving remote .env untouched"
fi

# ─── Image transfer ──────────────────────────────────────────────────────────
if [[ "$SKIP_BUILD" -eq 0 ]] || ! "${SSH_CMD[@]}" "$VPS_HOST" "docker image inspect $IMAGE_NAME:latest" > /dev/null 2>&1; then
  say "Transferring image $IMAGE_NAME:$IMAGE_TAG to VPS (gzipped)..."
  docker save "$IMAGE_NAME:$IMAGE_TAG" | gzip --fast | "${SSH_CMD[@]}" "$VPS_HOST" "gunzip | docker load && docker tag $IMAGE_NAME:$IMAGE_TAG $IMAGE_NAME:latest"
else
  say "Skipping image transfer (--no-build and remote already has $IMAGE_NAME:latest)"
fi

# ─── Restart stack ───────────────────────────────────────────────────────────
say "Restarting stack on VPS (web + proxy)..."
"${SSH_CMD[@]}" "$VPS_HOST" "cd '$REMOTE_DIR' && docker compose up -d --remove-orphans && docker compose up -d --force-recreate web proxy"

# ─── Health check ────────────────────────────────────────────────────────────
say "Waiting for web container to become healthy..."
"${SSH_CMD[@]}" "$VPS_HOST" "cd '$REMOTE_DIR' && \
  for i in \$(seq 1 30); do \
    state=\$(docker compose ps --format '{{.Status}}' web 2>/dev/null); \
    if echo \"\$state\" | grep -q 'healthy'; then echo '✓ web is healthy'; exit 0; fi; \
    sleep 2; \
  done; \
  echo '✗ web did not become healthy in 60s' >&2; \
  docker compose logs --tail 30 web; \
  exit 1"

# ─── Cleanup orphaned images on VPS (free disk) ──────────────────────────────
say "Cleaning up old images on VPS..."
"${SSH_CMD[@]}" "$VPS_HOST" "docker image prune -f > /dev/null 2>&1 || true"

echo ""
say "✓ Deploy finished."
say "Site: ${NEXT_PUBLIC_SITE_URL:-$NEXT_PUBLIC_SITE_URL_DEFAULT}"
