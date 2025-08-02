import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 英語箱のCSVデータを基にした初期タスクデータ
const englishTasks = [
  {
    taskId: '1',
    remark: '把握系',
    problem: '問題を把握する時間',
    answer: '',
    explanation: '解答解説を把握する',
    scoring: '引用と事実誤認の対象となる箇所を把握する'
  },
  {
    taskId: '2',
    remark: '全訳系',
    problem: '',
    answer: '',
    explanation: '「▶全訳」と本文が正しく対応しているか',
    scoring: ''
  },
  {
    taskId: '3',
    remark: '剽窃はないか',
    problem: '',
    answer: '',
    explanation: '',
    scoring: ''
  },
  {
    taskId: '4',
    remark: '引用の誤り',
    problem: '引用が誤っていないか',
    answer: '',
    explanation: '引用が誤っていないか',
    scoring: '引用が誤っていないか'
  },
  {
    taskId: '5',
    remark: '解答解説齟齬',
    problem: '',
    answer: '',
    explanation: '「▶解答」と「▶解説」に齟齬はないか',
    scoring: ''
  },
  {
    taskId: '6',
    remark: '選択肢番号訳',
    problem: '',
    answer: '',
    explanation: '選択肢の番号・訳が正しいか',
    scoring: ''
  },
  {
    taskId: '7',
    remark: 'かっこの使用法',
    problem: '',
    answer: '',
    explanation: 'かっこの使用法に不備はないか',
    scoring: 'かっこの使用法に不備はないか'
  },
  {
    taskId: '8',
    remark: '明確な事実誤認',
    problem: '明確な事実誤認はないか',
    answer: '',
    explanation: '明確な事実誤認はないか',
    scoring: ''
  },
  {
    taskId: '9',
    remark: '誤字脱字',
    problem: '誤字脱字等の誤植・表現不備・スペルミスはないか',
    answer: '誤字脱字等の誤植はないか',
    explanation: '誤字脱字等の誤植・表現不備・スペルミスはないか',
    scoring: '誤字脱字等の誤植・表現不備・スペルミスはないか'
  },
  {
    taskId: '10',
    remark: '解答が満点になるか',
    problem: '',
    answer: '',
    explanation: '',
    scoring: '解答が満点になるか'
  },
  {
    taskId: '11',
    remark: '大学満点',
    problem: '',
    answer: '',
    explanation: '',
    scoring: ''
  },
  {
    taskId: '12',
    remark: '問題採点基準',
    problem: '',
    answer: '',
    explanation: '',
    scoring: '【フェーズ(3), (4)のみ】問題と採点基準の対応関係にミスはないか'
  },
  {
    taskId: '13',
    remark: '解説採点基準',
    problem: '',
    answer: '',
    explanation: '',
    scoring: '【フェーズ(3)(4)のみ】解答解説「▶解説」の内容と採点基準に齟齬はないか'
  },
  {
    taskId: '14',
    remark: '問題の注釈',
    problem: '問題文の注釈に不備はないか',
    answer: '',
    explanation: '',
    scoring: ''
  },
  {
    taskId: '15',
    remark: '解答欄の大きさ',
    problem: '',
    answer: '【フェーズ(3)のみ】解答欄の大きさが解答に対して適切か',
    explanation: '',
    scoring: ''
  },
  {
    taskId: '16',
    remark: '選択肢過不足',
    problem: '',
    answer: '',
    explanation: '解答となる選択肢が過不足なく存在するか',
    scoring: ''
  },
  {
    taskId: '17',
    remark: '重要語句',
    problem: '',
    answer: '',
    explanation: '「▶重要語句・構文」に不備はないか',
    scoring: ''
  },
  {
    taskId: '18',
    remark: 'その他',
    problem: 'その他',
    answer: 'その他',
    explanation: 'その他',
    scoring: ''
  },
  {
    taskId: '19',
    remark: '成果物の確認',
    problem: '',
    answer: '',
    explanation: '',
    scoring: '成果物の確認'
  }
];

async function main() {
  console.log('シードデータの作成を開始します...');

  // 英語科目が存在するかチェック（削除されていないもの）
  let englishSubject = await prisma.subject.findFirst({
    where: { 
      subjectId: 'english',
      isDeleted: false
    }
  });

  if (!englishSubject) {
    // 削除済みの英語科目があるかチェック
    const deletedEnglishSubject = await prisma.subject.findFirst({
      where: { 
        subjectId: 'english',
        isDeleted: true
      }
    });

    if (deletedEnglishSubject) {
      // 削除済みの英語科目を復元
      englishSubject = await prisma.subject.update({
        where: { id: deletedEnglishSubject.id },
        data: {
          isDeleted: false,
          deletedAt: null
        }
      });
      console.log('削除済みの英語科目を復元しました');
    } else {
      // 英語科目を新規作成
      englishSubject = await prisma.subject.create({
        data: {
          subjectId: 'english',
          subjectName: '英語',
          examType: 'mock',
          isDeleted: false
        }
      });
      console.log('英語科目を作成しました');
    }
  }

  // 既存のタスク定義を削除
  await prisma.taskDefinition.deleteMany({
    where: { subjectId: 'english' }
  });

  // 新しいタスク定義を作成
  const taskDefinition = await prisma.taskDefinition.create({
    data: {
      subjectId: 'english',
      examType: 'mock',
      files: [
        {
          fileType: 'problem',
          fileName: '英語_模試_問題用紙',
          tasks: englishTasks.map(task => ({
            id: `task_${task.taskId}`,
            taskId: task.taskId,
            remark: task.remark,
            taskName: task.remark, // 後方互換性のため
            description: task.problem
          }))
        },
        {
          fileType: 'answer',
          fileName: '英語_模試_解答用紙',
          tasks: englishTasks.map(task => ({
            id: `task_${task.taskId}`,
            taskId: task.taskId,
            remark: task.remark,
            taskName: task.remark, // 後方互換性のため
            description: task.answer
          }))
        },
        {
          fileType: 'explanation',
          fileName: '英語_模試_解答解説',
          tasks: englishTasks.map(task => ({
            id: `task_${task.taskId}`,
            taskId: task.taskId,
            remark: task.remark,
            taskName: task.remark, // 後方互換性のため
            description: task.explanation
          }))
        },
        {
          fileType: 'scoring',
          fileName: '英語_模試_採点基準',
          tasks: englishTasks.map(task => ({
            id: `task_${task.taskId}`,
            taskId: task.taskId,
            remark: task.remark,
            taskName: task.remark, // 後方互換性のため
            description: task.scoring
          }))
        }
      ]
    }
  });

  console.log('英語箱のタスク定義を作成しました');
  console.log('シードデータの作成が完了しました');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 