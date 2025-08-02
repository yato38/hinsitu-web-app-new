const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateUser000001() {
  try {
    console.log('🔧 ユーザーID 000001の権限とパスワードを更新中...');

    const userId = '000001';
    const newPassword = 'admin123'; // 新しいパスワード
    const newRole = 'SUPER_ADMIN'; // 管理者権限

    // 既存のユーザーをチェック
    const existingUser = await prisma.user.findUnique({
      where: { userId: userId }
    });

    if (!existingUser) {
      console.log('❌ ユーザーID 000001が見つかりません');
      return;
    }

    console.log('📝 現在のユーザー情報:');
    console.log(`ユーザーID: ${existingUser.userId}`);
    console.log(`名前: ${existingUser.name}`);
    console.log(`現在の権限: ${existingUser.role}`);

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // ユーザー情報を更新
    const updatedUser = await prisma.user.update({
      where: { userId: userId },
      data: {
        password: hashedPassword,
        role: newRole
      }
    });

    console.log('✅ ユーザー情報の更新が完了しました！');
    console.log('📋 更新後のログイン情報:');
    console.log(`ユーザーID: ${updatedUser.userId}`);
    console.log(`名前: ${updatedUser.name}`);
    console.log(`権限: ${updatedUser.role}`);
    console.log(`パスワード: ${newPassword}`);
    console.log('\n💡 セキュリティのため、ログイン後はパスワードを変更してください。');

  } catch (error) {
    console.error('❌ ユーザー情報の更新に失敗しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
updateUser000001(); 