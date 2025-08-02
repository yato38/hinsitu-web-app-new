const fs = require('fs');
const path = require('path');

// コマンドライン引数の取得
const backupFile = process.argv[2];

if (!backupFile) {
  console.log('使用方法: node restore-db.js <バックアップファイル名>');
  console.log('例: node restore-db.js backup_2024-01-15_14-30-00.db');
  console.log('\n利用可能なバックアップファイル:');
  
  const backupDir = path.join(__dirname, '../backups');
  if (fs.existsSync(backupDir)) {
    const files = fs.readdirSync(backupDir).filter(file => file.endsWith('.db'));
    if (files.length === 0) {
      console.log('バックアップファイルが見つかりません');
    } else {
      files.forEach(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        console.log(`- ${file} (${stats.mtime.toLocaleString()})`);
      });
    }
  }
  process.exit(1);
}

// パスの設定
const backupDir = path.join(__dirname, '../backups');
const backupPath = path.join(backupDir, backupFile);
const dbPath = path.join(__dirname, '../prisma/dev.db');

// 復元の実行
try {
  if (!fs.existsSync(backupPath)) {
    console.error(`❌ バックアップファイルが見つかりません: ${backupPath}`);
    process.exit(1);
  }

  // 現在のデータベースのバックアップを作成
  if (fs.existsSync(dbPath)) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                     now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const currentBackupPath = path.join(backupDir, `pre-restore_${timestamp}.db`);
    fs.copyFileSync(dbPath, currentBackupPath);
    console.log(`📦 現在のデータベースをバックアップしました: ${currentBackupPath}`);
  }

  // 復元の実行
  fs.copyFileSync(backupPath, dbPath);
  console.log(`✅ データベースの復元が完了しました: ${backupFile}`);
  console.log('💡 必要に応じて "npm run db:seed" を実行してシードデータを再適用してください');
  
} catch (error) {
  console.error('❌ 復元に失敗しました:', error);
  process.exit(1);
} 