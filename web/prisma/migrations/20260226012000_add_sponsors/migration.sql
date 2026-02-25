CREATE TABLE IF NOT EXISTS "Sponsor" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "tier" TEXT NOT NULL,
  "websiteUrl" TEXT,
  "isVisible" BOOLEAN NOT NULL DEFAULT true,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Sponsor_isVisible_displayOrder_idx"
  ON "Sponsor"("isVisible", "displayOrder");

INSERT INTO "Sponsor" ("id", "name", "tier", "websiteUrl", "isVisible", "displayOrder")
SELECT 'sponsor_kdkce', 'KDKCE', 'Title', NULL, true, 1
WHERE NOT EXISTS (SELECT 1 FROM "Sponsor" WHERE "id"='sponsor_kdkce');

INSERT INTO "Sponsor" ("id", "name", "tier", "websiteUrl", "isVisible", "displayOrder")
SELECT 'sponsor_acm', 'ACM Student Chapter', 'Gold', NULL, true, 2
WHERE NOT EXISTS (SELECT 1 FROM "Sponsor" WHERE "id"='sponsor_acm');

INSERT INTO "Sponsor" ("id", "name", "tier", "websiteUrl", "isVisible", "displayOrder")
SELECT 'sponsor_csi', 'CSI KDKCE', 'Gold', NULL, true, 3
WHERE NOT EXISTS (SELECT 1 FROM "Sponsor" WHERE "id"='sponsor_csi');

INSERT INTO "Sponsor" ("id", "name", "tier", "websiteUrl", "isVisible", "displayOrder")
SELECT 'sponsor_gcloud', 'Google Cloud', 'Technical', NULL, true, 4
WHERE NOT EXISTS (SELECT 1 FROM "Sponsor" WHERE "id"='sponsor_gcloud');

INSERT INTO "Sponsor" ("id", "name", "tier", "websiteUrl", "isVisible", "displayOrder")
SELECT 'sponsor_postman', 'Postman', 'Tooling', NULL, true, 5
WHERE NOT EXISTS (SELECT 1 FROM "Sponsor" WHERE "id"='sponsor_postman');

INSERT INTO "Sponsor" ("id", "name", "tier", "websiteUrl", "isVisible", "displayOrder")
SELECT 'sponsor_github', 'GitHub', 'Platform', NULL, true, 6
WHERE NOT EXISTS (SELECT 1 FROM "Sponsor" WHERE "id"='sponsor_github');
