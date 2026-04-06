#!/usr/bin/env bash
set -euo pipefail

ANON=${ANON_KEY}
SERVICE=${SERVICE_ROLE_KEY}
PI_IP=$(hostname -I | awk '{print $1}')
API_AUTH="http://$PI_IP:8000/auth/v1/admin/users"
API_REST="http://$PI_IP:8000/rest/v1"
echo "==> Detected Pi IP: $PI_IP"

ensure_user() {
  local email="$1"
  local password="$2"
  local role="$3"

  echo "=== $role: $email ==="

  # Try to create user
  local response
  response=$(curl -s -X POST "$API_AUTH" \
    -H "apikey: $ANON" \
    -H "Authorization: Bearer $SERVICE" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\",\"email_confirm\":true}")

  local uid
  uid=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null || true)

  if [ -z "$uid" ]; then
    echo "  User already exists, looking up by email..."
    # List users and find by email
    local list_response
    list_response=$(curl -s "$API_AUTH" \
      -H "apikey: $ANON" \
      -H "Authorization: Bearer $SERVICE")

    uid=$(echo "$list_response" | python3 -c "
import sys, json
data = json.load(sys.stdin)
users = data if isinstance(data, list) else data.get('users', [])
for u in users:
    if u.get('email') == '$email':
        print(u['id'])
        break
" 2>/dev/null || true)

    if [ -z "$uid" ]; then
      echo "  ERROR: Could not find or create user $email"
      return 1
    fi
    echo "  Found existing user: $uid"
  else
    echo "  Created new user: $uid"
  fi

  # Update role in profiles table
  curl -s -X PATCH \
    "$API_REST/profiles?id=eq.$uid" \
    -H "apikey: $ANON" \
    -H "Authorization: Bearer $SERVICE" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d "{\"app_role\":\"$role\"}" > /dev/null

  echo "  Role set to: $role"
  echo ""
}

ensure_user "admin@test.com"     "password123" "ADMIN"
ensure_user "moderator@test.com" "password123" "MODERATOR"
ensure_user "user@test.com"      "password123" "USER"

echo "Done! All test users created."
echo ""
echo "Credentials:"
echo "  admin@test.com     / password123  (ADMIN)"
echo "  moderator@test.com / password123  (MODERATOR)"
echo "  user@test.com      / password123  (USER)"
