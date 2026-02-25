ALTER TABLE "Team"
ADD COLUMN IF NOT EXISTS "registrationMode" TEXT NOT NULL DEFAULT 'ONLINE';

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "registrationMode" TEXT DEFAULT 'ONLINE';

-- Keep team mode in sync with existing registration source.
UPDATE "Team"
SET "registrationMode" = COALESCE("registrationSource", 'ONLINE')
WHERE "registrationMode" IS NULL OR "registrationMode" = '';

-- Explicit requirement: all existing participants should be ONLINE.
UPDATE "User"
SET "registrationMode" = 'ONLINE'
WHERE "role" = 'PARTICIPANT';
