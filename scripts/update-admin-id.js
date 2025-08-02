const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateAdminId() {
  try {
    console.log('🔧 管理者ユーザーのIDを更新中...');

    // 古い管理者ユーザーID
    const oldAdminId = 'ADMIN001';
    const newAdminId = '000001';

    // 既存の管理者ユーザーをチェック
    const existingOldUser = await prisma.user.findUnique({
      where: { userId: oldAdminId }
    });

    const existingNewUser = await prisma.user.findUnique({
      where: { userId: newAdminId }
    });

    if (existingNewUser) {
      console.log('⚠️ 新しいID (000001) のユーザーは既に存在します');
      console.log(`ユーザーID: ${existingNewUser.userId}`);
      console.log(`名前: ${existingNewUser.name}`);
      console.log(`権限: ${existingNewUser.role}`);
      return;
    }

    if (existingOldUser) {
      console.log('📝 古い管理者ユーザーを削除中...');
      
      // 古いユーザーを削除
      await prisma.user.delete({
        where: { userId: oldAdminId }
      });
      
      console.log('✅ 古い管理者ユーザーを削除しました');
    }

    // 新しい管理者ユーザーを作成
    console.log('📝 新しい管理者ユーザーを作成中...');
    
    const adminData = {
      userId: newAdminId,
      name: 'システム管理者',
      password: 'admin123',
      role: 'SUPER_ADMIN'
    };

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(adminData.password, 12);

    // 新しい管理者ユーザーを作成
    const adminUser = await prisma.user.create({
      data: {
        userId: adminData.userId,
        name: adminData.name,
        password: hashedPassword,
        role: adminData.role
      }
    });

    console.log('✅ 管理者ユーザーのID更新が完了しました！');
    console.log('📋 新しいログイン情報:');
    console.log(`ユーザーID: ${adminData.userId}`);
    console.log(`パスワード: ${adminData.password}`);
    console.log(`権限: ${adminData.role}`);
    console.log('\n💡 セキュリティのため、ログイン後はパスワードを変更してください。');

  } catch (error) {
    console.error('❌ 管理者ユーザーのID更新に失敗しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
updateAdminId(); 