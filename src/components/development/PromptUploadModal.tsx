'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface PromptUploadModalProps {
  subjectId: string;
  taskId: string;
  fileType: 'problem' | 'answer' | 'explanation' | 'scoring';
  taskName: string;
  fileName: string;
  onUpload: (upload: any) => void;
  onClose: () => void;
}

export default function PromptUploadModal({
  subjectId,
  taskId,
  fileType,
  taskName,
  fileName,
  onUpload,
  onClose
}: PromptUploadModalProps) {
  const [fileContent, setFileContent] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('1.0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileContent.trim()) {
      alert('プロンプト内容を入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const upload = {
        subjectId,
        taskId,
        fileType,
        fileName,
        fileContent: fileContent.trim(),
        description: description.trim() || undefined,
        version
      };

      await onUpload(upload);
    } catch (error) {
      console.error('アップロードエラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileTypeLabel = (fileType: string) => {
    switch (fileType) {
      case 'problem': return '問題用紙';
      case 'answer': return '解答用紙';
      case 'explanation': return '解答解説';
      case 'scoring': return '採点基準';
      default: return fileType;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            プロンプトアップロード
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 座標情報表示 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">座標情報</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <span className="font-medium">タスクID:</span> {taskId}
              </div>
              <div>
                <span className="font-medium">ファイルタイプ:</span> {getFileTypeLabel(fileType)}
              </div>
              <div>
                <span className="font-medium">タスク名:</span> {taskName}
              </div>
              <div>
                <span className="font-medium">ファイル名:</span> {fileName}
              </div>
            </div>
          </div>

          {/* プロンプト内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              プロンプト内容 *
            </label>
            <textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`${getFileTypeLabel(fileType)}用のプロンプトを入力してください...

例：
あなたは大学入試模試の品質管理専門家です。
${getFileTypeLabel(fileType)}の品質チェックを行ってください。

チェック項目：
1. 内容の正確性
2. 表現の適切性
3. その他の品質要件

指摘事項がある場合は、具体的な箇所と修正提案を含めて回答してください。`}
              required
            />
          </div>

          {/* 説明 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              説明（オプション）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="このプロンプトの用途や特徴について説明してください"
            />
          </div>

          {/* バージョン */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              バージョン
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1.0"
            />
          </div>

          {/* ボタン */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !fileContent.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'アップロード中...' : 'アップロード'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 