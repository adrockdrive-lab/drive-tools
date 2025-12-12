'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Menu, Search, Settings, User } from 'lucide-react'
import { useState } from 'react'

interface AdminHeaderProps {
  onMenuClick: () => void
  adminName: string
  notificationCount?: number
}

export function AdminHeader({
  onMenuClick,
  adminName,
  notificationCount = 0
}: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search bar */}
          <div className="hidden md:flex items-center bg-gray-50 rounded-lg px-3 py-2 w-80">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="검색... (사용자, 미션, 지점)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Search button for mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden hover:bg-gray-100"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative hover:bg-gray-100">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>알림</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notificationCount > 0 ? (
                <>
                  <DropdownMenuItem className="flex flex-col items-start py-3">
                    <div className="font-medium text-gray-900">새로운 미션 제출물</div>
                    <div className="text-sm text-gray-500">홍길동님이 챌린지 미션을 완료했습니다</div>
                    <div className="text-xs text-gray-400 mt-1">5분 전</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start py-3">
                    <div className="font-medium text-gray-900">페이백 신청</div>
                    <div className="text-sm text-gray-500">12건의 새로운 페이백 신청이 있습니다</div>
                    <div className="text-xs text-gray-400 mt-1">1시간 전</div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-center text-blue-600 font-medium">
                    모든 알림 보기
                  </DropdownMenuItem>
                </>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">새로운 알림이 없습니다</p>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-gray-100">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden lg:block text-sm font-medium text-gray-900">
                  {adminName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-gray-900">{adminName}</p>
                  <p className="text-xs text-gray-500">관리자</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                내 정보
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                설정
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
