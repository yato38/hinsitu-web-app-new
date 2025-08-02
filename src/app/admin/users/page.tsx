'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UserManagement from '@/features/admin/components/UserManagement';
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/types/permissions';

interface User {
  id: string;
  userId: string;
  name: string;
  role: string;
  roles: string[];
  createdAt: string;
}

interface UserRoleData {
  id: string;
  userId: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, UserRoleData[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // 認証チェック
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !(session.user.roles || []).includes('ADMIN')) {
      router.push('/login');
      return;
    }

    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        
        // 各ユーザーの役割を取得
        for (const user of data.users) {
          await fetchUserRoles(user.id);
        }
      }
    } catch (error) {
      console.error('ユーザー取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserRoles = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/role?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserRoles(prev => ({
          ...prev,
          [userId]: data.userRoles
        }));
      }
    } catch (error) {
      console.error('ユーザー役割取得エラー:', error);
    }
  };

  const updateUserRoles = async (userId: string, roles: string[]) => {
    try {
      const response = await fetch('/api/admin/users/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, roles }),
      });

      if (response.ok) {
        await fetchUserRoles(userId);
      }
    } catch (error) {
      console.error('役割更新エラー:', error);
    }
  };

  if (status === 'loading' || isLoading) {
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
        <h1 className="text-3xl font-bold text-gray-900">ユーザー管理</h1>
        <p className="mt-2 text-gray-600">
          システム内のユーザーアカウントと権限を管理します。
        </p>
      </div>

      {/* ユーザー一覧 */}
      <UserManagement
        users={users}
        userRoles={userRoles}
        onUpdateUserRoles={updateUserRoles}
        onSelectUser={() => {}}
      />
    </div>
  );
} 