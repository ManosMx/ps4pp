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
#
# We check two sentinels:
#   DEMO_PG  — the demo Postgres password (generate-keys.sh replaces this)
#   DEMO_JWT — the well-known demo ANON_KEY prefix (iss: supabase-demo)
#              which slips through if someone manually edits the password
#              without running generate-keys.sh.
DEMO_PG="your-super-secret-and-long-postgres-password"
DEMO_JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIg"

if [ ! -f "$ENV_FILE" ]; then
  echo "==> No .env found. Copying from .env.example..."
  cp supabase-project/.env.example "$ENV_FILE"
fi

if grep -q "$DEMO_PG" "$ENV_FILE" || grep -q "$DEMO_JWT" "$ENV_FILE"; then
  echo "==> Demo secrets detected. Running generate-keys.sh to initialise secrets..."
  (cd supabase-project && echo "y" | bash utils/generate-keys.sh)
  echo "==> Secrets written to $ENV_FILE."
fi

# Final check — abort if either sentinel is still present.
SECRETS_OK=true
if grep -q "$DEMO_PG" "$ENV_FILE"; then
  echo "ERROR: $ENV_FILE still contains the demo POSTGRES_PASSWORD."
  SECRETS_OK=false
fi
if grep -q "$DEMO_JWT" "$ENV_FILE"; then
  echo "ERROR: $ENV_FILE still contains the demo ANON_KEY / SERVICE_ROLE_KEY (iss: supabase-demo)."
  SECRETS_OK=false
fi
if [ "$SECRETS_OK" = false ]; then
  echo "Aborting. Run: cd supabase-project && bash utils/generate-keys.sh"
  exit 1
fi

# ── Step 0b: Propagate PUBLIC_URL → SITE_URL / API_EXTERNAL_URL / SUPABASE_PUBLIC_URL ──
# In dev PUBLIC_URL=http://localhost:8000 — leave the localhost defaults alone.
# In production PUBLIC_URL=https://your-domain.com — rewrite all three so GoTrue
# and Studio use the real domain without the operator touching them manually.
CADDY_DOMAIN=$(grep '^CADDY_DOMAIN=' "$ENV_FILE" | grep -v '^#' | cut -d'=' -f2)
PUBLIC_URL=$(grep '^PUBLIC_URL=' "$ENV_FILE" | grep -v '^#' | cut -d'=' -f2)

if [ -z "$CADDY_DOMAIN" ] || echo "$CADDY_DOMAIN" | grep -q '^:'; then
  echo "WARNING: CADDY_DOMAIN is '${CADDY_DOMAIN:-unset}' — serving plain HTTP."
  echo "         To enable HTTPS, uncomment CADDY_DOMAIN and PUBLIC_URL in $ENV_FILE."
  APP_BASE_URL="http://${HOST_IP}:8000"
else
  if [ -z "$PUBLIC_URL" ]; then
    echo "ERROR: CADDY_DOMAIN is set to a domain but PUBLIC_URL is not set in $ENV_FILE. Aborting."
    exit 1
  fi
  APP_BASE_URL="$PUBLIC_URL"
  echo "==> Production mode: propagating PUBLIC_URL=${PUBLIC_URL} to SITE_URL, API_EXTERNAL_URL, SUPABASE_PUBLIC_URL..."
  sed -i "s|^SITE_URL=.*|SITE_URL=${PUBLIC_URL}|" "$ENV_FILE"
  sed -i "s|^API_EXTERNAL_URL=.*|API_EXTERNAL_URL=${PUBLIC_URL}|" "$ENV_FILE"
  sed -i "s|^SUPABASE_PUBLIC_URL=.*|SUPABASE_PUBLIC_URL=${PUBLIC_URL}|" "$ENV_FILE"
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
TURNSTILE_SITE_KEY=$(grep '^TURNSTILE_SITE_KEY=' "$ENV_FILE" | cut -d'=' -f2)

if [ -z "$ANON_KEY" ]; then
  echo "ERROR: Could not read ANON_KEY from $ENV_FILE. Aborting."
  exit 1
fi

if [ -z "$TURNSTILE_SITE_KEY" ]; then
  echo "ERROR: TURNSTILE_SITE_KEY is not set in $ENV_FILE. Aborting."
  exit 1
fi

cat > .env.deploy <<EOF
NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}
NEXT_PUBLIC_TURNSTILE_SITE_KEY=${TURNSTILE_SITE_KEY}
NEXT_PUBLIC_SITE_URL=${APP_BASE_URL}
EOF

echo "==> App .env.deploy created."

# ── Step 4: Build and start the Next.js app ──
echo "==> Building and starting the Next.js app..."
docker compose -f docker-compose.deploy.yml --env-file .env.deploy up -d --build

echo ""
echo "============================================"
echo "  Deployment complete!"
echo ""
echo "  App:          ${APP_BASE_URL}/"
echo "  Supabase API: ${APP_BASE_URL}"
echo ""
echo "  To start Studio (on demand):"
echo "    cd supabase-project"
echo "    docker compose --profile studio up -d studio"
echo "  Then visit via SSH tunnel: ssh -L 8000:localhost:8000 user@host"
echo "  Studio URL (tunnel only): http://localhost:8000/studio"
echo ""
echo "  Daily backups (run once to install):"
echo "    (crontab -l 2>/dev/null; echo \"0 3 * * * $(pwd)/backup.sh >> /var/log/ps4pp-backup.log 2>&1\") | crontab -"
echo "  Backups land in /var/backups/ps4pp — last 7 days kept."
echo "============================================"
