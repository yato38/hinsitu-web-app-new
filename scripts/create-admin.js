const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔧 管理者ユーザーを作成中...');

    // 管理者ユーザーの情報
    const adminData = {
      userId: '000001', // 6桁のID
      name: 'システム管理者',
      password: 'admin123', // 平文パスワード
      role: 'SUPER_ADMIN'
    };

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(adminData.password, 12);

    // 既存のユーザーをチェック
    const existingUser = await prisma.user.findUnique({
      where: { userId: adminData.userId }
    });

    if (existingUser) {
      console.log('⚠️ 管理者ユーザーは既に存在します');
      console.log(`ユーザーID: ${existingUser.userId}`);
      console.log(`名前: ${existingUser.name}`);
      console.log(`権限: ${existingUser.role}`);
      return;
    }

    // 管理者ユーザーを作成
    const adminUser = await prisma.user.create({
      data: {
        userId: adminData.userId,
        name: adminData.name,
        password: hashedPassword,
        role: adminData.role
      }
    });

    console.log('✅ 管理者ユーザーが正常に作成されました！');
    console.log('📋 ログイン情報:');
    console.log(`ユーザーID: ${adminData.userId}`);
    console.log(`パスワード: ${adminData.password}`);
    console.log(`権限: ${adminData.role}`);
    console.log('\n💡 セキュリティのため、ログイン後はパスワードを変更してください。');

    // 基本的な科目データも作成
    await createBasicSubjects();

  } catch (error) {
    console.error('❌ 管理者ユーザーの作成に失敗しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createBasicSubjects() {
  try {
    console.log('\n📚 基本的な科目データを作成中...');

    const subjects = [
      { subjectId: 'english', subjectName: '英語', examType: 'mock' },
      { subjectId: 'math', subjectName: '数学', examType: 'mock' },
      { subjectId: 'japanese', subjectName: '国語', examType: 'mock' },
      { subjectId: 'science', subjectName: '理科', examType: 'mock' },
      { subjectId: 'social', subjectName: '社会', examType: 'mock' }
    ];

    for (const subject of subjects) {
      const existingSubject = await prisma.subject.findUnique({
        where: { subjectId: subject.subjectId }
      });

      if (!existingSubject) {
        await prisma.subject.create({
          data: subject
        });
        console.log(`✅ ${subject.subjectName} を作成しました`);
      } else {
        console.log(`⚠️ ${subject.subjectName} は既に存在します`);
      }
    }

    console.log('✅ 基本的な科目データの作成が完了しました');

  } catch (error) {
    console.error('❌ 科目データの作成に失敗しました:', error);
  }
}

// スクリプト実行
createAdminUser(); 