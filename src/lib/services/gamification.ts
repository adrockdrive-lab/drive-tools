import { supabase } from '@/lib/supabase'
import type { 
  UserLevel, 
  Badge, 
  UserBadge, 
  Streak, 
  BadgeRarity, 
  StreakType,
  MissionType 
} from '@/types'

export const gamificationService = {
  // ===============================================
  // 레벨/경험치 시스템
  // ===============================================

  // 사용자 레벨 정보 조회
  async getUserLevel(userId: string): Promise<{ success: boolean; userLevel?: UserLevel; error?: string }> {
    try {
      const { data: userLevel, error } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', userId)
        .single()

      // 사용자 레벨이 없으면 생성 (레벨 1, 경험치 0)
      if (error && error.code === 'PGRST116') {
        const { data: newUserLevel, error: createError } = await supabase
          .from('user_levels')
          .insert({
            user_id: userId,
            level: 1,
            experience_points: 0,
            total_experience: 0
          })
          .select()
          .single()

        if (createError) throw createError
        userLevel = newUserLevel
      } else if (error) {
        throw error
      }

      const result: UserLevel = {
        id: userLevel.id,
        userId: userLevel.user_id,
        level: userLevel.level,
        experiencePoints: userLevel.experience_points,
        totalExperience: userLevel.total_experience,
        createdAt: userLevel.created_at,
        updatedAt: userLevel.updated_at
      }

      return { success: true, userLevel: result }
    } catch (error) {
      console.error('사용자 레벨 조회 오류:', error)
      return { success: false, error: '레벨 정보를 불러오는데 실패했습니다.' }
    }
  },

  // 경험치 추가
  async addExperience(
    userId: string, 
    points: number,
    source: string = 'mission_complete'
  ): Promise<{ success: boolean; leveledUp?: boolean; newLevel?: number; error?: string }> {
    try {
      const levelResult = await this.getUserLevel(userId)
      if (!levelResult.success || !levelResult.userLevel) {
        return { success: false, error: '사용자 레벨 정보를 불러올 수 없습니다.' }
      }

      const currentLevel = levelResult.userLevel
      const newExperience = currentLevel.experiencePoints + points
      const newTotalExperience = currentLevel.totalExperience + points

      // 레벨업 계산 (100 경험치당 1레벨)
      const experiencePerLevel = 100
      const newLevel = Math.floor(newTotalExperience / experiencePerLevel) + 1
      const remainingExperience = newTotalExperience % experiencePerLevel
      const leveledUp = newLevel > currentLevel.level

      // 레벨 업데이트
      const { error: updateError } = await supabase
        .from('user_levels')
        .update({
          level: newLevel,
          experience_points: remainingExperience,
          total_experience: newTotalExperience,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) throw updateError

      // 레벨업 시 보상 지급 및 알림
      if (leveledUp) {
        await this.handleLevelUpRewards(userId, newLevel)
      }

      return { 
        success: true, 
        leveledUp, 
        newLevel: leveledUp ? newLevel : undefined 
      }
    } catch (error) {
      console.error('경험치 추가 오류:', error)
      return { success: false, error: '경험치 추가에 실패했습니다.' }
    }
  },

  // 레벨업 보상 처리
  async handleLevelUpRewards(userId: string, newLevel: number): Promise<void> {
    try {
      // 레벨별 보상 정의
      const levelRewards: Record<number, { experienceBonus?: number; couponCode?: string }> = {
        5: { experienceBonus: 50, couponCode: 'LEVEL5' },
        10: { experienceBonus: 100, couponCode: 'LEVEL10' },
        15: { experienceBonus: 200, couponCode: 'LEVEL15' },
        20: { experienceBonus: 500, couponCode: 'LEVEL20' }
      }

      const reward = levelRewards[newLevel]
      if (reward) {
        // 쿠폰 발급
        if (reward.couponCode) {
          const { couponService } = await import('./coupons')
          await couponService.issueCoupon(userId, reward.couponCode)
        }

        // 보너스 경험치 지급
        if (reward.experienceBonus) {
          await this.addExperience(userId, reward.experienceBonus, 'level_up_bonus')
        }
      }

      // 레벨업 알림 생성
      await this.createNotification(userId, 'level_up', {
        title: `🎉 레벨 ${newLevel} 달성!`,
        message: `축하합니다! 레벨 ${newLevel}에 도달했습니다.`,
        data: { newLevel, rewards: reward }
      })
    } catch (error) {
      console.error('레벨업 보상 처리 오류:', error)
    }
  },

  // ===============================================
  // 뱃지 시스템
  // ===============================================

  // 사용자 뱃지 목록 조회
  async getUserBadges(userId: string): Promise<{ success: boolean; badges?: UserBadge[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badges!inner(*)
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })

      if (error) throw error

      const userBadges: UserBadge[] = (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        badgeId: item.badge_id,
        earnedAt: item.earned_at,
        badge: {
          id: item.badges.id,
          name: item.badges.name,
          title: item.badges.title,
          description: item.badges.description,
          iconUrl: item.badges.icon_url,
          rarity: item.badges.rarity,
          condition: item.badges.condition,
          isActive: item.badges.is_active,
          createdAt: item.badges.created_at
        }
      }))

      return { success: true, badges: userBadges }
    } catch (error) {
      console.error('사용자 뱃지 조회 오류:', error)
      return { success: false, error: '뱃지를 불러오는데 실패했습니다.' }
    }
  },

  // 뱃지 조건 확인 및 자동 지급
  async checkAndAwardBadges(userId: string): Promise<{ success: boolean; newBadges?: Badge[]; error?: string }> {
    try {
      // 모든 활성 뱃지 조건 조회
      const { data: badges, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)

      if (badgesError) throw badgesError

      // 사용자가 이미 획득한 뱃지 조회
      const { data: userBadges, error: userBadgesError } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', userId)

      if (userBadgesError) throw userBadgesError

      const earnedBadgeIds = userBadges.map(ub => ub.badge_id)
      const newBadges: Badge[] = []

      // 각 뱃지 조건 확인
      for (const badge of badges) {
        if (earnedBadgeIds.includes(badge.id)) continue // 이미 획득한 뱃지

        const meetsCondition = await this.checkBadgeCondition(userId, badge.condition)
        if (meetsCondition) {
          // 뱃지 지급
          await supabase
            .from('user_badges')
            .insert({
              user_id: userId,
              badge_id: badge.id,
              earned_at: new Date().toISOString()
            })

          newBadges.push({
            id: badge.id,
            name: badge.name,
            title: badge.title,
            description: badge.description,
            iconUrl: badge.icon_url,
            rarity: badge.rarity,
            condition: badge.condition,
            isActive: badge.is_active,
            createdAt: badge.created_at
          })

          // 뱃지 획득 알림
          await this.createNotification(userId, 'badge_earned', {
            title: `🏆 새로운 뱃지 획득!`,
            message: `"${badge.title}" 뱃지를 획득했습니다!`,
            data: { badge }
          })
        }
      }

      return { success: true, newBadges }
    } catch (error) {
      console.error('뱃지 확인 및 지급 오류:', error)
      return { success: false, error: '뱃지 처리에 실패했습니다.' }
    }
  },

  // 뱃지 조건 확인
  async checkBadgeCondition(userId: string, condition: any): Promise<boolean> {
    try {
      switch (condition.type) {
        case 'mission_complete':
          // 특정 미션 완료
          const { count: missionCount } = await supabase
            .from('mission_participations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'completed')
            .eq('mission_type', condition.missionType)

          return (missionCount || 0) >= condition.value

        case 'mission_count':
          // 총 미션 완료 수
          const { count: totalMissions } = await supabase
            .from('mission_participations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'completed')

          return (totalMissions || 0) >= condition.value

        case 'referral_count':
          // 친구 추천 수
          const { count: referralCount } = await supabase
            .from('referrals')
            .select('*', { count: 'exact', head: true })
            .eq('referrer_id', userId)
            .eq('is_verified', true)

          return (referralCount || 0) >= condition.value

        case 'payback_amount':
          // 총 페이백 금액
          const { data: paybacks } = await supabase
            .from('paybacks')
            .select('amount')
            .eq('user_id', userId)
            .eq('status', 'paid')

          const totalPayback = paybacks?.reduce((sum, p) => sum + p.amount, 0) || 0
          return totalPayback >= condition.value

        case 'streak':
          // 연속 참여 일수
          const { data: streak } = await supabase
            .from('user_streaks')
            .select('current_count')
            .eq('user_id', userId)
            .eq('type', 'daily_login')
            .single()

          return (streak?.current_count || 0) >= condition.value

        default:
          return false
      }
    } catch (error) {
      console.error('뱃지 조건 확인 오류:', error)
      return false
    }
  },

  // ===============================================
  // 연속 참여 시스템
  // ===============================================

  // 사용자 스트릭 정보 조회
  async getUserStreak(userId: string, type: StreakType): Promise<{ success: boolean; streak?: Streak; error?: string }> {
    try {
      const { data: streak, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .single()

      // 스트릭이 없으면 생성
      if (error && error.code === 'PGRST116') {
        const { data: newStreak, error: createError } = await supabase
          .from('user_streaks')
          .insert({
            user_id: userId,
            type: type,
            current_count: 0,
            max_count: 0,
            last_activity_at: new Date().toISOString(),
            bonus_multiplier: 1.0
          })
          .select()
          .single()

        if (createError) throw createError
        streak = newStreak
      } else if (error) {
        throw error
      }

      const result: Streak = {
        id: streak.id,
        userId: streak.user_id,
        type: streak.type,
        currentCount: streak.current_count,
        maxCount: streak.max_count,
        lastActivityAt: streak.last_activity_at,
        bonusMultiplier: streak.bonus_multiplier,
        createdAt: streak.created_at,
        updatedAt: streak.updated_at
      }

      return { success: true, streak: result }
    } catch (error) {
      console.error('스트릭 조회 오류:', error)
      return { success: false, error: '연속 참여 정보를 불러오는데 실패했습니다.' }
    }
  },

  // 스트릭 업데이트 (일일 로그인, 미션 완료 등)
  async updateStreak(userId: string, type: StreakType): Promise<{ success: boolean; streakBroken?: boolean; bonusEarned?: boolean; error?: string }> {
    try {
      const streakResult = await this.getUserStreak(userId, type)
      if (!streakResult.success || !streakResult.streak) {
        return { success: false, error: '스트릭 정보를 불러올 수 없습니다.' }
      }

      const currentStreak = streakResult.streak
      const now = new Date()
      const lastActivity = new Date(currentStreak.lastActivityAt)
      const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

      let streakBroken = false
      let bonusEarned = false
      let newCurrentCount = currentStreak.currentCount
      let newMaxCount = currentStreak.maxCount

      if (daysDiff === 0) {
        // 같은 날 - 스트릭 유지
        return { success: true, streakBroken: false, bonusEarned: false }
      } else if (daysDiff === 1) {
        // 연속 참여 - 스트릭 증가
        newCurrentCount += 1
        newMaxCount = Math.max(newMaxCount, newCurrentCount)

        // 스트릭 보너스 (7일마다)
        if (newCurrentCount % 7 === 0) {
          bonusEarned = true
          const bonusExperience = 50 * (newCurrentCount / 7) // 7일마다 50포인트씩 증가
          await this.addExperience(userId, bonusExperience, 'streak_bonus')
        }
      } else {
        // 스트릭 브레이크
        streakBroken = true
        newCurrentCount = 1 // 새로 시작
      }

      // 보너스 배수 계산 (연속 참여일수에 따라)
      const bonusMultiplier = Math.min(1 + (newCurrentCount * 0.1), 3.0) // 최대 3배

      // 스트릭 업데이트
      const { error: updateError } = await supabase
        .from('user_streaks')
        .update({
          current_count: newCurrentCount,
          max_count: newMaxCount,
          last_activity_at: now.toISOString(),
          bonus_multiplier: bonusMultiplier,
          updated_at: now.toISOString()
        })
        .eq('user_id', userId)
        .eq('type', type)

      if (updateError) throw updateError

      // 스트릭 보너스 알림
      if (bonusEarned) {
        await this.createNotification(userId, 'streak_bonus', {
          title: `🔥 ${newCurrentCount}일 연속 참여!`,
          message: `연속 참여 보너스로 경험치를 추가로 받았습니다!`,
          data: { streakCount: newCurrentCount, bonusMultiplier }
        })
      }

      return { success: true, streakBroken, bonusEarned }
    } catch (error) {
      console.error('스트릭 업데이트 오류:', error)
      return { success: false, error: '연속 참여 업데이트에 실패했습니다.' }
    }
  },

  // ===============================================
  // 알림 시스템
  // ===============================================

  // 알림 생성
  async createNotification(
    userId: string, 
    type: string, 
    data: { title: string; message: string; data?: any }
  ): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: type,
          title: data.title,
          message: data.message,
          data: data.data || {},
          is_read: false,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('알림 생성 오류:', error)
    }
  },

  // 사용자 알림 목록 조회
  async getUserNotifications(userId: string, limit: number = 20): Promise<{ success: boolean; notifications?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return { success: true, notifications: data || [] }
    } catch (error) {
      console.error('알림 조회 오류:', error)
      return { success: false, error: '알림을 불러오는데 실패했습니다.' }
    }
  }
}