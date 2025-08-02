-- CreateTable
CREATE TABLE "WorkProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "referenceData" TEXT,
    "aiOutput" TEXT,
    "subjectId" TEXT NOT NULL,
    "examType" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkProgress_userId_taskId_fileType_key" ON "WorkProgress"("userId", "taskId", "fileType");
