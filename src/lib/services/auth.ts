import { createClient } from '@/lib/supabase'

export interface RegisterData {
  name: string
  phone: string
  verificationCode: string
  branchCode?: string // URL에서 추출한 지점 코드
  referralCode?: string // URL에서 추출한 추천 코드
}

export interface LoginData {
  phone: string
  verificationCode: string
}

export const authService = {
  // SMS 인증 코드 전송
  async sendVerificationCode(phone: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()

      const { error } = await supabase.functions.invoke('send-sms-verification', {
        body: { phone }
      })

      if (error) {
        console.error('SMS 전송 오류:', error)
        return { success: false, error: 'SMS 전송에 실패했습니다.' }
      }

      return { success: true }
    } catch (error) {
      console.error('SMS 전송 오류:', error)
      return { success: false, error: 'SMS 전송에 실패했습니다.' }
    }
  },

  // SMS 인증 코드 확인
  async verifyCode(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('sms_verifications')
        .select('*')
        .eq('phone', phone)
        .eq('code', code)
        .eq('verified', false)
        .gte('expires_at', new Date().toISOString())
        .single()

      if (error || !data) {
        return { success: false, error: '인증 코드가 올바르지 않거나 만료되었습니다.' }
      }

      // 인증 코드를 확인된 것으로 표시
      await supabase
        .from('sms_verifications')
        .update({ verified: true })
        .eq('id', data.id)

      return { success: true }
    } catch (error) {
      console.error('인증 코드 확인 오류:', error)
      return { success: false, error: '인증 코드 확인에 실패했습니다.' }
    }
  },

  // 회원가입 (지점 정보 포함)
  async register(data: RegisterData): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const supabase = createClient()

      // 1. 지점 정보 조회
      let branchId = null
      if (data.branchCode) {
        const { data: branchData, error: branchError } = await supabase
          .from('branches')
          .select('id')
          .eq('code', data.branchCode)
          .eq('is_active', true)
          .single()

        if (!branchError && branchData) {
          branchId = branchData.id
        }
      }

      // 2. 추천인 정보 조회
      let referredBy = null
      if (data.referralCode) {
        const { data: referrerData, error: referrerError } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', data.referralCode)
          .single()

        if (!referrerError && referrerData) {
          referredBy = referrerData.id
        }
      }

      // 3. 고유 추천 코드 생성
      const referralCode = await this.generateUniqueReferralCode()

      // 4. 사용자 생성
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          name: data.name,
          phone: data.phone,
          phone_verified: true,
          branch_id: branchId,
          referral_code: referralCode,
          referred_by: referredBy
        })
        .select()
        .single()

      if (error) {
        console.error('회원가입 오류:', error)
        return { success: false, error: '회원가입에 실패했습니다.' }
      }

      // 5. 추천인 보너스 처리 (있는 경우)
      if (referredBy) {
        await this.processReferralBonus(referredBy, user.id)
      }

      return { success: true, user }
    } catch (error) {
      console.error('회원가입 오류:', error)
      return { success: false, error: '회원가입에 실패했습니다.' }
    }
  },

  // 로그인
  async login(data: LoginData): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const supabase = createClient()

      // SMS 인증 확인
      const verifyResult = await this.verifyCode(data.phone, data.verificationCode)
      if (!verifyResult.success) {
        return { success: false, error: verifyResult.error }
      }

      // 사용자 조회
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', data.phone)
        .single()

      if (error || !user) {
        return { success: false, error: '등록되지 않은 휴대폰 번호입니다.' }
      }

      return { success: true, user }
    } catch (error) {
      console.error('로그인 오류:', error)
      return { success: false, error: '로그인에 실패했습니다.' }
    }
  },

  // 고유 추천 코드 생성
  async generateUniqueReferralCode(): Promise<string> {
    const supabase = createClient()

    while (true) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()

      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', code)
        .single()

      if (error && error.code === 'PGRST116') {
        // 코드가 존재하지 않음 - 사용 가능
        return code
      }
    }
  },

  // 추천 보너스 처리
  async processReferralBonus(referrerId: string, referredId: string): Promise<void> {
    try {
      const supabase = createClient()

      // 추천인 보너스 증가
      await supabase
        .from('users')
        .update({
          referral_bonus: supabase.sql`referral_bonus + 50000`
        })
        .eq('id', referrerId)

      // 추천 관계 기록
      await supabase
        .from('user_referrals')
        .insert({
          referrer_id: referrerId,
          referred_id: referredId,
          reward_amount: 50000
        })

    } catch (error) {
      console.error('추천 보너스 처리 오류:', error)
    }
  },

  // URL에서 지점 및 추천 정보 추출
  extractUrlParams(): { branchCode?: string; referralCode?: string } {
    if (typeof window === 'undefined') return {}

    const urlParams = new URLSearchParams(window.location.search)
    return {
      branchCode: urlParams.get('branch') || undefined,
      referralCode: urlParams.get('ref') || undefined
    }
  }
}
