#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set"
  exit 1
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "pg_dump is not installed. Install PostgreSQL client tools first."
  exit 1
fi

BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"

STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_FILE="$BACKUP_DIR/hackathonix_${STAMP}.sql.gz"

echo "Creating backup: $OUT_FILE"
pg_dump "$DATABASE_URL" --no-owner --no-privileges | gzip >"$OUT_FILE"
echo "Backup completed: $OUT_FILE"

