const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// SQLiteデータベースファイルのパス
const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');

// データベースファイルの存在確認
if (!fs.existsSync(dbPath)) {
  console.error('❌ SQLiteデータベースファイルが見つかりません:', dbPath);
  process.exit(1);
}

console.log('=== 移行前データ確認 ===\n');
console.log(`📁 データベースファイル: ${dbPath}`);

// データベースに接続
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ データベース接続に失敗:', err.message);
    process.exit(1);
  }
  console.log('✅ SQLiteデータベースに接続しました\n');
});

// テーブル一覧を取得
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_prisma_%' ORDER BY name", (err, tables) => {
  if (err) {
    console.error('❌ テーブル一覧の取得に失敗:', err);
    db.close();
    return;
  }

  if (tables.length === 0) {
    console.log('⚠️  テーブルが見つかりません');
    db.close();
    return;
  }

  console.log('📊 データ確認結果:\n');

  let completedTables = 0;
  tables.forEach(table => {
    // 各テーブルのレコード数を確認
    db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, result) => {
      if (err) {
        console.error(`❌ ${table.name}: カウント取得に失敗`, err);
      } else {
        console.log(`📋 ${table.name}: ${result.count}件`);
        
        // サンプルデータを表示（最初の3件）
        if (result.count > 0) {
          db.all(`SELECT * FROM ${table.name} LIMIT 3`, (err, rows) => {
            if (!err && rows.length > 0) {
              console.log(`   └─ サンプル: ${rows.length}件表示`);
              rows.forEach((row, index) => {
                const sample = Object.entries(row)
                  .slice(0, 3) // 最初の3つのカラムのみ表示
                  .map(([key, value]) => `${key}=${value}`)
                  .join(', ');
                console.log(`      ${index + 1}. ${sample}${Object.keys(row).length > 3 ? '...' : ''}`);
              });
            }
            console.log('');
          });
        } else {
          console.log('');
        }
      }

      completedTables++;
      if (completedTables === tables.length) {
        generateMigrationSummary(tables, () => {
          db.close();
        });
      }
    });
  });
});

function generateMigrationSummary(tables, callback) {
  console.log('📝 移行サマリー:');
  console.log('='.repeat(50));
  
  // 移行用SQLファイルの存在確認
  const migrationFile = path.join(__dirname, '..', 'supabase-migration.sql');
  if (fs.existsSync(migrationFile)) {
    const stats = fs.statSync(migrationFile);
    console.log(`✅ 移行スクリプト: ${migrationFile}`);
    console.log(`   サイズ: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   更新日時: ${stats.mtime.toLocaleString()}`);
  } else {
    console.log('⚠️  移行スクリプトが見つかりません');
    console.log('   npm run db:generate-migration を実行してください');
  }
  
  console.log('');
  console.log('🔧 次のステップ:');
  console.log('1. Supabaseプロジェクトを作成');
  console.log('2. 生成されたSQLファイルをSupabaseのSQL Editorで実行');
  console.log('3. 環境変数を更新（DATABASE_URL等）');
  console.log('4. アプリケーションの動作確認');
  
  callback();
} 