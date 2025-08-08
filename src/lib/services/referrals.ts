import { supabase } from '@/lib/supabase'

export interface Referral {
  id: string
  referrer_id: string
  referee_name: string
  referee_phone: string
  is_verified: boolean
  reward_paid: boolean
  created_at: string
  branch_id?: string
}

export interface UserReferral {
  id: string
  referrer_id: string
  referred_id: string
  reward_amount: number
  created_at: string
}

export const referralService = {
  // 사용자의 추천 목록 조회
  async getUserReferrals(userId: string): Promise<{ success: boolean; referrals?: Referral[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('추천 조회 오류:', error)
        return { success: false, error: '추천 목록을 불러오는데 실패했습니다.' }
      }

      return { success: true, referrals: data }
    } catch (error) {
      console.error('추천 조회 오류:', error)
      return { success: false, error: '추천 목록을 불러오는데 실패했습니다.' }
    }
  },

  // 추천인 관계 조회
  async getUserReferralRelations(userId: string): Promise<{ success: boolean; relations?: UserReferral[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_referrals')
        .select('*')
        .or(`referrer_id.eq.${userId},referred_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('추천인 관계 조회 오류:', error)
        return { success: false, error: '추천인 관계를 불러오는데 실패했습니다.' }
      }

      return { success: true, relations: data }
    } catch (error) {
      console.error('추천인 관계 조회 오류:', error)
      return { success: false, error: '추천인 관계를 불러오는데 실패했습니다.' }
    }
  },

  // 새로운 추천 추가
  async addReferral(referrerId: string, refereeName: string, refereePhone: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrerId,
          referee_name: refereeName,
          referee_phone: refereePhone,
          is_verified: false,
          reward_paid: false
        })

      if (error) {
        console.error('추천 추가 오류:', error)
        return { success: false, error: '추천을 추가하는데 실패했습니다.' }
      }

      return { success: true }
    } catch (error) {
      console.error('추천 추가 오류:', error)
      return { success: false, error: '추천을 추가하는데 실패했습니다.' }
    }
  },

  // 추천 보너스 조회
  async getUserReferralBonus(userId: string): Promise<{ success: boolean; bonus?: number; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('referral_bonus')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('추천 보너스 조회 오류:', error)
        return { success: false, error: '추천 보너스를 불러오는데 실패했습니다.' }
      }

      return { success: true, bonus: data?.referral_bonus || 0 }
    } catch (error) {
      console.error('추천 보너스 조회 오류:', error)
      return { success: false, error: '추천 보너스를 불러오는데 실패했습니다.' }
    }
  },

  // 지점별 추천 통계 조회
  async getBranchReferralStats(branchId: string): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_referrals')
        .select(`
          reward_amount,
          created_at,
          users!inner(branch_id)
        `)
        .eq('users.branch_id', branchId)

      if (error) {
        console.error('지점 추천 통계 조회 오류:', error)
        return { success: false, error: '지점 추천 통계를 불러오는데 실패했습니다.' }
      }

      const stats = {
        total_referrals: data?.length || 0,
        total_rewards: data?.reduce((sum, r) => sum + r.reward_amount, 0) || 0,
        this_month: data?.filter(r => {
          const created = new Date(r.created_at)
          const now = new Date()
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
        }).length || 0
      }

      return { success: true, stats }
    } catch (error) {
      console.error('지점 추천 통계 조회 오류:', error)
      return { success: false, error: '지점 추천 통계를 불러오는데 실패했습니다.' }
    }
  },

  // 추천 코드로 사용자 조회
  async getUserByReferralCode(referralCode: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, phone')
        .eq('referral_code', referralCode)
        .single()

      if (error) {
        console.error('추천 코드 사용자 조회 오류:', error)
        return { success: false, error: '유효하지 않은 추천 코드입니다.' }
      }

      return { success: true, user: data }
    } catch (error) {
      console.error('추천 코드 사용자 조회 오류:', error)
      return { success: false, error: '유효하지 않은 추천 코드입니다.' }
    }
  }
}
