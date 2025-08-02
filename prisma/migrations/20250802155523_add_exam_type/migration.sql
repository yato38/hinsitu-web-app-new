/*
  Warnings:

  - Added the required column `examType` to the `TaskDefinition` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "examType" TEXT NOT NULL DEFAULT 'mock',
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Subject" ("createdAt", "id", "subjectId", "subjectName", "updatedAt") SELECT "createdAt", "id", "subjectId", "subjectName", "updatedAt" FROM "Subject";
DROP TABLE "Subject";
ALTER TABLE "new_Subject" RENAME TO "Subject";
CREATE UNIQUE INDEX "Subject_subjectId_key" ON "Subject"("subjectId");
CREATE TABLE "new_TaskDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "examType" TEXT NOT NULL,
    "files" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TaskDefinition_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("subjectId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TaskDefinition" ("createdAt", "files", "id", "subjectId", "updatedAt") SELECT "createdAt", "files", "id", "subjectId", "updatedAt" FROM "TaskDefinition";
DROP TABLE "TaskDefinition";
ALTER TABLE "new_TaskDefinition" RENAME TO "TaskDefinition";
CREATE UNIQUE INDEX "TaskDefinition_subjectId_examType_key" ON "TaskDefinition"("subjectId", "examType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
