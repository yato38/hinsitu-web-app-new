import { useState, useEffect } from 'react';

interface User {
  id: string;
  userId: string;
  name: string;
  role: string;
  roles: string[];
  createdAt: string;
}

interface UserRole {
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

export function useAdminData() {
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, UserRole[]>>({});
  const [permissions, setPermissions] = useState<AccessPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    fetchUsers();
    fetchPermissions();
  }, []);

  return {
    users,
    userRoles,
    permissions,
    isLoading,
    updateUserRoles,
    updatePermission,
    refetch: () => {
      setIsLoading(true);
      fetchUsers();
      fetchPermissions();
    }
  };
} 