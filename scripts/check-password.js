const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkPassword() {
  try {
    console.log('🔍 ユーザーID 000001のパスワードを確認中...\n');

    // ユーザーを検索
    const user = await prisma.user.findUnique({
      where: { userId: '000001' }
    });

    if (!user) {
      console.log('❌ ユーザーID 000001が見つかりません');
      return;
    }

    console.log('✅ ユーザーが見つかりました');
    console.log(`ユーザーID: ${user.userId}`);
    console.log(`名前: ${user.name}`);
    console.log(`権限: ${user.role}\n`);

    // 一般的なパスワードを試す
    const commonPasswords = [
      '000001',
      'password',
      '123456',
      'admin',
      'user',
      'test',
      'dde',
      'password123',
      'admin123'
    ];

    console.log('🔐 パスワードを検証中...');
    
    for (const password of commonPasswords) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        console.log(`✅ パスワードが見つかりました: ${password}`);
        return;
      }
    }

    console.log('❌ 一般的なパスワードでは認証できませんでした');
    console.log('💡 パスワードをリセットする必要があります');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
checkPassword(); 