/*
  Warnings:

  - Added the required column `teamLeaderEmail` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "teamLeaderName" TEXT NOT NULL,
    "teamLeaderEmail" TEXT NOT NULL,
    "teamLeaderPhone" TEXT NOT NULL,
    "problemStatementId" TEXT,
    "psStatus" TEXT NOT NULL DEFAULT 'NONE',
    "psSelectedAt" DATETIME,
    "psLockedAt" DATETIME,
    "repoUrl" TEXT,
    "registrationApproved" BOOLEAN NOT NULL DEFAULT false,
    "paymentVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Team_problemStatementId_fkey" FOREIGN KEY ("problemStatementId") REFERENCES "ProblemStatement" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Team" ("collegeName", "createdAt", "id", "name", "paymentVerified", "problemStatementId", "psLockedAt", "psSelectedAt", "psStatus", "registrationApproved", "repoUrl", "teamLeaderName", "teamLeaderPhone", "updatedAt") SELECT "collegeName", "createdAt", "id", "name", "paymentVerified", "problemStatementId", "psLockedAt", "psSelectedAt", "psStatus", "registrationApproved", "repoUrl", "teamLeaderName", "teamLeaderPhone", "updatedAt" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");
CREATE UNIQUE INDEX "Team_teamLeaderEmail_key" ON "Team"("teamLeaderEmail");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
