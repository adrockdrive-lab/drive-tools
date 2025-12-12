import { supabase } from '@/lib/supabase'

/**
 * 스토리 미션 시스템 서비스
 */

// 모든 챕터 조회
export async function getAllChapters() {
  const { data, error } = await supabase
    .from('story_chapters')
    .select('*')
    .order('chapter_number')

  if (error) throw error
  return data || []
}

// 특정 챕터의 미션 목록
export async function getChapterMissions(chapterId: string) {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('chapter_id', chapterId)
    .eq('is_story_mission', true)
    .order('mission_order')

  if (error) throw error
  return data || []
}

// 사용자의 챕터 진행 상황
export async function getUserChapterProgress(userId: string) {
  try {
    // 모든 챕터 가져오기
    const chapters = await getAllChapters()

    const progress = await Promise.all(
      chapters.map(async (chapter) => {
        // 챕터의 미션들
        const missions = await getChapterMissions(chapter.id)

        // 사용자의 완료한 미션들
        const { data: completedMissions } = await supabase
          .from('mission_participations')
          .select('mission_id')
          .eq('user_id', userId)
          .eq('status', 'approved')
          .in(
            'mission_id',
            missions.map((m) => m.id)
          )

        const completedCount = completedMissions?.length || 0
        const totalCount = missions.length
        const isUnlocked = await checkChapterUnlocked(userId, chapter)
        const isCompleted = totalCount > 0 && completedCount === totalCount

        return {
          chapter,
          missions,
          completedCount,
          totalCount,
          progress: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
          isUnlocked,
          isCompleted,
        }
      })
    )

    return progress
  } catch (error) {
    console.error('Error getting user chapter progress:', error)
    throw error
  }
}

// 챕터 언락 조건 확인
async function checkChapterUnlocked(userId: string, chapter: any): Promise<boolean> {
  // 챕터 1은 항상 언락
  if (chapter.chapter_number === 1) return true

  // unlock_condition이 없으면 언락
  if (!chapter.unlock_condition) return true

  const condition = chapter.unlock_condition as any

  // 이전 챕터 완료 조건
  if (condition.type === 'previous_chapter_complete') {
    const prevChapterNum = chapter.chapter_number - 1

    const { data: prevChapter } = await supabase
      .from('story_chapters')
      .select('id')
      .eq('chapter_number', prevChapterNum)
      .single()

    if (!prevChapter) return false

    // 이전 챕터의 모든 미션 완료 확인
    const missions = await getChapterMissions(prevChapter.id)

    const { count } = await supabase
      .from('mission_participations')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'approved')
      .in(
        'mission_id',
        missions.map((m) => m.id)
      )

    return count === missions.length
  }

  return false
}

// 스토리 미션 시작
export async function startStoryMission(userId: string, missionId: string) {
  try {
    // 미션 정보 가져오기
    const { data: mission } = await supabase.from('missions').select('*').eq('id', missionId).single()

    if (!mission) throw new Error('미션을 찾을 수 없습니다.')

    // 미션 언락 조건 확인
    if (mission.unlock_condition) {
      const isUnlocked = await checkMissionUnlocked(userId, mission)
      if (!isUnlocked) {
        throw new Error('아직 언락되지 않은 미션입니다.')
      }
    }

    // 미션 참여 기록 생성
    const { data, error } = await supabase
      .from('mission_participations')
      .insert({
        user_id: userId,
        mission_id: missionId,
        status: 'in_progress',
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, participation: data }
  } catch (error) {
    console.error('Error starting story mission:', error)
    throw error
  }
}

// 미션 언락 조건 확인
async function checkMissionUnlocked(userId: string, mission: any): Promise<boolean> {
  if (!mission.unlock_condition) return true

  const condition = mission.unlock_condition as any

  // 이전 미션 완료 조건
  if (condition.type === 'previous_mission_complete' && condition.mission_id) {
    const { data } = await supabase
      .from('mission_participations')
      .select('status')
      .eq('user_id', userId)
      .eq('mission_id', condition.mission_id)
      .single()

    return data?.status === 'approved'
  }

  // 레벨 조건
  if (condition.type === 'min_level' && condition.level) {
    const { data: user } = await supabase.from('users').select('level').eq('id', userId).single()

    return (user?.level || 0) >= condition.level
  }

  return true
}

// 스토리 미션 완료 처리
export async function completeStoryMission(
  userId: string,
  missionId: string,
  proofData: any
) {
  try {
    // 참여 기록 업데이트
    const { data: participation, error: updateError } = await supabase
      .from('mission_participations')
      .update({
        status: 'pending_review',
        proof_data: proofData,
        submitted_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .select('*, missions(*)')
      .single()

    if (updateError) throw updateError

    return { success: true, participation }
  } catch (error) {
    console.error('Error completing story mission:', error)
    throw error
  }
}

// 미션 승인 및 보상 지급 (관리자용)
export async function approveMission(participationId: string) {
  try {
    // 참여 기록 가져오기
    const { data: participation } = await supabase
      .from('mission_participations')
      .select('*, missions(*)')
      .eq('id', participationId)
      .single()

    if (!participation) throw new Error('참여 기록을 찾을 수 없습니다.')

    // 상태 업데이트
    await supabase
      .from('mission_participations')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', participationId)

    const mission = participation.missions

    // 보상 지급
    const { gamificationService } = await import('./gamification')

    if (mission.xp_reward) {
      await gamificationService.addExperience(
        participation.user_id,
        mission.xp_reward,
        'story_mission_complete'
      )
    }

    // TODO: 코인 및 캐시 보상 지급

    // 챕터 완료 확인
    await checkChapterCompletion(participation.user_id, mission.chapter_id)

    return { success: true }
  } catch (error) {
    console.error('Error approving mission:', error)
    throw error
  }
}

// 챕터 완료 확인 및 보너스
async function checkChapterCompletion(userId: string, chapterId: string) {
  if (!chapterId) return

  const missions = await getChapterMissions(chapterId)

  const { count } = await supabase
    .from('mission_participations')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .eq('status', 'approved')
    .in(
      'mission_id',
      missions.map((m) => m.id)
    )

  // 모든 미션 완료 시
  if (count === missions.length && missions.length > 0) {
    const { data: chapter } = await supabase
      .from('story_chapters')
      .select('chapter_number, title')
      .eq('id', chapterId)
      .single()

    if (chapter) {
      // 챕터 완료 보너스
      const bonusXP = 500
      const { gamificationService } = await import('./gamification')
      await gamificationService.addExperience(userId, bonusXP, 'chapter_complete')

      await gamificationService.createNotification(userId, 'chapter_complete', {
        title: `🎊 챕터 ${chapter.chapter_number} 완료!`,
        message: `"${chapter.title}"를 완료했습니다! 보너스 ${bonusXP} XP를 획득했습니다.`,
        data: { chapterId, chapterNumber: chapter.chapter_number, bonusXP },
      })
    }
  }
}
