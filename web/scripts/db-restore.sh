#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set"
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is not installed. Install PostgreSQL client tools first."
  exit 1
fi

if [[ $# -lt 1 ]]; then
  echo "Usage: bash scripts/db-restore.sh <backup.sql.gz|backup.sql>"
  exit 1
fi

IN_FILE="$1"
if [[ ! -f "$IN_FILE" ]]; then
  echo "Backup file not found: $IN_FILE"
  exit 1
fi

echo "Restoring from: $IN_FILE"
if [[ "$IN_FILE" == *.gz ]]; then
  gunzip -c "$IN_FILE" | psql "$DATABASE_URL"
else
  psql "$DATABASE_URL" <"$IN_FILE"
fi
echo "Restore completed"

