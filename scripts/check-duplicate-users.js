// 環境変数を直接設定
process.env.DATABASE_URL = "postgresql://postgres:hinsitukanriyamamoto@db.zhxmdcylgkbtpknmwvpg.supabase.co:5432/postgres";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://zhxmdcylgkbtpknmwvpg.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoeG1kY3lsZ2tidHBrbm13dnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE5MjUzNiwiZXhwIjoyMDY5NzY4NTM2fQ.9IgxIA01Igq91o3iSMGeb5Qs3U7Bmcrq4E-RKKfdGak";

const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();

// Supabaseクライアントの初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDuplicateUsers() {
  try {
    console.log('🔍 ユーザーの重複登録状況を確認中...\n');

    // 1. Prismaでユーザー一覧を取得
    console.log('📋 Prisma（PostgreSQL）のユーザー一覧:');
    const prismaUsers = await prisma.user.findMany({
      include: { userRoles: true }
    });

    prismaUsers.forEach(user => {
      console.log(`  - ユーザーID: ${user.userId}`);
      console.log(`    名前: ${user.name}`);
      console.log(`    Prisma ID: ${user.id}`);
      console.log(`    役割: ${user.role}`);
      console.log(`    作成日: ${user.createdAt}`);
      console.log('');
    });

    // 2. Supabaseでユーザー一覧を取得
    console.log('🔐 Supabase認証テーブルのユーザー一覧:');
    const { data: supabaseUsers, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('❌ Supabaseユーザー取得エラー:', error);
      return;
    }

    supabaseUsers.users.forEach(user => {
      console.log(`  - メール: ${user.email}`);
      console.log(`    Supabase ID: ${user.id}`);
      console.log(`    メタデータ:`, user.user_metadata);
      console.log(`    作成日: ${user.created_at}`);
      console.log('');
    });

    // 3. 重複分析
    console.log('🔍 重複分析:');
    const userIds = prismaUsers.map(u => u.userId);
    const supabaseEmails = supabaseUsers.users.map(u => u.email);

    console.log(`Prismaユーザー数: ${prismaUsers.length}`);
    console.log(`Supabaseユーザー数: ${supabaseUsers.users.length}`);

    // ユーザーID 000004の詳細確認
    const user000004 = prismaUsers.find(u => u.userId === '000004');
    const supabaseUser000004 = supabaseUsers.users.find(u => u.email === '000004@example.com');

    if (user000004 && supabaseUser000004) {
      console.log('\n✅ ユーザーID 000004 は両方のデータベースに存在します:');
      console.log(`  Prisma: ${user000004.userId} (${user000004.name})`);
      console.log(`  Supabase: ${supabaseUser000004.email}`);
    }

    // 4. 推奨事項
    console.log('\n💡 現在の状況:');
    console.log('  - これは意図的な設計です');
    console.log('  - Supabase: 認証・セッション管理');
    console.log('  - Prisma: アプリケーション固有のユーザー情報');
    console.log('  - 両方が連携して動作します');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプトを実行
checkDuplicateUsers(); 