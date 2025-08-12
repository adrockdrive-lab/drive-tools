import { supabase } from '@/lib/supabase';
import type { Admin, MissionStatus, MissionType, PaybackStatus, ProofData, UserMissionData } from '@/types';

export const adminService = {
  // 어드민 로그인
  async login(email: string, password: string): Promise<{ success: boolean; admin?: Admin; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // 어드민 정보 조회
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      if (adminError) throw adminError

      const admin: Admin = {
        id: adminData.id,
        name: adminData.name,
        email: adminData.email,
        storeId: adminData.store_id,
        role: adminData.role,
        isActive: adminData.is_active,
        createdAt: adminData.created_at,
        updatedAt: adminData.updated_at
      }

      return { success: true, admin }
    } catch (error) {
      console.error('Admin login error:', error)
      return { success: false, error: '로그인에 실패했습니다.' }
    }
  },

  // 전체 사용자 미션 데이터 조회
  async getUserMissions(storeId?: number): Promise<{ success: boolean; data?: UserMissionData[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_missions')
        .select(`
          id,
          status,
          proof_data,
          completed_at,
          created_at,
          users!inner(
            name,
            phone
          ),
          missions!inner(
            title,
            mission_type,
            reward_amount
          ),
          paybacks(
            status,
            amount
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const userMissions: UserMissionData[] = data.map((item: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        id: item.id,
        userName: item.users.name,
        userPhone: item.users.phone,
        missionTitle: item.missions.title,
        missionType: item.missions.mission_type as MissionType,
        status: item.status as MissionStatus,
        startedAt: item.created_at,
        completedAt: item.completed_at,
        rewardAmount: item.missions.reward_amount,
        proofData: item.proof_data as ProofData | null,
        paybackStatus: (item.paybacks?.[0]?.status as PaybackStatus) || null,
        paybackAmount: item.paybacks?.[0]?.amount || null,
        createdAt: item.created_at
      }))

      return { success: true, data: userMissions }
    } catch (error) {
      console.error('Get user missions error:', error)
      return { success: false, error: '사용자 미션 데이터를 불러오는데 실패했습니다.' }
    }
  },

  // 페이백 승인
  async approvePayback(participationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 미션 참여 정보 조회
      const { data: participation, error: participationError } = await supabase
        .from('user_missions')
        .select(`
          *,
          missions!inner(reward_amount)
        `)
        .eq('id', participationId)
        .single()

      if (participationError) throw participationError

      // 페이백 생성 또는 업데이트
      const { error: paybackError } = await supabase
        .from('paybacks')
        .upsert({
          user_id: participation.user_id,
          mission_id: participation.mission_id,
          amount: participation.missions.reward_amount,
          status: 'paid',
          paid_at: new Date().toISOString()
        })

      if (paybackError) throw paybackError

      return { success: true }
    } catch (error) {
      console.error('Approve payback error:', error)
      return { success: false, error: '페이백 승인에 실패했습니다.' }
    }
  },

  // 페이백 거부
  async rejectPayback(participationId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 미션 참여 정보 조회
      const { data: participation, error: participationError } = await supabase
        .from('user_missions')
        .select(`
          *,
          missions!inner(reward_amount)
        `)
        .eq('id', participationId)
        .single()

      if (participationError) throw participationError

      // 페이백 생성 (거부 상태)
      const { error: paybackError } = await supabase
        .from('paybacks')
        .upsert({
          user_id: participation.user_id,
          mission_id: participation.mission_id,
          amount: participation.missions.reward_amount,
          status: 'rejected',
          paid_at: null,
          rejection_reason: reason
        })

      if (paybackError) throw paybackError

      return { success: true }
    } catch (error) {
      console.error('Reject payback error:', error)
      return { success: false, error: '페이백 거부에 실패했습니다.' }
    }
  },

  // 전체 통계 조회 (storeId 제거 - 모든 데이터 조회)
  async getStoreStats(storeId?: number): Promise<{
    success: boolean;
    stats?: {
      totalUsers: number
      totalMissions: number
      completedMissions: number
      totalPayback: number
      completionRate: number
    };
    error?: string
  }> {
    try {
      // 총 사용자 수
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // 총 미션 참여 수
      const { count: totalMissions } = await supabase
        .from('user_missions')
        .select('*', { count: 'exact', head: true })

      // 완료된 미션 수
      const { count: completedMissions } = await supabase
        .from('user_missions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

      // 총 페이백 금액
      const { data: paybacks } = await supabase
        .from('paybacks')
        .select('amount')
        .eq('status', 'paid')

      const totalPayback = paybacks?.reduce((sum, p) => sum + p.amount, 0) || 0

      const stats = {
        totalUsers: totalUsers || 0,
        totalMissions: totalMissions || 0,
        completedMissions: completedMissions || 0,
        totalPayback,
        completionRate: totalMissions ? Math.round((completedMissions || 0) / totalMissions * 100) : 0
      }

      return { success: true, stats }
    } catch (error) {
      console.error('Get store stats error:', error)
      return { success: false, error: '통계 데이터를 불러오는데 실패했습니다.' }
    }
  }
}
