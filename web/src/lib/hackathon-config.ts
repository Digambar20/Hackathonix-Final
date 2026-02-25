import { prisma } from "@/lib/prisma";

export type HackathonMode = "TESTING" | "LIVE";

export type HackathonConfig = {
  mode: HackathonMode;
  problemSelectionStartAt: Date;
  hackathonEndAt: Date;
  updatedAt: Date;
};

const DEFAULT_PROBLEM_SELECTION_START_ISO = "2026-03-09T04:00:00.000Z"; // 09:30 IST
const DEFAULT_HACKATHON_END_ISO = "2026-03-09T14:00:00.000Z"; // 19:30 IST

let isInitialized = false;

async function ensureHackathonConfigTable() {
  if (isInitialized) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "HackathonConfig" (
      "id" INTEGER PRIMARY KEY,
      "mode" TEXT NOT NULL DEFAULT 'LIVE',
      "problemSelectionStartAt" TIMESTAMPTZ NOT NULL,
      "hackathonEndAt" TIMESTAMPTZ NOT NULL,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "HackathonConfig" ("id", "mode", "problemSelectionStartAt", "hackathonEndAt", "updatedAt")
      VALUES (1, 'LIVE', $1::timestamptz, $2::timestamptz, NOW())
      ON CONFLICT ("id") DO NOTHING;
    `,
    DEFAULT_PROBLEM_SELECTION_START_ISO,
    DEFAULT_HACKATHON_END_ISO
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
      updatedAt: Date | string;
    }>
  >(
    `
      SELECT "mode", "problemSelectionStartAt", "hackathonEndAt", "updatedAt"
      FROM "HackathonConfig"
      WHERE "id" = 1
      LIMIT 1;
    `
  );

  const row = rows[0];
  const mode = row?.mode === "TESTING" ? "TESTING" : "LIVE";

  return {
    mode,
    problemSelectionStartAt: toDate(row?.problemSelectionStartAt ?? DEFAULT_PROBLEM_SELECTION_START_ISO),
    hackathonEndAt: toDate(row?.hackathonEndAt ?? DEFAULT_HACKATHON_END_ISO),
    updatedAt: toDate(row?.updatedAt ?? new Date()),
  };
}

export async function updateHackathonConfig(input: {
  mode?: string;
  problemSelectionStartAt?: string | Date;
  hackathonEndAt?: string | Date;
}) {
  const existing = await getHackathonConfig();

  const mode: HackathonMode = input.mode === "TESTING" ? "TESTING" : input.mode === "LIVE" ? "LIVE" : existing.mode;
  const selectionStart = input.problemSelectionStartAt ? toDate(input.problemSelectionStartAt) : existing.problemSelectionStartAt;
  const hackathonEnd = input.hackathonEndAt ? toDate(input.hackathonEndAt) : existing.hackathonEndAt;

  if (Number.isNaN(selectionStart.getTime()) || Number.isNaN(hackathonEnd.getTime())) {
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
        "updatedAt" = NOW()
      WHERE "id" = 1;
    `,
    mode,
    selectionStart.toISOString(),
    hackathonEnd.toISOString()
  );

  return getHackathonConfig();
}

