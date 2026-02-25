ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "teamName" TEXT;

UPDATE "User" u
SET "teamName" = t."name"
FROM "Team" t
WHERE u."teamId" = t."id"
  AND u."role" = 'PARTICIPANT';
