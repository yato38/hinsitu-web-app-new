#!/usr/bin/env node

/**
 * Vercelデプロイ用スクリプト
 * 
 * 使用方法:
 * node scripts/deploy-vercel.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Vercelデプロイを開始します...');

try {
  // 1. データベースのバックアップ
  console.log('📦 データベースのバックアップを作成中...');
  execSync('npm run db:backup', { stdio: 'inherit' });

  // 2. Prismaクライアントの生成
  console.log('🔧 Prismaクライアントを生成中...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // 3. ビルド
  console.log('🏗️ アプリケーションをビルド中...');
  execSync('npm run build', { stdio: 'inherit' });

  // 4. Gitの変更をコミット
  console.log('💾 変更をコミット中...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Vercelデプロイ用の更新"', { stdio: 'inherit' });

  // 5. GitHubにプッシュ
  console.log('📤 GitHubにプッシュ中...');
  execSync('git push origin main', { stdio: 'inherit' });

  console.log('✅ デプロイ準備が完了しました！');
  console.log('🌐 Vercelダッシュボードでデプロイの進行状況を確認してください:');
  console.log('   https://vercel.com/yatos-projects-632ec345/hinsitu-web-app-new/deployments');

} catch (error) {
  console.error('❌ デプロイ中にエラーが発生しました:', error.message);
  process.exit(1);
} 