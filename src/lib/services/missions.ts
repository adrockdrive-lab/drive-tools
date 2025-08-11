import { supabase } from '@/lib/supabase'

export interface Mission {
  id: string
  title: string
  description: string
  reward_amount: number
  mission_type: string
  status: 'active' | 'completed' | 'pending' | 'in_progress'
  branch_id?: string
  branch_name?: string
  created_at: string
  completed_at?: string
}

export interface MissionInstance {
  id: string
  branch_id: string
  mission_template_id: number
  title: string
  description: string
  reward_amount: number
  start_date: string
  end_date: string
  is_active: boolean
}

export interface UserMission {
  id: string
  user_id: string
  mission_instance_id: string
  status: 'pending' | 'in_progress' | 'completed'
  created_at: string
  completed_at?: string
  proof_url?: string
  branch_id?: string
}



export const missionService = {
  // 사용자의 지점별 미션 목록 조회
  async getUserMissions(userId: string): Promise<{ success: boolean; missions?: Mission[]; error?: string }> {
    try {
      // 사용자 정보 조회
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('branch_id')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('사용자 조회 오류:', userError)
        return { success: false, error: '사용자 정보를 불러오는데 실패했습니다.' }
      }

      // 사용자의 지점별 미션 인스턴스 조회
      const { data: missions, error: missionError } = await supabase
        .from('mission_instances')
        .select(`
          id,
          title,
          description,
          reward_amount,
          start_date,
          end_date,
          is_active,
          mission_templates!inner(
            mission_type_id,
            mission_types!inner(name)
          ),
          branches!inner(name)
        `)
        .eq('branch_id', user.branch_id)
        .eq('is_active', true)

      if (missionError) {
        console.error('미션 조회 오류:', missionError)
        return { success: false, error: '미션을 불러오는데 실패했습니다.' }
      }

      // 사용자의 미션 진행 상태 조회
      const { data: userMissions, error: userMissionError } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', userId)

      if (userMissionError) {
        console.error('사용자 미션 조회 오류:', userMissionError)
      }

      // 미션 데이터 변환
      const formattedMissions = (missions || []).map((mission: Record<string, unknown>) => {
        const userMission = userMissions?.find((um: Record<string, unknown>) => um.mission_instance_id === mission.id)
        return {
          id: mission.id,
          title: mission.title,
          description: mission.description,
          reward_amount: mission.reward_amount,
          mission_type: 'challenge', // 임시로 고정값 사용
          status: userMission?.status || 'pending',
          branch_id: user.branch_id,
          branch_name: '드라이빙존', // 임시로 고정값 사용
          created_at: mission.start_date,
          completed_at: userMission?.completed_at
        }
      })

      return { success: true, missions: formattedMissions as Mission[] }
    } catch (error) {
      console.error('미션 조회 오류:', error)
      return { success: false, error: '미션을 불러오는데 실패했습니다.' }
    }
  },

  // 특정 미션 시작
  async startMission(userId: string, missionInstanceId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_missions')
        .insert({
          user_id: userId,
          mission_instance_id: missionInstanceId,
          status: 'in_progress'
        })

      if (error) {
        console.error('미션 시작 오류:', error)
        return { success: false, error: '미션을 시작하는데 실패했습니다.' }
      }

      return { success: true }
    } catch (error) {
      console.error('미션 시작 오류:', error)
      return { success: false, error: '미션을 시작하는데 실패했습니다.' }
    }
  },

  // 미션 완료
  async completeMission(userId: string, missionInstanceId: string, proofUrl?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_missions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          proof_url: proofUrl
        })
        .eq('user_id', userId)
        .eq('mission_instance_id', missionInstanceId)

      if (error) {
        console.error('미션 완료 오류:', error)
        return { success: false, error: '미션을 완료하는데 실패했습니다.' }
      }

      return { success: true }
    } catch (error) {
      console.error('미션 완료 오류:', error)
      return { success: false, error: '미션을 완료하는데 실패했습니다.' }
    }
  },

  // 미션 타입별 통계 조회
  async getMissionStats(): Promise<{ success: boolean; stats?: Record<string, unknown>; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('get_branch_mission_stats', { branch_code: 'default' }) // 실제로는 사용자의 지점 코드 사용

      if (error) {
        console.error('미션 통계 조회 오류:', error)
        return { success: false, error: '미션 통계를 불러오는데 실패했습니다.' }
      }

      return { success: true, stats: data }
    } catch (error) {
      console.error('미션 통계 조회 오류:', error)
      return { success: false, error: '미션 통계를 불러오는데 실패했습니다.' }
    }
  },

  // 지점별 미션 템플릿 조회
  async getBranchMissionTemplates(): Promise<{ success: boolean; templates?: Record<string, unknown>[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('mission_templates')
        .select(`
          id,
          title,
          description,
          reward_amount,
          requirements,
          mission_types!inner(name)
        `)
        .eq('is_active', true)

      if (error) {
        console.error('미션 템플릿 조회 오류:', error)
        return { success: false, error: '미션 템플릿을 불러오는데 실패했습니다.' }
      }

      return { success: true, templates: data }
    } catch (error) {
      console.error('미션 템플릿 조회 오류:', error)
      return { success: false, error: '미션 템플릿을 불러오는데 실패했습니다.' }
    }
  }
}

// 개별 함수 export
export const { startMission, completeMission, getUserMissions, getMissionStats, getBranchMissionTemplates } = missionService
