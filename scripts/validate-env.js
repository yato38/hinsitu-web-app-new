#!/usr/bin/env node

/**
 * 環境変数検証スクリプト
 * 必要な環境変数が正しく設定されているかを確認します
 */

const fs = require('fs');
const path = require('path');

// 必要な環境変数の定義
const requiredEnvVars = {
  // データベース関連
  'DATABASE_URL': {
    description: 'Supabaseデータベースの接続文字列',
    required: true,
    pattern: /^postgresql:\/\//
  },
  
  // Supabase設定
  'NEXT_PUBLIC_SUPABASE_URL': {
    description: 'SupabaseプロジェクトのURL',
    required: true,
    pattern: /^https:\/\/.*\.supabase\.co$/
  },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
    description: 'Supabase匿名ユーザー用APIキー',
    required: true,
    pattern: /^eyJ/
  },
  'SUPABASE_SERVICE_ROLE_KEY': {
    description: 'Supabase管理者権限用APIキー',
    required: true,
    pattern: /^eyJ/
  },
  
  // NextAuth設定
  'NEXTAUTH_URL': {
    description: 'NextAuth.jsの認証URL',
    required: true,
    pattern: /^https?:\/\//
  },
  'NEXTAUTH_SECRET': {
    description: 'NextAuth.jsの秘密鍵',
    required: true,
    minLength: 32
  },
  
  // 外部API
  'OPENAI_API_KEY': {
    description: 'OpenAI APIキー',
    required: false,
    pattern: /^sk-/
  },
  'NOTION_TOKEN': {
    description: 'Notion API統合トークン',
    required: false,
    pattern: /^secret_/
  },
  
  // 環境設定
  'NODE_ENV': {
    description: '実行環境',
    required: true,
    allowedValues: ['development', 'production', 'test']
  }
};

// 環境変数を読み込む関数
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        let value = valueParts.join('=');
        // 引用符を除去
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        env[key.trim()] = value.trim();
      }
    }
  });
  
  return env;
}

// 環境変数を検証する関数
function validateEnvVar(key, value, config) {
  const errors = [];
  
  // 必須チェック
  if (config.required && (!value || value === '')) {
    errors.push(`${key} は必須です`);
    return errors;
  }
  
  // 値が存在しない場合はスキップ
  if (!value || value === '') {
    return errors;
  }
  
  // パターンチェック
  if (config.pattern && !config.pattern.test(value)) {
    errors.push(`${key} の形式が正しくありません`);
  }
  
  // 最小長チェック
  if (config.minLength && value.length < config.minLength) {
    errors.push(`${key} は最低${config.minLength}文字必要です`);
  }
  
  // 許可値チェック
  if (config.allowedValues && !config.allowedValues.includes(value)) {
    errors.push(`${key} は以下のいずれかである必要があります: ${config.allowedValues.join(', ')}`);
  }
  
  return errors;
}

// メイン処理
function main() {
  console.log('🔍 環境変数検証スクリプト');
  console.log('========================\n');
  
  // 環境変数ファイルの優先順位で読み込み
  const envFiles = [
    '.env.local',
    '.env.development',
    '.env.production',
    '.env'
  ];
  
  let env = {};
  let loadedFiles = [];
  
  for (const file of envFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const fileEnv = loadEnvFile(filePath);
      env = { ...env, ...fileEnv };
      loadedFiles.push(file);
    }
  }
  
  // システム環境変数も追加
  env = { ...env, ...process.env };
  
  console.log('📁 読み込まれたファイル:');
  if (loadedFiles.length > 0) {
    loadedFiles.forEach(file => console.log(`  ✅ ${file}`));
  } else {
    console.log('  ⚠️  環境変数ファイルが見つかりません');
  }
  console.log('');
  
  // 環境変数を検証
  const results = {
    valid: [],
    invalid: [],
    missing: [],
    optional: []
  };
  
  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = env[key];
    
    if (!value || value === '') {
      if (config.required) {
        results.missing.push({ key, config });
      } else {
        results.optional.push({ key, config });
      }
    } else {
      const errors = validateEnvVar(key, value, config);
      if (errors.length > 0) {
        results.invalid.push({ key, value, config, errors });
      } else {
        results.valid.push({ key, value, config });
      }
    }
  }
  
  // 結果を表示
  console.log('📊 検証結果:');
  console.log('==========\n');
  
  // 有効な環境変数
  if (results.valid.length > 0) {
    console.log('✅ 有効な環境変数:');
    results.valid.forEach(({ key, config }) => {
      console.log(`  ${key}: ${config.description}`);
    });
    console.log('');
  }
  
  // 無効な環境変数
  if (results.invalid.length > 0) {
    console.log('❌ 無効な環境変数:');
    results.invalid.forEach(({ key, value, errors }) => {
      console.log(`  ${key}:`);
      console.log(`    値: ${value}`);
      errors.forEach(error => console.log(`    エラー: ${error}`));
    });
    console.log('');
  }
  
  // 不足している環境変数
  if (results.missing.length > 0) {
    console.log('⚠️  不足している必須環境変数:');
    results.missing.forEach(({ key, config }) => {
      console.log(`  ${key}: ${config.description}`);
    });
    console.log('');
  }
  
  // オプションの環境変数
  if (results.optional.length > 0) {
    console.log('ℹ️  設定されていないオプション環境変数:');
    results.optional.forEach(({ key, config }) => {
      console.log(`  ${key}: ${config.description}`);
    });
    console.log('');
  }
  
  // サマリー
  const total = Object.keys(requiredEnvVars).length;
  const valid = results.valid.length;
  const invalid = results.invalid.length;
  const missing = results.missing.length;
  
  console.log('📈 サマリー:');
  console.log(`  総数: ${total}`);
  console.log(`  有効: ${valid}`);
  console.log(`  無効: ${invalid}`);
  console.log(`  不足: ${missing}`);
  
  if (invalid === 0 && missing === 0) {
    console.log('\n🎉 すべての環境変数が正しく設定されています！');
    process.exit(0);
  } else {
    console.log('\n⚠️  環境変数の設定に問題があります。');
    console.log('詳細は ENVIRONMENT_SETUP.md を参照してください。');
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = { validateEnvVar, loadEnvFile, requiredEnvVars }; 