#!/usr/bin/env node

/**
 * 環境変数設定スクリプト
 * 開発環境と本番環境の.envファイルを簡単に作成できます
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 質問を表示して回答を取得する関数
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// 開発環境用の.env.localテンプレート
const devEnvTemplate = `# 開発環境用設定 (.env.local)
# このファイルはgitignoreに含まれており、ローカル開発専用です

# Database - Supabase (開発用)
DATABASE_URL="postgresql://postgres:hinsitukanriyamamoto@db.zhxmdcylgkbtpknmwvpg.supabase.co:5432/postgres"

# Supabase設定 (開発用)
NEXT_PUBLIC_SUPABASE_URL="https://zhxmdcylgkbtpknmwvpg.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoeG1kY3lsZ2tidHBrbm13dnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxOTI1MzYsImV4cCI6MjA2OTc2ODUzNn0.8yjxZeYr2ik75gsistOeltlt1fgAggJYOXt_p3zJipw"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoeG1kY3lsZ2tidHBrbm13dnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE5MjUzNiwiZXhwIjoyMDY5NzY4NTM2fQ.9IgxIA01Igq91o3iSMGeb5Qs3U7Bmcrq4E-RKKfdGak"

# NextAuth (開発用)
NEXTAUTH_URL="http://localhost:3003"
NEXTAUTH_SECRET="aa3dc4678a3ed270b8d87b11785e8f8adfeda975548d10e7fed94d22bf40f91f"

# OpenAI API設定 (開発用)
OPENAI_API_KEY=your_openai_api_key_here

# Notion API設定 (開発用)
NOTION_TOKEN=your_notion_integration_token_here

# 環境設定
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug

# 開発用の追加設定
ENABLE_LOGGING=true
ENABLE_DEBUG_MODE=true
`;

// 本番環境用の.env.productionテンプレート
const prodEnvTemplate = `# 本番環境用設定 (.env.production)
# このファイルはgitignoreに含まれており、本番環境専用です
# 本番環境ではVercelダッシュボードで環境変数を設定することを推奨します

# Database - Supabase (本番用)
# 本番環境では専用のデータベースを使用してください
DATABASE_URL="postgresql://postgres:your_production_password@your_production_db_host:5432/your_production_db"

# Supabase設定 (本番用)
# 本番環境では専用のSupabaseプロジェクトを使用してください
NEXT_PUBLIC_SUPABASE_URL="https://your-production-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_production_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_production_service_role_key"

# NextAuth (本番用)
# 本番環境のURLに変更してください
NEXTAUTH_URL="https://your-app.vercel.app"
# 本番環境では強力な秘密鍵を生成してください
NEXTAUTH_SECRET="your_production_nextauth_secret"

# OpenAI API設定 (本番用)
# 本番環境では専用のAPIキーを使用してください
OPENAI_API_KEY=your_production_openai_api_key

# Notion API設定 (本番用)
# 本番環境では専用のトークンを使用してください
NOTION_TOKEN=your_production_notion_token

# 環境設定
NODE_ENV=production
DEBUG=false
LOG_LEVEL=error

# 本番用の追加設定
ENABLE_LOGGING=false
ENABLE_DEBUG_MODE=false
ENABLE_ANALYTICS=true
`;

// ファイルを作成する関数
function createEnvFile(filename, content) {
  const filePath = path.join(process.cwd(), filename);
  
  if (fs.existsSync(filePath)) {
    console.log(`⚠️  ${filename} は既に存在します。`);
    return false;
  }
  
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${filename} を作成しました。`);
    return true;
  } catch (error) {
    console.error(`❌ ${filename} の作成に失敗しました:`, error.message);
    return false;
  }
}

// メイン処理
async function main() {
  console.log('🚀 環境変数設定スクリプト');
  console.log('========================\n');
  
  const choice = await askQuestion(
    'どの環境の設定ファイルを作成しますか？\n' +
    '1. 開発環境 (.env.local)\n' +
    '2. 本番環境 (.env.production)\n' +
    '3. 両方\n' +
    '4. キャンセル\n' +
    '選択してください (1-4): '
  );
  
  switch (choice) {
    case '1':
      createEnvFile('.env.local', devEnvTemplate);
      break;
    case '2':
      createEnvFile('.env.production', prodEnvTemplate);
      break;
    case '3':
      createEnvFile('.env.local', devEnvTemplate);
      createEnvFile('.env.production', prodEnvTemplate);
      break;
    case '4':
      console.log('キャンセルしました。');
      break;
    default:
      console.log('無効な選択です。');
  }
  
  console.log('\n📝 次のステップ:');
  console.log('1. 作成されたファイルを編集して、実際の値を設定してください');
  console.log('2. 本番環境ではVercelダッシュボードでの環境変数設定を推奨します');
  console.log('3. 詳細は ENVIRONMENT_SETUP.md を参照してください');
  
  rl.close();
}

// スクリプト実行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createEnvFile, devEnvTemplate, prodEnvTemplate }; 