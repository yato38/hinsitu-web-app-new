// 全タスクID（1-19）
export const allTaskIds = Array.from({ length: 19 }, (_, i) => (i + 1).toString());

// タスクIDに対応する備考
export const TASK_REMARKS: { [key: string]: string } = {
  '1': '把握系',
  '2': '全訳系',
  '3': '剽窃はないか',
  '4': '引用の誤り',
  '5': '解答解説齟齬',
  '6': '選択肢番号訳',
  '7': 'かっこの使用法',
  '8': '明確な事実誤認',
  '9': '誤字脱字',
  '10': '解答が満点になるか',
  '11': '大学満点',
  '12': '問題採点基準',
  '13': '解説採点基準',
  '14': '問題の注釈',
  '15': '解答欄の大きさ',
  '16': '選択肢過不足',
  '17': '重要語句',
  '18': 'その他',
  '19': '成果物の確認'
} as const;

// タスクIDに対応する備考を取得
export function getTaskRemark(taskId: string): string {
  return TASK_REMARKS[taskId as keyof typeof TASK_REMARKS] || '';
}

// 開発用の科目データ
export const developmentSubjects = [
  { id: 'english', name: '英語', icon: '🇺🇸', description: '英語科目のプロンプト管理' },
  { id: 'japanese', name: '国語', icon: '🇯🇵', description: '国語科目のプロンプト管理' },
  { id: 'math', name: '数学', icon: '📐', description: '数学科目のプロンプト管理' }
] as const;

// 科目別システムプロンプト設定
export const subjectSystemPromptConfigs = [
  {
    subjectId: 'english',
    maxSystemPrompts: 3,
    currentCount: 0,
    allowMultipleActive: true
  },
  {
    subjectId: 'japanese',
    maxSystemPrompts: 3,
    currentCount: 0,
    allowMultipleActive: true
  },
  {
    subjectId: 'math',
    maxSystemPrompts: 3,
    currentCount: 0,
    allowMultipleActive: true
  }
] as const;

// システムプロンプトの最大数に達しているかチェック
export function canAddSystemPrompt(subjectId: string, currentCount: number): boolean {
  const config = subjectSystemPromptConfigs.find(c => c.subjectId === subjectId);
  return config ? currentCount < config.maxSystemPrompts : false;
} 