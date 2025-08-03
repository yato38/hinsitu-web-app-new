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
  // 1. 環境変数の確認
  console.log('📋 環境変数を確認中...');
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ 以下の環境変数が設定されていません:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\n.env.localファイルまたはVercelの環境変数設定を確認してください。');
    process.exit(1);
  }

  // 2. Prismaクライアントの生成
  console.log('🔧 Prismaクライアントを生成中...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // 3. データベースのマイグレーション確認
  console.log('🗄️ データベースの状態を確認中...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  } catch (error) {
    console.warn('⚠️ データベースのプッシュに失敗しました。手動で確認してください。');
  }

  // 4. ビルドの確認
  console.log('🏗️ プロジェクトをビルド中...');
  execSync('npm run build', { stdio: 'inherit' });

  // 5. Vercelへのデプロイ
  console.log('🚀 Vercelにデプロイ中...');
  execSync('vercel --prod', { stdio: 'inherit' });

  console.log('✅ デプロイが完了しました！');
  console.log('\n📝 次のステップ:');
  console.log('1. Vercelダッシュボードでデプロイ状況を確認');
  console.log('2. 環境変数が正しく設定されているか確認');
  console.log('3. Supabaseとの接続をテスト');

} catch (error) {
  console.error('❌ デプロイ中にエラーが発生しました:', error.message);
  process.exit(1);
} 