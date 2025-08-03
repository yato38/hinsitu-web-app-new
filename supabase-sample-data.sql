-- Supabase用サンプルデータINSERT文
-- このSQLをSupabaseのSQL Editorで実行してください

-- ユーザーデータ
INSERT INTO "User" ("id", "userId", "name", "password", "role", "createdAt", "updatedAt") VALUES ('cmdugzcp300077kks45jtbe3e', '000001', 'dde', '$2a$12$s6oZLfawATaZFZMsDdDSuOzTAnVY8Qzclaz.IR2kC6AsZETRmGGIy', 'SUPER_ADMIN', '2025-08-02T16:31:29.031Z', '2025-08-02T16:46:49.669Z');
INSERT INTO "User" ("id", "userId", "name", "password", "role", "createdAt", "updatedAt") VALUES ('cmduh2mc800007kiow0tqrcal', 'ADMIN001', 'システム管理者', '$2a$12$AzdecqDYghk4t0uu2jGzkuuu2CAyuin5IDA8GNizTnQaebcZAopI.', 'SUPER_ADMIN', '2025-08-02T16:34:01.497Z', '2025-08-02T16:34:01.497Z');

-- 科目データ
INSERT INTO "Subject" ("id", "subjectId", "subjectName", "examType", "createdBy", "isDeleted", "deletedAt", "createdAt", "updatedAt") VALUES ('cmdugpvfd00007k2gh94xaawg', 'english', '英語', 'mock', NULL, false, NULL, '2025-08-02T16:24:06.746Z', '2025-08-02T16:24:06.746Z');
INSERT INTO "Subject" ("id", "subjectId", "subjectName", "examType", "createdBy", "isDeleted", "deletedAt", "createdAt", "updatedAt") VALUES ('cmduh2md300047kiovhskb65h', 'social', '社会', 'mock', NULL, false, NULL, '2025-08-02T16:34:01.527Z', '2025-08-02T18:47:27.287Z');

-- タスク定義データ（Prismaスキーマに合わせて修正）
INSERT INTO "TaskDefinition" ("id", "subjectId", "examType", "files", "createdAt", "updatedAt") VALUES ('cmdugqmpg00017kt08npaj9td', 'english', 'mock', '[]', '2025-08-02T16:24:42.099Z', '2025-08-02T18:14:36.345Z');
INSERT INTO "TaskDefinition" ("id", "subjectId", "examType", "files", "createdAt", "updatedAt") VALUES ('cmduhxsje00017kkcs20giauv', 'japanese', 'mock', '[]', '2025-08-02T16:58:15.866Z', '2025-08-02T16:58:19.233Z');
INSERT INTO "TaskDefinition" ("id", "subjectId", "examType", "files", "createdAt", "updatedAt") VALUES ('cmdultidk00067kh4pmkeurac', 'english', 'past', '[]', '2025-08-02T18:46:54.536Z', '2025-08-02T18:46:58.310Z');
INSERT INTO "TaskDefinition" ("id", "subjectId", "examType", "files", "createdAt", "updatedAt") VALUES ('cmduluk9q000e7kh4udnulnp1', 'social', 'mock', '[]', '2025-08-02T18:47:43.646Z', '2025-08-02T18:47:43.646Z');

-- システムプロンプトデータ（Prismaスキーマに合わせて修正）
INSERT INTO "SystemPrompt" ("id", "subjectId", "name", "content", "applicableTasks", "priority", "isActive", "maxCount", "createdBy", "createdAt", "updatedAt") VALUES ('cmdukojod000h7k1kt18ndxq1', 'english', 'デフォルトプロンプト', 'あなたは英語の試験問題作成の専門家です。', '[]', 1, true, 3, 'cmdugzcp300077kks45jtbe3e', '2025-08-02T18:15:03.326Z', '2025-08-02T18:15:03.326Z');
INSERT INTO "SystemPrompt" ("id", "subjectId", "name", "content", "applicableTasks", "priority", "isActive", "maxCount", "createdBy", "createdAt", "updatedAt") VALUES ('cmdulut8j000g7kh4uvssnh68', 'social', '社会科プロンプト', 'あなたは社会科の試験問題作成の専門家です。', '[]', 1, true, 3, 'cmdugzcp300077kks45jtbe3e', '2025-08-02T18:47:55.268Z', '2025-08-02T18:47:55.268Z');

-- プロンプトアップロードデータ（uploadedByカラムを追加）
INSERT INTO "PromptUpload" ("id", "subjectId", "taskId", "fileType", "fileName", "fileContent", "description", "version", "isActive", "uploadedBy", "uploadedAt", "updatedAt") VALUES ('cmdukmq3z00037k1k5p0hsgnf', 'english', '1', 'problem', '1_problem.txt', 'xdddsdsdsd', 'sdsdsdsd', '1.0', true, 'cmdugzcp300077kks45jtbe3e', '2025-08-03T04:50:07.489Z', '2025-08-02T18:13:38.351Z');
INSERT INTO "PromptUpload" ("id", "subjectId", "taskId", "fileType", "fileName", "fileContent", "description", "version", "isActive", "uploadedBy", "uploadedAt", "updatedAt") VALUES ('cmdulhguu00017kh46j35gey7', 'english', '1', 'answer', '1_answer.txt', 'gbggtrfgtredfr', 'edfgred', '1.0', true, 'cmdugzcp300077kks45jtbe3e', '2025-08-03T04:50:07.489Z', '2025-08-02T18:37:32.694Z');

-- 作業進捗データ（Prismaスキーマに合わせて修正）
INSERT INTO "WorkProgress" ("id", "userId", "taskId", "fileType", "questionNumber", "referenceData", "aiOutput", "subjectId", "examType", "completedAt", "createdAt", "updatedAt") VALUES ('cmdulhr8c00027kh4djz36bps', '000001', '1', 'problem', 1, NULL, NULL, 'english', 'mock', '2025-08-02T18:37:46.141Z', '2025-08-02T18:37:46.141Z', '2025-08-02T18:42:08.719Z');

-- AI設定データ（Prismaスキーマに合わせて修正）
INSERT INTO "AIConfig" ("id", "name", "model", "apiKey", "isActive", "createdAt", "updatedAt") VALUES ('cmduj261400007kz46x4fdnbb', 'デフォルト設定', 'gpt-4', 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', false, '2025-08-02T17:29:39.592Z', '2025-08-02T17:29:39.592Z');

-- 管理者設定データ
INSERT INTO "AdminSettings" ("id", "settingKey", "settingValue", "description", "createdAt", "updatedAt") VALUES ('cmduj261400007kz46x4fdncc', 'system_name', '品質AIシステム', 'システム名', '2025-08-02T17:29:39.592Z', '2025-08-02T17:29:39.592Z');

-- ユーザー役割データ
INSERT INTO "UserRole" ("id", "userId", "role", "createdAt", "updatedAt") VALUES ('cmduj261400007kz46x4fdndd', 'cmdugzcp300077kks45jtbe3e', 'SUPER_ADMIN', '2025-08-02T17:29:39.592Z', '2025-08-02T17:29:39.592Z');
INSERT INTO "UserRole" ("id", "userId", "role", "createdAt", "updatedAt") VALUES ('cmduj261400007kz46x4fdnee', 'cmduh2mc800007kiow0tqrcal', 'SUPER_ADMIN', '2025-08-02T17:29:39.592Z', '2025-08-02T17:29:39.592Z');

-- アクセス権限データ
INSERT INTO "AccessPermission" ("id", "userId", "subjectId", "canAccess", "canEdit", "canDelete", "createdAt", "updatedAt") VALUES ('cmduj261400007kz46x4fdnff', 'cmdugzcp300077kks45jtbe3e', 'english', true, true, true, '2025-08-02T17:29:39.592Z', '2025-08-02T17:29:39.592Z');
INSERT INTO "AccessPermission" ("id", "userId", "subjectId", "canAccess", "canEdit", "canDelete", "createdAt", "updatedAt") VALUES ('cmduj261400007kz46x4fdngg', 'cmdugzcp300077kks45jtbe3e', 'social', true, true, true, '2025-08-02T17:29:39.592Z', '2025-08-02T17:29:39.592Z');

