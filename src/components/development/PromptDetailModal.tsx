'use client';

import { useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface PromptUpload {
  id: string;
  subjectId: string;
  taskId: string;
  fileType: 'problem' | 'answer' | 'explanation' | 'scoring';
  fileName: string;
  fileContent: string;
  description?: string;
  version: string;
  isActive: boolean;
  uploadedAt: string;
  user: {
    name: string;
  };
}

interface PromptDetailModalProps {
  taskId: string;
  taskName: string;
  fileType: string;
  promptUploads: PromptUpload[];
  onEdit: (prompt: PromptUpload) => void;
  onDelete: (promptId: string) => void;
  onUpload: (taskId: string, fileType: string, taskName: string) => void;
  onClose: () => void;
}

export default function PromptDetailModal({
  taskId,
  taskName,
  fileType,
  promptUploads,
  onEdit,
  onDelete,
  onUpload,
  onClose
}: PromptDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const fileTypeLabels = {
    problem: '📄 問題用紙',
    answer: '✏️ 解答用紙',
    explanation: '📖 解答解説',
    scoring: '📊 採点基準'
  };

  const currentPrompt = promptUploads.find(p => 
    p.taskId === taskId && p.fileType === fileType
  );

  const handleDelete = async (promptId: string) => {
    if (!confirm('このプロンプトを削除しますか？この操作は元に戻せません。')) {
      return;
    }

    setIsLoading(true);
    try {
      await onDelete(promptId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                プロンプト詳細
              </h2>
              <p className="text-gray-600 mt-1">
                タスクID: {taskId} - {fileTypeLabels[fileType as keyof typeof fileTypeLabels]}
              </p>
              {taskName && (
                <p className="text-gray-600 text-sm">
                  タスク名: {taskName}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {currentPrompt ? (
            // プロンプトが存在する場合
            <div className="space-y-6">
              {/* プロンプト情報 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">ファイル名:</span>
                    <span className="ml-2 text-gray-900">{currentPrompt.fileName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">バージョン:</span>
                    <span className="ml-2 text-gray-900">{currentPrompt.version}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">アップロード者:</span>
                    <span className="ml-2 text-gray-900">{currentPrompt.user.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">アップロード日時:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(currentPrompt.uploadedAt).toLocaleString('ja-JP')}
                    </span>
                  </div>
                </div>
                {currentPrompt.description && (
                  <div className="mt-4">
                    <span className="font-medium text-gray-700">説明:</span>
                    <p className="mt-1 text-gray-900">{currentPrompt.description}</p>
                  </div>
                )}
              </div>

              {/* プロンプト内容 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">プロンプト内容</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-gray-900 overflow-x-auto">
                    {currentPrompt.fileContent}
                  </pre>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleDelete(currentPrompt.id)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  {isLoading ? '削除中...' : '削除'}
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={() => onEdit(currentPrompt)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    編集
                  </button>
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // プロンプトが存在しない場合
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                プロンプトが未設定です
              </h3>
              <p className="text-gray-600 mb-6">
                このタスクの{fileTypeLabels[fileType as keyof typeof fileTypeLabels]}のプロンプトがまだアップロードされていません。
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => onUpload(taskId, fileType, taskName)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  プロンプトをアップロード
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  閉じる
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 