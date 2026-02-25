-- Keep a single most-recent score per team before adding team-level uniqueness.
DELETE FROM "Score" s1
USING "Score" s2
WHERE s1."teamId" = s2."teamId"
  AND (
    s1."updatedAt" < s2."updatedAt"
    OR (s1."updatedAt" = s2."updatedAt" AND s1."id" > s2."id")
  );

ALTER TABLE "Score" DROP CONSTRAINT IF EXISTS "Score_judgeId_fkey";
DROP INDEX IF EXISTS "Score_teamId_judgeId_key";
ALTER TABLE "Score" DROP COLUMN IF EXISTS "judgeId";

CREATE UNIQUE INDEX IF NOT EXISTS "Score_teamId_key" ON "Score"("teamId");
