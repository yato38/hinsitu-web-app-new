const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// SQLiteデータベースファイルのパス
const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');

// データベースに接続
const db = new sqlite3.Database(dbPath);

console.log('=== SQLiteデータベース構造分析 ===\n');

// テーブル一覧を取得
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('テーブル一覧の取得に失敗:', err);
    return;
  }

  console.log('テーブル一覧:');
  tables.forEach(table => {
    console.log(`- ${table.name}`);
  });
  console.log('');

  // 各テーブルの構造を詳細に分析
  let completedTables = 0;
  tables.forEach(table => {
    analyzeTable(table.name, () => {
      completedTables++;
      if (completedTables === tables.length) {
        console.log('\n=== 分析完了 ===');
        db.close();
      }
    });
  });
});

function analyzeTable(tableName, callback) {
  console.log(`\n--- ${tableName} テーブル ---`);
  
  // テーブル構造を取得
  db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
    if (err) {
      console.error(`テーブル構造の取得に失敗 (${tableName}):`, err);
      callback();
      return;
    }

    console.log('カラム:');
    columns.forEach(col => {
      console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
    });

    // サンプルデータを取得（最初の3行）
    db.all(`SELECT * FROM ${tableName} LIMIT 3`, (err, rows) => {
      if (err) {
        console.error(`サンプルデータの取得に失敗 (${tableName}):`, err);
      } else {
        console.log('サンプルデータ:');
        rows.forEach((row, index) => {
          console.log(`  ${index + 1}:`, row);
        });
      }

      // レコード数を取得
      db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, result) => {
        if (err) {
          console.error(`レコード数の取得に失敗 (${tableName}):`, err);
        } else {
          console.log(`レコード数: ${result.count}`);
        }
        callback();
      });
    });
  });
} 