import { supabase } from '@/lib/supabase'
import type { Mission, UserMission, ProofData } from '@/types'

// 활성 미션 목록 조회
export async function getActiveMissions() {
  try {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('is_active', true)
      .order('id')

    if (error) throw error

    const missions: Mission[] = data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      rewardAmount: item.reward_amount,
      missionType: item.mission_type as any,
      isActive: item.is_active,
      createdAt: item.created_at
    }))

    return { missions, error: null }
  } catch (error) {
    console.error('Get missions error:', error)
    return { 
      missions: [], 
      error: error instanceof Error ? error.message : '미션 목록 조회에 실패했습니다.' 
    }
  }
}

// 사용자의 미션 진행상황 조회
export async function getUserMissions(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_missions')
      .select(`
        *,
        missions (
          id,
          title,
          description,
          reward_amount,
          mission_type
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const userMissions: UserMission[] = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      missionId: item.mission_id,
      status: item.status as any,
      proofData: item.proof_data,
      completedAt: item.completed_at,
      createdAt: item.created_at
    }))

    return { userMissions, error: null }
  } catch (error) {
    console.error('Get user missions error:', error)
    return { 
      userMissions: [], 
      error: error instanceof Error ? error.message : '사용자 미션 조회에 실패했습니다.' 
    }
  }
}

// 미션 시작 (사용자가 미션에 참여)
export async function startMission(userId: string, missionId: number) {
  try {
    // 이미 참여한 미션인지 확인
    const { data: existing } = await supabase
      .from('user_missions')
      .select('id')
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .single()

    if (existing) {
      return { userMission: null, error: '이미 참여한 미션입니다.' }
    }

    const { data, error } = await supabase
      .from('user_missions')
      .insert([
        {
          user_id: userId,
          mission_id: missionId,
          status: 'pending'
        }
      ])
      .select()
      .single()

    if (error) throw error

    const userMission: UserMission = {
      id: data.id,
      userId: data.user_id,
      missionId: data.mission_id,
      status: data.status as any,
      proofData: data.proof_data,
      completedAt: data.completed_at,
      createdAt: data.created_at
    }

    return { userMission, error: null }
  } catch (error) {
    console.error('Start mission error:', error)
    return { 
      userMission: null, 
      error: error instanceof Error ? error.message : '미션 시작에 실패했습니다.' 
    }
  }
}

// 미션 진행상태 업데이트
export async function updateMissionStatus(
  userMissionId: string, 
  status: 'pending' | 'in_progress' | 'completed' | 'verified',
  proofData?: ProofData
) {
  try {
    const updateData: any = { status }
    
    if (proofData) {
      updateData.proof_data = proofData
    }

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('user_missions')
      .update(updateData)
      .eq('id', userMissionId)
      .select()
      .single()

    if (error) throw error

    const userMission: UserMission = {
      id: data.id,
      userId: data.user_id,
      missionId: data.mission_id,
      status: data.status as any,
      proofData: data.proof_data,
      completedAt: data.completed_at,
      createdAt: data.created_at
    }

    return { userMission, error: null }
  } catch (error) {
    console.error('Update mission status error:', error)
    return { 
      userMission: null, 
      error: error instanceof Error ? error.message : '미션 상태 업데이트에 실패했습니다.' 
    }
  }
}

// 미션별 증명 데이터 제출
export async function submitMissionProof(
  userId: string,
  missionId: number,
  proofData: ProofData
) {
  try {
    // 사용자의 해당 미션 조회
    const { data: userMission, error: fetchError } = await supabase
      .from('user_missions')
      .select('*')
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .single()

    if (fetchError || !userMission) {
      throw new Error('참여하지 않은 미션입니다.')
    }

    // 증명 데이터와 함께 완료 상태로 업데이트
    const { data, error } = await supabase
      .from('user_missions')
      .update({
        status: 'completed',
        proof_data: proofData,
        completed_at: new Date().toISOString()
      })
      .eq('id', userMission.id)
      .select()
      .single()

    if (error) throw error

    const updatedUserMission: UserMission = {
      id: data.id,
      userId: data.user_id,
      missionId: data.mission_id,
      status: data.status as any,
      proofData: data.proof_data,
      completedAt: data.completed_at,
      createdAt: data.created_at
    }

    return { userMission: updatedUserMission, error: null }
  } catch (error) {
    console.error('Submit mission proof error:', error)
    return { 
      userMission: null, 
      error: error instanceof Error ? error.message : '미션 제출에 실패했습니다.' 
    }
  }
}