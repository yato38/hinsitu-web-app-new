// 科目別のタスクデータ定義
export interface TaskItem {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
}

export interface FileTasks {
  fileType: 'problem' | 'answer' | 'explanation' | 'scoring';
  fileName: string;
  tasks: TaskItem[];
}

export interface SubjectTasks {
  subjectId: string;
  subjectName: string;
  subjectIcon: string;
  available: boolean;
  files: FileTasks[];
}

// データベースからタスク定義を取得する関数
export async function getTaskDefinitionsFromDB(subjectId: string): Promise<FileTasks[]> {
  try {
    const response = await fetch(`/api/tasks/${subjectId}`);
    if (response.ok) {
      const data = await response.json();
      return data.files.map((file: any) => ({
        fileType: file.fileType,
        fileName: file.fileName,
        tasks: file.tasks.map((task: any) => ({
          id: task.taskId,
          name: task.taskName,
          description: task.description,
          status: 'pending' as const,
          priority: task.priority.toLowerCase() as 'high' | 'medium' | 'low'
        }))
      }));
    }
  } catch (error) {
    console.error('タスク定義の取得に失敗しました:', error);
  }
  return [];
}

// 英語のタスクデータ（CSVファイルに基づく）
export const englishTasks: SubjectTasks = {
  subjectId: 'english',
  subjectName: '英語',
  subjectIcon: '🇺🇸',
  available: true,
  files: [
    {
      fileType: 'problem',
      fileName: '英語_模試_問題用紙',
      tasks: [
        {
          id: '1',
          name: '把握系',
          description: '問題を把握する時間',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '4',
          name: '引用の誤り',
          description: '引用が誤っていないか',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '8',
          name: '明確な事実誤認',
          description: '明確な事実誤認はないか',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '9',
          name: '誤字脱字',
          description: '誤字脱字等の誤植・表現不備・スペルミスはないか',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: '14',
          name: '問題の注釈',
          description: '問題文の注釈に不備はないか',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: '18',
          name: 'その他',
          description: 'その他',
          status: 'pending',
          priority: 'low'
        }
      ]
    },
    {
      fileType: 'answer',
      fileName: '英語_模試_解答用紙',
      tasks: [
        {
          id: '9',
          name: '誤字脱字',
          description: '誤字脱字等の誤植はないか',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: '15',
          name: '解答欄の大きさ',
          description: '【フェーズ(3)のみ】解答欄の大きさが解答に対して適切か',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: '18',
          name: 'その他',
          description: 'その他',
          status: 'pending',
          priority: 'low'
        }
      ]
    },
    {
      fileType: 'explanation',
      fileName: '英語_模試_解答解説',
      tasks: [
        {
          id: '1',
          name: '把握系',
          description: '解答解説を把握する',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '2',
          name: '全訳系',
          description: '「▶全訳」と本文が正しく対応しているか',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '3',
          name: '剽窃はないか',
          description: '剽窃はないか',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '4',
          name: '引用の誤り',
          description: '引用が誤っていないか',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '5',
          name: '解答解説齟齬',
          description: '「▶解答」と「▶解説」に齟齬はないか',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '6',
          name: '選択肢番号訳',
          description: '選択肢の番号・訳が正しいか',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: '7',
          name: 'かっこの使用法',
          description: 'かっこの使用法に不備はないか',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: '8',
          name: '明確な事実誤認',
          description: '明確な事実誤認はないか',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '9',
          name: '誤字脱字',
          description: '誤字脱字等の誤植・表現不備・スペルミスはないか',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: '11',
          name: '大学満点',
          description: '大学満点',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '13',
          name: '解説採点基準',
          description: '【フェーズ(3)(4)のみ】解答解説「▶解説」の内容と採点基準に齟齬はないか',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '16',
          name: '選択肢過不足',
          description: '解答となる選択肢が過不足なく存在するか',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: '17',
          name: '重要語句',
          description: '「▶重要語句・構文」に不備はないか',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: '18',
          name: 'その他',
          description: 'その他',
          status: 'pending',
          priority: 'low'
        }
      ]
    },
    {
      fileType: 'scoring',
      fileName: '英語_模試_採点基準',
      tasks: [
        {
          id: '1',
          name: '把握系',
          description: '引用と事実誤認の対象となる箇所を把握する',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '4',
          name: '引用の誤り',
          description: '引用が誤っていないか',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '7',
          name: 'かっこの使用法',
          description: 'かっこの使用法に不備はないか',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: '8',
          name: '明確な事実誤認',
          description: '明確な事実誤認はないか',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '9',
          name: '誤字脱字',
          description: '誤字脱字等の誤植・表現不備・スペルミスはないか',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: '10',
          name: '解答が満点になるか',
          description: '解答が満点になるか',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '11',
          name: '大学満点',
          description: '大学満点',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '12',
          name: '問題採点基準',
          description: '【フェーズ(3), (4)のみ】問題と採点基準の対応関係にミスはないか',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '13',
          name: '解説採点基準',
          description: '【フェーズ(3)(4)のみ】解答解説「▶解説」の内容と採点基準に齟齬はないか',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '18',
          name: 'その他',
          description: 'その他',
          status: 'pending',
          priority: 'low'
        },
        {
          id: '19',
          name: '成果物の確認',
          description: '成果物の確認',
          status: 'pending',
          priority: 'high'
        }
      ]
    }
  ]
};

// 国語のタスクデータ（開発中）
export const japaneseTasks: SubjectTasks = {
  subjectId: 'japanese',
  subjectName: '国語',
  subjectIcon: '🇯🇵',
  available: false,
  files: []
};

// 数学のタスクデータ（開発中）
export const mathTasks: SubjectTasks = {
  subjectId: 'math',
  subjectName: '数学',
  subjectIcon: '📐',
  available: false,
  files: []
};

// 開発用の科目データ
export const developmentTasks: SubjectTasks = {
  subjectId: 'development',
  subjectName: '開発',
  subjectIcon: '🔧',
  available: true,
  files: [
    {
      fileType: 'problem',
      fileName: '開発_プロンプト管理',
      tasks: [
        {
          id: '1',
          name: 'プロンプト一覧',
          description: 'プロンプトの一覧表示と管理',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '2',
          name: 'プロンプト作成',
          description: '新しいプロンプトの作成',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '3',
          name: 'プロンプト編集',
          description: '既存プロンプトの編集',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: '4',
          name: 'プロンプト削除',
          description: 'プロンプトの削除',
          status: 'pending',
          priority: 'low'
        }
      ]
    },
    {
      fileType: 'answer',
      fileName: '開発_設定管理',
      tasks: [
        {
          id: '5',
          name: 'システム設定',
          description: 'システム全体の設定管理',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '6',
          name: 'ユーザー管理',
          description: 'ユーザーアカウントの管理',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '7',
          name: '権限管理',
          description: 'ユーザー権限の管理',
          status: 'pending',
          priority: 'medium'
        }
      ]
    },
    {
      fileType: 'explanation',
      fileName: '開発_ログ管理',
      tasks: [
        {
          id: '8',
          name: 'アクセスログ',
          description: 'ユーザーアクセスのログ管理',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: '9',
          name: 'エラーログ',
          description: 'システムエラーのログ管理',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '10',
          name: '操作ログ',
          description: 'ユーザー操作のログ管理',
          status: 'pending',
          priority: 'medium'
        }
      ]
    },
    {
      fileType: 'scoring',
      fileName: '開発_データ管理',
      tasks: [
        {
          id: '11',
          name: 'データベース管理',
          description: 'データベースの管理とメンテナンス',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '12',
          name: 'バックアップ管理',
          description: 'データのバックアップ管理',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '13',
          name: 'パフォーマンス監視',
          description: 'システムパフォーマンスの監視',
          status: 'pending',
          priority: 'medium'
        }
      ]
    }
  ]
};

// 全科目のタスクデータ（作業科目のみ）
export const allSubjectTasks: SubjectTasks[] = [
  englishTasks,
  japaneseTasks,
  mathTasks
];

// 開発用の科目データ（別途保持）
export const developmentSubjectTasks: SubjectTasks[] = [
  developmentTasks
];

// 科目IDからタスクデータを取得する関数
export function getSubjectTasks(subjectId: string): SubjectTasks | null {
  return allSubjectTasks.find(subject => subject.subjectId === subjectId) || null;
}

// 科目情報を取得する関数
export function getSubjectInfo(subjectId: string) {
  const subject = allSubjectTasks.find(subject => subject.subjectId === subjectId);
  if (!subject) {
    return { name: '不明', icon: '❓', available: false };
  }
  return {
    name: subject.subjectName,
    icon: subject.subjectIcon,
    available: subject.available
  };
} 