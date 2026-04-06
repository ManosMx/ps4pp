#!/usr/bin/env bash
set -euo pipefail

# ─── deploy.sh ───────────────────────────────────────────────
# Deploy ps4pp to a Raspberry Pi (local network).
#
# Prerequisites on the Pi:
#   sudo apt update && sudo apt install -y docker.io docker-compose-plugin git
#   sudo usermod -aG docker $USER   # then re-login
#
# Usage:
#   1. Clone this repo on the Pi (or scp it over):
#        git clone <your-repo-url> ~/ps4pp && cd ~/ps4pp
#
#   2. Run this script:
#        chmod +x deploy.sh && ./deploy.sh
# ──────────────────────────────────────────────────────────────

PI_IP=$(hostname -I | awk '{print $1}')
echo "==> Detected Pi IP: $PI_IP"

# ── Step 1: Start Supabase ──
echo "==> Starting Supabase stack..."
cd supabase-project
docker compose up -d
echo "==> Waiting for Supabase to be healthy..."
sleep 15

# ── Step 2: Seed the database (first run only) ──
if [ -f dev/schema.sql ]; then
  echo "==> Applying schema.sql..."
  docker exec -i supabase-db psql -U supabase_admin -d postgres < dev/schema.sql || true
fi
if [ -f dev/app-bac.sql ]; then
  echo "==> Applying app-bac.sql..."
  docker exec -i supabase-db psql -U supabase_admin -d postgres < dev/app-bac.sql || true
fi
cd ..

# ── Step 3: Create .env for the app ──
# Pull the anon key from the Supabase .env
ANON_KEY=$(grep '^ANON_KEY=' supabase-project/.env | cut -d'=' -f2)

cat > .env.deploy <<EOF
NEXT_PUBLIC_SUPABASE_URL=http://${PI_IP}:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}
EOF

echo "==> App .env.deploy created (Supabase URL: http://${PI_IP}:8000)"

# ── Step 4: Build and start the Next.js app ──
echo "==> Building and starting the Next.js app..."
docker compose -f docker-compose.deploy.yml --env-file .env.deploy up -d --build

echo ""
echo "============================================"
echo "  Deployment complete!"
echo ""
echo "  App:            http://${PI_IP}:3000"
echo "  Supabase API:   http://${PI_IP}:8000"
echo "  Supabase Studio: http://${PI_IP}:3001"
echo "============================================"
