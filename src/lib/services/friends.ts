import { supabase } from '@/lib/supabase'

/**
 * 친구 시스템 서비스
 */

// 친구 요청 보내기
export async function sendFriendRequest(userId: string, friendId: string) {
  try {
    if (userId === friendId) {
      throw new Error('자기 자신에게는 친구 요청을 보낼 수 없습니다.')
    }

    // 이미 요청이 있는지 확인
    const { data: existing } = await supabase
      .from('friendships')
      .select('id')
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
      .single()

    if (existing) {
      throw new Error('이미 친구 관계가 존재합니다.')
    }

    // 친구 요청 생성
    const { data, error } = await supabase
      .from('friendships')
      .insert({
        user_id: userId,
        friend_id: friendId,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    // 알림 생성
    const { data: user } = await supabase.from('users').select('nickname').eq('id', userId).single()

    const { gamificationService } = await import('./gamification')
    await gamificationService.createNotification(friendId, 'friend_request', {
      title: '새로운 친구 요청',
      message: `${user?.nickname || '사용자'}님이 친구 요청을 보냈습니다.`,
      data: { requesterId: userId },
    })

    return { success: true, friendship: data }
  } catch (error) {
    console.error('Error sending friend request:', error)
    throw error
  }
}

// 친구 요청 수락
export async function acceptFriendRequest(userId: string, friendshipId: string) {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', friendshipId)
      .eq('friend_id', userId) // 요청을 받은 사람만 수락 가능
      .select()
      .single()

    if (error) throw error

    // 역방향 친구 관계도 생성 (양방향)
    await supabase.from('friendships').insert({
      user_id: userId,
      friend_id: data.user_id,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })

    return { success: true }
  } catch (error) {
    console.error('Error accepting friend request:', error)
    throw error
  }
}

// 친구 요청 거절
export async function rejectFriendRequest(userId: string, friendshipId: string) {
  try {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'rejected' })
      .eq('id', friendshipId)
      .eq('friend_id', userId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error rejecting friend request:', error)
    throw error
  }
}

// 친구 목록 조회
export async function getFriends(userId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .select('*, users!friendships_friend_id_fkey(id, nickname, avatar_url, level)')
    .eq('user_id', userId)
    .eq('status', 'accepted')
    .order('accepted_at', { ascending: false })

  if (error) throw error

  return data?.map((f) => ({
    friendshipId: f.id,
    friend: f.users,
    acceptedAt: f.accepted_at,
  })) || []
}

// 친구 요청 목록 (받은 요청)
export async function getFriendRequests(userId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .select('*, users!friendships_user_id_fkey(id, nickname, avatar_url, level)')
    .eq('friend_id', userId)
    .eq('status', 'pending')
    .order('requested_at', { ascending: false })

  if (error) throw error

  return data?.map((f) => ({
    friendshipId: f.id,
    requester: f.users,
    requestedAt: f.requested_at,
  })) || []
}

// 친구 삭제
export async function removeFriend(userId: string, friendId: string) {
  try {
    // 양방향 모두 삭제
    await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)

    return { success: true }
  } catch (error) {
    console.error('Error removing friend:', error)
    throw error
  }
}

// 친구 검색
export async function searchUsers(query: string, currentUserId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, nickname, avatar_url, level')
    .ilike('nickname', `%${query}%`)
    .neq('id', currentUserId)
    .limit(20)

  if (error) throw error

  return data || []
}
