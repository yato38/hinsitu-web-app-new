'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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

interface AccessPermission {
  id: string;
  userId: string;
  subjectId: string;
  canAccess: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, UserRoleData[]>>({});
  const [permissions, setPermissions] = useState<AccessPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 認証チェック
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !(session.user.roles || []).some(role => role === 'ADMIN' || role === 'SUPER_ADMIN')) {
      router.push('/login');
      return;
    }

    fetchUsers();
    fetchPermissions();
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

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/admin/permissions');
      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions);
      }
    } catch (error) {
      console.error('権限取得エラー:', error);
    } finally {
      setIsLoading(false);
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

  const updatePermission = async (permissionId: string, updates: Partial<AccessPermission>) => {
    try {
      const response = await fetch(`/api/admin/permissions/${permissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        fetchPermissions();
      }
    } catch (error) {
      console.error('権限更新エラー:', error);
    }
  };

  const handleRoleToggle = (userId: string, role: string, currentRoles: string[]) => {
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    
    updateUserRoles(userId, newRoles);
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
    <div className="w-full h-screen bg-gray-50 p-6">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">管理者パネル</h1>
        <p className="text-gray-600 mt-2">ユーザー管理と権限設定</p>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">総ユーザー数</h3>
          <p className="text-3xl font-bold text-blue-600">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">管理者数</h3>
          <p className="text-3xl font-bold text-green-600">
            {users.filter(u => userRoles[u.id]?.some(ur => ur.role === 'ADMIN')).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">権限設定数</h3>
          <p className="text-3xl font-bold text-purple-600">{permissions.length}</p>
        </div>
      </div>

      {/* ユーザー一覧 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">ユーザー一覧</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ユーザーID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名前
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  役割
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作成日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const userRoleList = userRoles[user.id] || [];
                const currentRoles = userRoleList.map(ur => ur.role);
                
                return (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1">
                        {currentRoles.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRoleToggle(user.id, 'ADMIN', currentRoles)}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            currentRoles.includes('ADMIN')
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {currentRoles.includes('ADMIN') ? '管理者解除' : '管理者設定'}
                        </button>
                        <button
                          onClick={() => handleRoleToggle(user.id, 'USER', currentRoles)}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            currentRoles.includes('USER')
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          }`}
                        >
                          {currentRoles.includes('USER') ? 'ユーザー解除' : 'ユーザー設定'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 