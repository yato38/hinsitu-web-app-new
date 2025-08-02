'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import MainSidebar from './MainSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // ログインページとレジスターページではサイドバーを表示しない
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // 認証チェック
  useEffect(() => {
    console.log('AppLayout - Session status:', status);
    console.log('AppLayout - Session data:', session);
    console.log('AppLayout - Current pathname:', pathname);
    
    if (status === 'loading') return;
    
    // 認証ページの場合は認証チェックをスキップ
    if (isAuthPage) return;
    
    // リダイレクト中は重複実行を防ぐ
    if (isRedirecting) return;
    
    if (!session) {
      console.log('AppLayout - No session, redirecting to login');
      setIsRedirecting(true);
      router.push('/login');
      return;
    }
    
    console.log('AppLayout - Session found, user:', session.user);
  }, [session, status, router, isAuthPage, pathname, isRedirecting]);

  // 現在のタブとページタイトルを取得
  const getCurrentTabInfo = () => {
    if (pathname.startsWith('/work')) {
      return {
        tab: '作業',
        title: '品質管理作業',
        subtitle: '大学入試模試の品質管理業務'
      };
    }
    if (pathname.startsWith('/development')) {
      return {
        tab: '開発',
        title: '開発者画面',
        subtitle: '品質管理システム - 開発者専用'
      };
    }
    if (pathname.startsWith('/admin')) {
      return {
        tab: '管理',
        title: '管理者画面',
        subtitle: '品質管理システム - 管理者専用'
      };
    }
    // デフォルト（ルートページなど）
    return {
      tab: 'ホーム',
      title: '品質管理システム',
      subtitle: '大学入試模試の品質管理業務'
    };
  };

  const { tab, title, subtitle } = getCurrentTabInfo();

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

  // 認証ページの場合はサイドバーなしでコンテンツのみ表示
  if (isAuthPage) {
    return <>{children}</>;
  }

  // 未認証でリダイレクト中の場合は何も表示しない
  if (!session || isRedirecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">認証確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* メインサイドバー */}
      <MainSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col">
        {/* ヘッダー */}
        <div className="bg-blue-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden mr-4 p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700 transition-colors"
                title="メニューを開く"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-sm bg-blue-500 px-2 py-1 rounded mr-3">{tab}</span>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">{title}</h1>
                    <p className="text-blue-100 mt-1 text-sm lg:text-base">{subtitle}</p>
                  </div>
                </div>
              </div>
              {/* ユーザー情報 */}
              <div className="text-right hidden sm:block">
                <div className="text-sm text-blue-100">作業者</div>
                <div className="font-semibold text-sm lg:text-base">{session.user.name}</div>
                <div className="text-xs text-blue-200">ID: {session.user.userId}</div>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
} 