import "dotenv/config";
import { Pool } from "pg";

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

function warn(message) {
  console.warn(`WARN: ${message}`);
}

const requiredEnv = ["DATABASE_URL", "NEXTAUTH_SECRET"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    fail(`${key} is missing`);
  } else {
    pass(`${key} is set`);
  }
}

if (!process.env.GITHUB_TOKEN) {
  warn("GITHUB_TOKEN is missing (GitHub validation may hit API rate limits)");
} else {
  pass("GITHUB_TOKEN is set");
}

if (!(process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET)) {
  warn("CRON_SECRET/VERCEL_CRON_SECRET is missing (cron endpoint cannot be authenticated)");
} else {
  pass("Cron secret is set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  await pool.query("select now() as now");
  pass("Database connection is healthy");

  const tableChecks = await pool.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('User','Team','ProblemStatement','Score','Notification','HackathonConfig')
  `);

  const found = new Set(tableChecks.rows.map((r) => r.table_name));
  for (const t of ["User", "Team", "ProblemStatement", "Score", "Notification", "HackathonConfig"]) {
    if (found.has(t)) pass(`Table present: ${t}`);
    else fail(`Missing table: ${t}`);
  }

  const cfg = await pool.query('select "mode","problemSelectionStartAt","hackathonEndAt" from "HackathonConfig" where id=1');
  if (cfg.rowCount !== 1) {
    fail("HackathonConfig row id=1 missing");
  } else {
    const row = cfg.rows[0];
    pass(`HackathonConfig mode=${row.mode}`);
  }
} catch (error) {
  fail(`Ops check error: ${error instanceof Error ? error.message : String(error)}`);
} finally {
  await pool.end().catch(() => {});
}

if (process.exitCode && process.exitCode !== 0) {
  process.exit(process.exitCode);
}

