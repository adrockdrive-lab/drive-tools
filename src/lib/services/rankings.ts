import { supabase } from '@/lib/supabase'

export interface RankingUser {
  rank: number
  userId: string
  nickname: string
  level: number
  xp: number
  coins: number
  badges: number
  completedMissions: number
  avatarUrl?: string
  storeId?: string
  storeName?: string
  change?: number // 순위 변동
}

// 종합 랭킹 (레벨 + XP + 뱃지)
export async function getOverallRanking(limit: number = 100): Promise<RankingUser[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        nickname,
        level,
        xp,
        coins,
        avatar_url,
        store:stores(id, name),
        badges:user_badges(count),
        missions:mission_participations(count)
      `)
      .eq('mission_participations.status', 'completed')
      .order('level', { ascending: false })
      .order('xp', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (data || []).map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      nickname: user.nickname,
      level: user.level,
      xp: user.xp,
      coins: user.coins,
      badges: user.badges[0]?.count || 0,
      completedMissions: user.missions[0]?.count || 0,
      avatarUrl: user.avatar_url,
      storeId: user.store?.id,
      storeName: user.store?.name,
    }))
  } catch (error) {
    console.error('Error loading overall ranking:', error)
    return []
  }
}

// 주간 랭킹 (최근 7일간 XP 획득량)
export async function getWeeklyRanking(limit: number = 100): Promise<RankingUser[]> {
  try {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { data, error } = await supabase.rpc('get_weekly_ranking', {
      since_date: weekAgo.toISOString(),
      result_limit: limit,
    })

    if (error) throw error

    return (data || []).map((user: any, index: number) => ({
      rank: index + 1,
      userId: user.user_id,
      nickname: user.nickname,
      level: user.level,
      xp: user.weekly_xp,
      coins: user.coins,
      badges: user.badge_count,
      completedMissions: user.mission_count,
      avatarUrl: user.avatar_url,
      storeId: user.store_id,
      storeName: user.store_name,
    }))
  } catch (error) {
    console.error('Error loading weekly ranking:', error)
    // RPC 함수가 없는 경우 대체 쿼리
    return getWeeklyRankingFallback(limit)
  }
}

// 주간 랭킹 대체 함수
async function getWeeklyRankingFallback(limit: number = 100): Promise<RankingUser[]> {
  try {
    // 간단한 구현: 최근 완료한 미션 수로 랭킹
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { data, error } = await supabase
      .from('mission_participations')
      .select(`
        user:users(
          id,
          nickname,
          level,
          xp,
          coins,
          avatar_url,
          store:stores(id, name),
          badges:user_badges(count)
        )
      `)
      .eq('status', 'completed')
      .gte('completed_at', weekAgo.toISOString())

    if (error) throw error

    // 사용자별 미션 수 집계
    const userMissions = new Map<string, { user: any; count: number }>()

    data?.forEach((participation: any) => {
      const user = participation.user
      if (user) {
        const existing = userMissions.get(user.id)
        if (existing) {
          existing.count++
        } else {
          userMissions.set(user.id, { user, count: 1 })
        }
      }
    })

    // 배열로 변환 및 정렬
    const ranking = Array.from(userMissions.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    return ranking.map((item, index) => ({
      rank: index + 1,
      userId: item.user.id,
      nickname: item.user.nickname,
      level: item.user.level,
      xp: item.user.xp,
      coins: item.user.coins,
      badges: item.user.badges[0]?.count || 0,
      completedMissions: item.count,
      avatarUrl: item.user.avatar_url,
      storeId: item.user.store?.id,
      storeName: item.user.store?.name,
    }))
  } catch (error) {
    console.error('Error in weekly ranking fallback:', error)
    return []
  }
}

// 지점별 랭킹
export async function getStoreRanking(storeId: string, limit: number = 50): Promise<RankingUser[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        nickname,
        level,
        xp,
        coins,
        avatar_url,
        store:stores(id, name),
        badges:user_badges(count),
        missions:mission_participations!inner(count)
      `)
      .eq('store_id', storeId)
      .eq('mission_participations.status', 'completed')
      .order('level', { ascending: false })
      .order('xp', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (data || []).map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      nickname: user.nickname,
      level: user.level,
      xp: user.xp,
      coins: user.coins,
      badges: user.badges[0]?.count || 0,
      completedMissions: user.missions[0]?.count || 0,
      avatarUrl: user.avatar_url,
      storeId: user.store?.id,
      storeName: user.store?.name,
    }))
  } catch (error) {
    console.error('Error loading store ranking:', error)
    return []
  }
}

// 스피드 랭킹 (미션 완료 속도)
export async function getSpeedRanking(limit: number = 100): Promise<RankingUser[]> {
  try {
    const { data, error } = await supabase.rpc('get_speed_ranking', {
      result_limit: limit,
    })

    if (error) throw error

    return (data || []).map((user: any, index: number) => ({
      rank: index + 1,
      userId: user.user_id,
      nickname: user.nickname,
      level: user.level,
      xp: user.xp,
      coins: user.coins,
      badges: user.badge_count,
      completedMissions: user.mission_count,
      avatarUrl: user.avatar_url,
      storeId: user.store_id,
      storeName: user.store_name,
      change: user.avg_completion_hours, // 평균 완료 시간 (시간)
    }))
  } catch (error) {
    console.error('Error loading speed ranking:', error)
    // RPC 함수가 없는 경우 대체 쿼리
    return getOverallRanking(limit)
  }
}

// 사용자 순위 조회
export async function getUserRank(userId: string, type: 'overall' | 'weekly' | 'store' | 'speed' = 'overall'): Promise<number> {
  try {
    let ranking: RankingUser[] = []

    switch (type) {
      case 'overall':
        ranking = await getOverallRanking(1000)
        break
      case 'weekly':
        ranking = await getWeeklyRanking(1000)
        break
      case 'speed':
        ranking = await getSpeedRanking(1000)
        break
      case 'store':
        // 사용자의 지점 ID 조회
        const { data: user } = await supabase.from('users').select('store_id').eq('id', userId).single()
        if (user?.store_id) {
          ranking = await getStoreRanking(user.store_id, 1000)
        }
        break
    }

    const userRanking = ranking.find((r) => r.userId === userId)
    return userRanking?.rank || 0
  } catch (error) {
    console.error('Error getting user rank:', error)
    return 0
  }
}

// 랭킹 변동 조회 (전날 대비)
export async function getRankChange(userId: string): Promise<number> {
  try {
    // 어제 랭킹 스냅샷 조회
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('ranking_snapshots')
      .select('rank')
      .eq('user_id', userId)
      .eq('ranking_type', 'overall')
      .gte('snapshot_date', yesterday.toISOString())
      .single()

    if (error || !data) return 0

    const previousRank = data.rank
    const currentRank = await getUserRank(userId, 'overall')

    // 순위가 낮아지면 양수 (상승), 높아지면 음수 (하락)
    return previousRank - currentRank
  } catch (error) {
    console.error('Error getting rank change:', error)
    return 0
  }
}

// 랭킹 스냅샷 저장 (크론잡으로 매일 실행)
export async function saveRankingSnapshot(): Promise<void> {
  try {
    const ranking = await getOverallRanking(1000)

    const snapshots = ranking.map((user) => ({
      user_id: user.userId,
      ranking_type: 'overall',
      rank: user.rank,
      level: user.level,
      xp: user.xp,
      snapshot_date: new Date().toISOString(),
    }))

    const { error } = await supabase.from('ranking_snapshots').insert(snapshots)

    if (error) throw error
  } catch (error) {
    console.error('Error saving ranking snapshot:', error)
  }
}
