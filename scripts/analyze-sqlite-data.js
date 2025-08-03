const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

// SQLiteデータベースに直接接続（絶対パスを使用）
const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`
    }
  }
});

// 安全な文字列エスケープ関数
function escapeString(str) {
  if (!str) return '';
  return str.replace(/'/g, "''").replace(/\n/g, ' ').replace(/\r/g, ' ');
}

// 安全なデータ取得関数
function safeGet(data, field, defaultValue = '') {
  try {
    return data[field] || defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

async function analyzeData() {
  console.log('🔍 SQLiteデータベースの内容を解析中...\n');
  console.log(`📁 データベースパス: ${dbPath}\n`);

  try {
    console.log('📊 データベース接続確認中...');
    
    // ユーザーデータの取得
    console.log('👥 ユーザーデータを取得中...');
    const users = await prisma.user.findMany();
    console.log(`- 総数: ${users.length}`);
    if (users.length > 0) {
      users.forEach(user => {
        console.log(`  - ID: ${safeGet(user, 'id')}, 名前: ${safeGet(user, 'name')}, 役割: ${safeGet(user, 'role')}`);
      });
    } else {
      console.log('  - ユーザーデータがありません');
    }
    console.log('');

    // 科目データの取得
    console.log('📚 科目データを取得中...');
    const subjects = await prisma.subject.findMany({
      where: { isDeleted: false }
    });
    console.log(`- 総数: ${subjects.length}`);
    if (subjects.length > 0) {
      subjects.forEach(subject => {
        console.log(`  - ID: ${safeGet(subject, 'id')}, 科目ID: ${safeGet(subject, 'subjectId')}, 科目名: ${safeGet(subject, 'subjectName')}, 試験種: ${safeGet(subject, 'examType')}`);
      });
    } else {
      console.log('  - 科目データがありません');
    }
    console.log('');

    // タスク定義データの取得
    console.log('📋 タスク定義データを取得中...');
    const taskDefinitions = await prisma.taskDefinition.findMany();
    console.log(`- 総数: ${taskDefinitions.length}`);
    if (taskDefinitions.length > 0) {
      taskDefinitions.forEach(task => {
        console.log(`  - ID: ${safeGet(task, 'id')}, 科目ID: ${safeGet(task, 'subjectId')}, タスク名: ${safeGet(task, 'taskName')}`);
      });
    } else {
      console.log('  - タスク定義データがありません');
    }
    console.log('');

    // システムプロンプトデータの取得
    console.log('🤖 システムプロンプトデータを取得中...');
    const systemPrompts = await prisma.systemPrompt.findMany();
    console.log(`- 総数: ${systemPrompts.length}`);
    if (systemPrompts.length > 0) {
      systemPrompts.forEach(prompt => {
        console.log(`  - ID: ${safeGet(prompt, 'id')}, 名前: ${safeGet(prompt, 'promptName')}, アクティブ: ${safeGet(prompt, 'isActive')}`);
      });
    } else {
      console.log('  - システムプロンプトデータがありません');
    }
    console.log('');

    // プロンプトアップロードデータの取得
    console.log('📤 プロンプトアップロードデータを取得中...');
    const promptUploads = await prisma.promptUpload.findMany();
    console.log(`- 総数: ${promptUploads.length}`);
    if (promptUploads.length > 0) {
      promptUploads.forEach(upload => {
        console.log(`  - ID: ${safeGet(upload, 'id')}, ファイル名: ${safeGet(upload, 'fileName')}, ファイルタイプ: ${safeGet(upload, 'fileType')}`);
      });
    } else {
      console.log('  - プロンプトアップロードデータがありません');
    }
    console.log('');

    // 作業進捗データの取得
    console.log('📊 作業進捗データを取得中...');
    const workProgress = await prisma.workProgress.findMany();
    console.log(`- 総数: ${workProgress.length}`);
    if (workProgress.length > 0) {
      workProgress.forEach(progress => {
        console.log(`  - ID: ${safeGet(progress, 'id')}, ユーザーID: ${safeGet(progress, 'userId')}, 科目ID: ${safeGet(progress, 'subjectId')}, ステータス: ${safeGet(progress, 'status')}`);
      });
    } else {
      console.log('  - 作業進捗データがありません');
    }
    console.log('');

    // 管理者設定データの取得
    console.log('⚙️ 管理者設定データを取得中...');
    const adminSettings = await prisma.adminSettings.findMany();
    console.log(`- 総数: ${adminSettings.length}`);
    if (adminSettings.length > 0) {
      adminSettings.forEach(setting => {
        console.log(`  - キー: ${safeGet(setting, 'settingKey')}, 値: ${safeGet(setting, 'settingValue')}`);
      });
    } else {
      console.log('  - 管理者設定データがありません');
    }
    console.log('');

    // AI設定データの取得
    console.log('🤖 AI設定データを取得中...');
    const aiConfigs = await prisma.aIConfig.findMany();
    console.log(`- 総数: ${aiConfigs.length}`);
    if (aiConfigs.length > 0) {
      aiConfigs.forEach(config => {
        console.log(`  - キー: ${safeGet(config, 'configKey')}, 値: ${safeGet(config, 'configValue')}`);
      });
    } else {
      console.log('  - AI設定データがありません');
    }
    console.log('');

    // Supabase用のINSERT文を生成
    console.log('📝 Supabase用のINSERT文を生成中...\n');
    const sqlContent = generateSupabaseInserts(users, subjects, taskDefinitions, systemPrompts, promptUploads, workProgress, adminSettings, aiConfigs);
    
    // SQLファイルに保存
    const outputPath = path.join(__dirname, '..', 'supabase-sample-data.sql');
    fs.writeFileSync(outputPath, sqlContent, 'utf8');
    console.log(`✅ Supabase用サンプルデータを ${outputPath} に保存しました`);

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    console.error('エラーの詳細:', error.message);
    if (error.stack) {
      console.error('スタックトレース:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

function generateSupabaseInserts(users, subjects, taskDefinitions, systemPrompts, promptUploads, workProgress, adminSettings, aiConfigs) {
  let sqlContent = '';
  
  sqlContent += '-- Supabase用サンプルデータINSERT文\n';
  sqlContent += '-- このSQLをSupabaseのSQL Editorで実行してください\n\n';

  // ユーザーデータ
  if (users.length > 0) {
    sqlContent += '-- ユーザーデータ\n';
    users.forEach(user => {
      const id = safeGet(user, 'id', '');
      const userId = safeGet(user, 'userId', '');
      const name = escapeString(safeGet(user, 'name', ''));
      const password = escapeString(safeGet(user, 'password', ''));
      const role = safeGet(user, 'role', 'USER');
      const createdAt = user.createdAt ? user.createdAt.toISOString() : new Date().toISOString();
      const updatedAt = user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString();
      
      sqlContent += `INSERT INTO "User" ("id", "userId", "name", "password", "role", "createdAt", "updatedAt") VALUES ('${id}', '${userId}', '${name}', '${password}', '${role}', '${createdAt}', '${updatedAt}');\n`;
    });
    sqlContent += '\n';
  }

  // 科目データ
  if (subjects.length > 0) {
    sqlContent += '-- 科目データ\n';
    subjects.forEach(subject => {
      const id = safeGet(subject, 'id', '');
      const subjectId = safeGet(subject, 'subjectId', '');
      const subjectName = escapeString(safeGet(subject, 'subjectName', ''));
      const examType = safeGet(subject, 'examType', 'mock');
      const createdBy = subject.createdBy ? `'${escapeString(subject.createdBy)}'` : 'NULL';
      const isDeleted = safeGet(subject, 'isDeleted', false);
      const deletedAt = subject.deletedAt ? `'${subject.deletedAt.toISOString()}'` : 'NULL';
      const createdAt = subject.createdAt ? subject.createdAt.toISOString() : new Date().toISOString();
      const updatedAt = subject.updatedAt ? subject.updatedAt.toISOString() : new Date().toISOString();
      
      sqlContent += `INSERT INTO "Subject" ("id", "subjectId", "subjectName", "examType", "createdBy", "isDeleted", "deletedAt", "createdAt", "updatedAt") VALUES ('${id}', '${subjectId}', '${subjectName}', '${examType}', ${createdBy}, ${isDeleted}, ${deletedAt}, '${createdAt}', '${updatedAt}');\n`;
    });
    sqlContent += '\n';
  }

  // タスク定義データ
  if (taskDefinitions.length > 0) {
    sqlContent += '-- タスク定義データ\n';
    taskDefinitions.forEach(task => {
      const id = safeGet(task, 'id', '');
      const subjectId = safeGet(task, 'subjectId', '');
      const taskName = escapeString(safeGet(task, 'taskName', ''));
      const taskDescription = task.taskDescription ? `'${escapeString(task.taskDescription)}'` : 'NULL';
      const createdAt = task.createdAt ? task.createdAt.toISOString() : new Date().toISOString();
      const updatedAt = task.updatedAt ? task.updatedAt.toISOString() : new Date().toISOString();
      
      sqlContent += `INSERT INTO "TaskDefinition" ("id", "subjectId", "taskName", "taskDescription", "createdAt", "updatedAt") VALUES ('${id}', '${subjectId}', '${taskName}', ${taskDescription}, '${createdAt}', '${updatedAt}');\n`;
    });
    sqlContent += '\n';
  }

  // システムプロンプトデータ
  if (systemPrompts.length > 0) {
    sqlContent += '-- システムプロンプトデータ\n';
    systemPrompts.forEach(prompt => {
      const id = safeGet(prompt, 'id', '');
      const promptName = escapeString(safeGet(prompt, 'promptName', ''));
      const promptContent = escapeString(safeGet(prompt, 'promptContent', ''));
      const isActive = safeGet(prompt, 'isActive', false);
      const createdAt = prompt.createdAt ? prompt.createdAt.toISOString() : new Date().toISOString();
      const updatedAt = prompt.updatedAt ? prompt.updatedAt.toISOString() : new Date().toISOString();
      
      sqlContent += `INSERT INTO "SystemPrompt" ("id", "promptName", "promptContent", "isActive", "createdAt", "updatedAt") VALUES ('${id}', '${promptName}', '${promptContent}', ${isActive}, '${createdAt}', '${updatedAt}');\n`;
    });
    sqlContent += '\n';
  }

  // プロンプトアップロードデータ
  if (promptUploads.length > 0) {
    sqlContent += '-- プロンプトアップロードデータ\n';
    promptUploads.forEach(upload => {
      const id = safeGet(upload, 'id', '');
      const subjectId = safeGet(upload, 'subjectId', '');
      const taskId = safeGet(upload, 'taskId', '');
      const fileType = safeGet(upload, 'fileType', '');
      const fileName = escapeString(safeGet(upload, 'fileName', ''));
      const fileContent = escapeString(safeGet(upload, 'fileContent', ''));
      const description = upload.description ? `'${escapeString(upload.description)}'` : 'NULL';
      const version = safeGet(upload, 'version', '1.0');
      const isActive = safeGet(upload, 'isActive', true);
      const createdAt = upload.createdAt ? upload.createdAt.toISOString() : new Date().toISOString();
      const updatedAt = upload.updatedAt ? upload.updatedAt.toISOString() : new Date().toISOString();
      
      sqlContent += `INSERT INTO "PromptUpload" ("id", "subjectId", "taskId", "fileType", "fileName", "fileContent", "description", "version", "isActive", "createdAt", "updatedAt") VALUES ('${id}', '${subjectId}', '${taskId}', '${fileType}', '${fileName}', '${fileContent}', ${description}, '${version}', ${isActive}, '${createdAt}', '${updatedAt}');\n`;
    });
    sqlContent += '\n';
  }

  // 作業進捗データ
  if (workProgress.length > 0) {
    sqlContent += '-- 作業進捗データ\n';
    workProgress.forEach(progress => {
      const id = safeGet(progress, 'id', '');
      const userId = safeGet(progress, 'userId', '');
      const subjectId = safeGet(progress, 'subjectId', '');
      const taskId = safeGet(progress, 'taskId', '');
      const status = safeGet(progress, 'status', 'pending');
      const notes = progress.notes ? `'${escapeString(progress.notes)}'` : 'NULL';
      const createdAt = progress.createdAt ? progress.createdAt.toISOString() : new Date().toISOString();
      const updatedAt = progress.updatedAt ? progress.updatedAt.toISOString() : new Date().toISOString();
      
      sqlContent += `INSERT INTO "WorkProgress" ("id", "userId", "subjectId", "taskId", "status", "notes", "createdAt", "updatedAt") VALUES ('${id}', '${userId}', '${subjectId}', '${taskId}', '${status}', ${notes}, '${createdAt}', '${updatedAt}');\n`;
    });
    sqlContent += '\n';
  }

  // 管理者設定データ
  if (adminSettings.length > 0) {
    sqlContent += '-- 管理者設定データ\n';
    adminSettings.forEach(setting => {
      const id = safeGet(setting, 'id', '');
      const settingKey = escapeString(safeGet(setting, 'settingKey', ''));
      const settingValue = escapeString(safeGet(setting, 'settingValue', ''));
      const description = setting.description ? `'${escapeString(setting.description)}'` : 'NULL';
      const createdAt = setting.createdAt ? setting.createdAt.toISOString() : new Date().toISOString();
      const updatedAt = setting.updatedAt ? setting.updatedAt.toISOString() : new Date().toISOString();
      
      sqlContent += `INSERT INTO "AdminSettings" ("id", "settingKey", "settingValue", "description", "createdAt", "updatedAt") VALUES ('${id}', '${settingKey}', '${settingValue}', ${description}, '${createdAt}', '${updatedAt}');\n`;
    });
    sqlContent += '\n';
  }

  // AI設定データ
  if (aiConfigs.length > 0) {
    sqlContent += '-- AI設定データ\n';
    aiConfigs.forEach(config => {
      const id = safeGet(config, 'id', '');
      const configKey = escapeString(safeGet(config, 'configKey', ''));
      const configValue = escapeString(safeGet(config, 'configValue', ''));
      const description = config.description ? `'${escapeString(config.description)}'` : 'NULL';
      const createdAt = config.createdAt ? config.createdAt.toISOString() : new Date().toISOString();
      const updatedAt = config.updatedAt ? config.updatedAt.toISOString() : new Date().toISOString();
      
      sqlContent += `INSERT INTO "AIConfig" ("id", "configKey", "configValue", "description", "createdAt", "updatedAt") VALUES ('${id}', '${configKey}', '${configValue}', ${description}, '${createdAt}', '${updatedAt}');\n`;
    });
    sqlContent += '\n';
  }

  return sqlContent;
}

analyzeData(); 