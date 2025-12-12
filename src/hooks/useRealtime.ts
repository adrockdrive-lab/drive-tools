import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

/**
 * 실시간 알림 구독 훅
 */
export function useNotifications(userId: string | undefined, onNotification?: (notification: any) => void) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!userId) return

    // 초기 읽지 않은 알림 수 조회
    const loadUnreadCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      setUnreadCount(count || 0)
    }

    loadUnreadCount()

    // 실시간 구독
    const notificationChannel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setUnreadCount((prev) => prev + 1)
          if (onNotification) {
            onNotification(payload.new)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as any
          if (notification.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()

    setChannel(notificationChannel)

    return () => {
      if (notificationChannel) {
        supabase.removeChannel(notificationChannel)
      }
    }
  }, [userId, onNotification])

  return { unreadCount, channel }
}

/**
 * 실시간 친구 요청 구독 훅
 */
export function useFriendRequests(userId: string | undefined) {
  const [requestCount, setRequestCount] = useState(0)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!userId) return

    // 초기 친구 요청 수 조회
    const loadRequestCount = async () => {
      const { count } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .eq('friend_id', userId)
        .eq('status', 'pending')

      setRequestCount(count || 0)
    }

    loadRequestCount()

    // 실시간 구독
    const friendChannel = supabase
      .channel(`friend_requests:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friendships',
          filter: `friend_id=eq.${userId}`,
        },
        (payload) => {
          const friendship = payload.new as any
          if (friendship.status === 'pending') {
            setRequestCount((prev) => prev + 1)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'friendships',
          filter: `friend_id=eq.${userId}`,
        },
        (payload) => {
          const friendship = payload.new as any
          if (friendship.status !== 'pending') {
            setRequestCount((prev) => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()

    setChannel(friendChannel)

    return () => {
      if (friendChannel) {
        supabase.removeChannel(friendChannel)
      }
    }
  }, [userId])

  return { requestCount, channel }
}

/**
 * 실시간 활동 피드 구독 훅
 */
export function useActivityFeed(userId: string | undefined, onNewActivity?: (activity: any) => void) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!userId) return

    // 친구 목록 조회
    const subscribeFriendActivities = async () => {
      const { data: friends } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', userId)
        .eq('status', 'accepted')

      const friendIds = friends?.map((f) => f.friend_id) || []

      if (friendIds.length === 0) return

      // 친구들의 활동 구독
      const activityChannel = supabase
        .channel(`activity_feed:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'activity_feeds',
          },
          (payload) => {
            const activity = payload.new as any
            // 친구의 활동인 경우에만 콜백 호출
            if (friendIds.includes(activity.user_id)) {
              if (onNewActivity) {
                onNewActivity(activity)
              }
            }
          }
        )
        .subscribe()

      setChannel(activityChannel)
    }

    subscribeFriendActivities()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [userId, onNewActivity])

  return { channel }
}

/**
 * 실시간 레벨 변경 구독 훅
 */
export function useUserLevel(userId: string | undefined, onLevelChange?: (level: number) => void) {
  const [level, setLevel] = useState(1)
  const [xp, setXp] = useState(0)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!userId) return

    // 초기 레벨 조회
    const loadLevel = async () => {
      const { data } = await supabase.from('users').select('level, xp').eq('id', userId).single()

      if (data) {
        setLevel(data.level)
        setXp(data.xp)
      }
    }

    loadLevel()

    // 실시간 구독
    const levelChannel = supabase
      .channel(`user_level:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const user = payload.new as any
          setLevel(user.level)
          setXp(user.xp)
          if (onLevelChange && user.level !== level) {
            onLevelChange(user.level)
          }
        }
      )
      .subscribe()

    setChannel(levelChannel)

    return () => {
      if (levelChannel) {
        supabase.removeChannel(levelChannel)
      }
    }
  }, [userId, onLevelChange])

  return { level, xp, channel }
}

/**
 * 실시간 채팅/댓글 구독 훅
 */
export function useComments(postId: string | undefined, onNewComment?: (comment: any) => void) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!postId) return

    const commentChannel = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          if (onNewComment) {
            onNewComment(payload.new)
          }
        }
      )
      .subscribe()

    setChannel(commentChannel)

    return () => {
      if (commentChannel) {
        supabase.removeChannel(commentChannel)
      }
    }
  }, [postId, onNewComment])

  return { channel }
}

/**
 * 실시간 미션 상태 변경 구독 훅
 */
export function useMissionStatus(userId: string | undefined, onMissionUpdate?: (mission: any) => void) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!userId) return

    const missionChannel = supabase
      .channel(`missions:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'mission_participations',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (onMissionUpdate) {
            onMissionUpdate(payload.new)
          }
        }
      )
      .subscribe()

    setChannel(missionChannel)

    return () => {
      if (missionChannel) {
        supabase.removeChannel(missionChannel)
      }
    }
  }, [userId, onMissionUpdate])

  return { channel }
}

/**
 * 범용 실시간 구독 훅
 */
export function useRealtimeSubscription(
  table: string,
  filter?: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
  onData?: (payload: any) => void
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    const realtimeChannel = supabase
      .channel(`${table}:${filter || 'all'}`)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter,
        },
        (payload) => {
          if (onData) {
            onData(payload)
          }
        }
      )
      .subscribe()

    setChannel(realtimeChannel)

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel)
      }
    }
  }, [table, filter, event, onData])

  return { channel }
}
