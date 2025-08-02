'use client';

import { useState } from 'react';
import AIManagement from './AIManagement';
import TaskDevelopment from './TaskDevelopment';

type TabType = 'ai' | 'tasks';

export default function DevelopmentModeSelector() {
  const [activeTab, setActiveTab] = useState<TabType>('tasks');

  const tabs = [
    {
      id: 'ai' as TabType,
      name: 'AI管理',
      icon: '🤖',
      component: AIManagement,
    },
    {
      id: 'tasks' as TabType,
      name: 'タスク開発',
      icon: '📋',
      component: TaskDevelopment,
    },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* アクティブなコンポーネント */}
      <div className="bg-white rounded-lg shadow-md">
        {ActiveComponent && (
          <ActiveComponent 
            onBack={() => {
              // 開発画面から戻る場合は、メインページに戻る
              window.location.href = '/';
            }} 
          />
        )}
      </div>
    </div>
  );
} 