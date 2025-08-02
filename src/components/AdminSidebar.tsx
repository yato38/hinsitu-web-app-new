'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { ROLE_LABELS, type UserRole } from '@/types/permissions';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// 管理者用ナビゲーション項目
const ADMIN_NAVIGATION_ITEMS = [
  {
    name: 'ダッシュボード',
    href: '/admin',
    icon: '📊',
    description: '管理者ダッシュボード'
  },
  {
    name: 'ユーザー管理',
    href: '/admin/users',
    icon: '👥',
    description: 'ユーザーの管理・権限設定'
  },
  {
    name: '権限管理',
    href: '/admin/permissions',
    icon: '🔐',
    description: 'アクセス権限の管理'
  },
  {
    name: 'システム設定',
    href: '/admin/settings',
    icon: '⚙️',
    description: 'システム全体の設定'
  },
  {
    name: 'ログ管理',
    href: '/admin/logs',
    icon: '📝',
    description: 'システムログの確認'
  },
  {
    name: '作業画面',
    href: '/',
    icon: '🏠',
    description: '通常の作業画面へ戻る'
  },
  {
    name: '開発画面',
    href: '/development',
    icon: '🔧',
    description: '開発者ツール'
  }
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ユーザーの役割を取得（複数役割対応）
  const userRoles = session?.user?.roles || [];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* オーバーレイ */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* サイドバー */}
      <div className={`
        fixed top-0 left-0 h-screen bg-white shadow-lg z-50 transition-all duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-16' : 'w-80'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          {!isCollapsed && (
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">管理者パネル</h1>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            {isCollapsed ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>

        {/* ナビゲーション - スクロール可能 */}
        <nav className="flex-1 overflow-y-auto">
          <div className="px-3 py-4 space-y-2">
            {ADMIN_NAVIGATION_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`
                  group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                  ${isActive(item.href)
                    ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                  }
                `}
              >
                <span className="text-2xl mr-4 flex-shrink-0">{item.icon}</span>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base truncate">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-1 leading-tight">{item.description}</div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* ユーザー情報 */}
        {session && !isCollapsed && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {session.user.name?.charAt(0)}
                </div>
                <div className="ml-4">
                  <div className="text-sm font-semibold text-gray-900">{session.user.name}</div>
                  <div className="text-xs text-gray-500">ID: {session.user.userId}</div>
                  {/* パスワードを表示 */}
                  {session.user.password && (
                    <div className="text-xs text-gray-500">PW: {session.user.password}</div>
                  )}
                  {/* ユーザーの役割を表示 */}
                  {userRoles.length > 0 && (
                    <div className="text-xs text-gray-400 mt-1">
                      役割: {userRoles.map(role => ROLE_LABELS[role as UserRole] || role).join(', ')}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                title="ログアウト"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* 折りたたみ時のユーザー情報 */}
        {session && isCollapsed && (
          <div className="p-2 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {session.user.name?.charAt(0)}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                title="ログアウト"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 