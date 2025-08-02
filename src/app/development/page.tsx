'use client';

import { useEffect, useState } from 'react';
import { useDevelopmentAuth } from '@/hooks/development/useDevelopmentAuth';
import DevelopmentModeSelector from '@/components/development/DevelopmentModeSelector';
import AIManagement from '@/components/development/AIManagement';
import TaskDevelopment from '@/components/development/TaskDevelopment';

// 開発者用ナビゲーション項目
const DEVELOPMENT_NAVIGATION_ITEMS = [
  {
    name: 'タスク開発',
    id: 'tasks',
    icon: '📋',
    description: '科目別タスク定義の作成・編集'
  },
  {
    name: 'AI管理',
    id: 'ai',
    icon: '🤖',
    description: 'AI設定とシステム管理'
  }
];

export default function DevelopmentPage() {
  const { isAuthorized, isLoading } = useDevelopmentAuth();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <p className="text-gray-600">アクセス権限がありません</p>
        </div>
      </div>
    );
  }



  // 特定のモードが選択されている場合
  if (selectedMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <button
              onClick={() => setSelectedMode(null)}
              className="flex items-center text-green-600 hover:text-green-800 mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              開発メニューに戻る
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {DEVELOPMENT_NAVIGATION_ITEMS.find(item => item.id === selectedMode)?.name}
            </h1>
          </div>
          
          {selectedMode === 'ai' && <AIManagement onBack={() => setSelectedMode(null)} />}
          {selectedMode === 'tasks' && <TaskDevelopment onBack={() => setSelectedMode(null)} />}
        </div>
      </div>
    );
  }

  // メインメニュー画面
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">開発者ツール</h1>
          <p className="text-gray-600 mt-2">品質管理システムの開発・管理ツール</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEVELOPMENT_NAVIGATION_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedMode(item.id)}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 