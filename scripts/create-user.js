const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// コマンドライン引数の取得
const userId = process.argv[2];
const name = process.argv[3];
const password = process.argv[4];
const role = process.argv[5] || 'USER';

async function createUser() {
  try {
    // 引数の検証
    if (!userId || !name || !password) {
      console.log('使用方法: node create-user.js <ユーザーID> <名前> <パスワード> [権限]');
      console.log('例: node create-user.js USER001 "田中太郎" password123 ADMIN');
      console.log('\n利用可能な権限:');
      console.log('- USER (一般ユーザー)');
      console.log('- DEVELOPER (開発者)');
      console.log('- WORKER (作業者)');
      console.log('- ADMIN (管理者)');
      console.log('- SUPER_ADMIN (スーパー管理者)');
      process.exit(1);
    }

    console.log('🔧 ユーザーを作成中...');

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);

    // 既存のユーザーをチェック
    const existingUser = await prisma.user.findUnique({
      where: { userId: userId }
    });

    if (existingUser) {
      console.log('⚠️ このユーザーIDは既に存在します');
      console.log(`ユーザーID: ${existingUser.userId}`);
      console.log(`名前: ${existingUser.name}`);
      console.log(`権限: ${existingUser.role}`);
      return;
    }

    // ユーザーを作成
    const user = await prisma.user.create({
      data: {
        userId: userId,
        name: name,
        password: hashedPassword,
        role: role
      }
    });

    console.log('✅ ユーザーが正常に作成されました！');
    console.log('📋 作成されたユーザー情報:');
    console.log(`ユーザーID: ${userId}`);
    console.log(`名前: ${name}`);
    console.log(`権限: ${role}`);
    console.log('\n💡 セキュリティのため、ログイン後はパスワードを変更してください。');

  } catch (error) {
    console.error('❌ ユーザーの作成に失敗しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
createUser(); 