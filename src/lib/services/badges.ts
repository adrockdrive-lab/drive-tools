import { supabase } from '@/lib/supabase'

export interface BadgeWithProgress {
  id: string
  name: string
  description: string
  category: string
  rarity: string
  progress: number
  isUnlocked: boolean
  unlockedAt?: string
  icon?: string
}

// 모든 뱃지 목록을 진행률과 함께 조회
export async function getAllBadgesWithProgress(userId: string): Promise<BadgeWithProgress[]> {
  try {
    // 모든 뱃지 조회
    const { data: allBadges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })

    if (badgesError) throw badgesError

    // 사용자가 획득한 뱃지 조회
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('badge_id, progress, unlocked_at')
      .eq('user_id', userId)

    if (userBadgesError) throw userBadgesError

    const userBadgeMap = new Map(
      userBadges?.map((ub) => [ub.badge_id, { progress: ub.progress, unlockedAt: ub.unlocked_at }]) || []
    )

    // 뱃지와 진행률 결합
    const badgesWithProgress: BadgeWithProgress[] = allBadges?.map((badge) => {
      const userBadge = userBadgeMap.get(badge.id)
      return {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        category: badge.category,
        rarity: badge.rarity,
        progress: userBadge?.progress || 0,
        isUnlocked: userBadge?.progress === 100,
        unlockedAt: userBadge?.unlockedAt,
        icon: badge.icon_url,
      }
    }) || []

    return badgesWithProgress
  } catch (error) {
    console.error('Error loading badges with progress:', error)
    return []
  }
}

// 뱃지 진행률 업데이트
export async function updateBadgeProgress(
  userId: string,
  badgeId: string,
  progress: number
): Promise<void> {
  try {
    const { data: existing, error: existingError } = await supabase
      .from('user_badges')
      .select('id, progress')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .single()

    if (existingError && existingError.code !== 'PGRST116') throw existingError

    if (existing) {
      // 업데이트
      await supabase
        .from('user_badges')
        .update({
          progress: Math.min(progress, 100),
          unlocked_at: progress >= 100 ? new Date().toISOString() : existing.unlocked_at,
        })
        .eq('id', existing.id)
    } else {
      // 삽입
      await supabase.from('user_badges').insert({
        user_id: userId,
        badge_id: badgeId,
        progress: Math.min(progress, 100),
        unlocked_at: progress >= 100 ? new Date().toISOString() : null,
      })
    }

    // 100% 달성 시 알림
    if (progress >= 100 && (!existing || existing.progress < 100)) {
      const { data: badge } = await supabase.from('badges').select('name').eq('id', badgeId).single()

      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'badge_unlock',
        title: '새 뱃지 획득!',
        message: `${badge?.name} 뱃지를 획득했습니다!`,
        metadata: { badgeId },
        is_read: false,
      })
    }
  } catch (error) {
    console.error('Error updating badge progress:', error)
    throw error
  }
}

// 뱃지 조건 체크 및 진행률 자동 업데이트
export async function checkBadgeConditions(userId: string): Promise<void> {
  try {
    // 모든 활성 뱃지 조건 조회
    const { data: badges, error } = await supabase
      .from('badges')
      .select('id, category, condition_type, condition_data')
      .eq('is_active', true)

    if (error) throw error

    // 각 뱃지의 진행률 계산
    for (const badge of badges || []) {
      const progress = await calculateBadgeProgress(userId, badge.condition_type, badge.condition_data)
      await updateBadgeProgress(userId, badge.id, progress)
    }
  } catch (error) {
    console.error('Error checking badge conditions:', error)
  }
}

// 뱃지 진행률 계산
async function calculateBadgeProgress(
  userId: string,
  conditionType: string,
  conditionData: any
): Promise<number> {
  try {
    switch (conditionType) {
      case 'count': {
        // 특정 이벤트 발생 횟수
        const { event, threshold, filter } = conditionData

        let query = supabase
          .from(getTableForEvent(event))
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)

        // 필터 적용
        if (filter) {
          Object.entries(filter).forEach(([key, value]) => {
            query = query.eq(key, value)
          })
        }

        const { count } = await query
        return Math.min(((count || 0) / threshold) * 100, 100)
      }

      case 'streak': {
        // 연속 일수
        const { streakType, threshold } = conditionData

        const { data: streak } = await supabase
          .from('user_streaks')
          .select('current_count')
          .eq('user_id', userId)
          .eq('type', streakType)
          .single()

        return Math.min(((streak?.current_count || 0) / threshold) * 100, 100)
      }

      case 'level': {
        // 레벨 달성
        const { threshold } = conditionData

        const { data: userLevel } = await supabase
          .from('user_levels')
          .select('level')
          .eq('user_id', userId)
          .single()

        return Math.min(((userLevel?.level || 1) / threshold) * 100, 100)
      }

      case 'time_based': {
        // 시간 기반 (특정 시간대에 활동)
        const { timeStart, timeEnd } = conditionData

        const { count } = await supabase
          .from('activity_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', timeStart)
          .lte('created_at', timeEnd)

        return count && count > 0 ? 100 : 0
      }

      case 'combination': {
        // 여러 조건의 조합
        const { conditions } = conditionData
        let totalProgress = 0

        for (const condition of conditions) {
          const progress = await calculateBadgeProgress(userId, condition.type, condition.data)
          totalProgress += progress / conditions.length
        }

        return Math.min(totalProgress, 100)
      }

      default:
        return 0
    }
  } catch (error) {
    console.error('Error calculating badge progress:', error)
    return 0
  }
}

// 이벤트에 대한 테이블 이름 반환
function getTableForEvent(event: string): string {
  const eventTableMap: Record<string, string> = {
    MISSION_COMPLETED: 'mission_participations',
    FRIEND_ADDED: 'friendships',
    POST_CREATED: 'community_posts',
    REVIEW_WRITTEN: 'mission_participations',
    SNS_SHARED: 'mission_participations',
  }
  return eventTableMap[event] || 'activity_logs'
}
