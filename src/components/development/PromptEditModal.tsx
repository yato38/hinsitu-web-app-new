'use client';

import { useState, useEffect } from 'react';

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

interface PromptEditModalProps {
  prompt: PromptUpload | null;
  onSave: (updatedPrompt: PromptUpload) => void;
  onClose: () => void;
}

export default function PromptEditModal({ prompt, onSave, onClose }: PromptEditModalProps) {
  const [formData, setFormData] = useState({
    fileName: '',
    fileContent: '',
    description: '',
    version: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (prompt) {
      setFormData({
        fileName: prompt.fileName,
        fileContent: prompt.fileContent,
        description: prompt.description || '',
        version: prompt.version,
      });
    }
  }, [prompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/prompts/upload', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: prompt.id,
          fileName: formData.fileName,
          fileContent: formData.fileContent,
          description: formData.description || null,
          version: formData.version,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'プロンプトの更新に失敗しました');
      }

      onSave(data.promptUpload);
    } catch (error) {
      console.error('プロンプト更新エラー:', error);
      setError(error instanceof Error ? error.message : 'プロンプトの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!prompt || !confirm('このプロンプトを削除しますか？この操作は元に戻せません。')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/prompts/upload?id=${prompt.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'プロンプトの削除に失敗しました');
      }

      onClose();
    } catch (error) {
      console.error('プロンプト削除エラー:', error);
      setError(error instanceof Error ? error.message : 'プロンプトの削除に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (!prompt) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              プロンプト編集
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* プロンプト情報 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">タスクID:</span>
                <span className="ml-2 text-gray-900">{prompt.taskId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">ファイルタイプ:</span>
                <span className="ml-2 text-gray-900">
                  {prompt.fileType === 'problem' && '📄 問題用紙'}
                  {prompt.fileType === 'answer' && '✏️ 解答用紙'}
                  {prompt.fileType === 'explanation' && '📖 解答解説'}
                  {prompt.fileType === 'scoring' && '📊 採点基準'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">アップロード者:</span>
                <span className="ml-2 text-gray-900">{prompt.user.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">アップロード日時:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(prompt.uploadedAt).toLocaleString('ja-JP')}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ファイル名 */}
            <div>
              <label htmlFor="fileName" className="block text-sm font-medium text-gray-700 mb-2">
                ファイル名 *
              </label>
              <input
                type="text"
                id="fileName"
                value={formData.fileName}
                onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* バージョン */}
            <div>
              <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-2">
                バージョン *
              </label>
              <input
                type="text"
                id="version"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* 説明 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                説明
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="プロンプトの説明を入力してください"
              />
            </div>

            {/* ファイル内容 */}
            <div>
              <label htmlFor="fileContent" className="block text-sm font-medium text-gray-700 mb-2">
                プロンプト内容 *
              </label>
              <textarea
                id="fileContent"
                value={formData.fileContent}
                onChange={(e) => setFormData({ ...formData, fileContent: e.target.value })}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                required
                placeholder="プロンプトの内容を入力してください"
              />
            </div>

            {/* ボタン */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '削除中...' : '削除'}
              </button>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 