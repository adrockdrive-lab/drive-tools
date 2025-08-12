'use client'

import { checkPermission } from '@/lib/services/auth'
import { useEffect, useState } from 'react'

interface PermissionGuardProps {
  children: React.ReactNode
  permission: string
  resourceId?: string
  resourceType?: 'branch' | 'store'
  fallback?: React.ReactNode
}

export default function PermissionGuard({
  children,
  permission,
  resourceId,
  resourceType,
  fallback = <div>권한이 없습니다.</div>
}: PermissionGuardProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  useEffect(() => {
    const checkUserPermission = async () => {
      const result = await checkPermission(permission, resourceId, resourceType)
      setHasPermission(result)
    }

    checkUserPermission()
  }, [permission, resourceId, resourceType])

  if (hasPermission === null) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
