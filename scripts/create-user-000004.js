// 環境変数を直接設定
process.env.DATABASE_URL = "postgresql://postgres:hinsitukanriyamamoto@db.zhxmdcylgkbtpknmwvpg.supabase.co:5432/postgres";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://zhxmdcylgkbtpknmwvpg.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoeG1kY3lsZ2tidHBrbm13dnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE5MjUzNiwiZXhwIjoyMDY5NzY4NTM2fQ.9IgxIA01Igq91o3iSMGeb5Qs3U7Bmcrq4E-RKKfdGak";

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();

// 環境変数の検証
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL が設定されていません。');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY が設定されていません。');
  process.exit(1);
}

// Supabaseクライアントの初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createUser000004() {
  try {
    console.log('🔍 ユーザー登録を開始します...');
    
    const userId = '000004';
    const name = 'あ';
    const password = '000004';
    const role = 'USER';

    // 1. 既存ユーザーのチェック
    console.log('📋 既存ユーザーをチェック中...');
    const existingUser = await prisma.user.findUnique({
      where: { userId }
    });

    if (existingUser) {
      console.log('❌ ユーザーID 000004 は既に存在します。');
      return;
    }

    // 2. Supabaseでユーザーを作成
    console.log('🔐 Supabaseでユーザーを作成中...');
    const { data: supabaseUser, error: supabaseError } = await supabase.auth.admin.createUser({
      email: `${userId}@example.com`,
      password: password,
      user_metadata: {
        userId: userId,
        name: name
      },
      email_confirm: true
    });

    if (supabaseError) {
      console.error('❌ Supabaseユーザー作成エラー:', supabaseError);
      throw new Error(`Supabase user creation failed: ${supabaseError.message}`);
    }

    console.log('✅ Supabaseユーザー作成成功:', supabaseUser.user?.id);

    // 3. Prismaでユーザーを作成
    console.log('🗄️ Prismaでユーザーを作成中...');
    const hashedPassword = await bcrypt.hash(password, 12);
    const prismaUser = await prisma.user.create({
      data: {
        userId: userId,
        name: name,
        password: hashedPassword,
        role: role
      }
    });

    console.log('✅ Prismaユーザー作成成功:', prismaUser.id);

    // 4. ユーザーロールを作成
    console.log('👤 ユーザーロールを作成中...');
    await prisma.userRole.create({
      data: {
        userId: prismaUser.id,
        role: role
      }
    });

    console.log('✅ ユーザーロール作成成功');

    // 5. 結果を表示
    console.log('\n🎉 ユーザー登録が完了しました！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`ユーザーID: ${userId}`);
    console.log(`名前: ${name}`);
    console.log(`役割: ${role}`);
    console.log(`Prisma ID: ${prismaUser.id}`);
    console.log(`Supabase ID: ${supabaseUser.user?.id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 6. 作成されたユーザーを確認
    const createdUser = await prisma.user.findUnique({
      where: { userId },
      include: { userRoles: true }
    });

    console.log('\n📊 作成されたユーザー情報:');
    console.log(JSON.stringify(createdUser, null, 2));

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプトを実行
createUser000004(); 