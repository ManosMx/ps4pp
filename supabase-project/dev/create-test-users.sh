#!/usr/bin/env bash
set -euo pipefail

API_AUTH="http://localhost:8000/auth/v1/admin/users"
API_REST="http://localhost:8000/rest/v1"
ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE"
SERVICE="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q"

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
