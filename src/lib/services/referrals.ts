import { supabase } from '@/lib/supabase'
import type { Referral } from '@/types'

// Database referral type for queries with specific fields
type DatabaseReferralResult = {
  id: string
  referee_name: string
  referee_phone: string
  created_at: string
}

// 사용자의 추천 내역 조회
export async function getUserReferrals(userId: string) {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const referrals: Referral[] = data.map(item => ({
      id: item.id,
      referrerId: item.referrer_id,
      refereeName: item.referee_name,
      refereePhone: item.referee_phone,
      isVerified: item.is_verified,
      rewardPaid: item.reward_paid,
      createdAt: item.created_at
    }))

    return { referrals, error: null }
  } catch (error) {
    console.error('Get user referrals error:', error)
    return {
      referrals: [],
      error: error instanceof Error ? error.message : '추천 내역 조회에 실패했습니다.'
    }
  }
}

// 친구 추천 등록
export async function addReferral(
  referrerId: string,
  refereeName: string,
  refereePhone: string
) {
  try {
    // 중복 추천 확인
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', referrerId)
      .eq('referee_phone', refereePhone)
      .single()

    if (existing) {
      return { referral: null, error: '이미 추천한 친구입니다.' }
    }

    const { data, error } = await supabase
      .from('referrals')
      .insert([
        {
          referrer_id: referrerId,
          referee_name: refereeName,
          referee_phone: refereePhone,
          is_verified: false,
          reward_paid: false
        }
      ])
      .select()
      .single()

    if (error) throw error

    const referral: Referral = {
      id: data.id,
      referrerId: data.referrer_id,
      refereeName: data.referee_name,
      refereePhone: data.referee_phone,
      isVerified: data.is_verified,
      rewardPaid: data.reward_paid,
      createdAt: data.created_at
    }

    return { referral, error: null }
  } catch (error) {
    console.error('Add referral error:', error)
    return {
      referral: null,
      error: error instanceof Error ? error.message : '추천 등록에 실패했습니다.'
    }
  }
}

// 추천인이 회원가입 시 추천 인증 처리
export async function verifyReferral(refereePhone: string) {
  try {
    // 해당 전화번호로 된 추천 찾기
    const { data: referrals, error: fetchError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referee_phone', refereePhone)
      .eq('is_verified', false)

    if (fetchError) throw fetchError

    if (!referrals || referrals.length === 0) {
      return { verifiedCount: 0, error: null }
    }

    // 모든 해당 추천을 인증 처리
    const { error: updateError } = await supabase
      .from('referrals')
      .update({ is_verified: true })
      .eq('referee_phone', refereePhone)
      .eq('is_verified', false)

    if (updateError) throw updateError

    // 추천 미션 완료 확인 및 페이백 생성
    for (const referral of referrals) {
      await checkReferralMissionCompletion(referral.referrer_id)
    }

    return { verifiedCount: referrals.length, error: null }
  } catch (error) {
    console.error('Verify referral error:', error)
    return {
      verifiedCount: 0,
      error: error instanceof Error ? error.message : '추천 인증에 실패했습니다.'
    }
  }
}

// 추천 미션 완료 확인 및 페이백 생성
async function checkReferralMissionCompletion(referrerId: string) {
  try {
    // 인증된 추천 수 확인
    const { data: verifiedReferrals, error: countError } = await supabase
      .from('referrals')
      .select('id, referee_name, referee_phone, created_at')
      .eq('referrer_id', referrerId)
      .eq('is_verified', true)

    if (countError) throw countError

    const verifiedCount = verifiedReferrals?.length || 0

    // 5명 이상 추천 시 미션 완료 처리
    if (verifiedCount >= 5) {
      // 추천 미션 ID 조회 (mission_type이 'referral'인 미션)
      const { data: referralMission, error: missionError } = await supabase
        .from('missions')
        .select('id, reward_amount')
        .eq('mission_type', 'referral')
        .eq('is_active', true)
        .single()

      if (missionError || !referralMission) return

      // 사용자가 해당 미션에 참여했는지 확인
      const { data: userMission, error: userMissionError } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', referrerId)
        .eq('mission_id', referralMission.id)
        .single()

      if (userMissionError || !userMission) return

      // 미션이 아직 완료되지 않았다면 완료 처리
      if (userMission.status !== 'completed' && userMission.status !== 'verified') {
        await supabase
          .from('user_missions')
          .update({
            status: 'completed',
            proof_data: {
              type: 'referral',
              referrals: verifiedReferrals.map((ref: DatabaseReferralResult) => ({
                name: ref.referee_name,
                phone: ref.referee_phone,
                registeredAt: ref.created_at,
                verified: true
              })),
              submittedAt: new Date().toISOString()
            },
            completed_at: new Date().toISOString()
          })
          .eq('id', userMission.id)
      }
    }
  } catch (error) {
    console.error('Check referral mission completion error:', error)
  }
}

// 추천 통계
export async function getReferralStats(userId: string) {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('is_verified, reward_paid')
      .eq('referrer_id', userId)

    if (error) throw error

    const stats = {
      totalReferrals: data.length,
      verifiedReferrals: data.filter(item => item.is_verified).length,
      pendingReferrals: data.filter(item => !item.is_verified).length,
      paidRewards: data.filter(item => item.reward_paid).length
    }

    return { stats, error: null }
  } catch (error) {
    console.error('Get referral stats error:', error)
    return {
      stats: null,
      error: error instanceof Error ? error.message : '추천 통계 조회에 실패했습니다.'
    }
  }
}
