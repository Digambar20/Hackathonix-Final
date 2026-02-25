ALTER TABLE "Team"
ADD COLUMN IF NOT EXISTS "rawCommitCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "countedCommitCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "leaderCommitCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "leaderCommitValidated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "lastCommitSyncAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "TeamCommitSnapshot" (
  "id" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "rawCommitCount" INTEGER NOT NULL DEFAULT 0,
  "countedCommitCount" INTEGER NOT NULL DEFAULT 0,
  "leaderEmail" TEXT NOT NULL,
  "leaderCommitCount" INTEGER NOT NULL DEFAULT 0,
  "leaderCommitValidated" BOOLEAN NOT NULL DEFAULT false,
  "windowHours" INTEGER NOT NULL DEFAULT 2,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TeamCommitSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TeamCommitSnapshot_teamId_checkedAt_idx"
  ON "TeamCommitSnapshot"("teamId", "checkedAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'TeamCommitSnapshot_teamId_fkey'
      AND table_name = 'TeamCommitSnapshot'
  ) THEN
    ALTER TABLE "TeamCommitSnapshot"
      ADD CONSTRAINT "TeamCommitSnapshot_teamId_fkey"
      FOREIGN KEY ("teamId") REFERENCES "Team"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
