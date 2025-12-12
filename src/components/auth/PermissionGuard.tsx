'use client'

import { checkPagePermission, createPermissionCheck } from '@/lib/permissions'
import { adminService } from '@/lib/services/admin'
import type { Permission } from '@/types'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PermissionGuardProps {
  children: React.ReactNode
  requiredPermissions?: Permission[]
  fallback?: React.ReactNode
}

export default function PermissionGuard({
  children,
  requiredPermissions = [],
  fallback = <div>접근 권한이 없습니다.</div>
}: PermissionGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkPermissions()
  }, [pathname])

  const checkPermissions = async () => {
    try {
      setIsLoading(true)

      // 현재 관리자 정보 가져오기
      const currentAdmin = adminService.getCurrentAdmin()
      if (!currentAdmin) {
        router.push('/admin/login')
        return
      }

      // 권한 체크 객체 생성
      const permissionCheck = createPermissionCheck(
        currentAdmin.role as any,
        currentAdmin.storeIds
      )

      // 페이지 권한 체크
      const hasPagePermission = checkPagePermission(pathname, permissionCheck)

      // 추가 권한 체크
      const hasRequiredPermissions = requiredPermissions.length === 0 ||
        permissionCheck.hasAllPermissions(requiredPermissions)

      setHasPermission(hasPagePermission && hasRequiredPermissions)

      if (!hasPagePermission || !hasRequiredPermissions) {
        console.warn(`권한 없음: ${pathname}`, {
          requiredPermissions,
          userRole: currentAdmin.role,
          userPermissions: permissionCheck
        })
      }
    } catch (error) {
      console.error('Permission check error:', error)
      setHasPermission(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">권한 확인 중...</div>
      </div>
    )
  }

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
