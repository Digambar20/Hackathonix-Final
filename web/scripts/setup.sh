#!/usr/bin/env bash
set -euo pipefail

# Determine the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Hackathonix setup started in $ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is not installed."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is not installed."
  exit 1
fi

if [[ ! -f ".env" ]]; then
  if [[ -f ".env.example" ]]; then
    cp ".env.example" ".env"
    echo "==> Created .env from .env.example"
  else
    echo "ERROR: .env.example not found"
    exit 1
  fi
fi

echo "==> Installing dependencies"
npm install

echo "==> Generating Prisma client"
npx prisma generate

if grep -q '^DATABASE_URL=' .env; then
  echo "==> Applying DB migrations"
  npx prisma migrate deploy || {
    echo "WARN: Migration deploy failed. Ensure PostgreSQL is running and DATABASE_URL is valid."
  }
else
  echo "WARN: DATABASE_URL missing in .env. Skipping DB migration step."
fi

echo "==> Running ops preflight check"
npm run ops:check || true

cat <<'EOF'

Setup complete.
Next steps:
1) Edit web/.env and set required values:
   - DATABASE_URL
   - NEXTAUTH_SECRET
   - GITHUB_TOKEN (recommended)
   - CRON_SECRET (or VERCEL_CRON_SECRET)
2) Start app:
   npm run dev
3) Optional sanity check:
   npm run e2e:sanity

EOF

