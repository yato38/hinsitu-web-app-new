'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 認証チェックとリダイレクト
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    // ユーザーの権限に基づいて適切なタブにリダイレクト
    const userRoles = session.user.roles || [];
    
    if (userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN')) {
      // 管理者は管理タブにリダイレクト
      router.push('/admin');
    } else if (userRoles.includes('DEVELOPER')) {
      // 開発者は開発タブにリダイレクト
      router.push('/development');
    } else {
      // 一般ユーザーは作業タブにリダイレクト
      router.push('/work');
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">適切なタブにリダイレクト中...</p>
      </div>
    </div>
  );
} 