const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listUsers() {
  try {
    console.log('👥 ユーザー一覧を取得中...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        userId: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (users.length === 0) {
      console.log('❌ ユーザーが見つかりません');
      return;
    }

    console.log(`📊 総ユーザー数: ${users.length}人\n`);
    console.log('┌─────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┐');
    console.log('│ ユーザーID   │ 名前            │ 権限            │ 作成日          │ 更新日          │');
    console.log('├─────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤');

    users.forEach(user => {
      const userId = user.userId.padEnd(11);
      const name = user.name.padEnd(15);
      const role = user.role.padEnd(15);
      const createdAt = user.createdAt.toLocaleDateString('ja-JP').padEnd(15);
      const updatedAt = user.updatedAt.toLocaleDateString('ja-JP').padEnd(15);
      
      console.log(`│ ${userId} │ ${name} │ ${role} │ ${createdAt} │ ${updatedAt} │`);
    });

    console.log('└─────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘');

    // 権限別の統計
    const roleStats = {};
    users.forEach(user => {
      roleStats[user.role] = (roleStats[user.role] || 0) + 1;
    });

    console.log('\n📈 権限別統計:');
    Object.entries(roleStats).forEach(([role, count]) => {
      console.log(`- ${role}: ${count}人`);
    });

  } catch (error) {
    console.error('❌ ユーザー一覧の取得に失敗しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
listUsers(); 