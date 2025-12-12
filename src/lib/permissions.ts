import type { AdminRole, Permission, PermissionCheck, RolePermissions } from '@/types'

// 역할별 권한 정의
export const ROLE_PERMISSIONS: Record<AdminRole, RolePermissions> = {
  super_admin: {
    role: 'super_admin',
    permissions: [
      'dashboard:view',
      'users:view',
      'users:edit',
      'users:delete',
      'roles:view',
      'roles:edit',
      'missions:view',
      'missions:create',
      'missions:edit',
      'missions:delete',
      'missions:approve',
      'submissions:view',
      'submissions:approve',
      'submissions:reject',
      'paybacks:view',
      'paybacks:approve',
      'paybacks:reject',
      'marketing:view',
      'marketing:edit',
      'files:view',
      'files:manage',
      'settings:view',
      'settings:edit'
    ] as unknown as Permission[],
    scope: 'all'
  },
  branch_manager: {
    role: 'branch_manager',
    permissions: [
      'dashboard:view',
      'users:view',
      'missions:view',
      'missions:approve',
      'submissions:view',
      'submissions:approve',
      'submissions:reject',
      'paybacks:view',
      'paybacks:approve',
      'paybacks:reject',
      'marketing:view'
    ] as unknown as Permission[],
    scope: 'assigned_stores'
  },
  store_manager: {
    role: 'store_manager',
    permissions: [
      'dashboard:view',
      'users:view',
      'missions:view',
      'missions:approve',
      'submissions:view',
      'submissions:approve',
      'submissions:reject',
      'paybacks:view',
      'paybacks:approve',
      'paybacks:reject',
      'marketing:view'
    ] as unknown as Permission[],
    scope: 'assigned_stores'
  }
}

// 페이지별 필요한 권한 정의
export const PAGE_PERMISSIONS: Record<string, Permission[]> = {
  '/admin/dashboard': ['dashboard:view'] as unknown as Permission[],
  '/admin/users': ['users:view'] as unknown as Permission[],
  '/admin/roles': ['roles:view'] as unknown as Permission[],
  '/admin/missions': ['missions:view'] as unknown as Permission[],
  '/admin/missions/analytics': ['missions:view'] as unknown as Permission[],
  '/admin/missions/user-progress': ['missions:view', 'users:view'] as unknown as Permission[],
  '/admin/missions/definitions': ['missions:view', 'missions:create'] as unknown as Permission[],
  '/admin/missions/submissions': ['submissions:view'] as unknown as Permission[],
  '/admin/paybacks': ['paybacks:view'] as unknown as Permission[],
  '/admin/marketing': ['marketing:view'] as unknown as Permission[],
  '/admin/files': ['files:view'] as unknown as Permission[],
  '/admin/settings': ['settings:view'] as unknown as Permission[]
}

// 권한 체크 유틸리티 함수
export function createPermissionCheck(
  role: AdminRole | string | undefined,
  assignedStoreIds: number[] = []
): PermissionCheck {
  // role이 유효하지 않은 경우 기본값 사용
  const validRole = (role && ROLE_PERMISSIONS[role as AdminRole]) ? role as AdminRole : 'store_manager'
  const rolePermissions = ROLE_PERMISSIONS[validRole]

  console.log('Permission check created:', { role, validRole, rolePermissions })

  return {
    hasPermission: (permission: Permission): boolean => {
      return rolePermissions.permissions.includes(permission)
    },

    hasAnyPermission: (permissions: Permission[]): boolean => {
      return permissions.some(permission => rolePermissions.permissions.includes(permission))
    },

    hasAllPermissions: (permissions: Permission[]): boolean => {
      return permissions.every(permission => rolePermissions.permissions.includes(permission))
    },

    canAccessStore: (storeId: number): boolean => {
      if (rolePermissions.scope === 'all') return true
      if (rolePermissions.scope === 'assigned_stores') {
        return assignedStoreIds.includes(storeId)
      }
      return false
    },

    getAccessibleStores: (): number[] => {
      if (rolePermissions.scope === 'all') return [] // 모든 지점 접근 가능
      return assignedStoreIds
    }
  }
}

// 현재 페이지에 대한 권한 체크
export function checkPagePermission(pathname: string, permissionCheck: PermissionCheck): boolean {
  const requiredPermissions = PAGE_PERMISSIONS[pathname]
  if (!requiredPermissions) return true // 권한이 정의되지 않은 페이지는 접근 가능

  return permissionCheck.hasAllPermissions(requiredPermissions)
}

// 사이드바 메뉴 권한 체크
export function getAccessibleMenuItems(permissionCheck: PermissionCheck) {
  return [
    {
      title: '대시보드',
      href: '/admin/dashboard',
      icon: 'dashboard',
      accessible: permissionCheck.hasPermission('dashboard:view' as unknown as Permission)
    },
    {
      title: '사용자 관리',
      href: '/admin/users',
      icon: 'users',
      accessible: permissionCheck.hasPermission('users:view' as unknown as Permission)
    },
    {
      title: '권한 관리',
      href: '/admin/roles',
      icon: 'roles',
      accessible: permissionCheck.hasPermission('roles:view' as unknown as Permission)
    },
    {
      title: '미션 관리',
      icon: 'missions',
      accessible: permissionCheck.hasPermission('missions:view' as unknown as Permission),
      children: [
        {
          title: '재능충 미션',
          href: '/admin/missions/challenge',
          icon: 'missions-type',
          accessible: permissionCheck.hasPermission('submissions:view' as unknown as Permission)
        },
        {
          title: 'SNS 미션',
          href: '/admin/missions/sns',
          icon: 'missions-type',
          accessible: permissionCheck.hasPermission('submissions:view' as unknown as Permission)
        },
        {
          title: '후기 미션',
          href: '/admin/missions/review',
          icon: 'missions-type',
          accessible: permissionCheck.hasPermission('submissions:view' as unknown as Permission)
        },
        {
          title: '출석 미션',
          href: '/admin/missions/attendance',
          icon: 'missions-type',
          accessible: permissionCheck.hasPermission('submissions:view' as unknown as Permission)
        },
        {
          title: '추천 미션',
          href: '/admin/missions/referral',
          icon: 'missions-type',
          accessible: permissionCheck.hasPermission('submissions:view' as unknown as Permission)
        },
        {
          title: '미션 분석',
          href: '/admin/missions/analytics',
          accessible: permissionCheck.hasPermission('missions:view' as unknown as Permission)
        },
        {
          title: '사용자 진행현황',
          href: '/admin/missions/user-progress',
          accessible: permissionCheck.hasAllPermissions(['missions:view', 'users:view'] as unknown as Permission[])
        },
      ]
    },
    {
      title: '제출물 관리',
      href: '/admin/missions/submissions',
      icon: 'submissions',
      accessible: permissionCheck.hasPermission('submissions:view' as unknown as Permission)
    },
    {
      title: '페이백 관리',
      href: '/admin/paybacks',
      icon: 'paybacks',
      accessible: permissionCheck.hasPermission('paybacks:view' as unknown as Permission)
    },
    {
      title: '마케팅 관리',
      href: '/admin/marketing',
      icon: 'marketing',
      accessible: permissionCheck.hasPermission('marketing:view' as unknown as Permission)
    },
    {
      title: '파일 관리',
      href: '/admin/files',
      icon: 'files',
      accessible: permissionCheck.hasPermission('files:view' as unknown as Permission)
    },
    {
      title: '설정',
      href: '/admin/settings',
      icon: 'settings',
      accessible: permissionCheck.hasPermission('settings:view' as unknown as Permission)
    }
  ]
}
