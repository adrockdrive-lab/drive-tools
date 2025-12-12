'use client';

import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Award, 
  Coins, 
  Home, 
  Target, 
  Trophy, 
  User, 
  X 
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  {
    href: '/dashboard',
    label: '홈',
    icon: Home,
    color: 'text-blue-600'
  },
  {
    href: '/missions/challenge',
    label: '챌린지',
    icon: Target,
    color: 'text-green-600'
  },
  {
    href: '/rewards',
    label: '리워드',
    icon: Coins,
    color: 'text-yellow-600'
  },
  {
    href: '/profile',
    label: '프로필',
    icon: User,
    color: 'text-purple-600'
  }
];

export function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const currentIndex = navigationItems.findIndex(item => 
      pathname.startsWith(item.href)
    );
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [pathname]);

  const handleNavigation = (href: string, index: number) => {
    setActiveIndex(index);
    router.push(href);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Bottom Sheet Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30 
            }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 md:hidden"
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">메뉴</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation Grid */}
            <div className="p-6 pb-8">
              <div className="grid grid-cols-2 gap-4">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeIndex === index;
                  
                  return (
                    <motion.button
                      key={item.href}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleNavigation(item.href, index)}
                      className={`
                        relative p-6 rounded-2xl text-center transition-all duration-200
                        ${isActive
                          ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100'
                        }
                      `}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      
                      <div className="relative z-10">
                        <div className={`
                          w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center
                          ${isActive ? 'bg-white shadow-md' : 'bg-white/80'}
                        `}>
                          <Icon className={`
                            w-6 h-6 transition-colors duration-200
                            ${isActive ? item.color : 'text-gray-600'}
                          `} />
                        </div>
                        
                        <p className={`
                          text-sm font-medium transition-colors duration-200
                          ${isActive ? 'text-gray-900' : 'text-gray-600'}
                        `}>
                          {item.label}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 mb-4">빠른 액션</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { 
                      label: '미션 참여', 
                      href: '/missions/attendance',
                      icon: Target,
                      color: 'bg-green-100 text-green-600'
                    },
                    { 
                      label: '친구 추천', 
                      href: '/missions/referral',
                      icon: Award,
                      color: 'bg-purple-100 text-purple-600'
                    },
                    { 
                      label: '랭킹 보기', 
                      href: '/leaderboard',
                      icon: Trophy,
                      color: 'bg-yellow-100 text-yellow-600'
                    }
                  ].map((action, index) => {
                    const ActionIcon = action.icon;
                    
                    return (
                      <motion.button
                        key={action.href}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        onClick={() => {
                          router.push(action.href);
                          onClose();
                        }}
                        className="flex flex-col items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${action.color}`}>
                          <ActionIcon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {action.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Bottom Tab Bar for Mobile
export function MobileTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const currentIndex = navigationItems.findIndex(item => 
      pathname.startsWith(item.href)
    );
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [pathname]);

  const handleNavigation = (href: string, index: number) => {
    setActiveIndex(index);
    router.push(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
      <div className="grid grid-cols-4 h-16">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeIndex === index;
          
          return (
            <motion.button
              key={item.href}
              onClick={() => handleNavigation(item.href, index)}
              className="relative flex flex-col items-center justify-center h-full"
              whileTap={{ scale: 0.95 }}
            >
              {isActive && (
                <motion.div
                  layoutId="tabActiveIndicator"
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              
              <motion.div
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`
                  w-6 h-6 mb-1
                  ${isActive ? item.color : 'text-gray-500'}
                `}
              >
                <Icon className="w-full h-full" />
              </motion.div>
              
              <span className={`
                text-xs font-medium transition-colors duration-200
                ${isActive ? 'text-blue-600' : 'text-gray-500'}
              `}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}