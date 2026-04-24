#!/usr/bin/env bash
set -euo pipefail

# ─── deploy.sh ───────────────────────────────────────────────
# Deploy ps4pp to the server (Hostinger KVM 2 or any Linux host).
#
# Prerequisites on the server:
#   sudo apt update && sudo apt install -y docker.io docker-compose-plugin git openssl
#   sudo usermod -aG docker $USER   # then re-login
#
# Usage:
#   chmod +x deploy.sh && ./deploy.sh
# ──────────────────────────────────────────────────────────────

HOST_IP=$(hostname -I | awk '{print $1}')
echo "==> Detected host IP: $HOST_IP"

ENV_FILE="supabase-project/.env"

# ── Step 0: Secrets guard ──
# Refuse to deploy with the known demo secrets from .env.example.
# If not yet initialised, run generate-keys.sh automatically.
DEMO_SENTINEL="your-super-secret-and-long-postgres-password"

if [ ! -f "$ENV_FILE" ]; then
  echo "==> No .env found. Copying from .env.example..."
  cp supabase-project/.env.example "$ENV_FILE"
fi

if grep -q "$DEMO_SENTINEL" "$ENV_FILE"; then
  echo "==> Demo secrets detected. Running generate-keys.sh to initialise secrets..."
  (cd supabase-project && echo "y" | bash utils/generate-keys.sh)
  echo "==> Secrets written to $ENV_FILE."
fi

# Final check — abort if sentinel is still present (e.g. generate-keys.sh failed).
if grep -q "$DEMO_SENTINEL" "$ENV_FILE"; then
  echo "ERROR: $ENV_FILE still contains demo secrets. Aborting."
  exit 1
fi

# Warn if HTTPS is not configured.
CADDY_DOMAIN=$(grep '^CADDY_DOMAIN=' "$ENV_FILE" | cut -d'=' -f2)
if [ -z "$CADDY_DOMAIN" ] || echo "$CADDY_DOMAIN" | grep -q '^:'; then
  echo "WARNING: CADDY_DOMAIN is set to '${CADDY_DOMAIN:-unset}' — serving plain HTTP."
  echo "         Set CADDY_DOMAIN=your-domain.com in $ENV_FILE to enable HTTPS."
fi

# ── Step 1: Start Supabase ──
echo "==> Starting Supabase stack..."
(cd supabase-project && docker compose up -d)

echo "==> Waiting for Postgres to be healthy..."
until docker inspect --format='{{.State.Health.Status}}' supabase-db 2>/dev/null | grep -q "healthy"; do
  sleep 3
done
echo "==> Postgres is healthy."

# ── Step 2: Apply schema and RBAC (idempotent — safe to run on every deploy) ──
if [ -f supabase-project/dev/schema.sql ]; then
  echo "==> Applying schema.sql..."
  docker exec -i supabase-db psql -U supabase_admin -d postgres \
    -v ON_ERROR_STOP=1 < supabase-project/dev/schema.sql
fi

if [ -f supabase-project/dev/app-rbac.sql ]; then
  echo "==> Applying app-rbac.sql..."
  docker exec -i supabase-db psql -U supabase_admin -d postgres \
    -v ON_ERROR_STOP=1 < supabase-project/dev/app-rbac.sql
fi

# ── Step 3: Create .env for the app ──
ANON_KEY=$(grep '^ANON_KEY=' "$ENV_FILE" | cut -d'=' -f2)

if [ -z "$ANON_KEY" ]; then
  echo "ERROR: Could not read ANON_KEY from $ENV_FILE. Aborting."
  exit 1
fi

cat > .env.deploy <<EOF
NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}
EOF

echo "==> App .env.deploy created."

# ── Step 4: Build and start the Next.js app ──
echo "==> Building and starting the Next.js app..."
docker compose -f docker-compose.deploy.yml --env-file .env.deploy up -d --build

echo ""
echo "============================================"
echo "  Deployment complete!"
echo ""
echo "  App:          http://${HOST_IP}:8000/app"
echo "  Supabase API: http://${HOST_IP}:8000"
echo ""
echo "  To start Studio (on demand):"
echo "    cd supabase-project"
echo "    docker compose --profile studio up -d studio"
echo "  Then visit: http://${HOST_IP}:8000"
echo "============================================"
