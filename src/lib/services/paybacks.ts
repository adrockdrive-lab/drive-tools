import { supabase } from '@/lib/supabase'

export interface Payback {
  id: string
  user_id: string
  mission_id?: string
  amount: number
  status: 'pending' | 'paid' | 'cancelled'
  paid_at?: string
  created_at: string
  branch_id?: string
}

export const paybackService = {
  // 사용자의 페이백 목록 조회
  async getUserPaybacks(userId: string): Promise<{ success: boolean; paybacks?: Payback[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('paybacks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('페이백 조회 오류:', error)
        return { success: false, error: '페이백을 불러오는데 실패했습니다.' }
      }

      return { success: true, paybacks: data }
    } catch (error) {
      console.error('페이백 조회 오류:', error)
      return { success: false, error: '페이백을 불러오는데 실패했습니다.' }
    }
  },

  // 사용자의 총 페이백 금액 조회
  async getUserTotalPayback(userId: string): Promise<{ success: boolean; total?: number; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_total_payback', { user_uuid: userId })

      if (error) {
        console.error('총 페이백 조회 오류:', error)
        return { success: false, error: '총 페이백을 불러오는데 실패했습니다.' }
      }

      return { success: true, total: data || 0 }
    } catch (error) {
      console.error('총 페이백 조회 오류:', error)
      return { success: false, error: '총 페이백을 불러오는데 실패했습니다.' }
    }
  },

  // 지점별 페이백 통계 조회
  async getBranchPaybackStats(branchId: string): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('paybacks')
        .select(`
          amount,
          status,
          created_at,
          users!inner(branch_id)
        `)
        .eq('users.branch_id', branchId)

      if (error) {
        console.error('지점 페이백 통계 조회 오류:', error)
        return { success: false, error: '지점 페이백 통계를 불러오는데 실패했습니다.' }
      }

      const stats = {
        total_amount: data?.reduce((sum, p) => sum + p.amount, 0) || 0,
        pending_amount: data?.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0) || 0,
        paid_amount: data?.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0) || 0,
        total_count: data?.length || 0
      }

      return { success: true, stats }
    } catch (error) {
      console.error('지점 페이백 통계 조회 오류:', error)
      return { success: false, error: '지점 페이백 통계를 불러오는데 실패했습니다.' }
    }
  },

  // 페이백 상태 업데이트
  async updatePaybackStatus(paybackId: string, status: 'pending' | 'paid' | 'cancelled'): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = { status }

      if (status === 'paid') {
        updateData.paid_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('paybacks')
        .update(updateData)
        .eq('id', paybackId)

      if (error) {
        console.error('페이백 상태 업데이트 오류:', error)
        return { success: false, error: '페이백 상태를 업데이트하는데 실패했습니다.' }
      }

      return { success: true }
    } catch (error) {
      console.error('페이백 상태 업데이트 오류:', error)
      return { success: false, error: '페이백 상태를 업데이트하는데 실패했습니다.' }
    }
  }
}
