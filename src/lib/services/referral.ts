import { supabase } from '@/lib/supabase'
import type { Referral } from '@/types'

export const referralService = {
  // 추천 코드 생성 (사용자별 고유)
  generateReferralCode(userId: string, userName: string): string {
    // 사용자 이름 앞 2글자 + 사용자 ID 뒷 6자리 + 랜덤 2글자
    const namePrefix = userName.substring(0, 2).toUpperCase()
    const userIdSuffix = userId.slice(-6)
    const randomSuffix = Math.random().toString(36).substring(2, 4).toUpperCase()
    return `${namePrefix}${userIdSuffix}${randomSuffix}`
  },

  // 사용자의 추천 코드 조회 또는 생성
  async getUserReferralCode(userId: string): Promise<{ success: boolean; referralCode?: string; error?: string }> {
    try {
      // 사용자 정보와 기존 추천 코드 확인
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('referral_code, name')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      let referralCode = user.referral_code

      // 추천 코드가 없으면 생성
      if (!referralCode) {
        referralCode = this.generateReferralCode(userId, user.name)

        // 중복 체크 및 재생성
        let isUnique = false
        let attempts = 0
        while (!isUnique && attempts < 5) {
          const { count } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('referral_code', referralCode)

          if (count === 0) {
            isUnique = true
          } else {
            referralCode = this.generateReferralCode(userId, user.name)
            attempts++
          }
        }

        if (!isUnique) {
          return { success: false, error: '추천 코드 생성에 실패했습니다.' }
        }

        // 사용자 테이블에 추천 코드 저장
        const { error: updateError } = await supabase
          .from('users')
          .update({ referral_code: referralCode })
          .eq('id', userId)

        if (updateError) throw updateError
      }

      return { success: true, referralCode }
    } catch (error) {
      console.error('추천 코드 조회/생성 오류:', error)
      return { success: false, error: '추천 코드를 불러오는데 실패했습니다.' }
    }
  },

  // 추천인 등록 (회원가입 시)
  async registerReferral(newUserId: string, referralCode: string): Promise<{ success: boolean; referrer?: { id: string; name: string }; error?: string }> {
    try {
      if (!referralCode) {
        return { success: true } // 추천 코드 없이도 가입 가능
      }

      // 추천인 찾기
      const { data: referrer, error: referrerError } = await supabase
        .from('users')
        .select('id, name')
        .eq('referral_code', referralCode)
        .single()

      if (referrerError || !referrer) {
        return { success: false, error: '유효하지 않은 추천 코드입니다.' }
      }

      // 자기 자신을 추천하는 경우 방지
      if (referrer.id === newUserId) {
        return { success: false, error: '본인의 추천 코드는 사용할 수 없습니다.' }
      }

      // 추천 관계 생성
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrer.id,
          referee_id: newUserId,
          is_verified: false,
          reward_paid: false,
          created_at: new Date().toISOString()
        })

      if (referralError) throw referralError

      // 추천인에게 즉시 보상 지급 (페이백은 나중에 승인 후)
      const { gamificationService } = await import('./gamification')
      
      // 추천 성공 경험치 지급
      await gamificationService.addExperience(referrer.id, 100, 'referral_success')
      
      // 추천 성공 알림
      await gamificationService.createNotification(referrer.id, 'referral_success', {
        title: '🎉 친구 추천 성공!',
        message: `${referrer.name}님이 추천으로 가입했습니다. 경험치 100포인트를 받았습니다!`,
        data: { newUserName: referrer.name }
      })

      return { 
        success: true, 
        referrer: { id: referrer.id, name: referrer.name }
      }
    } catch (error) {
      console.error('추천인 등록 오류:', error)
      return { success: false, error: '추천인 등록에 실패했습니다.' }
    }
  },

  // 추천 현황 조회
  async getReferralStatus(userId: string): Promise<{ 
    success: boolean; 
    data?: {
      referralCode: string;
      totalReferrals: number;
      verifiedReferrals: number;
      pendingRewards: number;
      paidRewards: number;
      referrals: Referral[];
    }; 
    error?: string 
  }> {
    try {
      // 추천 코드 조회
      const codeResult = await this.getUserReferralCode(userId)
      if (!codeResult.success || !codeResult.referralCode) {
        return { success: false, error: '추천 코드를 불러오는데 실패했습니다.' }
      }

      // 추천 목록 조회
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          *,
          referee:users!referrals_referee_id_fkey(name, phone, created_at)
        `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false })

      if (referralsError) throw referralsError

      const referralList: Referral[] = (referrals || []).map(r => ({
        id: r.id,
        referrerId: r.referrer_id,
        refereeName: r.referee?.name || '알 수 없음',
        refereePhone: r.referee?.phone || '',
        isVerified: r.is_verified,
        rewardPaid: r.reward_paid,
        storeId: r.store_id,
        createdAt: r.created_at
      }))

      // 통계 계산
      const totalReferrals = referralList.length
      const verifiedReferrals = referralList.filter(r => r.isVerified).length
      const pendingRewards = referralList.filter(r => r.isVerified && !r.rewardPaid).length * 50000
      const paidRewards = referralList.filter(r => r.rewardPaid).length * 50000

      return {
        success: true,
        data: {
          referralCode: codeResult.referralCode,
          totalReferrals,
          verifiedReferrals,
          pendingRewards,
          paidRewards,
          referrals: referralList
        }
      }
    } catch (error) {
      console.error('추천 현황 조회 오류:', error)
      return { success: false, error: '추천 현황을 불러오는데 실패했습니다.' }
    }
  },

  // 추천 검증 (관리자)
  async verifyReferral(referralId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('referrals')
        .update({
          is_verified: true,
          verified_at: new Date().toISOString()
        })
        .eq('id', referralId)

      if (error) throw error

      // 추천인에게 검증 완료 알림
      const { data: referral } = await supabase
        .from('referrals')
        .select('referrer_id, referee:users!referrals_referee_id_fkey(name)')
        .eq('id', referralId)
        .single()

      if (referral) {
        const { gamificationService } = await import('./gamification')
        await gamificationService.createNotification(referral.referrer_id, 'referral_success', {
          title: '✅ 추천 검증 완료',
          message: `${referral.referee.name}님의 추천이 검증되었습니다. 페이백을 받을 수 있습니다!`,
          data: { referralId }
        })
      }

      return { success: true }
    } catch (error) {
      console.error('추천 검증 오류:', error)
      return { success: false, error: '추천 검증에 실패했습니다.' }
    }
  },

  // 추천 보상 지급 (관리자)
  async payReferralReward(referralId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 추천 정보 조회
      const { data: referral, error: fetchError } = await supabase
        .from('referrals')
        .select('*')
        .eq('id', referralId)
        .single()

      if (fetchError || !referral) {
        return { success: false, error: '추천 정보를 찾을 수 없습니다.' }
      }

      if (!referral.is_verified) {
        return { success: false, error: '검증되지 않은 추천입니다.' }
      }

      if (referral.reward_paid) {
        return { success: false, error: '이미 보상이 지급된 추천입니다.' }
      }

      // 페이백 생성
      const { error: paybackError } = await supabase
        .from('paybacks')
        .insert({
          user_id: referral.referrer_id,
          mission_definition_id: null, // 추천 보상은 미션과 별개
          amount: 50000, // 추천당 5만원
          status: 'paid',
          paid_at: new Date().toISOString(),
          description: '친구 추천 보상'
        })

      if (paybackError) throw paybackError

      // 추천 보상 지급 상태 업데이트
      const { error: updateError } = await supabase
        .from('referrals')
        .update({
          reward_paid: true,
          reward_paid_at: new Date().toISOString()
        })
        .eq('id', referralId)

      if (updateError) throw updateError

      return { success: true }
    } catch (error) {
      console.error('추천 보상 지급 오류:', error)
      return { success: false, error: '추천 보상 지급에 실패했습니다.' }
    }
  },

  // 추천 링크 생성
  generateReferralLink(referralCode: string, baseUrl: string = 'https://your-domain.com'): string {
    return `${baseUrl}/register?ref=${referralCode}`
  }
}