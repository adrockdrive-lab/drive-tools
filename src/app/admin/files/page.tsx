'use client'

import { FileManager } from '@/components/admin/FileManager'
import PermissionGuard from '@/components/auth/PermissionGuard'

export default function FilesPage() {
  return (
    <PermissionGuard requiredPermissions={['files:view' as any]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">파일 관리</h1>
          <p className="text-gray-600 mt-2">
            업로드된 파일들을 관리하고 모니터링하세요.
          </p>
        </div>

        <FileManager />
      </div>
    </PermissionGuard>
  )
}