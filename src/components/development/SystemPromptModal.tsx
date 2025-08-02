'use client';

import { useState } from 'react';
import { SystemPrompt } from '@/types/prompts';

interface SystemPromptModalProps {
  subjectId: string;
  editingPrompt: SystemPrompt | null;
  onSave: (prompt: Omit<SystemPrompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

// 全タスクID（1-19）
const allTaskIds = Array.from({ length: 19 }, (_, i) => (i + 1).toString());

// タスクIDに対応する備考を取得
function getTaskRemark(taskId: string) {
  const remarks: { [key: string]: string } = {
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
  };
  return remarks[taskId] || '';
}

export default function SystemPromptModal({ subjectId, editingPrompt, onSave, onClose }: SystemPromptModalProps) {
  const [name, setName] = useState(editingPrompt?.name || '');
  const [content, setContent] = useState(editingPrompt?.content || '');
  const [priority, setPriority] = useState(editingPrompt?.priority || 1);
  const [selectedTasks, setSelectedTasks] = useState<string[]>(editingPrompt?.applicableTasks || []);
  const [isActive, setIsActive] = useState(editingPrompt?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      subjectId,
      name,
      content,
      applicableTasks: selectedTasks,
      priority,
      isActive,
      maxCount: 3
    });
  };

  const toggleTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {editingPrompt ? 'システムプロンプト編集' : 'システムプロンプト追加'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              プロンプト名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                優先度
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>1 (最高)</option>
                <option value={2}>2 (中)</option>
                <option value={3}>3 (低)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">アクティブ</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              プロンプト内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="システムプロンプトの内容を入力してください..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              適用可能なタスク
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
              {allTaskIds.map(taskId => (
                <label key={taskId} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(taskId)}
                    onChange={() => toggleTask(taskId)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {taskId}: {getTaskRemark(taskId)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingPrompt ? '更新' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 