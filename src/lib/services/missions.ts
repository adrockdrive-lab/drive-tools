import { supabase } from '@/lib/supabase'
import { missionCache, withCache, CacheInvalidator } from '@/lib/utils/cache'
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
  // 사용자의 미션 참가 상태 조회 (캐시 적용)
  async getUserMissionParticipations(userId: string): Promise<{ success: boolean; participations?: MissionParticipation[]; error?: string }> {
    const cacheKey = `user_missions_${userId}`;
    
    try {
      const result = await withCache(
        missionCache,
        cacheKey,
        async () => {
          const { data, error } = await supabase
            .from('mission_participations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

          if (error) throw error
          return data;
        },
        3 * 60 * 1000 // 3분 캐시
      );

      const data = result;

      const participations: MissionParticipation[] = (data || []).map(p => ({
        id: p.id,
        userId: p.user_id,
        missionId: p.mission_definition_id,
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
        .eq('mission_definition_id', missionId)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        return { success: true, participation: undefined }
      }

      const participation: MissionParticipation = {
        id: data.id,
        userId: data.user_id,
        missionId: data.mission_definition_id,
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
        .from('mission_definitions')
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
          mission_definition_id: missionId,
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
        missionId: data.mission_definition_id,
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
        missionId: data.mission_definition_id,
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

      // 게이미피케이션 보상 처리
      await this.handleMissionRewards(userId, missionId, proofData)

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
          mission_definition_id: missionId,
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
        .from('mission_definitions')
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
  },

  // 챌린지 미션 조회
  async getChallengeMission(userId: string): Promise<{ success: boolean; mission?: any; userParticipation?: any; error?: string }> {
    try {
      if (!userId) {
        return { success: false, error: '사용자 인증이 필요합니다.' }
      }

      // 챌린지 미션 정의 조회
      const { data: missionDef, error: missionError } = await supabase
        .from('mission_definitions')
        .select('*')
        .eq('mission_type', 'challenge')
        .eq('is_active', true)
        .single()

      if (missionError) throw missionError

      // 사용자 참가 상태 조회
      const { data: participation, error: participationError } = await supabase
        .from('mission_participations')
        .select('*')
        .eq('user_id', userId)
        .eq('mission_definition_id', missionDef.id)
        .single()

      return {
        success: true,
        mission: missionDef,
        userParticipation: participation || null
      }
    } catch (error) {
      console.error('챌린지 미션 조회 오류:', error)
      return { success: false, error: '챌린지 미션을 불러오는데 실패했습니다.' }
    }
  },

  // 미션 시작 (새로운 API)
  async startMission(missionId: number, userId: string): Promise<{ success: boolean; participation?: any; error?: string }> {
    try {
      if (!userId) {
        return { success: false, error: '사용자 인증이 필요합니다.' }
      }

      // 기존 참여 확인
      const existingResult = await this.getMissionParticipation(userId, missionId)
      if (existingResult.success && existingResult.participation) {
        if (existingResult.participation.status === 'in_progress') {
          return { success: false, error: '이미 진행 중인 미션입니다.' }
        }
        if (existingResult.participation.status === 'completed') {
          return { success: false, error: '이미 완료된 미션입니다.' }
        }
      }

      const { data, error } = await supabase
        .from('mission_participations')
        .insert({
          user_id: userId,
          mission_definition_id: missionId,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, participation: data }
    } catch (error) {
      console.error('미션 시작 오류:', error)
      return { success: false, error: '미션을 시작하는데 실패했습니다.' }
    }
  },

  // 미션 제출 (승인 대기)
  async submitMission(participationId: string, proofData: Record<string, unknown>): Promise<{ success: boolean; participation?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('mission_participations')
        .update({
          status: 'submitted',
          completed_at: new Date().toISOString(),
          proof_data: proofData
        })
        .eq('id', participationId)
        .select()
        .single()

      if (error) throw error

      return { success: true, participation: data }
    } catch (error) {
      console.error('미션 제출 오류:', error)
      return { success: false, error: '미션을 제출하는데 실패했습니다.' }
    }
  },

  // 미션 완료 (새로운 API)
  async completeMission(participationId: string, proofData: Record<string, unknown>): Promise<{ success: boolean; participation?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('mission_participations')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          proof_data: proofData
        })
        .eq('id', participationId)
        .select()
        .single()

      if (error) throw error

      return { success: true, participation: data }
    } catch (error) {
      console.error('미션 완료 오류:', error)
      return { success: false, error: '미션을 완료하는데 실패했습니다.' }
    }
  },

  // 미션 완료 보상 처리 (게이미피케이션)
  async handleMissionRewards(userId: string, missionId: number, proofData: Record<string, unknown>): Promise<void> {
    try {
      console.log(`미션 보상 처리: 사용자 ${userId}, 미션 ${missionId}`)
      // 게이미피케이션 기능은 임시로 비활성화 (테이블 누락으로 인한 에러 방지)
      // TODO: 게이미피케이션 테이블 생성 후 활성화
    } catch (error) {
      console.error('미션 보상 처리 오류:', error)
      // 게이미피케이션 오류는 미션 완료를 방해하지 않음
    }
  },

  // 미션 목록 조회 (관리자용)
  async getMissions(filters?: any): Promise<{ success: boolean; missions?: Mission[]; error?: string }> {
    try {
      let query = supabase
        .from('mission_definitions')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.type) {
        query = query.eq('mission_type', filters.type)
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive)
      }

      const { data, error } = await query

      if (error) throw error

      const missions: Mission[] = data?.map(mission => ({
        id: mission.id,
        title: mission.title,
        description: mission.description,
        missionType: mission.mission_type,
        rewardAmount: parseFloat(mission.reward_amount),
        experiencePoints: mission.experience_points,
        maxParticipants: mission.max_participants,
        startDate: mission.start_date,
        endDate: mission.end_date,
        isActive: mission.is_active,
        createdAt: mission.created_at,
        updatedAt: mission.updated_at
      })) || []

      return { success: true, missions }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // 미션 생성
  async createMission(missionData: {
    title: string;
    description: string;
    type: 'challenge' | 'sns' | 'review' | 'attendance' | 'referral';
    rewardAmount: number;
    experiencePoints: number;
    maxParticipants?: number;
    startDate?: Date;
    endDate?: Date;
    isActive: boolean;
    isRepeating: boolean;
    repeatPattern?: 'daily' | 'weekly' | 'monthly';
    requirements: Record<string, any>;
    conditions: Record<string, any>;
    targetStores: string[];
    targetUserGroups: string[];
  }): Promise<{ success: boolean; mission?: Mission; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      const { data, error } = await supabase
        .from('mission_definitions')
        .insert({
          title: missionData.title,
          description: missionData.description,
          mission_type: missionData.type,
          reward_amount: missionData.rewardAmount,
          experience_points: missionData.experiencePoints,
          max_participants: missionData.maxParticipants,
          start_date: missionData.startDate?.toISOString(),
          end_date: missionData.endDate?.toISOString(),
          is_active: missionData.isActive,
          is_repeating: missionData.isRepeating,
          repeat_pattern: missionData.repeatPattern,
          requirements: missionData.requirements,
          conditions: missionData.conditions,
          target_stores: missionData.targetStores,
          target_user_groups: missionData.targetUserGroups,
          created_by: user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      const mission: Mission = {
        id: data.id,
        title: data.title,
        description: data.description,
        missionType: data.mission_type,
        rewardAmount: parseFloat(data.reward_amount),
        experiencePoints: data.experience_points,
        maxParticipants: data.max_participants,
        startDate: data.start_date,
        endDate: data.end_date,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { success: true, mission }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // 미션 수정
  async updateMission(id: number, updates: Partial<{
    title: string;
    description: string;
    rewardAmount: number;
    experiencePoints: number;
    maxParticipants?: number;
    startDate?: Date;
    endDate?: Date;
    isActive: boolean;
    requirements: Record<string, any>;
    conditions: Record<string, any>;
  }>): Promise<{ success: boolean; mission?: Mission; error?: string }> {
    try {
      const updateData: any = {}
      
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.rewardAmount !== undefined) updateData.reward_amount = updates.rewardAmount
      if (updates.experiencePoints !== undefined) updateData.experience_points = updates.experiencePoints
      if (updates.maxParticipants !== undefined) updateData.max_participants = updates.maxParticipants
      if (updates.startDate !== undefined) updateData.start_date = updates.startDate?.toISOString()
      if (updates.endDate !== undefined) updateData.end_date = updates.endDate?.toISOString()
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive
      if (updates.requirements !== undefined) updateData.requirements = updates.requirements
      if (updates.conditions !== undefined) updateData.conditions = updates.conditions
      
      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('mission_definitions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const mission: Mission = {
        id: data.id,
        title: data.title,
        description: data.description,
        missionType: data.mission_type,
        rewardAmount: parseFloat(data.reward_amount),
        experiencePoints: data.experience_points,
        maxParticipants: data.max_participants,
        startDate: data.start_date,
        endDate: data.end_date,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { success: true, mission }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // 미션 삭제
  async deleteMission(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('mission_definitions')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // 미션 복사
  async duplicateMission(id: number): Promise<{ success: boolean; mission?: Mission; error?: string }> {
    try {
      const { data: originalMission, error: fetchError } = await supabase
        .from('mission_definitions')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      const { data, error } = await supabase
        .from('mission_definitions')
        .insert({
          title: `${originalMission.title} (복사본)`,
          description: originalMission.description,
          mission_type: originalMission.mission_type,
          reward_amount: originalMission.reward_amount,
          experience_points: originalMission.experience_points,
          max_participants: originalMission.max_participants,
          requirements: originalMission.requirements,
          conditions: originalMission.conditions,
          target_stores: originalMission.target_stores,
          target_user_groups: originalMission.target_user_groups,
          is_active: false,
          is_repeating: originalMission.is_repeating,
          repeat_pattern: originalMission.repeat_pattern,
          created_by: user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      const mission: Mission = {
        id: data.id,
        title: data.title,
        description: data.description,
        missionType: data.mission_type,
        rewardAmount: parseFloat(data.reward_amount),
        experiencePoints: data.experience_points,
        maxParticipants: data.max_participants,
        startDate: data.start_date,
        endDate: data.end_date,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { success: true, mission }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // 관리자: 미션 승인
  async approveMission(participationId: string, adminNote?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 미션 참여 정보 조회
      const { data: participation, error: fetchError } = await supabase
        .from('mission_participations')
        .select('*, mission_definitions!inner(*)')
        .eq('id', participationId)
        .single()

      if (fetchError || !participation) {
        return { success: false, error: '미션 참여 정보를 찾을 수 없습니다.' }
      }

      if (participation.status !== 'submitted') {
        return { success: false, error: '제출된 미션만 승인할 수 있습니다.' }
      }

      // 미션 승인 처리
      const { error: updateError } = await supabase
        .from('mission_participations')
        .update({
          status: 'verified',
          admin_note: adminNote,
          verified_at: new Date().toISOString()
        })
        .eq('id', participationId)

      if (updateError) throw updateError

      // 페이백 승인 처리
      const { error: paybackError } = await supabase
        .from('paybacks')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          notes: adminNote
        })
        .eq('user_id', participation.user_id)
        .eq('mission_definition_id', participation.mission_definition_id)

      if (paybackError) {
        console.error('페이백 승인 오류:', paybackError)
      }

      return { success: true }
    } catch (error) {
      console.error('미션 승인 오류:', error)
      return { success: false, error: '미션 승인에 실패했습니다.' }
    }
  },

  // 관리자: 미션 반려
  async rejectMission(participationId: string, rejectReason: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 미션 참여 정보 조회
      const { data: participation, error: fetchError } = await supabase
        .from('mission_participations')
        .select('*')
        .eq('id', participationId)
        .single()

      if (fetchError || !participation) {
        return { success: false, error: '미션 참여 정보를 찾을 수 없습니다.' }
      }

      if (participation.status !== 'submitted') {
        return { success: false, error: '제출된 미션만 반려할 수 있습니다.' }
      }

      // 미션 반려 처리
      const { error: updateError } = await supabase
        .from('mission_participations')
        .update({
          status: 'rejected',
          admin_note: rejectReason,
          rejected_at: new Date().toISOString()
        })
        .eq('id', participationId)

      if (updateError) throw updateError

      // 페이백 반려 처리
      const { error: paybackError } = await supabase
        .from('paybacks')
        .update({
          status: 'rejected',
          rejection_reason: rejectReason,
          rejected_at: new Date().toISOString()
        })
        .eq('user_id', participation.user_id)
        .eq('mission_definition_id', participation.mission_definition_id)

      if (paybackError) {
        console.error('페이백 반려 오류:', paybackError)
      }

      return { success: true }
    } catch (error) {
      console.error('미션 반려 오류:', error)
      return { success: false, error: '미션 반려에 실패했습니다.' }
    }
  },

  // 관리자: 제출된 미션 목록 조회
  async getSubmittedMissions(filters?: { 
    missionType?: string; 
    storeId?: number; 
    status?: string; 
    page?: number; 
    limit?: number 
  }): Promise<{ success: boolean; missions?: any[]; total?: number; error?: string }> {
    try {
      const page = filters?.page || 1
      const limit = filters?.limit || 50
      const offset = (page - 1) * limit

      let query = supabase
        .from('mission_participations')
        .select(`
          *,
          users!inner (
            name,
            phone,
            store_id
          ),
          mission_definitions!inner (
            title,
            mission_type,
            reward_amount
          )
        `)
        .in('status', ['submitted', 'verified', 'rejected'])
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (filters?.missionType) {
        query = query.eq('mission_definitions.mission_type', filters.missionType)
      }

      if (filters?.storeId) {
        query = query.eq('users.store_id', filters.storeId)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error, count } = await query

      if (error) throw error

      return { 
        success: true, 
        missions: data || [], 
        total: count || 0 
      }
    } catch (error) {
      console.error('제출된 미션 조회 오류:', error)
      return { success: false, error: '제출된 미션을 불러오는데 실패했습니다.' }
    }
  }
}
