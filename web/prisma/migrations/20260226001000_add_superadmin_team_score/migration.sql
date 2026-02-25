ALTER TABLE "Team"
ADD COLUMN IF NOT EXISTS "superadminScore" INTEGER,
ADD COLUMN IF NOT EXISTS "superadminScoredBy" TEXT,
ADD COLUMN IF NOT EXISTS "superadminScoredAt" TIMESTAMP(3);

ALTER TABLE "Team"
ADD CONSTRAINT "Team_superadminScore_range_chk"
CHECK ("superadminScore" IS NULL OR ("superadminScore" >= 0 AND "superadminScore" <= 100));
