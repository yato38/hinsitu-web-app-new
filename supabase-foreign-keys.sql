-- Supabase外部キー制約追加スクリプト
-- このスクリプトは、supabase-setup-basic.sqlを実行した後に実行してください

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