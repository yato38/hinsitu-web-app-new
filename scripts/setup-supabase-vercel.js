#!/usr/bin/env node

/**
 * Supabase + Vercel設定スクリプト
 * 
 * 使用方法:
 * node scripts/setup-supabase-vercel.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🚀 Supabase + Vercel設定を開始します...\n');

  try {
    // 1. Supabase情報の入力
    console.log('📋 Supabase設定情報を入力してください:');
    
    const supabaseUrl = await question('Supabase Project URL (例: https://xxx.supabase.co): ');
    const supabaseAnonKey = await question('Supabase Anon Key: ');
    const supabaseServiceKey = await question('Supabase Service Role Key: ');
    const databasePassword = await question('Database Password: ');
    
    // DATABASE_URLの構築
    const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
    const databaseUrl = `postgresql://postgres:${databasePassword}@db.${projectRef}.supabase.co:5432/postgres`;

    // 2. NextAuth設定
    console.log('\n🔐 NextAuth設定:');
    const nextAuthSecret = await question('NEXTAUTH_SECRET (Enterで自動生成): ');
    const generatedSecret = nextAuthSecret || require('crypto').randomBytes(32).toString('hex');

    // 3. その他の設定
    console.log('\n🔧 その他の設定:');
    const openaiApiKey = await question('OpenAI API Key: ');
    const notionToken = await question('Notion Token (オプション): ');

    // 4. .env.localファイルの作成
    console.log('\n📝 .env.localファイルを作成中...');
    const envContent = `# Database - Supabase
DATABASE_URL="${databaseUrl}"

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL="${supabaseUrl}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${supabaseAnonKey}"
SUPABASE_SERVICE_ROLE_KEY="${supabaseServiceKey}"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${generatedSecret}"

# OpenAI API設定
OPENAI_API_KEY=${openaiApiKey}

# Notion API設定
NOTION_TOKEN=${notionToken || 'your_notion_integration_token_here'}

# その他の環境変数
NODE_ENV=development
`;

    fs.writeFileSync('.env.local', envContent);
    console.log('✅ .env.localファイルが作成されました');

    // 5. Prismaクライアントの生成
    console.log('\n🔧 Prismaクライアントを生成中...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // 6. データベーススキーマの適用
    console.log('\n🗄️ データベーススキーマを適用中...');
    try {
      execSync('npx prisma db push', { stdio: 'inherit' });
      console.log('✅ データベーススキーマが適用されました');
    } catch (error) {
      console.warn('⚠️ データベーススキーマの適用に失敗しました。手動で確認してください。');
    }

    // 7. Vercel CLIの確認
    console.log('\n🚀 Vercel CLIの確認中...');
    try {
      execSync('vercel --version', { stdio: 'pipe' });
      console.log('✅ Vercel CLIがインストールされています');
    } catch (error) {
      console.log('📦 Vercel CLIをインストール中...');
      execSync('npm install -g vercel', { stdio: 'inherit' });
    }

    // 8. Vercelプロジェクトの設定
    console.log('\n🌐 Vercelプロジェクトの設定:');
    const vercelProjectName = await question('Vercel Project Name (Enterでデフォルト): ') || 'quality-ai-app';
    
    // vercel.jsonの更新
    const vercelConfig = {
      buildCommand: "prisma generate && npm run build",
      outputDirectory: ".next",
      framework: "nextjs",
      installCommand: "npm install",
      functions: {
        "src/app/api/**/*.ts": {
          maxDuration: 30
        }
      },
      env: {
        NODE_ENV: "production"
      },
      build: {
        env: {
          DATABASE_URL: "@database_url",
          NEXT_PUBLIC_SUPABASE_URL: "@supabase_url",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "@supabase_anon_key",
          SUPABASE_SERVICE_ROLE_KEY: "@supabase_service_role_key",
          NEXTAUTH_SECRET: "@nextauth_secret",
          NEXTAUTH_URL: "@nextauth_url"
        }
      }
    };

    fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
    console.log('✅ vercel.jsonが更新されました');

    // 9. 環境変数の設定ガイド
    console.log('\n📋 Vercel環境変数設定ガイド:');
    console.log('以下の環境変数をVercelダッシュボードで設定してください:');
    console.log('\n=== 必須環境変数 ===');
    console.log(`DATABASE_URL: ${databaseUrl}`);
    console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`);
    console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey}`);
    console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey}`);
    console.log(`NEXTAUTH_SECRET: ${generatedSecret}`);
    console.log(`NEXTAUTH_URL: https://${vercelProjectName}.vercel.app`);
    console.log(`OPENAI_API_KEY: ${openaiApiKey}`);
    if (notionToken) {
      console.log(`NOTION_TOKEN: ${notionToken}`);
    }

    // 10. 次のステップ
    console.log('\n🎉 設定が完了しました！');
    console.log('\n📝 次のステップ:');
    console.log('1. Vercelダッシュボードで環境変数を設定');
    console.log('2. GitHubリポジトリをVercelに接続');
    console.log('3. デプロイを実行: npm run deploy');
    console.log('4. 動作確認');

    // 11. 設定情報の保存
    const setupInfo = {
      supabaseUrl,
      projectRef,
      databaseUrl,
      nextAuthSecret: generatedSecret,
      vercelProjectName,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync('supabase-vercel-setup.json', JSON.stringify(setupInfo, null, 2));
    console.log('\n💾 設定情報がsupabase-vercel-setup.jsonに保存されました');

  } catch (error) {
    console.error('❌ 設定中にエラーが発生しました:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main(); 