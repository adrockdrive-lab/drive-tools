import { supabase } from '@/lib/supabase'

export interface ActivityFeedItem {
  id: string
  userId: string
  userName: string
  userLevel: number
  userAvatar?: string
  type: string
  content: string
  metadata?: any
  timestamp: string
  likes: number
  comments: number
  isLiked?: boolean
}

// 활동 피드 조회
export async function getActivityFeed(
  userId: string,
  filter: 'all' | 'friends' | 'store' | 'me' = 'all',
  limit: number = 50
): Promise<ActivityFeedItem[]> {
  try {
    let query = supabase
      .from('activity_feeds')
      .select(`
        *,
        user:users!activity_feeds_user_id_fkey(id, nickname, level, avatar_url),
        likes:activity_likes(count),
        comments:activity_comments(count)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    // 필터 적용
    if (filter === 'friends') {
      // 친구의 활동만 조회
      const { data: friends } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', userId)
        .eq('status', 'accepted')

      const friendIds = friends?.map((f) => f.friend_id) || []
      if (friendIds.length > 0) {
        query = query.in('user_id', friendIds)
      } else {
        return [] // 친구가 없으면 빈 배열 반환
      }
    } else if (filter === 'store') {
      // 같은 지점의 활동만 조회
      const { data: currentUser } = await supabase.from('users').select('store_id').eq('id', userId).single()

      if (currentUser?.store_id) {
        query = query.eq('users.store_id', currentUser.store_id)
      }
    } else if (filter === 'me') {
      // 내 활동만 조회
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error

    // 사용자가 좋아요한 활동 조회
    const { data: likedActivities } = await supabase
      .from('activity_likes')
      .select('activity_id')
      .eq('user_id', userId)

    const likedActivityIds = new Set(likedActivities?.map((like) => like.activity_id) || [])

    return (data || []).map((activity) => ({
      id: activity.id,
      userId: activity.user.id,
      userName: activity.user.nickname,
      userLevel: activity.user.level,
      userAvatar: activity.user.avatar_url,
      type: activity.activity_type,
      content: activity.content,
      metadata: activity.metadata,
      timestamp: formatTimeAgo(activity.created_at),
      likes: activity.likes[0]?.count || 0,
      comments: activity.comments[0]?.count || 0,
      isLiked: likedActivityIds.has(activity.id),
    }))
  } catch (error) {
    console.error('Error loading activity feed:', error)
    return []
  }
}

// 활동 생성
export async function createActivity(
  userId: string,
  type: string,
  content: string,
  metadata?: any
): Promise<void> {
  try {
    const { error } = await supabase.from('activity_feeds').insert({
      user_id: userId,
      activity_type: type,
      content,
      metadata,
    })

    if (error) throw error
  } catch (error) {
    console.error('Error creating activity:', error)
    throw error
  }
}

// 좋아요 토글
export async function toggleActivityLike(userId: string, activityId: string): Promise<boolean> {
  try {
    // 이미 좋아요했는지 확인
    const { data: existing, error: checkError } = await supabase
      .from('activity_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('activity_id', activityId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') throw checkError

    if (existing) {
      // 좋아요 취소
      await supabase.from('activity_likes').delete().eq('id', existing.id)
      return false
    } else {
      // 좋아요 추가
      await supabase.from('activity_likes').insert({
        user_id: userId,
        activity_id: activityId,
      })

      // 활동 작성자에게 알림 (본인 제외)
      const { data: activity } = await supabase
        .from('activity_feeds')
        .select('user_id')
        .eq('id', activityId)
        .single()

      if (activity && activity.user_id !== userId) {
        const { data: liker } = await supabase.from('users').select('nickname').eq('id', userId).single()

        await supabase.from('notifications').insert({
          user_id: activity.user_id,
          type: 'like',
          title: '좋아요',
          message: `${liker?.nickname || '사용자'}님이 회원님의 활동을 좋아합니다.`,
          link: `/feed-v2`,
          metadata: { activityId },
          is_read: false,
        })
      }

      return true
    }
  } catch (error) {
    console.error('Error toggling activity like:', error)
    throw error
  }
}

// 댓글 추가
export async function addActivityComment(
  userId: string,
  activityId: string,
  content: string
): Promise<void> {
  try {
    const { error } = await supabase.from('activity_comments').insert({
      user_id: userId,
      activity_id: activityId,
      content,
    })

    if (error) throw error

    // 활동 작성자에게 알림 (본인 제외)
    const { data: activity } = await supabase
      .from('activity_feeds')
      .select('user_id')
      .eq('id', activityId)
      .single()

    if (activity && activity.user_id !== userId) {
      const { data: commenter } = await supabase.from('users').select('nickname').eq('id', userId).single()

      await supabase.from('notifications').insert({
        user_id: activity.user_id,
        type: 'comment',
        title: '새 댓글',
        message: `${commenter?.nickname || '사용자'}님이 회원님의 활동에 댓글을 남겼습니다.`,
        link: `/feed-v2`,
        metadata: { activityId },
        is_read: false,
      })
    }
  } catch (error) {
    console.error('Error adding activity comment:', error)
    throw error
  }
}

// 댓글 조회
export async function getActivityComments(activityId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('activity_comments')
      .select(`
        *,
        user:users(id, nickname, level, avatar_url)
      `)
      .eq('activity_id', activityId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return (data || []).map((comment) => ({
      id: comment.id,
      content: comment.content,
      user: comment.user,
      createdAt: formatTimeAgo(comment.created_at),
    }))
  } catch (error) {
    console.error('Error loading activity comments:', error)
    return []
  }
}

// 미션 완료 시 자동 활동 생성
export async function createMissionCompleteActivity(
  userId: string,
  missionType: string,
  missionName: string
): Promise<void> {
  let content = ''
  let type = 'mission_complete'

  switch (missionType) {
    case 'daily':
      content = '일일 미션을 완료했습니다!'
      break
    case 'story':
      content = `스토리 미션 "${missionName}"을(를) 완료했습니다!`
      break
    default:
      content = '미션을 완료했습니다!'
  }

  await createActivity(userId, type, content, { missionType, missionName })
}

// 레벨업 시 자동 활동 생성
export async function createLevelUpActivity(userId: string, newLevel: number): Promise<void> {
  await createActivity(userId, 'level_up', `레벨 ${newLevel}을(를) 달성했습니다!`, { level: newLevel })
}

// 뱃지 획득 시 자동 활동 생성
export async function createBadgeUnlockActivity(userId: string, badgeName: string): Promise<void> {
  await createActivity(userId, 'badge_unlock', `${badgeName} 뱃지를 획득했습니다!`, { badgeName })
}

// 연속 출석 시 자동 활동 생성
export async function createStreakActivity(userId: string, streakDays: number): Promise<void> {
  await createActivity(userId, 'streak', `${streakDays}일 연속 출석 달성!`, { days: streakDays })
}

// 챕터 완료 시 자동 활동 생성
export async function createChapterCompleteActivity(
  userId: string,
  chapterNumber: number,
  chapterName: string
): Promise<void> {
  await createActivity(
    userId,
    'chapter_complete',
    `스토리 챕터 ${chapterNumber}을(를) 완료했습니다!`,
    { chapterNumber, chapterName }
  )
}

// 시간 포맷팅
function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const past = new Date(timestamp)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`
  return `${Math.floor(diffDays / 365)}년 전`
}
