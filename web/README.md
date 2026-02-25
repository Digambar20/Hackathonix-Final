This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## GitHub Commit Validation (Production Setup)

1. Add env vars in deployment:
   - `GITHUB_TOKEN` (GitHub personal access token)
   - `CRON_SECRET` (random secret used by cron endpoint auth)
2. Schedule this endpoint every 2 hours (or every 15-30 min for testing):
   - `POST /api/cron/commits/sync`
   - Send header: `Authorization: Bearer <CRON_SECRET>`
3. Superadmins can still use manual sync from admin teams page:
   - `POST /api/admin/commits/sync`

The participant dashboard now reads cached commit-validation data from database snapshots, so it scales for 100 teams without GitHub API spikes.

## Superadmin Event Mode & Timers

- Superadmin can configure event mode and timers from `Admin Dashboard -> Superadmin Event Control`.
- Modes:
  - `LIVE`: problem selection/locking obeys configured start time.
  - `TESTING`: selection/locking is unlocked for testing flow.
- Config is exposed to clients via:
  - `GET /api/hackathon/config`
- Superadmin API:
  - `GET /api/admin/hackathon-config`
  - `PATCH /api/admin/hackathon-config`

## Operations Checklist (Step 3)

### 1) Preflight checks

Run:

```bash
npm run ops:check
```

This verifies:
- Required env vars
- PostgreSQL connectivity
- Core tables + `HackathonConfig` row

### 2) Automated commit-sync scheduler

- `vercel.json` includes cron for:
  - `POST /api/cron/commits/sync`
  - schedule: every 2 hours
- Set one of:
  - `CRON_SECRET`
  - `VERCEL_CRON_SECRET`

### 3) Database backup/restore

Backup:

```bash
npm run db:backup
```

Restore:

```bash
npm run db:restore -- ./backups/your_file.sql.gz
```

## E2E Sanity (Step 4)

Run:

```bash
npm run e2e:sanity
```

What it does:
- Runs critical DB flow checks in a single transaction
- Creates temporary test records
- Verifies registration/payment/problem-lock/scoring path
- Rolls back everything (no permanent data changes)

Optional API checks:
- Set `BASE_URL` (for example `http://localhost:3000`)
- Script then also checks:
  - `GET /api/hackathon/config`
  - `POST /api/cron/commits/sync` (with cron secret)
