require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 データベース接続テストを開始...');
    console.log('📊 環境変数確認:');
    console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '設定済み' : '未設定');
    console.log('- NODE_ENV:', process.env.NODE_ENV || '未設定');
    console.log('- ファイルパス:', require('path').resolve('.env.local'));
    console.log('- ファイル存在:', require('fs').existsSync('.env.local'));
    
    // データベース接続テスト
    await prisma.$connect();
    console.log('✅ データベース接続成功');
    
    // 簡単なクエリを実行
    const userCount = await prisma.user.count();
    console.log(`📈 ユーザー数: ${userCount}`);
    
    await prisma.$disconnect();
    console.log('✅ データベース接続テスト完了');
    
  } catch (error) {
    console.error('❌ データベース接続エラー:');
    console.error('エラーメッセージ:', error.message);
    console.error('エラー詳細:', error);
    
    if (error.message.includes('FATAL: Tenant or user not found')) {
      console.log('\n🔧 解決策:');
      console.log('1. Supabaseプロジェクトが存在することを確認');
      console.log('2. データベースパスワードが正しいことを確認');
      console.log('3. プロジェクトIDが正しいことを確認');
      console.log('4. Supabaseダッシュボードで接続文字列を再確認');
    }
  }
}

testDatabaseConnection(); 