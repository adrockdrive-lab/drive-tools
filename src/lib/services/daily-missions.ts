import { supabase } from '@/lib/supabase'

/**
 * 일일 미션 시스템 서비스
 */

// 오늘의 일일 미션 할당
export async function assignDailyMissions(userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0]

    // 이미 오늘 할당된 미션이 있는지 확인
    const { count: existingCount } = await supabase
      .from('daily_missions')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('assigned_date', today)

    if (existingCount && existingCount > 0) {
      return { success: true, message: '이미 오늘의 미션이 할당되었습니다.' }
    }

    // 활성화된 템플릿 중 랜덤하게 5개 선택
    const { data: templates } = await supabase
      .from('daily_mission_templates')
      .select('*')
      .eq('is_active', true)

    if (!templates || templates.length === 0) {
      throw new Error('활성화된 미션 템플릿이 없습니다.')
    }

    // 가중치 기반 랜덤 선택
    const selectedTemplates = weightedRandomSample(templates, Math.min(5, templates.length))

    // 일일 미션 할당
    const missions = selectedTemplates.map((template) => ({
      user_id: userId,
      template_id: template.id,
      assigned_date: today,
      status: 'pending',
      progress: {},
    }))

    const { error } = await supabase.from('daily_missions').insert(missions)

    if (error) throw error

    return { success: true, missions }
  } catch (error) {
    console.error('Error assigning daily missions:', error)
    throw error
  }
}

// 가중치 기반 랜덤 샘플링
function weightedRandomSample(arr: any[], count: number) {
  const result = []
  const pool = [...arr]

  for (let i = 0; i < count && pool.length > 0; i++) {
    const totalWeight = pool.reduce((sum, item) => sum + (item.weight || 1), 0)
    let random = Math.random() * totalWeight

    for (let j = 0; j < pool.length; j++) {
      random -= pool[j].weight || 1
      if (random <= 0) {
        result.push(pool[j])
        pool.splice(j, 1)
        break
      }
    }
  }

  return result
}

// 사용자의 오늘 일일 미션 조회
export async function getTodayDailyMissions(userId: string) {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('daily_missions')
    .select('*, daily_mission_templates(*)')
    .eq('user_id', userId)
    .eq('assigned_date', today)
    .order('created_at')

  if (error) throw error

  return data || []
}

// 일일 미션 완료 처리
export async function completeDailyMission(userId: string, missionId: string, progressData: any = {}) {
  try {
    // 미션 업데이트
    const { data: mission, error: updateError } = await supabase
      .from('daily_missions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress: progressData,
      })
      .eq('id', missionId)
      .eq('user_id', userId)
      .select('*, daily_mission_templates(*)')
      .single()

    if (updateError) throw updateError

    const template = mission.daily_mission_templates

    // XP 및 코인 보상 지급
    const { gamificationService } = await import('./gamification')

    if (template.xp_reward) {
      await gamificationService.addExperience(userId, template.xp_reward, 'daily_mission_complete')
    }

    // TODO: 코인 지급 로직 추가 필요

    // 연속 출석 체크
    await updateConsecutiveDays(userId)

    // 모든 일일 미션 완료 시 보너스
    await checkAllDailyMissionsComplete(userId)

    return { success: true, mission, rewards: { xp: template.xp_reward, coins: template.coin_reward } }
  } catch (error) {
    console.error('Error completing daily mission:', error)
    throw error
  }
}

// 연속 출석 업데이트
async function updateConsecutiveDays(userId: string) {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('consecutive_days, last_check_in')
      .eq('id', userId)
      .single()

    if (!user) return

    const today = new Date()
    const lastCheckIn = user.last_check_in ? new Date(user.last_check_in) : null

    let newConsecutiveDays = user.consecutive_days || 0

    if (lastCheckIn) {
      const daysDiff = Math.floor((today.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === 1) {
        // 연속 출석
        newConsecutiveDays += 1
      } else if (daysDiff > 1) {
        // 연속 출석 끊김
        newConsecutiveDays = 1
      }
    } else {
      newConsecutiveDays = 1
    }

    await supabase
      .from('users')
      .update({
        consecutive_days: newConsecutiveDays,
        last_check_in: today.toISOString(),
      })
      .eq('id', userId)

    // 연속 출석 마일스톤 보상
    if ([7, 14, 30, 100].includes(newConsecutiveDays)) {
      const bonusXP = newConsecutiveDays * 10
      const { gamificationService } = await import('./gamification')
      await gamificationService.addExperience(userId, bonusXP, 'streak_milestone')
    }
  } catch (error) {
    console.error('Error updating consecutive days:', error)
  }
}

// 모든 일일 미션 완료 체크
async function checkAllDailyMissionsComplete(userId: string) {
  const today = new Date().toISOString().split('T')[0]

  const { data: missions } = await supabase
    .from('daily_missions')
    .select('status')
    .eq('user_id', userId)
    .eq('assigned_date', today)

  if (!missions) return

  const allCompleted = missions.every((m) => m.status === 'completed')

  if (allCompleted && missions.length > 0) {
    // 보너스 보상
    const bonusXP = 100
    const { gamificationService } = await import('./gamification')
    await gamificationService.addExperience(userId, bonusXP, 'all_daily_complete')

    await gamificationService.createNotification(userId, 'all_daily_complete', {
      title: '🎉 오늘의 모든 미션 완료!',
      message: `보너스 ${bonusXP} XP를 획득했습니다!`,
      data: { bonusXP },
    })
  }
}

// 미션 스킵 (코인 사용)
export async function skipDailyMission(userId: string, missionId: string) {
  try {
    const SKIP_COST = 100 // 코인

    // TODO: 코인 차감 로직 추가 필요

    const { error } = await supabase
      .from('daily_missions')
      .update({ status: 'skipped' })
      .eq('id', missionId)
      .eq('user_id', userId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error skipping daily mission:', error)
    throw error
  }
}

// 일일 미션 통계
export async function getDailyMissionStats(userId: string) {
  const { data: missions } = await supabase
    .from('daily_missions')
    .select('status, assigned_date')
    .eq('user_id', userId)

  if (!missions) return { totalCompleted: 0, completionRate: 0, streak: 0 }

  const totalCompleted = missions.filter((m) => m.status === 'completed').length
  const completionRate = missions.length > 0 ? (totalCompleted / missions.length) * 100 : 0

  return {
    totalCompleted,
    completionRate,
    totalAssigned: missions.length,
  }
}
