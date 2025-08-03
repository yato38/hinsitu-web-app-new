#!/usr/bin/env node

/**
 * SQLiteからSupabaseへのデータ移行スクリプト
 * 
 * 使用方法:
 * 1. SupabaseのDATABASE_URL環境変数が設定されていることを確認
 * 2. node scripts/migrate-to-postgres.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// SQLiteデータベースのパス
const sqliteDbPath = path.join(__dirname, '../prisma/dev.db');

// SQLiteデータベースが存在するかチェック
if (!fs.existsSync(sqliteDbPath)) {
  console.error('❌ SQLiteデータベースが見つかりません:', sqliteDbPath);
  process.exit(1);
}

// Supabaseの環境変数をチェック
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL環境変数が設定されていません');
  console.log('💡 Supabaseの接続URLを設定してください');
  process.exit(1);
}

console.log('🚀 SQLiteからSupabaseへのデータ移行を開始します...');

async function migrateData() {
  // SQLite用のPrismaクライアント
  const sqlitePrisma = new PrismaClient({
    datasources: {
      db: {
        url: `file:${sqliteDbPath}`
      }
    }
  });

  // Supabase用のPrismaクライアント
  const supabasePrisma = new PrismaClient();

  try {
    console.log('📦 SQLiteからデータを読み込み中...');

    // ユーザーデータを取得
    const users = await sqlitePrisma.user.findMany({
      include: {
        userRoles: true,
        accessPermissions: true
      }
    });

    const subjects = await sqlitePrisma.subject.findMany();
    const taskDefinitions = await sqlitePrisma.taskDefinition.findMany();
    const systemPrompts = await sqlitePrisma.systemPrompt.findMany();
    const promptUploads = await sqlitePrisma.promptUpload.findMany();
    const workProgress = await sqlitePrisma.workProgress.findMany();
    const adminSettings = await sqlitePrisma.adminSettings.findMany();
    const aiConfigs = await sqlitePrisma.aIConfig.findMany();

    console.log(`✅ 読み込み完了:`);
    console.log(`  - ユーザー: ${users.length}件`);
    console.log(`  - 科目: ${subjects.length}件`);
    console.log(`  - タスク定義: ${taskDefinitions.length}件`);
    console.log(`  - システムプロンプト: ${systemPrompts.length}件`);
    console.log(`  - プロンプトアップロード: ${promptUploads.length}件`);
    console.log(`  - 作業進捗: ${workProgress.length}件`);
    console.log(`  - 管理者設定: ${adminSettings.length}件`);
    console.log(`  - AI設定: ${aiConfigs.length}件`);

    console.log('\n📤 Supabaseにデータを移行中...');

    // Supabaseにデータを移行
    for (const user of users) {
      const { userRoles, accessPermissions, ...userData } = user;
      
      await supabasePrisma.user.create({
        data: {
          ...userData,
          userRoles: {
            create: userRoles.map(ur => ({
              role: ur.role
            }))
          },
          accessPermissions: {
            create: accessPermissions.map(ap => ({
              subjectId: ap.subjectId,
              canAccess: ap.canAccess,
              canEdit: ap.canEdit,
              canDelete: ap.canDelete
            }))
          }
        }
      });
    }

    for (const subject of subjects) {
      await supabasePrisma.subject.create({
        data: subject
      });
    }

    for (const taskDef of taskDefinitions) {
      await supabasePrisma.taskDefinition.create({
        data: taskDef
      });
    }

    for (const systemPrompt of systemPrompts) {
      await supabasePrisma.systemPrompt.create({
        data: systemPrompt
      });
    }

    for (const promptUpload of promptUploads) {
      await supabasePrisma.promptUpload.create({
        data: promptUpload
      });
    }

    for (const workProg of workProgress) {
      await supabasePrisma.workProgress.create({
        data: workProg
      });
    }

    for (const adminSetting of adminSettings) {
      await supabasePrisma.adminSettings.create({
        data: adminSetting
      });
    }

    for (const aiConfig of aiConfigs) {
      await supabasePrisma.aIConfig.create({
        data: aiConfig
      });
    }

    console.log('✅ データ移行が完了しました！');
    console.log('🌐 Supabaseにデータが正常に移行されました');

  } catch (error) {
    console.error('❌ データ移行中にエラーが発生しました:', error);
    process.exit(1);
  } finally {
    await sqlitePrisma.$disconnect();
    await supabasePrisma.$disconnect();
  }
}

// スクリプト実行
migrateData(); 