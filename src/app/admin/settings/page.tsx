'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    systemName: '品質管理システム',
    maintenanceMode: false,
    allowRegistration: true,
    maxFileSize: 10,
    sessionTimeout: 30
  });

  // 認証チェック
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !(session.user.roles || []).includes('ADMIN')) {
      router.push('/login');
      return;
    }

    // 設定を読み込む
    loadSettings();
  }, [session, status, router]);

  const loadSettings = async () => {
    // 実際の実装ではAPIから設定を取得
    console.log('Loading settings...');
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // 実際の実装ではAPIに設定を保存
      console.log('Saving settings:', settings);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模擬的な遅延
      alert('設定を保存しました。');
    } catch (error) {
      console.error('設定保存エラー:', error);
      alert('設定の保存に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">システム設定</h1>
        <p className="mt-2 text-gray-600">
          システム全体の設定を管理します。
        </p>
      </div>

      {/* 設定フォーム */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">基本設定</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* システム名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              システム名
            </label>
            <input
              type="text"
              value={settings.systemName}
              onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* メンテナンスモード */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                メンテナンスモード
              </span>
            </label>
            <p className="mt-1 text-sm text-gray-500">
              メンテナンスモードが有効な場合、一般ユーザーはシステムにアクセスできません。
            </p>
          </div>

          {/* ユーザー登録許可 */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                ユーザー登録を許可
              </span>
            </label>
            <p className="mt-1 text-sm text-gray-500">
              新しいユーザーの登録を許可します。
            </p>
          </div>

          {/* 最大ファイルサイズ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最大ファイルサイズ (MB)
            </label>
            <input
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) || 0 })}
              min="1"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* セッションタイムアウト */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              セッションタイムアウト (分)
            </label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 0 })}
              min="5"
              max="480"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 保存ボタン */}
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={saveSettings}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '保存中...' : '設定を保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 