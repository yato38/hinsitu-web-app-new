'use client';

import { SessionProvider } from 'next-auth/react';

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60} // 5分ごとにセッションを更新
      refetchOnWindowFocus={true} // ウィンドウがフォーカスされた時にセッションを更新
    >
      {children}
    </SessionProvider>
  );
} 