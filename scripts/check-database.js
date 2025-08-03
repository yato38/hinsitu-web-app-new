const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 データベースの状態を確認中...\n');

    // 1. 接続テスト
    console.log('1. データベース接続テスト...');
    await prisma.$connect();
    console.log('✅ データベースに接続できました\n');

    // 2. Userテーブルの確認
    console.log('2. Userテーブルの確認...');
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Userテーブルが存在します（${userCount}件のレコード）`);
      
      if (userCount > 0) {
        const sampleUser = await prisma.user.findFirst();
        console.log(`   サンプルユーザー: ${sampleUser.userId} (${sampleUser.name})`);
      }
    } catch (error) {
      console.log('❌ Userテーブルが存在しません');
      console.log(`   エラー: ${error.message}`);
    }
    console.log('');

    // 3. Subjectテーブルの確認
    console.log('3. Subjectテーブルの確認...');
    try {
      const subjectCount = await prisma.subject.count();
      console.log(`✅ Subjectテーブルが存在します（${subjectCount}件のレコード）`);
    } catch (error) {
      console.log('❌ Subjectテーブルが存在しません');
      console.log(`   エラー: ${error.message}`);
    }
    console.log('');

    // 4. TaskDefinitionテーブルの確認
    console.log('4. TaskDefinitionテーブルの確認...');
    try {
      const taskCount = await prisma.taskDefinition.count();
      console.log(`✅ TaskDefinitionテーブルが存在します（${taskCount}件のレコード）`);
    } catch (error) {
      console.log('❌ TaskDefinitionテーブルが存在しません');
      console.log(`   エラー: ${error.message}`);
    }
    console.log('');

    // 5. WorkProgressテーブルの確認
    console.log('5. WorkProgressテーブルの確認...');
    try {
      const progressCount = await prisma.workProgress.count();
      console.log(`✅ WorkProgressテーブルが存在します（${progressCount}件のレコード）`);
    } catch (error) {
      console.log('❌ WorkProgressテーブルが存在しません');
      console.log(`   エラー: ${error.message}`);
    }
    console.log('');

    // 6. ユーザー作成テスト
    console.log('6. ユーザー作成テスト...');
    try {
      const testUser = await prisma.user.create({
        data: {
          userId: 'test_user_' + Date.now(),
          name: 'テストユーザー',
          password: 'hashed_password',
          role: 'USER'
        }
      });
      console.log(`✅ ユーザー作成テスト成功: ${testUser.userId}`);
      
      // テストユーザーを削除
      await prisma.user.delete({
        where: { id: testUser.id }
      });
      console.log('   テストユーザーを削除しました');
    } catch (error) {
      console.log('❌ ユーザー作成テスト失敗');
      console.log(`   エラー: ${error.message}`);
    }
    console.log('');

  } catch (error) {
    console.error('❌ データベース確認中にエラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
checkDatabase(); 