'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Flag,
  Home,
  LogOut,
  Settings,
  Shield,
  Target,
  TrendingUp,
  Users,
  X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface NavigationItem {
  name: string
  href?: string
  icon: React.ElementType
  badge?: number
  children?: NavigationItem[]
}

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
  adminName: string
  onLogout: () => void
}

export function AdminSidebar({
  isOpen,
  onClose,
  adminName,
  onLogout
}: AdminSidebarProps) {
  const pathname = usePathname()
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['미션 관리']))

  const navigation: NavigationItem[] = [
    {
      name: '대시보드',
      href: '/admin/dashboard',
      icon: Home,
    },
    {
      name: '미션 관리',
      icon: Target,
      children: [
        { name: '미션 목록', href: '/admin/missions', icon: Target },
        { name: '미션 생성', href: '/admin/missions/create', icon: Target },
        { name: '제출물 검토', href: '/admin/missions/submissions', icon: Target, badge: 5 },
        { name: '미션 템플릿', href: '/admin/missions/templates', icon: Target },
      ],
    },
    {
      name: '사용자 관리',
      icon: Users,
      children: [
        { name: '사용자 목록', href: '/admin/users', icon: Users },
        { name: '신고 관리', href: '/admin/reports', icon: Flag, badge: 3 },
      ],
    },
    {
      name: '페이백 관리',
      href: '/admin/paybacks',
      icon: CreditCard,
      badge: 12,
    },
    {
      name: '통계 및 분석',
      icon: BarChart3,
      children: [
        { name: '전체 통계', href: '/admin/analytics', icon: TrendingUp },
        { name: '미션 분석', href: '/admin/analytics/missions', icon: Target },
        { name: '지점 비교', href: '/admin/analytics/stores', icon: BarChart3 },
      ],
    },
    {
      name: '알림 관리',
      href: '/admin/notifications',
      icon: Bell,
    },
    {
      name: '이벤트 관리',
      href: '/admin/events',
      icon: Calendar,
    },
    {
      name: '설정',
      icon: Settings,
      children: [
        { name: '권한 관리', href: '/admin/settings/roles', icon: Shield },
        { name: '시스템 설정', href: '/admin/settings', icon: Settings },
      ],
    },
  ]

  const toggleMenu = (menuName: string) => {
    const newExpandedMenus = new Set(expandedMenus)
    if (newExpandedMenus.has(menuName)) {
      newExpandedMenus.delete(menuName)
    } else {
      newExpandedMenus.add(menuName)
    }
    setExpandedMenus(newExpandedMenus)
  }

  const isActive = (href?: string) => {
    if (!href) return false
    return pathname === href || pathname.startsWith(href + '/')
  }

  const hasActiveChild = (item: NavigationItem) => {
    if (!item.children) return false
    return item.children.some(child => isActive(child.href))
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Link href="/admin/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">드라이빙존</h1>
                <p className="text-xs text-gray-500">관리자</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              if (item.children) {
                const isExpanded = expandedMenus.has(item.name)
                const hasActive = hasActiveChild(item)

                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                        hasActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className={cn(
                          'h-5 w-5',
                          hasActive ? 'text-blue-600' : 'text-gray-500'
                        )} />
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-4">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href || '#'}
                            onClick={onClose}
                            className={cn(
                              'flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors',
                              isActive(child.href)
                                ? 'bg-blue-600 text-white font-medium'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            )}
                          >
                            <span>{child.name}</span>
                            {child.badge && (
                              <span className={cn(
                                'px-2 py-0.5 text-xs font-semibold rounded-full',
                                isActive(child.href)
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-red-500 text-white'
                              )}>
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={item.name}
                  href={item.href || '#'}
                  onClick={onClose}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={cn(
                      'h-5 w-5',
                      isActive(item.href) ? 'text-white' : 'text-gray-500'
                    )} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-900">{adminName}</div>
              <div className="text-xs text-gray-500">관리자</div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={onLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
