import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function checkApiIfAvailable() {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    console.log("SKIP: BASE_URL not set, skipping HTTP endpoint checks");
    return;
  }

  const cfgRes = await fetch(`${baseUrl.replace(/\/$/, "")}/api/hackathon/config`);
  assert(cfgRes.ok, `GET /api/hackathon/config failed with ${cfgRes.status}`);
  const cfg = await cfgRes.json();
  assert(cfg?.mode === "TESTING" || cfg?.mode === "LIVE", "Invalid mode from /api/hackathon/config");
  assert(!!cfg?.problemSelectionStartAt, "Missing problemSelectionStartAt from /api/hackathon/config");
  assert(!!cfg?.hackathonEndAt, "Missing hackathonEndAt from /api/hackathon/config");
  console.log("PASS: /api/hackathon/config");

  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET;
  if (!cronSecret) {
    console.log("SKIP: CRON_SECRET not set, skipping cron endpoint auth check");
    return;
  }

  const cronRes = await fetch(`${baseUrl.replace(/\/$/, "")}/api/cron/commits/sync`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cronSecret}` },
  });
  assert(cronRes.ok, `POST /api/cron/commits/sync failed with ${cronRes.status}`);
  const body = await cronRes.json();
  assert(body?.success === true, "Cron sync did not return success=true");
  console.log("PASS: /api/cron/commits/sync");
}

async function runDbTransactionSanity() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const suffix = Date.now();
    const problemId = `e2e_problem_${suffix}`;
    const teamId = `e2e_team_${suffix}`;
    const userId = `e2e_user_${suffix}`;
    const scoreId = `e2e_score_${suffix}`;
    const leaderEmail = `e2e.leader.${suffix}@example.com`;
    const teamName = `E2E Team ${suffix}`;

    await client.query(
      `insert into "ProblemStatement" ("id","title","description","category","difficulty","tags","createdAt","updatedAt")
       values ($1, $2, $3, $4, 'EASY', '[]', now(), now())`,
      [problemId, `E2E Problem ${suffix}`, "E2E description", "E2E"]
    );

    await client.query(
      `insert into "Team" (
          "id","name","collegeName","teamLeaderName","teamLeaderEmail","teamLeaderPhone",
          "registrationSource","registrationMode","problemStatementId","psStatus",
          "registrationApproved","paymentVerified","createdAt","updatedAt"
       )
       values (
          $1,$2,'E2E College','E2E Leader',$3,'9999999999',
          'ONLINE','ONLINE',$4,'PENDING',
          false,false,now(),now()
       )`,
      [teamId, teamName, leaderEmail, problemId]
    );

    await client.query(
      `insert into "User" ("id","name","email","role","teamId","teamName","registrationMode","createdAt","updatedAt")
       values ($1,'E2E Leader',$2,'PARTICIPANT',$3,$4,'ONLINE',now(),now())`,
      [userId, leaderEmail, teamId, teamName]
    );

    await client.query(
      `update "Team"
       set "registrationApproved"=true,
           "paymentVerified"=true,
           "psStatus"='LOCKED',
           "psLockedAt"=now(),
           "updatedAt"=now()
       where "id"=$1`,
      [teamId]
    );

    await client.query(
      `insert into "Score" ("id","teamId","teamName","commitFrequency","codeQuality","problemRelevance","innovation","total","createdAt","updatedAt")
       values ($1,$2,$3,20,20,20,20,80,now(),now())`,
      [scoreId, teamId, teamName]
    );

    const verification = await client.query(
      `select
         t."registrationApproved",
         t."paymentVerified",
         t."psStatus",
         s."total"
       from "Team" t
       left join "Score" s on s."teamId" = t."id"
       where t."id" = $1`,
      [teamId]
    );

    const row = verification.rows[0];
    assert(row, "Team verification row missing");
    assert(row.registrationApproved === true, "registrationApproved update failed");
    assert(row.paymentVerified === true, "paymentVerified update failed");
    assert(row.psStatus === "LOCKED", "psStatus update failed");
    assert(Number(row.total) === 80, "Score insert failed");

    await client.query("ROLLBACK");
    console.log("PASS: transactional DB flow sanity (rolled back)");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

try {
  await runDbTransactionSanity();
  await checkApiIfAvailable();
  console.log("E2E_SANITY: PASS");
} catch (error) {
  console.error("E2E_SANITY: FAIL");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await pool.end().catch(() => {});
}
