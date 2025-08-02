'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useDevelopmentAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  return {
    isAuthorized: !!session && (session.user.roles?.includes('DEVELOPER') || session.user.roles?.includes('ADMIN') || session.user.roles?.includes('SUPER_ADMIN')),
    isLoading: status === 'loading',
    user: session?.user
  };
} 