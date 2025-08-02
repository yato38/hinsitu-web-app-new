'use client';

import { useState, useEffect } from 'react';

interface AIConfig {
  id: string;
  name: string;
  model: string;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AIManagementProps {
  onBack: () => void;
}

export default function AIManagement({ onBack }: AIManagementProps) {
  const [aiConfigs, setAiConfigs] = useState<AIConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null);
  
  // フォーム状態
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    apiKey: '',
    isActive: false,
  });

  // AI設定を取得
  const fetchAIConfigs = async () => {
    try {
      const response = await fetch('/api/ai/config');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'AI設定の取得に失敗しました');
      }
      
      setAiConfigs(data.aiConfigs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI設定の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAIConfigs();
  }, []);

  // フォームをリセット
  const resetForm = () => {
    setFormData({
      name: '',
      model: '',
      apiKey: '',
      isActive: false,
    });
    setEditingConfig(null);
  };

  // 設定を保存
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingConfig ? '/api/ai/config' : '/api/ai/config';
      const method = editingConfig ? 'PUT' : 'POST';
      const body = editingConfig 
        ? { ...formData, id: editingConfig.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI設定の保存に失敗しました');
      }

      alert(editingConfig ? 'AI設定が更新されました' : 'AI設定が保存されました');
      setShowAddModal(false);
      resetForm();
      fetchAIConfigs();

    } catch (err) {
      alert(err instanceof Error ? err.message : 'AI設定の保存に失敗しました');
    }
  };

  // 設定を削除
  const handleDelete = async (id: string) => {
    if (!confirm('このAI設定を削除しますか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/ai/config?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI設定の削除に失敗しました');
      }

      alert('AI設定が削除されました');
      fetchAIConfigs();

    } catch (err) {
      alert(err instanceof Error ? err.message : 'AI設定の削除に失敗しました');
    }
  };

  // 編集モードを開始
  const handleEdit = (config: AIConfig) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      model: config.model,
      apiKey: config.apiKey,
      isActive: config.isActive,
    });
    setShowAddModal(true);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🤖</div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            🤖 AI管理
          </h2>
          <p className="text-gray-600">AIモデルとAPIキーの設定</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            新規追加
          </button>
          <button
            onClick={onBack}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            戻る
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* AI設定一覧 */}
      <div className="space-y-4">
        {aiConfigs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">AI設定がありません</p>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              最初の設定を追加
            </button>
          </div>
        ) : (
          aiConfigs.map((config) => (
            <div
              key={config.id}
              className={`border rounded-lg p-4 ${
                config.isActive ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{config.name}</h3>
                    {config.isActive && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        アクティブ
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>モデル:</strong> {config.model}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>作成日:</strong> {new Date(config.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(config)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(config.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 追加・編集モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingConfig ? 'AI設定を編集' : 'AI設定を追加'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  設定名
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: GPT-4設定"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AIモデル
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: gpt-4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  APIキー
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="sk-..."
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  この設定をアクティブにする
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingConfig ? '更新' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 