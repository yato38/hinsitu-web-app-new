const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSamplePrompts() {
  try {
    console.log('サンプルプロンプトを作成中...');

    // サンプルシステムプロンプトを作成
    const systemPrompt = await prisma.systemPrompt.create({
      data: {
        subjectId: 'english',
        name: '英語品質チェック基本プロンプト',
        content: 'あなたは英語の品質管理専門家です。以下の指示に従って品質チェックを行ってください。\n\n1. 内容の正確性を確認\n2. 表現の適切性をチェック\n3. 文法・スペルの確認\n4. 一貫性の確認',
        applicableTasks: JSON.stringify(['1', '2', '3', '4', '5']),
        priority: 1,
        isActive: true,
        maxCount: 3,
        createdBy: 'admin', // 実際のユーザーIDに変更してください
      },
    });

    console.log('システムプロンプトを作成しました:', systemPrompt.id);

    // サンプルプロンプトアップロードを作成
    const promptUpload = await prisma.promptUpload.create({
      data: {
        subjectId: 'english',
        taskId: '1',
        fileType: 'problem',
        fileName: '1_problem.txt',
        fileContent: '問題用紙の品質チェックプロンプト\n\n以下の点を確認してください：\n1. 問題文の正確性\n2. 選択肢の妥当性\n3. 配点の適切性',
        description: '問題用紙用の品質チェックプロンプト',
        version: '1.0',
        isActive: true,
        uploadedBy: 'admin', // 実際のユーザーIDに変更してください
      },
    });

    console.log('プロンプトアップロードを作成しました:', promptUpload.id);

    console.log('サンプルデータの作成が完了しました！');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSamplePrompts(); 