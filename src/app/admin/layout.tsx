'use client'

import { Button } from '@/components/ui/button'
import type { Admin } from '@/types'
import {
  BarChart3,
  CreditCard,
  Home,
  LogOut,
  Menu,
  Settings,
  Users,
  X
} from 'lucide-react'
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

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // 실제로는 세션에서 어드민 정보를 가져와야 함
      // 임시로 로그인 페이지가 아닌 경우에만 로드
      if (pathname !== '/admin/login') {
        // 실제 구현에서는 세션 체크
        setIsLoading(false)
      } else {
        setIsLoading(false)
      }
    } catch (error) {
      router.push('/admin/login')
    }
  }

  const handleLogout = () => {
    // 실제로는 세션 클리어
    router.push('/admin/login')
    toast.success('로그아웃되었습니다.')
  }

  const navigation = [
    { name: '대시보드', href: '/admin/dashboard', icon: Home },
    { name: '사용자 관리', href: '/admin/users', icon: Users },
    { name: '미션 관리', href: '/admin/missions', icon: BarChart3 },
    { name: '페이백 관리', href: '/admin/paybacks', icon: CreditCard },
    { name: '설정', href: '/admin/settings', icon: Settings },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">로딩 중...</div>
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
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">A</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">어드민</h1>
                <p className="text-xs text-gray-600">관리자 시스템</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${isActive ? 'bg-blue-600 text-black' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
                  onClick={() => {
                    router.push(item.href)
                    setSidebarOpen(false)
                  }}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto">
          {/* Top bar */}
          <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {admin?.name || '관리자'}님 환영합니다
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
