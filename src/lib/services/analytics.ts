import { supabase } from '@/lib/supabase'

export interface BranchStatistics {
  totalUsers: number
  totalMissions: number
  completedMissions: number
  totalPayback: number
  completionRate: number
}

export interface BranchAnalytics {
  userGrowth: number
  missionCompletionTrend: number
  paybackTrend: number
  topMissions: Array<{
    missionType: string
    completionCount: number
  }>
}

export interface MonthlyStats {
  month: string
  userCount: number
  missionCount: number
  paybackAmount: number
}

export const analyticsService = {
  // 지점별 기본 통계
  async getBranchStatistics(storeId: number): Promise<{ success: boolean; data?: BranchStatistics; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('get_branch_statistics', { store_id: storeId })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('지점 통계 조회 오류:', error)
      return { success: false, error: '지점 통계를 불러오는데 실패했습니다.' }
    }
  },

  // 지점별 고급 분석
  async getBranchAnalytics(storeId: number): Promise<{ success: boolean; data?: BranchAnalytics; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('get_branch_analytics', { store_id: storeId })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('지점 분석 조회 오류:', error)
      return { success: false, error: '지점 분석을 불러오는데 실패했습니다.' }
    }
  },

  // 월간 통계
  async getBranchMonthlyStats(storeId: number, months: number = 12): Promise<{ success: boolean; data?: MonthlyStats[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('get_branch_monthly_stats', { 
          store_id: storeId,
          months_back: months 
        })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('월간 통계 조회 오류:', error)
      return { success: false, error: '월간 통계를 불러오는데 실패했습니다.' }
    }
  },

  // 미션별 통계
  async getBranchMissionStats(storeId: number): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('get_branch_mission_stats', { store_id: storeId })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('미션 통계 조회 오류:', error)
      return { success: false, error: '미션 통계를 불러오는데 실패했습니다.' }
    }
  },

  // 사용자 총 페이백 조회
  async getUserTotalPayback(userId: string): Promise<{ success: boolean; total?: number; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_total_payback', { user_uuid: userId })

      if (error) throw error

      return { success: true, total: data || 0 }
    } catch (error) {
      console.error('사용자 총 페이백 조회 오류:', error)
      return { success: false, error: '총 페이백을 불러오는데 실패했습니다.' }
    }
  }
}