'use client';

import { useState } from 'react';
import { ROLE_LABELS, ROLE_DESCRIPTIONS, type UserRole } from '@/types/permissions';

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

interface UserManagementProps {
  users: User[];
  userRoles: Record<string, UserRole[]>;
  onUpdateUserRoles: (userId: string, roles: string[]) => Promise<void>;
  onSelectUser: (userId: string) => void;
}

export default function UserManagement({ users, userRoles, onUpdateUserRoles, onSelectUser }: UserManagementProps) {
  const [editingRoles, setEditingRoles] = useState<string | null>(null);

  const handleRoleToggle = (userId: string, role: string, currentRoles: string[]) => {
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    
    onUpdateUserRoles(userId, newRoles);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">ユーザー一覧</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ユーザーID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                氏名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                役割
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                登録日
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
                    {editingRoles === user.id ? (
                      <div className="space-y-2">
                        {(['DEVELOPER', 'WORKER', 'ADMIN'] as UserRole[]).map((role) => (
                          <label key={role} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={currentRoles.includes(role)}
                              onChange={() => handleRoleToggle(user.id, role, currentRoles)}
                              className="mr-2"
                            />
                            <span className="text-sm">
                              {ROLE_LABELS[role]} - {ROLE_DESCRIPTIONS[role]}
                            </span>
                          </label>
                        ))}
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => setEditingRoles(null)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            キャンセル
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex flex-wrap gap-1">
                          {currentRoles.map((role) => (
                            <span
                              key={role}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {ROLE_LABELS[role as UserRole] || role}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => setEditingRoles(user.id)}
                          className="text-xs text-blue-600 hover:text-blue-900 mt-1"
                        >
                          編集
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => onSelectUser(user.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      権限設定
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 