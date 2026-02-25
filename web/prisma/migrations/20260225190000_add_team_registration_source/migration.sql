ALTER TABLE "Team"
ADD COLUMN IF NOT EXISTS "registrationSource" TEXT NOT NULL DEFAULT 'ONLINE';

UPDATE "Team"
SET "registrationSource" = 'ONLINE'
WHERE "registrationSource" IS NULL;
