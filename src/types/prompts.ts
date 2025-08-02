// システムプロンプトの型定義
export interface SystemPrompt {
  id: string;
  subjectId: string;
  name: string;
  content: string;
  applicableTasks: string[]; // 適用可能なタスクIDの配列
  priority: number; // 優先度（1-3）
  isActive: boolean; // アクティブ状態
  maxCount: number; // 最大数（3）
  createdAt: string;
  updatedAt: string;
}

// タスクプロンプトの型定義
export interface TaskPrompt {
  id: string;
  subjectId: string;
  taskId: string;
  fileType: 'problem' | 'answer' | 'explanation' | 'scoring';
  name: string;
  content: string;
  category: string;
  isActive: boolean; // アクティブ状態
  createdAt: string;
  updatedAt: string;
}

// プロンプトアップロードの型定義
export interface PromptUpload {
  id: string;
  subjectId: string;
  taskId: string;
  fileType: 'problem' | 'answer' | 'explanation' | 'scoring';
  fileName: string;
  fileContent: string;
  description?: string; // 説明
  version?: string; // バージョン
  referenceData?: string; // 参照データ（試験ファイルのどの部分を参照するか）
  isActive: boolean; // アクティブ状態
  uploadedAt: string;
  user?: {
    name: string;
  };
}

// 科目別システムプロンプト設定
export interface SubjectSystemPromptConfig {
  subjectId: string;
  maxSystemPrompts: number; // 最大システムプロンプト数（3）
  currentCount: number; // 現在のシステムプロンプト数
  allowMultipleActive: boolean; // 複数アクティブを許可するか
} 