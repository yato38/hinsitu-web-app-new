-- Supabaseデータベースセットアップスクリプト
-- このスクリプトをSupabaseのSQL Editorで実行してください

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "userId" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- 科目テーブル
CREATE TABLE IF NOT EXISTS "Subject" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT UNIQUE NOT NULL,
    "subjectName" TEXT NOT NULL,
    "examType" TEXT NOT NULL DEFAULT 'mock',
    "createdBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- タスク定義テーブル（Prismaスキーマに合わせて修正）
CREATE TABLE IF NOT EXISTS "TaskDefinition" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "examType" TEXT NOT NULL,
    "files" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskDefinition_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TaskDefinition_subjectId_examType_key" UNIQUE ("subjectId", "examType")
);

-- システムプロンプトテーブル（Prismaスキーマに合わせて修正）
CREATE TABLE IF NOT EXISTS "SystemPrompt" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "applicableTasks" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxCount" INTEGER NOT NULL DEFAULT 3,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemPrompt_pkey" PRIMARY KEY ("id")
);

-- プロンプトアップロードテーブル
CREATE TABLE IF NOT EXISTS "PromptUpload" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileContent" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptUpload_pkey" PRIMARY KEY ("id")
);

-- 作業進捗テーブル（Prismaスキーマに合わせて修正）
CREATE TABLE IF NOT EXISTS "WorkProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "referenceData" TEXT,
    "aiOutput" TEXT,
    "subjectId" TEXT NOT NULL,
    "examType" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkProgress_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "WorkProgress_userId_taskId_fileType_key" UNIQUE ("userId", "taskId", "fileType")
);

-- 管理者設定テーブル
CREATE TABLE IF NOT EXISTS "AdminSettings" (
    "id" TEXT NOT NULL,
    "settingKey" TEXT UNIQUE NOT NULL,
    "settingValue" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSettings_pkey" PRIMARY KEY ("id")
);

-- AI設定テーブル（Prismaスキーマに合わせて修正）
CREATE TABLE IF NOT EXISTS "AIConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIConfig_pkey" PRIMARY KEY ("id")
);

-- ユーザー役割テーブル
CREATE TABLE IF NOT EXISTS "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserRole_userId_role_key" UNIQUE ("userId", "role")
);

-- アクセス権限テーブル
CREATE TABLE IF NOT EXISTS "AccessPermission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "canAccess" BOOLEAN NOT NULL DEFAULT false,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessPermission_pkey" PRIMARY KEY ("id")
);

-- 外部キー制約（テーブル作成後に追加）
-- まず、テーブルが存在することを確認してから制約を追加

-- TaskDefinitionの外部キー制約
ALTER TABLE "TaskDefinition" ADD CONSTRAINT "TaskDefinition_subjectId_fkey" 
FOREIGN KEY ("subjectId") REFERENCES "Subject"("subjectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- WorkProgressの外部キー制約（userIdは外部キー制約なし）
-- ALTER TABLE "WorkProgress" ADD CONSTRAINT "WorkProgress_userId_fkey" 
-- FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "WorkProgress" ADD CONSTRAINT "WorkProgress_subjectId_fkey" 
FOREIGN KEY ("subjectId") REFERENCES "Subject"("subjectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- PromptUploadの外部キー制約
ALTER TABLE "PromptUpload" ADD CONSTRAINT "PromptUpload_uploadedBy_fkey" 
FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "PromptUpload" ADD CONSTRAINT "PromptUpload_subjectId_fkey" 
FOREIGN KEY ("subjectId") REFERENCES "Subject"("subjectId") ON DELETE CASCADE;

-- SystemPromptの外部キー制約
ALTER TABLE "SystemPrompt" ADD CONSTRAINT "SystemPrompt_createdBy_fkey" 
FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "SystemPrompt" ADD CONSTRAINT "SystemPrompt_subjectId_fkey" 
FOREIGN KEY ("subjectId") REFERENCES "Subject"("subjectId") ON DELETE CASCADE;

-- UserRoleの外部キー制約
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- AccessPermissionの外部キー制約
ALTER TABLE "AccessPermission" ADD CONSTRAINT "AccessPermission_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- インデックスの作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS "User_userId_idx" ON "User"("userId");
CREATE INDEX IF NOT EXISTS "Subject_subjectId_idx" ON "Subject"("subjectId");
CREATE INDEX IF NOT EXISTS "TaskDefinition_subjectId_idx" ON "TaskDefinition"("subjectId");
CREATE INDEX IF NOT EXISTS "WorkProgress_userId_idx" ON "WorkProgress"("userId");
CREATE INDEX IF NOT EXISTS "WorkProgress_subjectId_idx" ON "WorkProgress"("subjectId");
CREATE INDEX IF NOT EXISTS "PromptUpload_subjectId_idx" ON "PromptUpload"("subjectId");
CREATE INDEX IF NOT EXISTS "PromptUpload_taskId_idx" ON "PromptUpload"("taskId");
CREATE INDEX IF NOT EXISTS "SystemPrompt_subjectId_idx" ON "SystemPrompt"("subjectId");
CREATE INDEX IF NOT EXISTS "SystemPrompt_createdBy_idx" ON "SystemPrompt"("createdBy");
CREATE INDEX IF NOT EXISTS "UserRole_userId_idx" ON "UserRole"("userId");
CREATE INDEX IF NOT EXISTS "AccessPermission_userId_idx" ON "AccessPermission"("userId"); 