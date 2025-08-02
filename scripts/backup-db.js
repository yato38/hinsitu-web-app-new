const fs = require('fs');
const path = require('path');

// バックアップディレクトリの作成
const backupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// 現在の日時を取得
const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                 now.toTimeString().split(' ')[0].replace(/:/g, '-');

// データベースファイルのパス
const dbPath = path.join(__dirname, '../prisma/dev.db');
const backupPath = path.join(backupDir, `backup_${timestamp}.db`);

// バックアップの実行
try {
  if (fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, backupPath);
    console.log(`✅ データベースバックアップが完了しました: ${backupPath}`);
    
    // 古いバックアップファイルの削除（30日以上古いもの）
    const files = fs.readdirSync(backupDir);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    files.forEach(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      if (stats.mtime < thirtyDaysAgo) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ 古いバックアップファイルを削除しました: ${file}`);
      }
    });
  } else {
    console.log('⚠️ データベースファイルが見つかりません');
  }
} catch (error) {
  console.error('❌ バックアップに失敗しました:', error);
  process.exit(1);
} 