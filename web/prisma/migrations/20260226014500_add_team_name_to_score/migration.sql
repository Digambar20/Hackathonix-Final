ALTER TABLE "Score"
ADD COLUMN IF NOT EXISTS "teamName" TEXT;

UPDATE "Score" s
SET "teamName" = t."name"
FROM "Team" t
WHERE s."teamId" = t."id"
  AND (s."teamName" IS NULL OR s."teamName" = '');
