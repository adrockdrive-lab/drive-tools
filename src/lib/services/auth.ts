import { supabase } from '@/lib/supabase'
import { Permission, UserRole } from '@/types'

export interface RegisterData {
  name: string
  phone: string
  verificationCode: string
  storeId?: number // 지점 ID
  referralCode?: string // URL에서 추출한 추천 코드
}

export interface LoginData {
  phone: string
  verificationCode: string
}

export const authService = {
  // 휴대폰 번호 형식 통일 (하이픈 제거)
  normalizePhone(phone: string): string {
    return phone.replace(/[^\d]/g, '')
  },

  // SMS 인증 코드 전송 (개발용 - 실제 SMS 대신 DB에 저장)
  async sendVerificationCode(phone: string): Promise<{ success: boolean; error?: string }> {
    try {
      const normalizedPhone = this.normalizePhone(phone)
      console.log('SMS 인증 코드 전송:', { original: phone, normalized: normalizedPhone })

      // 개발용: 6자리 랜덤 코드 생성
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10분 후 만료

      // 기존 인증 코드 삭제
      await supabase
        .from('sms_verifications')
        .delete()
        .eq('phone', normalizedPhone)

      // 새 인증 코드 저장
      const { error } = await supabase
        .from('sms_verifications')
        .insert({
          phone: normalizedPhone,
          code,
          expires_at: expiresAt.toISOString(),
          verified: false
        })

      if (error) {
        console.error('인증 코드 저장 오류:', error)
        return { success: false, error: '인증 코드 생성에 실패했습니다.' }
      }

      // 개발용: 콘솔에 코드 출력
      console.log(`[개발용] ${normalizedPhone}로 전송된 인증 코드: ${code}`)

      // 테스트용: UI에서 사용할 수 있도록 코드 반환
      return { success: true, verificationCode: code }
    } catch (error) {
      console.error('SMS 전송 오류:', error)
      return { success: false, error: 'SMS 전송에 실패했습니다.' }
    }
  },

  // SMS 인증 코드 확인
  async verifyCode(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const normalizedPhone = this.normalizePhone(phone)
      console.log('인증 코드 확인 시도:', { original: phone, normalized: normalizedPhone, code })

      const { data, error } = await supabase
        .from('sms_verifications')
        .select('*')
        .eq('phone', normalizedPhone)
        .eq('code', code)
        .eq('verified', false)
        .gte('expires_at', new Date().toISOString())
        .single()

      console.log('인증 코드 조회 결과:', { data, error })

      if (error || !data) {
        console.log('인증 코드 검증 실패:', { error, data })
        return { success: false, error: '인증 코드가 올바르지 않거나 만료되었습니다.' }
      }

      // 인증 코드를 확인된 것으로 표시
      await supabase
        .from('sms_verifications')
        .update({ verified: true })
        .eq('id', data.id)

      console.log('인증 코드 확인 성공')
      return { success: true }
    } catch (error) {
      console.error('인증 코드 확인 오류:', error)
      return { success: false, error: '인증 코드 확인에 실패했습니다.' }
    }
  },

  // 회원가입 (지점 정보 포함)
  async register(data: RegisterData): Promise<{ success: boolean; user?: Record<string, unknown>; error?: string }> {
    try {
      // 1. 지점 정보 검증
      if (data.storeId) {
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('id', data.storeId)
          .single()

        if (storeError || !storeData) {
          return { success: false, error: '유효하지 않은 지점입니다.' }
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
      const normalizedPhone = this.normalizePhone(data.phone)
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          name: data.name,
          phone: normalizedPhone,
          phone_verified: true,
          store_id: data.storeId,
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
  async login(data: LoginData): Promise<{ success: boolean; user?: Record<string, unknown>; error?: string }> {
    try {
      const normalizedPhone = this.normalizePhone(data.phone)
      console.log('로그인 시도:', { original: data.phone, normalized: normalizedPhone, code: data.verificationCode })

      // SMS 인증 확인
      const verifyResult = await this.verifyCode(data.phone, data.verificationCode)
      if (!verifyResult.success) {
        console.log('SMS 인증 실패:', verifyResult.error)
        return { success: false, error: verifyResult.error }
      }

      console.log('SMS 인증 성공, 사용자 조회 중...')

      // 사용자 조회
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', normalizedPhone)
        .single()

      console.log('사용자 조회 결과:', { user, error })

      if (error || !user) {
        console.log('사용자를 찾을 수 없음:', { phone: normalizedPhone, error })
        return { success: false, error: '등록되지 않은 휴대폰 번호입니다.' }
      }

      console.log('로그인 성공:', user)
      return { success: true, user }
    } catch (error) {
      console.error('로그인 오류:', error)
      return { success: false, error: '로그인에 실패했습니다.' }
    }
  },

  // 고유 추천 코드 생성
  async generateUniqueReferralCode(): Promise<string> {
    while (true) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()

      const { error } = await supabase
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
      // 추천인 보너스 증가 (실제로는 RPC 함수나 별도 쿼리 사용)
      const { data: currentUser } = await supabase
        .from('users')
        .select('referral_bonus')
        .eq('id', referrerId)
        .single()

      if (currentUser) {
        await supabase
          .from('users')
          .update({
            referral_bonus: (currentUser.referral_bonus || 0) + 50000
          })
          .eq('id', referrerId)
      }

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
  extractUrlParams(): { storeId?: string; referralCode?: string } {
    if (typeof window === 'undefined') return {}

    const urlParams = new URLSearchParams(window.location.search)
    return {
      storeId: urlParams.get('store') || undefined,
      referralCode: urlParams.get('ref') || undefined
    }
  }
}

// 권한 확인 함수
export async function checkPermission(
  permissionName: string,
  resourceId?: string,
  resourceType?: 'branch' | 'store'
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase.rpc('check_user_permission', {
      p_user_id: user.id,
      p_permission_name: permissionName,
      p_resource_id: resourceId,
      p_resource_type: resourceType
    })

    if (error) throw error
    return data || false
  } catch (error) {
    console.error('Permission check error:', error)
    return false
  }
}

// 사용자 역할 조회
export async function getUserRoles(): Promise<{ success: boolean; data?: UserRole[]; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: '사용자 인증이 필요합니다.' }

    const { data, error } = await supabase.rpc('get_user_roles', {
      p_user_id: user.id
    })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Get user roles error:', error)
    return { success: false, error: '사용자 역할을 불러오는데 실패했습니다.' }
  }
}

// 사용자 권한 조회
export async function getUserPermissions(): Promise<{ success: boolean; data?: Permission[]; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: '사용자 인증이 필요합니다.' }

    const { data, error } = await supabase.rpc('get_user_permissions', {
      p_user_id: user.id
    })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Get user permissions error:', error)
    return { success: false, error: '사용자 권한을 불러오는데 실패했습니다.' }
  }
}

// 슈퍼 관리자 여부 확인
export async function isSuperAdmin(): Promise<boolean> {
  const rolesResult = await getUserRoles()
  if (!rolesResult.success || !rolesResult.data) return false

  return rolesResult.data.some(role => role.name === 'super_admin')
}

// 지점장 여부 확인
export async function isBranchManager(branchId?: string): Promise<boolean> {
  const rolesResult = await getUserRoles()
  if (!rolesResult.success || !rolesResult.data) return false

  const hasBranchManagerRole = rolesResult.data.some(role => role.name === 'branch_manager')

  if (!hasBranchManagerRole) return false

  if (branchId) {
    return await checkPermission('branches.read', branchId, 'branch')
  }

  return hasBranchManagerRole
}

// 매장 매니저 여부 확인
export async function isStoreManager(storeId?: number): Promise<boolean> {
  const rolesResult = await getUserRoles()
  if (!rolesResult.success || !rolesResult.data) return false

  const hasStoreManagerRole = rolesResult.data.some(role => role.name === 'store_manager')

  if (!hasStoreManagerRole) return false

  if (storeId) {
    return await checkPermission('stores.read', storeId.toString(), 'store')
  }

  return hasStoreManagerRole
}
