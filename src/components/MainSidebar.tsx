'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

interface MainSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MainSidebar({ isOpen, onClose }: MainSidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ユーザーの権限を取得
  const userRoles = session?.user?.roles || [];
  const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN');
  const isDeveloper = userRoles.includes('DEVELOPER') || isAdmin;

  // ナビゲーションアイテムの定義
  const navigationItems = [
    // 作業タブ - 全ユーザーがアクセス可能
    {
      name: '作業',
      href: '/work',
      icon: '📋',
      description: '品質管理作業',
      accessible: true
    },
    // 開発タブ - 開発者のみアクセス可能
    {
      name: '開発',
      href: '/development',
      icon: '🔧',
      description: '開発者専用機能',
      accessible: isDeveloper || isAdmin
    },
    // 管理タブ - 管理者のみアクセス可能
    {
      name: '管理',
      href: '/admin',
      icon: '⚙️',
      description: '管理者専用機能',
      accessible: isAdmin
    }
  ];

  // 管理タブ内のサブメニュー（権限に応じて表示）
  const adminSubItems = [
    {
      name: 'ダッシュボード',
      href: '/admin',
      icon: '📊',
      accessible: isAdmin
    },
    {
      name: 'ユーザー管理',
      href: '/admin/users',
      icon: '👥',
      accessible: isAdmin
    },
    {
      name: '権限管理',
      href: '/admin/permissions',
      icon: '🔐',
      accessible: isAdmin
    },
    {
      name: 'システム設定',
      href: '/admin/settings',
      icon: '⚙️',
      accessible: isAdmin
    }
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname.startsWith('/admin');
    }
    return pathname.startsWith(href);
  };

  const isActiveSubItem = (href: string) => {
    return pathname === href;
  };

  return (
    <>
      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* サイドバー */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-16' : 'w-80'}`}
      >
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="bg-blue-600 text-white p-4">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div>
                  <h1 className="text-lg font-bold">品質管理システム</h1>
                  <p className="text-blue-100 text-xs mt-1">大学入試模試の品質管理</p>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-1.5 rounded-md text-blue-100 hover:text-white hover:bg-blue-700 transition-colors"
                  title={isCollapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"}
                >
                  {isCollapsed ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="lg:hidden p-1.5 rounded-md text-blue-100 hover:text-white hover:bg-blue-700 transition-colors"
                  title="メニューを閉じる"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* ユーザー情報 */}
            {session && !isCollapsed && (
              <div className="mt-3 p-3 bg-blue-700 rounded-lg">
                <div className="text-xs text-blue-100">作業者情報</div>
                <div className="font-semibold text-sm">{session.user.name}</div>
                <div className="text-xs text-blue-200">ID: {session.user.userId}</div>
                <div className="text-xs text-blue-200 mt-1">
                  権限: {userRoles.join(', ') || '一般ユーザー'}
                </div>
              </div>
            )}

            {/* 折りたたみ時のユーザー情報 */}
            {session && isCollapsed && (
              <div className="mt-3 flex flex-col items-center">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {session.user.name?.charAt(0)}
                </div>
              </div>
            )}
          </div>

          {/* ログアウトボタン */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className={`w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors ${
                isCollapsed ? 'px-2' : 'px-3'
              }`}
              title={isCollapsed ? "ログアウト" : undefined}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!isCollapsed && <span className="ml-2">ログアウト</span>}
            </button>
          </div>

          {/* ナビゲーション */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              if (!item.accessible) return null;

              const active = isActive(item.href);
              const hasSubItems = item.href === '/admin' && isAdmin;

              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      active
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    onClick={onClose}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <span className="text-lg mr-3 flex-shrink-0">{item.icon}</span>
                    {!isCollapsed && (
                      <div className="flex-1">
                        <div className="text-sm">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    )}
                  </Link>

                  {/* 管理タブのサブメニュー */}
                  {hasSubItems && active && !isCollapsed && (
                    <div className="ml-6 mt-1 space-y-1">
                      {adminSubItems.map((subItem) => {
                        if (!subItem.accessible) return null;

                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                              isActiveSubItem(subItem.href)
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                            onClick={onClose}
                          >
                            <span className="text-sm mr-2">{subItem.icon}</span>
                            {subItem.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
} 