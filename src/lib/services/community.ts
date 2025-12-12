import { supabase } from '@/lib/supabase'

export interface Post {
  id: string
  category: string
  title: string
  content: string
  author: string
  authorId: string
  authorLevel: number
  authorAvatar?: string
  createdAt: string
  views: number
  likes: number
  comments: number
  isPinned: boolean
  isLiked?: boolean
}

export interface Comment {
  id: string
  content: string
  author: string
  authorId: string
  authorLevel: number
  authorAvatar?: string
  createdAt: string
  likes: number
  isLiked?: boolean
}

// 게시글 목록 조회
export async function getPosts(
  category: string = 'all',
  userId?: string,
  limit: number = 50
): Promise<Post[]> {
  try {
    let query = supabase
      .from('community_posts')
      .select(`
        *,
        author:users!community_posts_user_id_fkey(id, nickname, level, avatar_url),
        likes:post_likes(count),
        comments:post_comments(count)
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (category !== 'all') {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error

    // 사용자가 좋아요한 게시글 조회
    let likedPostIds = new Set<string>()
    if (userId) {
      const { data: likedPosts } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', userId)

      likedPostIds = new Set(likedPosts?.map((like) => like.post_id) || [])
    }

    return (data || []).map((post) => ({
      id: post.id,
      category: post.category,
      title: post.title,
      content: post.content,
      author: post.author.nickname,
      authorId: post.author.id,
      authorLevel: post.author.level,
      authorAvatar: post.author.avatar_url,
      createdAt: formatTimeAgo(post.created_at),
      views: post.views,
      likes: post.likes[0]?.count || 0,
      comments: post.comments[0]?.count || 0,
      isPinned: post.is_pinned,
      isLiked: likedPostIds.has(post.id),
    }))
  } catch (error) {
    console.error('Error loading posts:', error)
    return []
  }
}

// 게시글 상세 조회
export async function getPost(postId: string, userId?: string): Promise<Post | null> {
  try {
    // 조회수 증가
    await supabase.rpc('increment_post_views', { post_id: postId })

    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        author:users!community_posts_user_id_fkey(id, nickname, level, avatar_url),
        likes:post_likes(count),
        comments:post_comments(count)
      `)
      .eq('id', postId)
      .single()

    if (error) throw error

    // 사용자가 좋아요했는지 확인
    let isLiked = false
    if (userId) {
      const { data: like } = await supabase
        .from('post_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .single()

      isLiked = !!like
    }

    return {
      id: data.id,
      category: data.category,
      title: data.title,
      content: data.content,
      author: data.author.nickname,
      authorId: data.author.id,
      authorLevel: data.author.level,
      authorAvatar: data.author.avatar_url,
      createdAt: formatTimeAgo(data.created_at),
      views: data.views,
      likes: data.likes[0]?.count || 0,
      comments: data.comments[0]?.count || 0,
      isPinned: data.is_pinned,
      isLiked,
    }
  } catch (error) {
    console.error('Error loading post:', error)
    return null
  }
}

// 게시글 작성
export async function createPost(
  userId: string,
  category: string,
  title: string,
  content: string
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: userId,
        category,
        title,
        content,
        views: 0,
        is_pinned: false,
      })
      .select('id')
      .single()

    if (error) throw error

    // 활동 피드에 추가
    const { createActivity } = await import('./activity-feed')
    await createActivity(userId, 'post_created', `"${title}" 게시글을 작성했습니다.`, { postId: data.id, category })

    return data.id
  } catch (error) {
    console.error('Error creating post:', error)
    throw error
  }
}

// 게시글 수정
export async function updatePost(
  postId: string,
  userId: string,
  title: string,
  content: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('community_posts')
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq('id', postId)
      .eq('user_id', userId) // 작성자만 수정 가능

    if (error) throw error
  } catch (error) {
    console.error('Error updating post:', error)
    throw error
  }
}

// 게시글 삭제
export async function deletePost(postId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId) // 작성자만 삭제 가능

    if (error) throw error
  } catch (error) {
    console.error('Error deleting post:', error)
    throw error
  }
}

// 게시글 좋아요 토글
export async function togglePostLike(userId: string, postId: string): Promise<boolean> {
  try {
    // 이미 좋아요했는지 확인
    const { data: existing, error: checkError } = await supabase
      .from('post_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') throw checkError

    if (existing) {
      // 좋아요 취소
      await supabase.from('post_likes').delete().eq('id', existing.id)
      return false
    } else {
      // 좋아요 추가
      await supabase.from('post_likes').insert({
        user_id: userId,
        post_id: postId,
      })

      // 게시글 작성자에게 알림 (본인 제외)
      const { data: post } = await supabase
        .from('community_posts')
        .select('user_id, title')
        .eq('id', postId)
        .single()

      if (post && post.user_id !== userId) {
        const { data: liker } = await supabase.from('users').select('nickname').eq('id', userId).single()

        await supabase.from('notifications').insert({
          user_id: post.user_id,
          type: 'like',
          title: '좋아요',
          message: `${liker?.nickname || '사용자'}님이 회원님의 게시글을 좋아합니다.`,
          link: `/community-v2/${postId}`,
          metadata: { postId },
          is_read: false,
        })
      }

      return true
    }
  } catch (error) {
    console.error('Error toggling post like:', error)
    throw error
  }
}

// 댓글 목록 조회
export async function getComments(postId: string, userId?: string): Promise<Comment[]> {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        author:users!post_comments_user_id_fkey(id, nickname, level, avatar_url),
        likes:comment_likes(count)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) throw error

    // 사용자가 좋아요한 댓글 조회
    let likedCommentIds = new Set<string>()
    if (userId) {
      const { data: likedComments } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', userId)

      likedCommentIds = new Set(likedComments?.map((like) => like.comment_id) || [])
    }

    return (data || []).map((comment) => ({
      id: comment.id,
      content: comment.content,
      author: comment.author.nickname,
      authorId: comment.author.id,
      authorLevel: comment.author.level,
      authorAvatar: comment.author.avatar_url,
      createdAt: formatTimeAgo(comment.created_at),
      likes: comment.likes[0]?.count || 0,
      isLiked: likedCommentIds.has(comment.id),
    }))
  } catch (error) {
    console.error('Error loading comments:', error)
    return []
  }
}

// 댓글 작성
export async function createComment(userId: string, postId: string, content: string): Promise<void> {
  try {
    const { error } = await supabase.from('post_comments').insert({
      user_id: userId,
      post_id: postId,
      content,
    })

    if (error) throw error

    // 게시글 작성자에게 알림 (본인 제외)
    const { data: post } = await supabase.from('community_posts').select('user_id, title').eq('id', postId).single()

    if (post && post.user_id !== userId) {
      const { data: commenter } = await supabase.from('users').select('nickname').eq('id', userId).single()

      await supabase.from('notifications').insert({
        user_id: post.user_id,
        type: 'comment',
        title: '새 댓글',
        message: `${commenter?.nickname || '사용자'}님이 회원님의 게시글에 댓글을 남겼습니다.`,
        link: `/community-v2/${postId}`,
        metadata: { postId },
        is_read: false,
      })
    }
  } catch (error) {
    console.error('Error creating comment:', error)
    throw error
  }
}

// 댓글 삭제
export async function deleteComment(commentId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId) // 작성자만 삭제 가능

    if (error) throw error
  } catch (error) {
    console.error('Error deleting comment:', error)
    throw error
  }
}

// 댓글 좋아요 토글
export async function toggleCommentLike(userId: string, commentId: string): Promise<boolean> {
  try {
    const { data: existing, error: checkError } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('comment_id', commentId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') throw checkError

    if (existing) {
      await supabase.from('comment_likes').delete().eq('id', existing.id)
      return false
    } else {
      await supabase.from('comment_likes').insert({
        user_id: userId,
        comment_id: commentId,
      })
      return true
    }
  } catch (error) {
    console.error('Error toggling comment like:', error)
    throw error
  }
}

// 시간 포맷팅
function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const past = new Date(timestamp)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`
  return `${Math.floor(diffDays / 365)}년 전`
}
