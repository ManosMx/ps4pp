#!/usr/bin/env bash
set -euo pipefail

# ─── backup.sh ────────────────────────────────────────────────
# Local Postgres backup for ps4pp.
# Dumps the full database cluster from the running supabase-db
# container and retains the last KEEP_DAYS days of backups.
#
# Install as a daily cron (run once after deploy to set up):
#   (crontab -l 2>/dev/null; echo "0 3 * * * $(pwd)/backup.sh >> /var/log/ps4pp-backup.log 2>&1") | crontab -
#
# Backups are written to: $BACKUP_DIR
# ──────────────────────────────────────────────────────────────

BACKUP_DIR="${BACKUP_DIR:-/var/backups/ps4pp}"
KEEP_DAYS="${KEEP_DAYS:-7}"
CONTAINER="supabase-db"
TIMESTAMP=$(date +%Y-%m-%dT%H-%M-%S)
DEST="${BACKUP_DIR}/pg-${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

# Verify the container is running and healthy before touching it.
STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || true)
if [ "$STATUS" != "healthy" ]; then
  echo "[backup] ERROR: $CONTAINER is not healthy (status: ${STATUS:-not found}). Aborting."
  exit 1
fi

echo "[backup] Starting dump → ${DEST}"
docker exec "$CONTAINER" pg_dumpall -U postgres | gzip > "$DEST"
echo "[backup] Done. Size: $(du -sh "$DEST" | cut -f1)"

# Remove backups older than KEEP_DAYS days.
find "$BACKUP_DIR" -name "pg-*.sql.gz" -mtime "+${KEEP_DAYS}" -print -delete
echo "[backup] Pruned files older than ${KEEP_DAYS} days."
