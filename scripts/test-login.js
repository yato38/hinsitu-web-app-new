const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('🔍 ログイン機能をテスト中...\n');

    // 管理者ユーザーでログインテスト
    const adminUserId = 'ADMIN001';
    const adminPassword = 'admin123';

    console.log(`テストユーザー: ${adminUserId}`);
    console.log(`テストパスワード: ${adminPassword}\n`);

    // ユーザーを検索
    const user = await prisma.user.findUnique({
      where: { userId: adminUserId }
    });

    if (!user) {
      console.log('❌ ユーザーが見つかりません');
      return;
    }

    console.log('✅ ユーザーが見つかりました');
    console.log(`ユーザーID: ${user.userId}`);
    console.log(`名前: ${user.name}`);
    console.log(`権限: ${user.role}\n`);

    // パスワード検証
    const isPasswordValid = await bcrypt.compare(adminPassword, user.password);

    if (isPasswordValid) {
      console.log('✅ パスワードが正しく検証されました');
      console.log('🎉 ログイン成功！');
    } else {
      console.log('❌ パスワードが正しくありません');
    }

    // 他のユーザーも確認
    console.log('\n📋 登録されているユーザー一覧:');
    const allUsers = await prisma.user.findMany({
      select: {
        userId: true,
        name: true,
        role: true
      }
    });

    allUsers.forEach(user => {
      console.log(`- ${user.userId}: ${user.name} (${user.role})`);
    });

  } catch (error) {
    console.error('❌ テストに失敗しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
testLogin(); 