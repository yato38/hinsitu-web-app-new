const { PrismaClient } = require('@prisma/client');

// 環境変数を直接設定
process.env.DATABASE_URL = "postgresql://postgres:hinsituwebapp@db.zhxmdcylgkbtpknmwvpg.supabase.co:5432/postgres";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://zhxmdcylgkbtpknmwvpg.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoeG1kY3lsZ2tidHBrbm13dnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxOTI1MzYsImV4cCI6MjA2OTc2ODUzNn0.8yjxZeYr2ik75gsistOeltlt1fgAggJYOXt_p3zJipw";
process.env.SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoeG1kY3lsZ2tidHBrbm13dnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE5MjUzNiwiZXhwIjoyMDY5NzY4NTM2fQ.9IgxIA01Igq91o3iSMGeb5Qs3U7Bmcrq4E-RKKfdGak";
process.env.NEXTAUTH_URL = "http://localhost:3003";
process.env.NEXTAUTH_SECRET = "aa3dc4678a3ed270b8d87b11785e8f8adfeda975548d10e7fed94d22bf40f91f";
process.env.NODE_ENV = "development";

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 データベース接続テストを開始...');
    console.log('📊 環境変数確認:');
    console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '設定済み' : '未設定');
    console.log('- NODE_ENV:', process.env.NODE_ENV || '未設定');
    
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