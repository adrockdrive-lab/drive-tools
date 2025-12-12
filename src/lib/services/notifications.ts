import { supabase } from '@/lib/supabase'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  notificationType: 'mission_completed' | 'payback_approved' | 'payback_rejected' | 'new_mission' | 'referral_bonus' | 'marketing_campaign' | 'system_announcement' | 'attendance_reminder'
  data?: Record<string, any>
  isRead: boolean
  priority: 'low' | 'normal' | 'high' | 'urgent'
  channel: 'app' | 'push' | 'sms' | 'email'
  scheduledFor?: string
  sentAt?: string
  readAt?: string
  expiresAt?: string
  createdAt: string
}

export interface NotificationPreference {
  id: string
  userId: string
  notificationType: string
  channel: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export const notificationService = {
  // 사용자 알림 목록 조회
  async getUserNotifications(userId: string, limit: number = 50): Promise<{ success: boolean; notifications?: Notification[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      const notifications: Notification[] = data.map(n => ({
        id: n.id,
        userId: n.user_id,
        title: n.title,
        message: n.message,
        notificationType: n.notification_type,
        data: n.data,
        isRead: n.is_read,
        priority: n.priority,
        channel: n.channel,
        scheduledFor: n.scheduled_for,
        sentAt: n.sent_at,
        readAt: n.read_at,
        expiresAt: n.expires_at,
        createdAt: n.created_at
      }))

      return { success: true, notifications }
    } catch (error) {
      console.error('알림 조회 오류:', error)
      return { success: false, error: '알림을 불러오는데 실패했습니다.' }
    }
  },

  // 알림 읽음 처리
  async markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('알림 읽음 처리 오류:', error)
      return { success: false, error: '알림 읽음 처리에 실패했습니다.' }
    }
  },

  // 모든 알림 읽음 처리
  async markAllAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('모든 알림 읽음 처리 오류:', error)
      return { success: false, error: '모든 알림 읽음 처리에 실패했습니다.' }
    }
  },

  // 읽지 않은 알림 수 조회
  async getUnreadCount(userId: string): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error

      return { success: true, count: count || 0 }
    } catch (error) {
      console.error('읽지 않은 알림 수 조회 오류:', error)
      return { success: false, error: '읽지 않은 알림 수 조회에 실패했습니다.' }
    }
  },

  // 알림 선호 설정 조회
  async getNotificationPreferences(userId: string): Promise<{ success: boolean; preferences?: NotificationPreference[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error

      const preferences: NotificationPreference[] = data.map(p => ({
        id: p.id,
        userId: p.user_id,
        notificationType: p.notification_type,
        channel: p.channel,
        enabled: p.enabled,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }))

      return { success: true, preferences }
    } catch (error) {
      console.error('알림 선호 설정 조회 오류:', error)
      return { success: false, error: '알림 선호 설정을 불러오는데 실패했습니다.' }
    }
  },

  // 알림 선호 설정 업데이트
  async updateNotificationPreference(
    userId: string, 
    notificationType: string, 
    channel: string, 
    enabled: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          notification_type: notificationType,
          channel: channel,
          enabled: enabled,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('알림 선호 설정 업데이트 오류:', error)
      return { success: false, error: '알림 선호 설정 업데이트에 실패했습니다.' }
    }
  }
}