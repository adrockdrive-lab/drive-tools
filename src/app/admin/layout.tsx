'use client'

import { Button } from '@/components/ui/button'
import { createPermissionCheck, getAccessibleMenuItems } from '@/lib/permissions'
import { adminService } from '@/lib/services/admin'
import type { Admin } from '@/types'
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Megaphone,
  Menu,
  Settings,
  Shield,
  Target,
  Users,
  X
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type NavigationItem = {
  name: string
  href?: string
  icon: any
  children?: NavigationItem[]
}

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
        console.log('레이아웃에서 가져온 관리자 정보:', currentAdmin)
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
      // 로그아웃 확인
      if (!confirm('정말 로그아웃하시겠습니까?')) {
        return
      }

      await adminService.logout()
      setAdmin(null) // 상태도 초기화
      router.push('/admin/login')
      toast.success('로그아웃되었습니다.')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('로그아웃 중 오류가 발생했습니다.')
    }
  }

  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())

  // 권한 기반 네비게이션 메뉴 생성
  const getNavigation = (): NavigationItem[] => {
    if (!admin) return []

    const permissionCheck = createPermissionCheck(
      admin.role as any,
      admin.storeIds
    )

    const accessibleItems = getAccessibleMenuItems(permissionCheck)

    return accessibleItems
      .filter(item => item.accessible)
      .map(item => ({
        name: item.title,
        href: item.href,
        icon: getIconComponent(item.icon),
        children: item.children
          ?.filter(child => child.accessible)
          .map(child => ({
            name: child.title,
            href: child.href,
            icon: getIconComponent('default')
          }))
      }))
  }

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      dashboard: Home,
      users: Users,
      roles: Shield,
      missions: Target,
      'missions-type': BarChart3,
      submissions: Target,
      paybacks: CreditCard,
      marketing: Megaphone,
      files: FileText,
      settings: Settings,
      default: BarChart3
    }
    return iconMap[iconName] || BarChart3
  }

  const navigation = getNavigation()

  const toggleMenu = (menuName: string) => {
    const newExpandedMenus = new Set(expandedMenus)
    if (newExpandedMenus.has(menuName)) {
      newExpandedMenus.delete(menuName)
    } else {
      newExpandedMenus.add(menuName)
    }
    setExpandedMenus(newExpandedMenus)
  }

  // 서버 사이드 렌더링 중에는 로딩 상태 표시
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">로딩 중...</div>
        </div>
      </div>
    )
  }

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
                <span className="text-white font-bold text-sm">A</span>
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
              if (item.children && item.children.length > 0) {
                // 서브메뉴가 있는 항목
                const isExpanded = expandedMenus.has(item.name)
                const hasActiveChild = item.children.some(child => pathname === child.href)

                return (
                  <div key={item.name}>
                    <Button
                      variant={hasActiveChild ? "default" : "ghost"}
                      className={`w-full justify-start ${hasActiveChild ? 'bg-blue-600 text-white' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
                      onClick={() => toggleMenu(item.name)}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.name}
                      {isExpanded ? (
                        <ChevronDown className="ml-auto h-4 w-4" />
                      ) : (
                        <ChevronRight className="ml-auto h-4 w-4" />
                      )}
                    </Button>

                    {isExpanded && (
                      <div className="ml-6 mt-2 space-y-1">
                        {item.children.map((child) => {
                          const isActive = pathname === child.href
                          return (
                            <Button
                              key={child.name}
                              variant={isActive ? "default" : "ghost"}
                              size="sm"
                              className={`w-full justify-start ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                              onClick={() => {
                                if (child.href) {
                                  router.push(child.href)
                                  setSidebarOpen(false)
                                }
                              }}
                            >
                              <child.icon className="mr-3 h-4 w-4" />
                              {child.name}
                            </Button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              } else {
                // 일반 메뉴 항목
                const isActive = pathname === item.href
                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
                    onClick={() => {
                      if (item.href) {
                        router.push(item.href)
                        setSidebarOpen(false)
                      }
                    }}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Button>
                )
              }
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
