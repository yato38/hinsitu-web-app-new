'use client';

interface AdminDashboardProps {
  totalUsers: number;
  adminCount: number;
  permissionCount: number;
}

export default function AdminDashboard({ totalUsers, adminCount, permissionCount }: AdminDashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="text-2xl mr-3">👥</div>
          <div>
            <div className="text-sm text-gray-600">総ユーザー数</div>
            <div className="text-2xl font-semibold text-blue-600">{totalUsers}</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="text-2xl mr-3">🔐</div>
          <div>
            <div className="text-sm text-gray-600">管理者数</div>
            <div className="text-2xl font-semibold text-green-600">{adminCount}</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="text-2xl mr-3">📋</div>
          <div>
            <div className="text-sm text-gray-600">権限設定数</div>
            <div className="text-2xl font-semibold text-purple-600">{permissionCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 