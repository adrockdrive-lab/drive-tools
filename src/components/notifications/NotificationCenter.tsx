'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { notificationService, type Notification } from '@/lib/services/notifications'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

export function NotificationCenter() {
  const { user } = useAppStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadNotifications()
      loadUnreadCount()
    }
  }, [user])

  const loadNotifications = async () => {
    if (!user) return

    setLoading(true)
    try {
      const result = await notificationService.getUserNotifications(user.id)
      if (result.success && result.notifications) {
        setNotifications(result.notifications)
      }
    } catch (error) {
      console.error('알림 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    if (!user) return

    try {
      const result = await notificationService.getUnreadCount(user.id)
      if (result.success && result.count !== undefined) {
        setUnreadCount(result.count)
      }
    } catch (error) {
      console.error('읽지 않은 알림 수 조회 오류:', error)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const result = await notificationService.markAsRead(notificationId)
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      toast.error('알림 읽음 처리에 실패했습니다.')
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return

    try {
      const result = await notificationService.markAllAsRead(user.id)
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        )
        setUnreadCount(0)
        toast.success('모든 알림을 읽음 처리했습니다.')
      }
    } catch (error) {
      toast.error('모든 알림 읽음 처리에 실패했습니다.')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mission_completed': return '🎯'
      case 'payback_approved': return '💰'
      case 'payback_rejected': return '❌'
      case 'new_mission': return '📢'
      case 'referral_bonus': return '🎁'
      case 'marketing_campaign': return '📱'
      case 'system_announcement': return '📢'
      case 'attendance_reminder': return '⏰'
      default: return '📫'
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 max-h-96 overflow-hidden z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">알림</CardTitle>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="h-8 px-2"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                알림을 불러오는 중...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                알림이 없습니다.
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-lg flex-shrink-0">
                        {getTypeIcon(notification.notificationType)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-medium truncate ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <Badge 
                            variant="secondary"
                            className={`text-xs ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                        
                        <p className={`text-xs mt-1 ${
                          !notification.isRead ? 'text-gray-800' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <time className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </time>
                          
                          {notification.isRead && (
                            <Check className="h-3 w-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}