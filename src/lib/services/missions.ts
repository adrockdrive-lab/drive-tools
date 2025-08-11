import { supabase } from '@/lib/supabase'
import type { Mission, MissionStatus } from '@/types'

export interface MissionParticipation {
  id: string
  userId: string
  missionId: number
  status: MissionStatus
  startedAt: string | null
  completedAt: string | null
  proofData: Record<string, unknown> | null
  rewardAmount: number
  createdAt: string
  updatedAt: string
}

export const missionService = {
  // 사용자의 미션 참가 상태 조회
  async getUserMissionParticipations(userId: string): Promise<{ success: boolean; participations?: MissionParticipation[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('mission_participations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const participations: MissionParticipation[] = (data || []).map(p => ({
        id: p.id,
        userId: p.user_id,
        missionId: p.mission_id,
        status: p.status as MissionStatus,
        startedAt: p.started_at,
        completedAt: p.completed_at,
        proofData: p.proof_data,
        rewardAmount: p.reward_amount,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }))

      return { success: true, participations }
    } catch (error) {
      console.error('미션 참가 조회 오류:', error)
      return { success: false, error: '미션 참가 정보를 불러오는데 실패했습니다.' }
    }
  },

  // 특정 미션 참가 상태 조회
  async getMissionParticipation(userId: string, missionId: number): Promise<{ success: boolean; participation?: MissionParticipation; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('mission_participations')
        .select('*')
        .eq('user_id', userId)
        .eq('mission_id', missionId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (!data) {
        return { success: true, participation: undefined }
      }

      const participation: MissionParticipation = {
        id: data.id,
        userId: data.user_id,
        missionId: data.mission_id,
        status: data.status as MissionStatus,
        startedAt: data.started_at,
        completedAt: data.completed_at,
        proofData: data.proof_data,
        rewardAmount: data.reward_amount,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { success: true, participation }
    } catch (error) {
      console.error('미션 참가 조회 오류:', error)
      return { success: false, error: '미션 참가 정보를 불러오는데 실패했습니다.' }
    }
  },

  // 미션 참가 시작
  async startMissionParticipation(userId: string, missionId: number): Promise<{ success: boolean; participation?: MissionParticipation; error?: string }> {
    try {
      // 기존 참가 확인
      const existingResult = await this.getMissionParticipation(userId, missionId)
      if (existingResult.success && existingResult.participation) {
        if (existingResult.participation.status === 'in_progress') {
          return { success: false, error: '이미 진행 중인 미션입니다.' }
        }
        if (existingResult.participation.status === 'completed') {
          return { success: false, error: '이미 완료된 미션입니다.' }
        }
      }

      // 미션 정보 조회
      const { data: mission, error: missionError } = await supabase
        .from('missions')
        .select('*')
        .eq('id', missionId)
        .eq('is_active', true)
        .single()

      if (missionError || !mission) {
        return { success: false, error: '유효하지 않은 미션입니다.' }
      }

      // 참가 시작
      const { data, error } = await supabase
        .from('mission_participations')
        .upsert({
          user_id: userId,
          mission_id: missionId,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          reward_amount: mission.reward_amount
        })
        .select()
        .single()

      if (error) throw error

      const participation: MissionParticipation = {
        id: data.id,
        userId: data.user_id,
        missionId: data.mission_id,
        status: data.status as MissionStatus,
        startedAt: data.started_at,
        completedAt: data.completed_at,
        proofData: data.proof_data,
        rewardAmount: data.reward_amount,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { success: true, participation }
    } catch (error) {
      console.error('미션 참가 시작 오류:', error)
      return { success: false, error: '미션 참가를 시작하는데 실패했습니다.' }
    }
  },

  // 미션 완료
  async completeMissionParticipation(userId: string, missionId: number, proofData: Record<string, unknown>): Promise<{ success: boolean; participation?: MissionParticipation; error?: string }> {
    try {
      // 참가 상태 확인
      const participationResult = await this.getMissionParticipation(userId, missionId)
      if (!participationResult.success || !participationResult.participation) {
        return { success: false, error: '참가하지 않은 미션입니다.' }
      }

      const participation = participationResult.participation
      if (participation.status !== 'in_progress') {
        return { success: false, error: '진행 중인 미션이 아닙니다.' }
      }

      // 미션 완료
      const { data, error } = await supabase
        .from('mission_participations')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          proof_data: proofData
        })
        .eq('id', participation.id)
        .select()
        .single()

      if (error) throw error

      const updatedParticipation: MissionParticipation = {
        id: data.id,
        userId: data.user_id,
        missionId: data.mission_id,
        status: data.status as MissionStatus,
        startedAt: data.started_at,
        completedAt: data.completed_at,
        proofData: data.proof_data,
        rewardAmount: data.reward_amount,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      // 페이백 생성
      await this.createPayback(userId, missionId, participation.rewardAmount)

      return { success: true, participation: updatedParticipation }
    } catch (error) {
      console.error('미션 완료 오류:', error)
      return { success: false, error: '미션을 완료하는데 실패했습니다.' }
    }
  },

  // 페이백 생성
  async createPayback(_userId: string, missionId: number, amount: number): Promise<void> {
    try {
      await supabase
        .from('paybacks')
        .insert({
          user_id: _userId,
          mission_id: missionId,
          amount: amount,
          status: 'pending'
        })
    } catch (error) {
      console.error('페이백 생성 오류:', error)
    }
  },

  // 미션 목록 조회 (기존 함수 유지)
  async getUserMissions(_userId: string): Promise<{ success: boolean; missions?: Mission[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('is_active', true)
        .order('id')

      if (error) throw error

      const missions: Mission[] = (data || []).map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        rewardAmount: m.reward_amount,
        missionType: m.mission_type as Mission['missionType'],
        isActive: m.is_active,
        createdAt: m.created_at
      }))

      return { success: true, missions }
    } catch (error) {
      console.error('미션 조회 오류:', error)
      return { success: false, error: '미션을 불러오는데 실패했습니다.' }
    }
  }
}
