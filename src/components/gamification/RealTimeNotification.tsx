'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRealtimeProgress, useSocialFeed } from '@/hooks/useRealtimeProgress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PaybackCounter } from './PaybackCounter';

interface NotificationProps {
  type: 'success' | 'payback' | 'social' | 'level_up' | 'achievement';
  title: string;
  message: string;
  amount?: number;
  icon?: string;
  duration?: number;
  onDismiss?: () => void;
}

interface ToastNotification extends NotificationProps {
  id: string;
  timestamp: Date;
}

// Toast Notification Component
export function ToastNotification({
  type,
  title,
  message,
  amount,
  icon,
  duration = 5000,
  onDismiss
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) setTimeout(onDismiss, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const typeConfig = {
    success: {
      bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
      icon: icon || '🎉',
      textColor: 'text-white'
    },
    payback: {
      bgColor: 'bg-gradient-to-r from-orange-500 to-orange-600',
      icon: icon || '💰',
      textColor: 'text-white'
    },
    social: {
      bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
      icon: icon || '👥',
      textColor: 'text-white'
    },
    level_up: {
      bgColor: 'bg-gradient-to-r from-purple-500 to-purple-600',
      icon: icon || '⭐',
      textColor: 'text-white'
    },
    achievement: {
      bgColor: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      icon: icon || '🏆',
      textColor: 'text-white'
    }
  };

  const config = typeConfig[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`
            ${config.bgColor} ${config.textColor}
            rounded-lg shadow-lg p-4 mb-2 cursor-pointer
            hover:shadow-xl transition-shadow duration-200
          `}
          onClick={() => {
            setIsVisible(false);
            if (onDismiss) setTimeout(onDismiss, 300);
          }}
        >
          <div className="flex items-center space-x-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
              className="text-2xl flex-shrink-0"
            >
              {config.icon}
            </motion.div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">{title}</h4>
              <p className="text-sm opacity-90">{message}</p>
            </div>
            {amount && (
              <div className="text-right">
                <PaybackCounter
                  amount={amount}
                  size="sm"
                  color="default"
                  animationType="bounce"
                  showCurrency={true}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Toast Container
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (notification: NotificationProps) => {
    const toast: ToastNotification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    setToasts(prev => [...prev, toast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Global toast function
  useEffect(() => {
    (window as Window & { showToast?: (notification: NotificationProps) => void }).showToast = addToast;
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastNotification
            key={toast.id}
            {...toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Real-time Connection Status
export function ConnectionStatus() {
  const { isConnected, connectionError, lastUpdate } = useRealtimeProgress();
  const [showDetails, setShowDetails] = useState(false);

  if (!isConnected && !connectionError) {
    return null; // Don't show anything if not trying to connect
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-4 z-40"
    >
      <Card 
        className={`cursor-pointer transition-all duration-200 ${
          isConnected 
            ? 'border-green-200 bg-green-50 hover:bg-green-100' 
            : 'border-red-200 bg-red-50 hover:bg-red-100'
        }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <CardContent className="p-3">
          <div className="flex items-center space-x-2">
            <div 
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} 
            />
            <span className="text-xs font-medium">
              {isConnected ? '실시간 연결됨' : '연결 끊김'}
            </span>
            {lastUpdate && (
              <span className="text-xs text-gray-500">
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 pt-2 border-t border-gray-200"
              >
                <div className="text-xs space-y-1">
                  <div>상태: {isConnected ? '연결됨' : '끊어짐'}</div>
                  {connectionError && (
                    <div className="text-red-600">오류: {connectionError}</div>
                  )}
                  {lastUpdate && (
                    <div>마지막 업데이트: {lastUpdate.toLocaleString()}</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Social Activity Feed Component
export function SocialActivityFeed({ maxItems = 5 }: { maxItems?: number }) {
  const { activities, isLoading } = useSocialFeed(maxItems);
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  const displayActivities = isExpanded ? activities : activities.slice(0, 3);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
          <motion.span
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🔥
          </motion.span>
          <span>실시간 활동</span>
        </h3>
        {activities.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? '접기' : '더보기'}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {displayActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    {activity.userName}님이 {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getTimeAgo(new Date(activity.timestamp))}
                  </p>
                </div>
              </div>
              {activity.metadata && 'amount' in activity.metadata && typeof activity.metadata.amount === 'number' && (
                <Badge className="bg-green-100 text-green-800 text-xs flex-shrink-0 ml-2">
                  +{activity.metadata.amount.toLocaleString()}원
                </Badge>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Utility function to get time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  return `${Math.floor(diffInSeconds / 86400)}일 전`;
}

// Global toast functions
declare global {
  interface Window {
    showToast: (notification: NotificationProps) => void;
  }
}

export const showSuccessToast = (title: string, message: string, amount?: number) => {
  if (typeof window !== 'undefined' && window.showToast) {
    window.showToast({ type: 'success', title, message, amount });
  }
};

export const showPaybackToast = (amount: number) => {
  if (typeof window !== 'undefined' && window.showToast) {
    window.showToast({
      type: 'payback',
      title: '페이백 적립!',
      message: '페이백이 성공적으로 적립되었습니다',
      amount
    });
  }
};

export const showSocialToast = (userName: string, action: string) => {
  if (typeof window !== 'undefined' && window.showToast) {
    window.showToast({
      type: 'social',
      title: '실시간 활동',
      message: `${userName}님이 ${action}`,
      duration: 3000
    });
  }
};