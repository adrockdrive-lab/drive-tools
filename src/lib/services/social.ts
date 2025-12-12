import { supabase } from '@/lib/supabase'
import { userCache, withCache, CacheInvalidator } from '@/lib/utils/cache'

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked' | 'cancelled'
export type PostVisibility = 'public' | 'friends' | 'private'
export type AchievementCategory = 'mission' | 'social' | 'streak' | 'payback' | 'referral' | 'special'
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary'

export interface Friendship {
  id: number
  requesterId: string
  addresseeId: string
  status: FriendshipStatus
  createdAt: string
  updatedAt: string
}

export interface UserStatistics {
  userId: string
  totalMissionsCompleted: number
  totalExperiencePoints: number
  currentLevel: number
  currentStreak: number
  maxStreak: number
  totalPaybackEarned: number
  totalReferrals: number
  friendsCount: number
  likesReceived: number
  weeklyScore: number
  monthlyScore: number
  lastActivityAt: string
}

export interface MissionPost {
  id: number
  userId: string
  missionParticipationId?: number
  title: string
  content?: string
  imageUrls: string[]
  tags: string[]
  visibility: PostVisibility
  likesCount: number
  commentsCount: number
  sharesCount: number
  viewsCount: number
  isFeatured: boolean
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    phone: string
  }
}

export interface PostComment {
  id: number
  postId: number
  userId: string
  parentCommentId?: number
  content: string
  likesCount: number
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
  }
}

export interface Achievement {
  id: number
  code: string
  name: string
  description: string
  iconUrl?: string
  category: AchievementCategory
  tier: AchievementTier
  points: number
  requirements: Record<string, any>
  isHidden: boolean
}

export interface UserProfile {
  userId: string
  bio?: string
  avatarUrl?: string
  coverImageUrl?: string
  location?: string
  websiteUrl?: string
  isPublic: boolean
  showAchievements: boolean
  showStatistics: boolean
  allowFriendRequests: boolean
  socialLinks: Record<string, string>
}

export const socialService = {
  // ============================================================================
  // 친구 시스템
  // ============================================================================
  
  async sendFriendRequest(addresseeId: string): Promise<{ success: boolean; friendship?: Friendship; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      // 기존 친구 관계 확인
      const { data: existingFriendship } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${user.id})`)
        .single()

      if (existingFriendship) {
        return { success: false, error: '이미 친구 관계가 존재합니다' }
      }

      const { data, error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: addresseeId,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      // 알림 생성
      await this.createSocialNotification(
        addresseeId,
        'friend_request',
        `새로운 친구 요청이 도착했습니다`,
        { requesterId: user.id }
      )

      // 캐시 무효화
      CacheInvalidator.invalidatePattern(`friends_${user.id}`)
      CacheInvalidator.invalidatePattern(`friends_${addresseeId}`)

      const friendship: Friendship = {
        id: data.id,
        requesterId: data.requester_id,
        addresseeId: data.addressee_id,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { success: true, friendship }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async respondToFriendRequest(friendshipId: number, accept: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      const status = accept ? 'accepted' : 'cancelled'

      const { data, error } = await supabase
        .from('friendships')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', friendshipId)
        .eq('addressee_id', user.id) // 수신자만 응답 가능
        .select()
        .single()

      if (error) throw error

      if (accept) {
        // 친구 승인 알림 생성
        await this.createSocialNotification(
          data.requester_id,
          'friend_accepted',
          `친구 요청이 승인되었습니다`,
          { friendId: user.id }
        )
      }

      // 캐시 무효화
      CacheInvalidator.invalidatePattern(`friends_${user.id}`)
      CacheInvalidator.invalidatePattern(`friends_${data.requester_id}`)

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async getFriends(userId: string): Promise<{ success: boolean; friends?: any[]; error?: string }> {
    const cacheKey = `friends_${userId}`
    
    try {
      const result = await withCache(
        userCache,
        cacheKey,
        async () => {
          const { data, error } = await supabase
            .from('friendships')
            .select(`
              id,
              requester_id,
              addressee_id,
              status,
              created_at,
              updated_at,
              requester:users!friendships_requester_id_fkey (
                id, name, phone
              ),
              addressee:users!friendships_addressee_id_fkey (
                id, name, phone
              )
            `)
            .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
            .eq('status', 'accepted')
            .order('updated_at', { ascending: false })

          if (error) throw error

          // 친구 목록 포맷팅 (상대방 정보만 반환)
          const friends = data?.map(friendship => {
            const friend = friendship.requester_id === userId 
              ? friendship.addressee 
              : friendship.requester
            
            return {
              ...friend,
              friendshipId: friendship.id,
              friendshipCreatedAt: friendship.created_at
            }
          }) || []

          return friends
        },
        5 * 60 * 1000 // 5분 캐시
      )

      return { success: true, friends: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async getFriendRequests(userId: string): Promise<{ success: boolean; requests?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          requester_id,
          created_at,
          requester:users!friendships_requester_id_fkey (
            id, name, phone
          )
        `)
        .eq('addressee_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      const requests = data?.map(request => ({
        id: request.id,
        requester: request.requester,
        createdAt: request.created_at
      })) || []

      return { success: true, requests }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // ============================================================================
  // 사용자 통계 (리더보드용)
  // ============================================================================

  async getUserStatistics(userId: string): Promise<{ success: boolean; statistics?: UserStatistics; error?: string }> {
    const cacheKey = `user_stats_${userId}`
    
    try {
      const result = await withCache(
        userCache,
        cacheKey,
        async () => {
          const { data, error } = await supabase
            .from('user_statistics')
            .select('*')
            .eq('user_id', userId)
            .single()

          if (error) {
            // 통계가 없으면 생성
            if (error.code === 'PGRST116') {
              await this.initializeUserStatistics(userId)
              return this.getUserStatistics(userId)
            }
            throw error
          }

          const statistics: UserStatistics = {
            userId: data.user_id,
            totalMissionsCompleted: data.total_missions_completed,
            totalExperiencePoints: data.total_experience_points,
            currentLevel: data.current_level,
            currentStreak: data.current_streak,
            maxStreak: data.max_streak,
            totalPaybackEarned: parseFloat(data.total_payback_earned),
            totalReferrals: data.total_referrals,
            friendsCount: data.friends_count,
            likesReceived: data.likes_received,
            weeklyScore: data.weekly_score,
            monthlyScore: data.monthly_score,
            lastActivityAt: data.last_activity_at
          }

          return statistics
        },
        2 * 60 * 1000 // 2분 캐시
      )

      return { success: true, statistics: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async initializeUserStatistics(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_statistics')
        .upsert({
          user_id: userId,
          total_missions_completed: 0,
          total_experience_points: 0,
          current_level: 1,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async getLeaderboard(type: 'missions' | 'experience' | 'payback' | 'weekly' | 'monthly' = 'experience', limit: number = 50): Promise<{ success: boolean; leaderboard?: any[]; error?: string }> {
    const cacheKey = `leaderboard_${type}_${limit}`
    
    try {
      const result = await withCache(
        userCache,
        cacheKey,
        async () => {
          const orderColumn = {
            missions: 'total_missions_completed',
            experience: 'total_experience_points',
            payback: 'total_payback_earned',
            weekly: 'weekly_score',
            monthly: 'monthly_score'
          }[type]

          const { data, error } = await supabase
            .from('user_statistics')
            .select(`
              user_id,
              ${orderColumn},
              current_level,
              user:users!user_statistics_user_id_fkey (
                id, name, phone
              )
            `)
            .order(orderColumn, { ascending: false })
            .limit(limit)

          if (error) throw error

          const leaderboard = data?.map((item, index) => ({
            rank: index + 1,
            user: item.user,
            score: item[orderColumn as keyof typeof item],
            level: item.current_level
          })) || []

          return leaderboard
        },
        60 * 1000 // 1분 캐시
      )

      return { success: true, leaderboard: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // ============================================================================
  // 소셜 알림 생성
  // ============================================================================

  async createSocialNotification(
    userId: string, 
    type: string, 
    message: string, 
    data?: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title: '소셜 알림',
          message,
          data: data || {},
          created_at: new Date().toISOString()
        })

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // ============================================================================
  // 사용자 프로필 관리
  // ============================================================================

  async getUserProfile(userId: string): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    const cacheKey = `user_profile_${userId}`
    
    try {
      const result = await withCache(
        userCache,
        cacheKey,
        async () => {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()

          if (error) {
            // 프로필이 없으면 기본 프로필 생성
            if (error.code === 'PGRST116') {
              await this.createUserProfile(userId)
              return this.getUserProfile(userId)
            }
            throw error
          }

          const profile: UserProfile = {
            userId: data.user_id,
            bio: data.bio,
            avatarUrl: data.avatar_url,
            coverImageUrl: data.cover_image_url,
            location: data.location,
            websiteUrl: data.website_url,
            isPublic: data.is_public,
            showAchievements: data.show_achievements,
            showStatistics: data.show_statistics,
            allowFriendRequests: data.allow_friend_requests,
            socialLinks: data.social_links || {}
          }

          return profile
        },
        5 * 60 * 1000 // 5분 캐시
      )

      return { success: true, profile: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async createUserProfile(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          is_public: true,
          show_achievements: true,
          show_statistics: true,
          allow_friend_requests: true,
          social_links: {},
          created_at: new Date().toISOString()
        })

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async updateUserProfile(profile: UserProfile): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      if (profile.userId !== user.id) {
        throw new Error('본인의 프로필만 수정할 수 있습니다')
      }

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: profile.userId,
          bio: profile.bio,
          avatar_url: profile.avatarUrl,
          cover_image_url: profile.coverImageUrl,
          location: profile.location,
          website_url: profile.websiteUrl,
          is_public: profile.isPublic,
          show_achievements: profile.showAchievements,
          show_statistics: profile.showStatistics,
          allow_friend_requests: profile.allowFriendRequests,
          social_links: profile.socialLinks,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // 캐시 무효화
      CacheInvalidator.invalidatePattern(`user_profile_${profile.userId}`)

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // ============================================================================
  // 미션 포스트 및 소셜 피드
  // ============================================================================

  async getMissionPosts(
    feedType: 'public' | 'friends' | 'featured' = 'public',
    userId?: string,
    limit: number = 20
  ): Promise<{ success: boolean; posts?: MissionPost[]; error?: string }> {
    const cacheKey = `mission_posts_${feedType}_${userId || 'all'}_${limit}`
    
    try {
      const result = await withCache(
        userCache,
        cacheKey,
        async () => {
          let queryBuilder = supabase
            .from('mission_posts')
            .select(`
              id,
              user_id,
              mission_participation_id,
              title,
              content,
              image_urls,
              tags,
              visibility,
              likes_count,
              comments_count,
              shares_count,
              views_count,
              is_featured,
              created_at,
              updated_at,
              user:users!mission_posts_user_id_fkey (
                id, name, phone
              )
            `)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(limit)

          // 피드 타입에 따른 필터링
          if (feedType === 'featured') {
            queryBuilder = queryBuilder.eq('is_featured', true)
          } else if (feedType === 'friends') {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('로그인이 필요합니다')
            
            // 친구들의 포스트만 가져오기
            const { data: friendships } = await supabase
              .from('friendships')
              .select('requester_id, addressee_id')
              .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
              .eq('status', 'accepted')

            const friendIds = friendships?.map(f => 
              f.requester_id === user.id ? f.addressee_id : f.requester_id
            ) || []
            
            if (friendIds.length === 0) {
              return []
            }
            
            queryBuilder = queryBuilder.in('user_id', friendIds)
          }

          // 특정 사용자의 포스트만
          if (userId) {
            queryBuilder = queryBuilder.eq('user_id', userId)
          }

          // 공개 포스트만 또는 본인 포스트
          if (feedType !== 'friends') {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
              queryBuilder = queryBuilder.or(`visibility.eq.public,user_id.eq.${user.id}`)
            } else {
              queryBuilder = queryBuilder.eq('visibility', 'public')
            }
          }

          const { data, error } = await queryBuilder

          if (error) throw error

          const posts: MissionPost[] = data?.map(item => ({
            id: item.id,
            userId: item.user_id,
            missionParticipationId: item.mission_participation_id,
            title: item.title,
            content: item.content,
            imageUrls: item.image_urls || [],
            tags: item.tags || [],
            visibility: item.visibility,
            likesCount: item.likes_count,
            commentsCount: item.comments_count,
            sharesCount: item.shares_count,
            viewsCount: item.views_count,
            isFeatured: item.is_featured,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            user: item.user
          })) || []

          return posts
        },
        2 * 60 * 1000 // 2분 캐시
      )

      return { success: true, posts: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async togglePostLike(postId: number, isLike: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      if (isLike) {
        // 좋아요 추가
        const { error } = await supabase
          .from('post_likes')
          .insert({
            user_id: user.id,
            post_id: postId
          })
        
        if (error) throw error
      } else {
        // 좋아요 제거
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId)
        
        if (error) throw error
      }

      // 캐시 무효화
      CacheInvalidator.invalidatePattern(`mission_posts_`)
      CacheInvalidator.invalidatePattern(`user_liked_posts_${user.id}`)

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async getUserLikedPosts(userId: string): Promise<{ success: boolean; likedPostIds?: number[]; error?: string }> {
    const cacheKey = `user_liked_posts_${userId}`
    
    try {
      const result = await withCache(
        userCache,
        cacheKey,
        async () => {
          const { data, error } = await supabase
            .from('post_likes')
            .select('post_id')
            .eq('user_id', userId)

          if (error) throw error

          return data?.map(item => item.post_id) || []
        },
        5 * 60 * 1000 // 5분 캐시
      )

      return { success: true, likedPostIds: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async getPostComments(postId: number): Promise<{ success: boolean; comments?: PostComment[]; error?: string }> {
    const cacheKey = `post_comments_${postId}`
    
    try {
      const result = await withCache(
        userCache,
        cacheKey,
        async () => {
          const { data, error } = await supabase
            .from('post_comments')
            .select(`
              id,
              post_id,
              user_id,
              parent_comment_id,
              content,
              likes_count,
              created_at,
              updated_at,
              user:users!post_comments_user_id_fkey (
                id, name
              )
            `)
            .eq('post_id', postId)
            .is('deleted_at', null)
            .order('created_at', { ascending: true })

          if (error) throw error

          // 댓글을 계층구조로 정리
          const commentsMap = new Map<number, PostComment>()
          const rootComments: PostComment[] = []

          data?.forEach(item => {
            const comment: PostComment = {
              id: item.id,
              postId: item.post_id,
              userId: item.user_id,
              parentCommentId: item.parent_comment_id,
              content: item.content,
              likesCount: item.likes_count,
              createdAt: item.created_at,
              updatedAt: item.updated_at,
              user: item.user,
              replies: []
            }

            commentsMap.set(comment.id, comment)

            if (comment.parentCommentId) {
              // 답글인 경우
              const parentComment = commentsMap.get(comment.parentCommentId)
              if (parentComment) {
                parentComment.replies = parentComment.replies || []
                parentComment.replies.push(comment)
              }
            } else {
              // 최상위 댓글인 경우
              rootComments.push(comment)
            }
          })

          return rootComments
        },
        2 * 60 * 1000 // 2분 캐시
      )

      return { success: true, comments: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async addComment(postId: number, content: string, parentCommentId?: number): Promise<{ success: boolean; comment?: PostComment; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          parent_comment_id: parentCommentId,
          content: content.trim(),
          created_at: new Date().toISOString()
        })
        .select(`
          id,
          post_id,
          user_id,
          parent_comment_id,
          content,
          likes_count,
          created_at,
          updated_at,
          user:users!post_comments_user_id_fkey (
            id, name
          )
        `)
        .single()

      if (error) throw error

      const comment: PostComment = {
        id: data.id,
        postId: data.post_id,
        userId: data.user_id,
        parentCommentId: data.parent_comment_id,
        content: data.content,
        likesCount: data.likes_count,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        user: data.user
      }

      // 캐시 무효화
      CacheInvalidator.invalidatePattern(`post_comments_${postId}`)
      CacheInvalidator.invalidatePattern(`mission_posts_`)

      return { success: true, comment }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // ============================================================================
  // 유틸리티 함수들
  // ============================================================================

  async searchUsers(query: string, excludeUserId?: string): Promise<{ success: boolean; users?: any[]; error?: string }> {
    try {
      let queryBuilder = supabase
        .from('users')
        .select('id, name, phone')
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
        .is('deleted_at', null)
        .limit(20)

      if (excludeUserId) {
        queryBuilder = queryBuilder.neq('id', excludeUserId)
      }

      const { data, error } = await queryBuilder

      if (error) throw error

      return { success: true, users: data || [] }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}