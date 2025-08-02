'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface DevelopmentLayoutProps {
  children: React.ReactNode;
}

export default function DevelopmentLayout({ children }: DevelopmentLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 認証チェック
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    // 開発者または管理者のみアクセス可能
    if (!session.user.roles || (!session.user.roles.includes('DEVELOPER') && !session.user.roles.includes('ADMIN') && !session.user.roles.includes('SUPER_ADMIN'))) {
      router.push('/');
      return;
    }
  }, [session, status, router]);

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

  if (!session) {
    return null; // リダイレクト中
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">開発画面</h1>
              <p className="text-green-100 mt-1">品質管理システム - 開発者ツール</p>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
} 