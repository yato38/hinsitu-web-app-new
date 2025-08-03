require('dotenv').config({ path: '.env.local' });

function checkConnectionString() {
  console.log('🔍 接続文字列の詳細確認...');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URLが設定されていません');
    return;
  }
  
  console.log('✅ DATABASE_URL: 設定済み');
  
  // 接続文字列を解析
  try {
    const url = new URL(databaseUrl);
    console.log('📊 接続詳細:');
    console.log('- プロトコル:', url.protocol);
    console.log('- ホスト:', url.hostname);
    console.log('- ポート:', url.port);
    console.log('- データベース名:', url.pathname.slice(1));
    console.log('- ユーザー名:', url.username);
    console.log('- パスワード:', url.password ? '設定済み' : '未設定');
    
    // Supabaseの形式かチェック
    if (url.hostname.includes('supabase.co')) {
      console.log('✅ Supabase接続文字列の形式: 正しい');
      
      // プロジェクトIDを抽出
      const projectId = url.hostname.split('.')[1];
      console.log('- プロジェクトID:', projectId);
      
      // 推奨される接続文字列の形式
      console.log('\n📝 推奨される接続文字列の形式:');
      console.log(`postgresql://postgres:[YOUR-PASSWORD]@db.${projectId}.supabase.co:5432/postgres`);
      
    } else {
      console.log('⚠️  Supabase接続文字列の形式: 不明');
    }
    
  } catch (error) {
    console.log('❌ 接続文字列の解析に失敗:', error.message);
  }
}

checkConnectionString(); 