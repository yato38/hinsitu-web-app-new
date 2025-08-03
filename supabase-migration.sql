-- Supabaseデータベース再構築スクリプト
-- このスクリプトをSupabaseのSQL Editorで実行してください
-- 生成日時: 2025-01-27

-- 既存のテーブルを削除（注意: データが失われます）
DROP TABLE IF EXISTS "AccessPermission" CASCADE;
DROP TABLE IF EXISTS "UserRole" CASCADE;
DROP TABLE IF EXISTS "AIConfig" CASCADE;
DROP TABLE IF EXISTS "AdminSettings" CASCADE;
DROP TABLE IF EXISTS "WorkProgress" CASCADE;
DROP TABLE IF EXISTS "PromptUpload" CASCADE;
DROP TABLE IF EXISTS "SystemPrompt" CASCADE;
DROP TABLE IF EXISTS "TaskDefinition" CASCADE;
DROP TABLE IF EXISTS "Subject" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- テーブル作成

-- AIConfigテーブル
CREATE TABLE IF NOT EXISTS "AIConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AccessPermissionテーブル
CREATE TABLE IF NOT EXISTS "AccessPermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "canAccess" BOOLEAN NOT NULL DEFAULT false,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- SystemPromptテーブル
CREATE TABLE IF NOT EXISTS "SystemPrompt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "applicableTasks" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "maxCount" INTEGER NOT NULL DEFAULT 3,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TaskDefinitionテーブル
CREATE TABLE IF NOT EXISTS "TaskDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "examType" TEXT NOT NULL,
    "files" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Userテーブル
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- UserRoleテーブル
CREATE TABLE IF NOT EXISTS "UserRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- WorkProgressテーブル
CREATE TABLE IF NOT EXISTS "WorkProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- PromptUploadテーブル
CREATE TABLE IF NOT EXISTS "PromptUpload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileContent" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Subjectテーブル
CREATE TABLE IF NOT EXISTS "Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "examType" TEXT NOT NULL DEFAULT 'mock',
    "createdBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AdminSettingsテーブル
CREATE TABLE IF NOT EXISTS "AdminSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "settingKey" TEXT NOT NULL,
    "settingValue" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 初期データ挿入

-- 管理者ユーザーの作成
INSERT INTO "User" ("id", "userId", "name", "password", "role", "createdAt", "updatedAt") VALUES 
('admin-001', 'ADMIN001', 'システム管理者', '$2a$12$AzdecqDYghk4t0uu2jGzkuuu2CAyuin5IDA8GNizTnQaebcZAopI.', 'SUPER_ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-001', '000001', 'テストユーザー', '$2a$12$s6oZLfawATaZFZMsDdDSuOzTAnVY8Qzclaz.IR2kC6AsZETRmGGIy', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 科目データの作成
INSERT INTO "Subject" ("id", "subjectId", "subjectName", "examType", "createdBy", "isDeleted", "createdAt", "updatedAt") VALUES 
('subject-001', 'english', '英語', 'mock', 'admin-001', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('subject-002', 'japanese', '国語', 'mock', 'admin-001', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('subject-003', 'math', '数学', 'mock', 'admin-001', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('subject-004', 'science', '理科', 'mock', 'admin-001', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('subject-005', 'social', '社会', 'mock', 'admin-001', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AI設定の作成
INSERT INTO "AIConfig" ("id", "name", "model", "apiKey", "isActive", "createdAt", "updatedAt") VALUES 
('ai-config-001', 'GPT-4設定', 'gpt-4', 'your-api-key-here', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- システムプロンプトの作成
INSERT INTO "SystemPrompt" ("id", "subjectId", "name", "content", "applicableTasks", "priority", "isActive", "maxCount", "createdBy", "createdAt", "updatedAt") VALUES 
('prompt-001', 'english', '英語問題チェック', '英語の問題文をチェックしてください。誤字脱字、文法の誤り、表現の不備がないか確認してください。', '["1","2","3"]', 1, true, 3, 'admin-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prompt-002', 'japanese', '国語問題チェック', '国語の問題文をチェックしてください。漢字の誤り、表現の不備がないか確認してください。', '["1","2"]', 1, true, 3, 'admin-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- タスク定義の作成
INSERT INTO "TaskDefinition" ("id", "subjectId", "examType", "files", "createdAt", "updatedAt") VALUES 
('task-def-001', 'english', 'mock', '[
  {
    "fileType": "problem",
    "fileName": "英語_模試_問題用紙",
    "tasks": [
      {
        "id": "task_1",
        "taskId": "1",
        "remark": "把握系",
        "taskName": "把握系",
        "description": "問題を把握する時間"
      },
      {
        "id": "task_9",
        "taskId": "9",
        "remark": "誤字脱字",
        "taskName": "誤字脱字",
        "description": "誤字脱字等の誤植・表現不備・スペルミスはないか"
      }
    ]
  },
  {
    "fileType": "answer",
    "fileName": "英語_模試_解答用紙",
    "tasks": [
      {
        "id": "task_9",
        "taskId": "9",
        "remark": "誤字脱字",
        "taskName": "誤字脱字",
        "description": "誤字脱字等の誤植はないか"
      }
    ]
  }
]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 作業進捗の作成
INSERT INTO "WorkProgress" ("id", "userId", "taskId", "fileType", "questionNumber", "referenceData", "aiOutput", "subjectId", "examType", "completedAt", "createdAt", "updatedAt") VALUES 
('progress-001', '000001', '1', 'problem', 1, '参考データ', 'AI出力結果', 'english', 'mock', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- プロンプトアップロードの作成
INSERT INTO "PromptUpload" ("id", "subjectId", "taskId", "fileType", "fileName", "fileContent", "description", "version", "isActive", "uploadedBy", "uploadedAt", "updatedAt") VALUES 
('upload-001', 'english', '1', 'problem', '1_problem.txt', '問題文の内容', '問題用紙のプロンプト', '1.0', true, 'admin-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('upload-002', 'english', '1', 'answer', '1_answer.txt', '解答文の内容', '解答用紙のプロンプト', '1.0', true, 'admin-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 管理者設定の作成
INSERT INTO "AdminSettings" ("id", "settingKey", "settingValue", "description", "createdAt", "updatedAt") VALUES 
('setting-001', 'max_file_size', '10485760', '最大ファイルサイズ（バイト）', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('setting-002', 'allowed_file_types', 'txt,pdf,doc,docx', '許可されるファイル形式', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- インデックスと制約

-- ユニーク制約
ALTER TABLE "User" ADD CONSTRAINT "User_userId_key" UNIQUE ("userId");
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_subjectId_key" UNIQUE ("subjectId");
ALTER TABLE "TaskDefinition" ADD CONSTRAINT "TaskDefinition_subjectId_examType_key" UNIQUE ("subjectId", "examType");
ALTER TABLE "WorkProgress" ADD CONSTRAINT "WorkProgress_userId_taskId_fileType_key" UNIQUE ("userId", "taskId", "fileType");
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_role_key" UNIQUE ("userId", "role");
ALTER TABLE "AdminSettings" ADD CONSTRAINT "AdminSettings_settingKey_key" UNIQUE ("settingKey");

-- インデックス
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

-- 完了メッセージ
SELECT 'データベースの再構築が完了しました。' as message;
