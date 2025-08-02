const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 安全なマイグレーションを開始します...');

try {
  // 1. 現在のデータベースをバックアップ
  console.log('📦 データベースをバックアップ中...');
  execSync('npm run db:backup', { stdio: 'inherit' });

  // 2. マイグレーションの実行
  console.log('🚀 マイグレーションを実行中...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  // 3. Prismaクライアントの再生成
  console.log('🔧 Prismaクライアントを再生成中...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('✅ マイグレーションが正常に完了しました！');

} catch (error) {
  console.error('❌ マイグレーションに失敗しました:', error.message);
  
  // エラーが発生した場合の復元オプションを提示
  console.log('\n💡 復元する場合は以下のコマンドを実行してください:');
  console.log('npm run db:restore <最新のバックアップファイル名>');
  
  process.exit(1);
} 