import { supabase } from '@/lib/supabase'
import type { User, UserRegistrationData } from '@/types'

// 사용자 가입
export async function registerUser(userData: UserRegistrationData) {
  try {
    // 중복 전화번호 확인
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .eq('phone', userData.phone)

    if (existingUsers && existingUsers.length > 0) {
      throw new Error('이미 가입된 전화번호입니다.')
    }

    // 사용자 생성
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name: userData.name,
          phone: userData.phone,
          phone_verified: true
        }
      ])
      .select()
      .single()

    if (error) throw error

    const user: User = {
      id: data.id,
      name: data.name,
      phone: data.phone,
      phoneVerified: data.phone_verified,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    return { user, error: null }
  } catch (error) {
    console.error('Registration error:', error)
    return {
      user: null,
      error: error instanceof Error ? error.message : '회원가입에 실패했습니다.'
    }
  }
}

// 전화번호로 사용자 조회
export async function getUserByPhone(phone: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116은 데이터 없음

    if (!data) return { user: null, error: null }

    const user: User = {
      id: data.id,
      name: data.name,
      phone: data.phone,
      phoneVerified: data.phone_verified,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    return { user, error: null }
  } catch (error) {
    console.error('Get user error:', error)
    return {
      user: null,
      error: error instanceof Error ? error.message : '사용자 조회에 실패했습니다.'
    }
  }
}

// SMS 인증번호 생성 및 저장 (실제 환경에서는 SMS 발송 API 연동)
export async function sendSMSVerification(phone: string) {
  try {
    // 6자리 인증번호 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000) // 3분 후 만료

    // 기존 인증번호 삭제
    await supabase
      .from('sms_verifications')
      .delete()
      .eq('phone', phone)

    // 새 인증번호 저장
    const { error } = await supabase
      .from('sms_verifications')
      .insert([
        {
          phone,
          code,
          expires_at: expiresAt.toISOString()
        }
      ])

    if (error) throw error

    // TODO: 실제 SMS 발송 API 호출 (예: 네이버 클라우드 플랫폼, AWS SNS 등)
    console.log(`SMS 인증번호 발송: ${phone} -> ${code}`)

    return { code, error: null } // 개발용으로 코드 반환 (실제로는 null 반환)
  } catch (error) {
    console.error('SMS verification error:', error)
    return {
      code: null,
      error: error instanceof Error ? error.message : 'SMS 발송에 실패했습니다.'
    }
  }
}

// SMS 인증번호 확인
export async function verifySMSCode(phone: string, code: string) {
  try {
    const { data, error } = await supabase
      .from('sms_verifications')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (error || !data) {
      return { verified: false, error: '인증번호가 일치하지 않거나 만료되었습니다.' }
    }

    // 인증 완료 처리
    await supabase
      .from('sms_verifications')
      .update({ verified: true })
      .eq('id', data.id)

    return { verified: true, error: null }
  } catch (error) {
    console.error('SMS verification error:', error)
    return {
      verified: false,
      error: error instanceof Error ? error.message : '인증에 실패했습니다.'
    }
  }
}
