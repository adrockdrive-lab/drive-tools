'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/lib/store';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Coins,
  LogOut,
  Menu,
  Settings,
  Trophy,
  User,
  X
} from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  showMobileNav?: boolean;
  onToggleMobileNav?: () => void;
}

export function Header({ onToggleMobileNav }: HeaderProps) {
  const { user, totalPayback, logout } = useAppStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    onToggleMobileNav?.();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50">
      <div className="px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center space-x-3"
          >
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              // transition={{ type: "", stiffness: 300, damping: 15 }}
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
            >
              🚗
            </motion.div>
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
                className="text-lg font-bold text-gray-900"
              >
                드라이빙존
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-xs text-gray-500"
              >
                Mission Payback
              </motion.p>
            </div>
          </motion.div>

          {/* 사용자 정보 및 액션 */}
          <div className="flex items-center space-x-3">
            {/* 페이백 표시 */}
            {user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                // transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-full border border-blue-100"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Coins className="w-4 h-4 text-blue-600" />
                </motion.div>
                <span className="text-sm font-semibold text-gray-800">
                  {totalPayback.toLocaleString()}원
                </span>
              </motion.div>
            )}

            {user ? (
              // 로그인된 사용자
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100 transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {user.level && user.level > 1 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                        >
                          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold">
                            {user.level}
                          </Badge>
                        </motion.div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white border-gray-200 shadow-xl rounded-xl mt-2" align="end">
                    <DropdownMenuLabel className="text-gray-900 p-4">
                      <div className="flex flex-col space-y-2">
                        <p className="text-sm font-semibold">{user.name}님</p>
                        <p className="text-xs text-gray-500">{user.phone}</p>
                        {user.level && (
                          <div className="flex items-center space-x-2 pt-1">
                            <Trophy className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-yellow-600 font-medium">레벨 {user.level}</span>
                          </div>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-100" />
                    <DropdownMenuItem onClick={() => window.location.href = '/profile'} className="text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer">
                      <User className="mr-3 h-4 w-4" />
                      마이페이지
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = '/settings'} className="text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer">
                      <Settings className="mr-3 h-4 w-4" />
                      설정
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-100" />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50 cursor-pointer">
                      <LogOut className="mr-3 h-4 w-4" />
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ) : (
              // 비로그인 사용자
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                className="flex items-center space-x-2"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  onClick={() => window.location.href = '/login'}
                >
                  로그인
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.location.href = '/register'}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  회원가입
                </Button>
              </motion.div>
            )}

            {/* 모바일 메뉴 버튼 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="md:hidden"
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                onClick={toggleMobileMenu}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* 모바일 네비게이션 */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="md:hidden"
            >
              <div className="py-4 border-t border-gray-200">
                <div className="flex flex-col space-y-1">
                  {[
                    { href: '/dashboard', label: '대시보드', active: true },
                    { href: '/missions', label: '미션' },
                    { href: '/payback', label: '페이백 내역' },
                    { href: '/leaderboard', label: '리더보드' }
                  ].map((item, index) => (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
                      className={`
                        block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200
                        ${item.active
                          ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      {item.label}
                    </motion.a>
                  ))}

                  {user && (
                    <>
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                        className="border-t border-gray-200 my-3"
                      />

                      {[
                        { href: '/profile', label: '마이페이지' },
                        { href: '/settings', label: '설정' }
                      ].map((item, index) => (
                        <motion.a
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.35 + index * 0.05, duration: 0.3 }}
                          className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                        >
                          {item.label}
                        </motion.a>
                      ))}

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.45, duration: 0.3 }}
                        className="mx-4 mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Coins className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-semibold text-gray-800">
                            총 페이백: {totalPayback.toLocaleString()}원
                          </span>
                        </div>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
