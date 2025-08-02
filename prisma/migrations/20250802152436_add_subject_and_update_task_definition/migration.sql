/*
  Warnings:

  - You are about to drop the column `description` on the `TaskDefinition` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `TaskDefinition` table. All the data in the column will be lost.
  - You are about to drop the column `fileType` on the `TaskDefinition` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `TaskDefinition` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `TaskDefinition` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `TaskDefinition` table. All the data in the column will be lost.
  - You are about to drop the column `taskId` on the `TaskDefinition` table. All the data in the column will be lost.
  - You are about to drop the column `taskName` on the `TaskDefinition` table. All the data in the column will be lost.
  - Added the required column `files` to the `TaskDefinition` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TaskDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "files" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TaskDefinition_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("subjectId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TaskDefinition" ("createdAt", "id", "subjectId", "updatedAt") SELECT "createdAt", "id", "subjectId", "updatedAt" FROM "TaskDefinition";
DROP TABLE "TaskDefinition";
ALTER TABLE "new_TaskDefinition" RENAME TO "TaskDefinition";
CREATE UNIQUE INDEX "TaskDefinition_subjectId_key" ON "TaskDefinition"("subjectId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Subject_subjectId_key" ON "Subject"("subjectId");
