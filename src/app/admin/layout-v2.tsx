'use client'

import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { adminService } from '@/lib/services/admin'
import type { Admin } from '@/types'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // 로그인 페이지가 아닌 경우에만 인증 확인
      if (pathname !== '/admin/login') {
        const currentAdmin = adminService.getCurrentAdmin()
        if (!currentAdmin) {
          router.push('/admin/login')
          return
        }
        setAdmin(currentAdmin)
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/admin/login')
    }
  }

  const handleLogout = async () => {
    try {
      if (!confirm('정말 로그아웃하시겠습니까?')) {
        return
      }

      await adminService.logout()
      setAdmin(null)
      router.push('/admin/login')
      toast.success('로그아웃되었습니다.')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('로그아웃 중 오류가 발생했습니다.')
    }
  }

  // 서버 사이드 렌더링 중에는 로딩 상태 표시
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <div className="text-lg text-gray-600">로딩 중...</div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <div className="text-lg text-gray-600">로딩 중...</div>
        </div>
      </div>
    )
  }

  // 로그인 페이지는 레이아웃 적용하지 않음
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        adminName={admin?.name || '관리자'}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          adminName={admin?.name || '관리자'}
          notificationCount={17}
        />

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
