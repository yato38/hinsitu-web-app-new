const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// SQLiteデータベースファイルのパス
const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');

// データベースファイルの存在確認
if (!fs.existsSync(dbPath)) {
  console.error('❌ SQLiteデータベースファイルが見つかりません:', dbPath);
  console.log('💡 以下のコマンドでデータベースを生成してください:');
  console.log('   npm run db:generate');
  console.log('   npm run db:push');
  process.exit(1);
}

console.log('=== SQLiteからSupabaseへの移行スクリプト生成 ===\n');
console.log(`📁 データベースファイル: ${dbPath}`);

// データベースに接続
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ データベース接続に失敗:', err.message);
    process.exit(1);
  }
  console.log('✅ SQLiteデータベースに接続しました');
});

// 移行用SQLファイルのパス
const migrationFile = path.join(__dirname, '..', 'supabase-migration.sql');

// SQLファイルの内容を格納する配列
let sqlContent = [
  '-- SQLiteからSupabaseへの移行スクリプト',
  '-- このスクリプトをSupabaseのSQL Editorで実行してください',
  '-- 生成日時: ' + new Date().toISOString(),
  '',
  '-- 既存のテーブルを削除（注意: データが失われます）',
  'DROP TABLE IF EXISTS "AccessPermission" CASCADE;',
  'DROP TABLE IF EXISTS "UserRole" CASCADE;',
  'DROP TABLE IF EXISTS "AIConfig" CASCADE;',
  'DROP TABLE IF EXISTS "AdminSettings" CASCADE;',
  'DROP TABLE IF EXISTS "WorkProgress" CASCADE;',
  'DROP TABLE IF EXISTS "PromptUpload" CASCADE;',
  'DROP TABLE IF EXISTS "SystemPrompt" CASCADE;',
  'DROP TABLE IF EXISTS "TaskDefinition" CASCADE;',
  'DROP TABLE IF EXISTS "Subject" CASCADE;',
  'DROP TABLE IF EXISTS "User" CASCADE;',
  '',
  '-- テーブル作成',
  ''
];

// テーブル一覧を取得
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_prisma_%' ORDER BY name", (err, tables) => {
  if (err) {
    console.error('❌ テーブル一覧の取得に失敗:', err);
    db.close();
    return;
  }

  if (tables.length === 0) {
    console.log('⚠️  移行対象のテーブルが見つかりません');
    console.log('💡 データベースにテーブルが存在するか確認してください');
    db.close();
    return;
  }

  console.log('📋 移行対象テーブル:');
  tables.forEach(table => {
    console.log(`   - ${table.name}`);
  });
  console.log('');

  // 各テーブルの構造を分析して移行SQLを生成
  let completedTables = 0;
  tables.forEach(table => {
    generateTableMigration(table.name, () => {
      completedTables++;
      if (completedTables === tables.length) {
        generateDataMigration(tables, () => {
          // インデックスと制約を追加
          generateIndexesAndConstraints(tables, () => {
            // SQLファイルに書き込み
            try {
              fs.writeFileSync(migrationFile, sqlContent.join('\n'));
              console.log(`\n✅ 移行スクリプトが生成されました: ${migrationFile}`);
              console.log('\n📝 移行手順:');
              console.log('1. Supabaseのダッシュボードにログイン');
              console.log('2. SQL Editorを開く');
              console.log('3. 生成されたSQLファイルの内容をコピー&ペースト');
              console.log('4. 実行ボタンをクリック');
              console.log('5. テーブル構造とデータが移行されます');
              console.log('\n⚠️  注意: 既存のデータは失われます。バックアップを取ってから実行してください。');
            } catch (writeErr) {
              console.error('❌ ファイル書き込みに失敗:', writeErr);
            }
            db.close();
          });
        });
      }
    });
  });
});

function generateTableMigration(tableName, callback) {
  console.log(`🔍 テーブル構造を分析中: ${tableName}`);
  
  // テーブル構造を取得
  db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
    if (err) {
      console.error(`❌ テーブル構造の取得に失敗 (${tableName}):`, err);
      callback();
      return;
    }

    // CREATE TABLE文を生成
    sqlContent.push(`-- ${tableName}テーブル`);
    sqlContent.push(`CREATE TABLE IF NOT EXISTS "${tableName}" (`);
    
    const columnDefs = columns.map(col => {
      let def = `    "${col.name}" ${mapSqliteTypeToPostgres(col.type)}`;
      
      if (col.notnull) {
        def += ' NOT NULL';
      }
      
      if (col.pk) {
        def += ' PRIMARY KEY';
      } else if (col.dflt_value !== null) {
        const defaultValue = mapDefaultValue(col.dflt_value, col.type);
        def += ` DEFAULT ${defaultValue}`;
      }
      
      return def;
    });
    
    sqlContent.push(columnDefs.join(',\n'));
    sqlContent.push(');');
    sqlContent.push('');

    callback();
  });
}

function generateDataMigration(tables, callback) {
  console.log('\n📊 データ移行SQLを生成中...');
  
  sqlContent.push('-- データ移行');
  sqlContent.push('');

  let completedTables = 0;
  tables.forEach(table => {
    // データを取得
    db.all(`SELECT * FROM ${table.name}`, (err, rows) => {
      if (err) {
        console.error(`❌ データの取得に失敗 (${table.name}):`, err);
      } else if (rows.length > 0) {
        console.log(`📝 ${table.name}: ${rows.length}件のデータを移行`);
        
        // INSERT文を生成
        sqlContent.push(`-- ${table.name}のデータ移行 (${rows.length}件)`);
        
        rows.forEach(row => {
          const columns = Object.keys(row);
          const values = columns.map(col => {
            const value = row[col];
            if (value === null) {
              return 'NULL';
            } else if (typeof value === 'string') {
              return `'${value.replace(/'/g, "''")}'`;
            } else if (typeof value === 'boolean') {
              return value ? 'true' : 'false';
            } else if (typeof value === 'number') {
              // SQLiteの0/1をPostgreSQLのbooleanに変換
              const columnType = columns.find(c => c.name === col)?.type?.toUpperCase() || '';
              if (columnType.includes('BOOLEAN') && (value === 0 || value === 1)) {
                return value === 1 ? 'true' : 'false';
              }
              return value;
            } else {
              return value;
            }
          });
          
          sqlContent.push(`INSERT INTO "${table.name}" ("${columns.join('", "')}") VALUES (${values.join(', ')});`);
        });
        sqlContent.push('');
      } else {
        console.log(`ℹ️  ${table.name}: データなし`);
      }

      completedTables++;
      if (completedTables === tables.length) {
        callback();
      }
    });
  });
}

function generateIndexesAndConstraints(tables, callback) {
  console.log('\n🔗 インデックスと制約を生成中...');
  
  sqlContent.push('-- インデックスと制約');
  sqlContent.push('');

  // ユニーク制約
  sqlContent.push('-- ユニーク制約');
  sqlContent.push('ALTER TABLE "User" ADD CONSTRAINT "User_userId_key" UNIQUE ("userId");');
  sqlContent.push('ALTER TABLE "Subject" ADD CONSTRAINT "Subject_subjectId_key" UNIQUE ("subjectId");');
  sqlContent.push('ALTER TABLE "TaskDefinition" ADD CONSTRAINT "TaskDefinition_subjectId_examType_key" UNIQUE ("subjectId", "examType");');
  sqlContent.push('ALTER TABLE "WorkProgress" ADD CONSTRAINT "WorkProgress_userId_taskId_fileType_key" UNIQUE ("userId", "taskId", "fileType");');
  sqlContent.push('ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_role_key" UNIQUE ("userId", "role");');
  sqlContent.push('ALTER TABLE "AdminSettings" ADD CONSTRAINT "AdminSettings_settingKey_key" UNIQUE ("settingKey");');
  sqlContent.push('');

  // インデックス
  sqlContent.push('-- インデックス');
  sqlContent.push('CREATE INDEX IF NOT EXISTS "User_userId_idx" ON "User"("userId");');
  sqlContent.push('CREATE INDEX IF NOT EXISTS "Subject_subjectId_idx" ON "Subject"("subjectId");');
  sqlContent.push('CREATE INDEX IF NOT EXISTS "TaskDefinition_subjectId_idx" ON "TaskDefinition"("subjectId");');
  sqlContent.push('CREATE INDEX IF NOT EXISTS "WorkProgress_userId_idx" ON "WorkProgress"("userId");');
  sqlContent.push('CREATE INDEX IF NOT EXISTS "WorkProgress_subjectId_idx" ON "WorkProgress"("subjectId");');
  sqlContent.push('CREATE INDEX IF NOT EXISTS "PromptUpload_subjectId_idx" ON "PromptUpload"("subjectId");');
  sqlContent.push('CREATE INDEX IF NOT EXISTS "PromptUpload_taskId_idx" ON "PromptUpload"("taskId");');
  sqlContent.push('CREATE INDEX IF NOT EXISTS "SystemPrompt_subjectId_idx" ON "SystemPrompt"("subjectId");');
  sqlContent.push('CREATE INDEX IF NOT EXISTS "SystemPrompt_createdBy_idx" ON "SystemPrompt"("createdBy");');
  sqlContent.push('CREATE INDEX IF NOT EXISTS "UserRole_userId_idx" ON "UserRole"("userId");');
  sqlContent.push('CREATE INDEX IF NOT EXISTS "AccessPermission_userId_idx" ON "AccessPermission"("userId");');
  sqlContent.push('');

  callback();
}

function mapSqliteTypeToPostgres(sqliteType) {
  const type = sqliteType.toUpperCase();
  
  if (type.includes('INTEGER') || type.includes('INT')) {
    return 'INTEGER';
  } else if (type.includes('REAL') || type.includes('FLOAT') || type.includes('DOUBLE')) {
    return 'REAL';
  } else if (type.includes('TEXT') || type.includes('VARCHAR') || type.includes('CHAR')) {
    return 'TEXT';
  } else if (type.includes('BLOB')) {
    return 'BYTEA';
  } else if (type.includes('BOOLEAN') || type.includes('BOOL')) {
    return 'BOOLEAN';
  } else if (type.includes('JSON')) {
    return 'JSONB';
  } else if (type.includes('DATETIME')) {
    return 'TIMESTAMP(3)';
  } else {
    return 'TEXT'; // デフォルト
  }
}

function mapDefaultValue(value, type) {
  if (value === null) {
    return 'NULL';
  }
  
  const sqliteType = type.toUpperCase();
  
  if (sqliteType.includes('DATETIME') && value === 'CURRENT_TIMESTAMP') {
    return 'CURRENT_TIMESTAMP';
  } else if (sqliteType.includes('BOOLEAN')) {
    return value === '1' ? 'true' : 'false';
  } else if (typeof value === 'string' && value.startsWith("'") && value.endsWith("'")) {
    return value; // 既にクォートされている
  } else if (typeof value === 'string') {
    return `'${value}'`;
  } else {
    return value;
  }
} 