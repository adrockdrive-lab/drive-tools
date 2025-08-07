import { supabase } from '@/lib/supabase'
import type { Payback } from '@/types'

// 사용자의 페이백 내역 조회
export async function getUserPaybacks(userId: string) {
  try {
    const { data, error } = await supabase
      .from('paybacks')
      .select(`
        *,
        missions (
          id,
          title,
          mission_type
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const paybacks: Payback[] = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      missionId: item.mission_id,
      amount: item.amount,
      status: item.status as any,
      paidAt: item.paid_at,
      createdAt: item.created_at
    }))

    return { paybacks, error: null }
  } catch (error) {
    console.error('Get user paybacks error:', error)
    return { 
      paybacks: [], 
      error: error instanceof Error ? error.message : '페이백 내역 조회에 실패했습니다.' 
    }
  }
}

// 사용자의 총 페이백 통계
export async function getUserPaybackStats(userId: string) {
  try {
    const { data, error } = await supabase
      .from('paybacks')
      .select('amount, status')
      .eq('user_id', userId)

    if (error) throw error

    const stats = {
      totalPaybacks: data.length,
      totalAmount: data.reduce((sum, item) => sum + item.amount, 0),
      paidAmount: data.filter(item => item.status === 'paid').reduce((sum, item) => sum + item.amount, 0),
      pendingAmount: data.filter(item => item.status === 'pending').reduce((sum, item) => sum + item.amount, 0),
      cancelledAmount: data.filter(item => item.status === 'cancelled').reduce((sum, item) => sum + item.amount, 0)
    }

    return { stats, error: null }
  } catch (error) {
    console.error('Get payback stats error:', error)
    return { 
      stats: null, 
      error: error instanceof Error ? error.message : '페이백 통계 조회에 실패했습니다.' 
    }
  }
}

// 페이백 상태 업데이트 (관리자용)
export async function updatePaybackStatus(
  paybackId: string, 
  status: 'pending' | 'paid' | 'cancelled'
) {
  try {
    const updateData: any = { status }
    
    if (status === 'paid') {
      updateData.paid_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('paybacks')
      .update(updateData)
      .eq('id', paybackId)
      .select()
      .single()

    if (error) throw error

    const payback: Payback = {
      id: data.id,
      userId: data.user_id,
      missionId: data.mission_id,
      amount: data.amount,
      status: data.status as any,
      paidAt: data.paid_at,
      createdAt: data.created_at
    }

    return { payback, error: null }
  } catch (error) {
    console.error('Update payback status error:', error)
    return { 
      payback: null, 
      error: error instanceof Error ? error.message : '페이백 상태 업데이트에 실패했습니다.' 
    }
  }
}

// 대기중인 페이백 목록 조회 (관리자용)
export async function getPendingPaybacks() {
  try {
    const { data, error } = await supabase
      .from('paybacks')
      .select(`
        *,
        users (
          id,
          name,
          phone
        ),
        missions (
          id,
          title,
          mission_type
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error

    const paybacks: Payback[] = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      missionId: item.mission_id,
      amount: item.amount,
      status: item.status as any,
      paidAt: item.paid_at,
      createdAt: item.created_at
    }))

    return { paybacks, error: null }
  } catch (error) {
    console.error('Get pending paybacks error:', error)
    return { 
      paybacks: [], 
      error: error instanceof Error ? error.message : '대기중인 페이백 조회에 실패했습니다.' 
    }
  }
}