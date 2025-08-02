export type UserRole = 'DEVELOPER' | 'WORKER' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserPermissions {
  id: string;
  userId: string;
  roles: UserRole[];
  canAccessDevelopment: boolean;
  canAccessWork: boolean;
  canAccessAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  description: string;
  requiredRoles: UserRole[];
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    name: '作業画面',
    href: '/',
    icon: '🏠',
    description: '品質管理作業のメイン画面',
    requiredRoles: ['WORKER', 'ADMIN', 'SUPER_ADMIN']
  },
  {
    name: '開発画面',
    href: '/development',
    icon: '⚙️',
    description: 'プロンプト管理と開発ツール',
    requiredRoles: ['DEVELOPER', 'ADMIN', 'SUPER_ADMIN']
  },
  {
    name: '管理画面',
    href: '/admin',
    icon: '👥',
    description: 'ユーザー管理とシステム設定',
    requiredRoles: ['ADMIN', 'SUPER_ADMIN']
  }
];

export const ROLE_LABELS: Record<UserRole, string> = {
  DEVELOPER: '開発者',
  WORKER: '作業者',
  ADMIN: '管理者',
  SUPER_ADMIN: 'システム管理者'
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  DEVELOPER: 'プロンプト管理と開発ツールにアクセス可能',
  WORKER: '品質管理作業にアクセス可能',
  ADMIN: 'すべての機能にアクセス可能（ユーザー管理含む）',
  SUPER_ADMIN: 'すべての機能にアクセス可能（システム管理者権限）'
};

// 権限チェック関数
export function hasRole(userRoles: string[], requiredRoles: UserRole[]): boolean {
  return requiredRoles.some(role => userRoles.includes(role));
}

// ユーザーがアクセス可能なナビゲーション項目を取得
export function getAccessibleNavigationItems(userRoles: string[]): NavigationItem[] {
  return NAVIGATION_ITEMS.filter(item => 
    hasRole(userRoles, item.requiredRoles)
  );
}

// ユーザーの役割に基づいてアクセス権限を計算
export function calculateUserPermissions(userRoles: string[]): {
  canAccessDevelopment: boolean;
  canAccessWork: boolean;
  canAccessAdmin: boolean;
} {
  return {
    canAccessDevelopment: hasRole(userRoles, ['DEVELOPER', 'ADMIN', 'SUPER_ADMIN']),
    canAccessWork: hasRole(userRoles, ['WORKER', 'ADMIN', 'SUPER_ADMIN']),
    canAccessAdmin: hasRole(userRoles, ['ADMIN', 'SUPER_ADMIN'])
  };
} 