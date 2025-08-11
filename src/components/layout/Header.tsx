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
import { motion } from 'framer-motion';
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
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
    >
      <div className="px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              🚗
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                드라이빙존
              </h1>
              <p className="text-xs text-muted-foreground">Mission Payback</p>
            </div>
          </motion.div>

          {/* 사용자 정보 및 액션 */}
          <div className="flex items-center space-x-3">
            {/* 페이백 표시 */}
            {user && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="hidden sm:flex items-center space-x-2 bg-primary/20 px-3 py-2 rounded-full"
              >
                <Coins className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-white">
                  {totalPayback.toLocaleString()}원
                </span>
              </motion.div>
            )}

            {user ? (
              // 로그인된 사용자
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                        {user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {user.level && user.level > 1 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 bg-yellow-500 text-xs">
                        {user.level}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card border-border" align="end">
                  <DropdownMenuLabel className="text-card-foreground">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}님</p>
                      <p className="text-xs text-muted-foreground">{user.phone}</p>
                      {user.level && (
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-yellow-400">레벨 {user.level}</span>
                        </div>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = '/profile'} className="text-card-foreground">
                    <User className="mr-2 h-4 w-4" />
                    마이페이지
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/settings'} className="text-card-foreground">
                    <Settings className="mr-2 h-4 w-4" />
                    설정
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // 비로그인 사용자
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white"
                  onClick={() => window.location.href = '/login'}
                >
                  로그인
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.location.href = '/register'}
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  회원가입
                </Button>
              </div>
            )}

            {/* 모바일 메뉴 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* 모바일 네비게이션 */}
        {isMobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            <div className="flex flex-col space-y-2">
              <MobileNavLink href="/dashboard" active onClick={() => setIsMobileMenuOpen(false)}>
                대시보드
              </MobileNavLink>
              <MobileNavLink href="/missions" onClick={() => setIsMobileMenuOpen(false)}>
                미션
              </MobileNavLink>
              <MobileNavLink href="/payback" onClick={() => setIsMobileMenuOpen(false)}>
                페이백 내역
              </MobileNavLink>
              <MobileNavLink href="/leaderboard" onClick={() => setIsMobileMenuOpen(false)}>
                리더보드
              </MobileNavLink>
              {user && (
                <>
                  <div className="border-t border-border my-2"></div>
                  <MobileNavLink href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    마이페이지
                  </MobileNavLink>
                  <MobileNavLink href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                    설정
                  </MobileNavLink>
                  {/* 모바일에서 페이백 표시 */}
                  <div className="flex items-center justify-center space-x-2 bg-primary/20 px-3 py-2 rounded-lg mx-2 mt-2">
                    <Coins className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-white">
                      총 페이백: {totalPayback.toLocaleString()}원
                    </span>
                  </div>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
}



// 모바일 네비게이션 링크 컴포넌트
function MobileNavLink({
  href,
  children,
  active = false,
  onClick
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.a
      href={href}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`
        block px-4 py-2 rounded-md text-base font-medium transition-colors
        ${active
          ? 'bg-primary/20 text-primary'
          : 'text-muted-foreground hover:text-white hover:bg-secondary'
        }
      `}
    >
      {children}
    </motion.a>
  );
}
