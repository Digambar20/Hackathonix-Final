import { prisma } from "@/lib/prisma";

export type HackathonMode = "TESTING" | "LIVE";

export type HackathonConfig = {
  mode: HackathonMode;
  problemSelectionStartAt: Date;
  hackathonEndAt: Date;
  testingHomepageCountdownTargetAt: Date;
  homepageCountdownTargetAt: Date;
  updatedAt: Date;
};

const DEFAULT_PROBLEM_SELECTION_START_ISO = "2026-03-09T04:00:00.000Z"; // 09:30 IST
const DEFAULT_HACKATHON_END_ISO = "2026-03-09T14:00:00.000Z"; // 19:30 IST
const LIVE_HOMEPAGE_COUNTDOWN_TARGET_ISO = "2026-03-09T03:30:00.000Z"; // 09:00 IST fixed for LIVE

let isInitialized = false;

async function ensureHackathonConfigTable() {
  if (isInitialized) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "HackathonConfig" (
      "id" INTEGER PRIMARY KEY,
      "mode" TEXT NOT NULL DEFAULT 'LIVE',
      "problemSelectionStartAt" TIMESTAMPTZ NOT NULL,
      "hackathonEndAt" TIMESTAMPTZ NOT NULL,
      "testingHomepageCountdownTargetAt" TIMESTAMPTZ NOT NULL DEFAULT '${LIVE_HOMEPAGE_COUNTDOWN_TARGET_ISO}',
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "HackathonConfig"
    ADD COLUMN IF NOT EXISTS "testingHomepageCountdownTargetAt" TIMESTAMPTZ NOT NULL DEFAULT '${LIVE_HOMEPAGE_COUNTDOWN_TARGET_ISO}';
  `);

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "HackathonConfig" ("id", "mode", "problemSelectionStartAt", "hackathonEndAt", "testingHomepageCountdownTargetAt", "updatedAt")
      VALUES (1, 'LIVE', $1::timestamptz, $2::timestamptz, $3::timestamptz, NOW())
      ON CONFLICT ("id") DO NOTHING;
    `,
    DEFAULT_PROBLEM_SELECTION_START_ISO,
    DEFAULT_HACKATHON_END_ISO,
    LIVE_HOMEPAGE_COUNTDOWN_TARGET_ISO
  );

  isInitialized = true;
}

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  return new Date(String(value));
}

export async function getHackathonConfig(): Promise<HackathonConfig> {
  await ensureHackathonConfigTable();

  const rows = await prisma.$queryRawUnsafe<
    Array<{
      mode: string;
      problemSelectionStartAt: Date | string;
      hackathonEndAt: Date | string;
      testingHomepageCountdownTargetAt: Date | string;
      updatedAt: Date | string;
    }>
  >(
    `
      SELECT "mode", "problemSelectionStartAt", "hackathonEndAt", "testingHomepageCountdownTargetAt", "updatedAt"
      FROM "HackathonConfig"
      WHERE "id" = 1
      LIMIT 1;
    `
  );

  const row = rows[0];
  const mode = row?.mode === "TESTING" ? "TESTING" : "LIVE";

  const testingHomepageCountdownTargetAt = toDate(
    row?.testingHomepageCountdownTargetAt ?? LIVE_HOMEPAGE_COUNTDOWN_TARGET_ISO
  );
  const homepageCountdownTargetAt = mode === "LIVE"
    ? toDate(LIVE_HOMEPAGE_COUNTDOWN_TARGET_ISO)
    : testingHomepageCountdownTargetAt;

  return {
    mode,
    problemSelectionStartAt: toDate(row?.problemSelectionStartAt ?? DEFAULT_PROBLEM_SELECTION_START_ISO),
    hackathonEndAt: toDate(row?.hackathonEndAt ?? DEFAULT_HACKATHON_END_ISO),
    testingHomepageCountdownTargetAt,
    homepageCountdownTargetAt,
    updatedAt: toDate(row?.updatedAt ?? new Date()),
  };
}

export async function updateHackathonConfig(input: {
  mode?: string;
  problemSelectionStartAt?: string | Date;
  hackathonEndAt?: string | Date;
  testingHomepageCountdownTargetAt?: string | Date;
}) {
  const existing = await getHackathonConfig();
  const now = new Date();

  const mode: HackathonMode = input.mode === "TESTING" ? "TESTING" : input.mode === "LIVE" ? "LIVE" : existing.mode;
  
  // Problem/hackathon timers are editable only in TESTING mode.
  let selectionStart = existing.problemSelectionStartAt;
  let hackathonEnd = existing.hackathonEndAt;
  let testingHomepageCountdownTargetAt = existing.testingHomepageCountdownTargetAt;

  if (mode === "TESTING") {
    // If switching TO testing mode from LIVE, or if it's already testing but we want to reset to "standard" 30min test:
    // We use the specified values if provided, otherwise default to the 30min/5min spec.
    selectionStart = input.problemSelectionStartAt 
      ? toDate(input.problemSelectionStartAt) 
      : new Date(now.getTime() + 5 * 60 * 1000); // 5 mins from now
      
    hackathonEnd = input.hackathonEndAt 
      ? toDate(input.hackathonEndAt) 
      : new Date(now.getTime() + 30 * 60 * 1000); // 30 mins from now
      
    testingHomepageCountdownTargetAt = input.testingHomepageCountdownTargetAt
      ? toDate(input.testingHomepageCountdownTargetAt)
      : now; // Start now
  } else {
    // In LIVE mode, we might still want to update these, but usually they are fixed.
    if (input.problemSelectionStartAt) selectionStart = toDate(input.problemSelectionStartAt);
    if (input.hackathonEndAt) hackathonEnd = toDate(input.hackathonEndAt);
    if (input.testingHomepageCountdownTargetAt) testingHomepageCountdownTargetAt = toDate(input.testingHomepageCountdownTargetAt);
  }

  if (
    Number.isNaN(selectionStart.getTime())
    || Number.isNaN(hackathonEnd.getTime())
    || Number.isNaN(testingHomepageCountdownTargetAt.getTime())
  ) {
    throw new Error("INVALID_DATE");
  }
  if (hackathonEnd.getTime() <= selectionStart.getTime()) {
    throw new Error("INVALID_TIMER_RANGE");
  }

  await prisma.$executeRawUnsafe(
    `
      UPDATE "HackathonConfig"
      SET
        "mode" = $1,
        "problemSelectionStartAt" = $2::timestamptz,
        "hackathonEndAt" = $3::timestamptz,
        "testingHomepageCountdownTargetAt" = $4::timestamptz,
        "updatedAt" = NOW()
      WHERE "id" = 1;
    `,
    mode,
    selectionStart.toISOString(),
    hackathonEnd.toISOString(),
    testingHomepageCountdownTargetAt.toISOString()
  );

  return getHackathonConfig();
}
