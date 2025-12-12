'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { HoverScale, SlideIn } from '@/components/animations/MicroInteractions';
import { StaggerContainer, StaggerItem } from '@/components/animations/PageTransition';
import { Spinner } from '@/components/animations/LoadingAnimations';
import { socialService } from '@/lib/services/social';
import { useAppStore } from '@/lib/store';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Send,
  Reply,
  ThumbsUp,
  Gift,
  Zap,
  Star,
  Award,
  Flame,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  id: number;
  postId: number;
  userId: string;
  parentCommentId?: number;
  content: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
  };
  replies?: Comment[];
}

interface SocialInteractionsProps {
  postId: number;
  initialLikesCount?: number;
  initialCommentsCount?: number;
  onInteraction?: () => void;
}

export function SocialInteractions({ 
  postId, 
  initialLikesCount = 0, 
  initialCommentsCount = 0,
  onInteraction 
}: SocialInteractionsProps) {
  const { user } = useAppStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [isLoading, setIsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
    checkUserLike();
  }, [postId, showComments]);

  const loadComments = async () => {
    setIsLoading(true);
    
    const result = await socialService.getPostComments(postId);
    
    if (result.success) {
      setComments(result.comments || []);
    } else {
      toast.error('댓글을 불러올 수 없습니다: ' + result.error);
    }
    
    setIsLoading(false);
  };

  const checkUserLike = async () => {
    if (!user) return;
    
    const result = await socialService.getUserLikedPosts(user.id);
    if (result.success) {
      setIsLiked((result.likedPostIds || []).includes(postId));
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    const result = await socialService.togglePostLike(postId, !isLiked);
    
    if (result.success) {
      setIsLiked(!isLiked);
      setLikesCount(prev => prev + (isLiked ? -1 : 1));
      onInteraction?.();
      
      if (!isLiked) {
        toast.success('좋아요를 눌렀습니다!', {
          icon: '❤️'
        });
      }
    } else {
      toast.error('좋아요 처리에 실패했습니다: ' + result.error);
    }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;
    
    const result = await socialService.addComment(postId, newComment.trim());
    
    if (result.success) {
      setNewComment('');
      setCommentsCount(prev => prev + 1);
      loadComments();
      onInteraction?.();
      toast.success('댓글이 작성되었습니다');
    } else {
      toast.error('댓글 작성에 실패했습니다: ' + result.error);
    }
  };

  const handleAddReply = async (parentCommentId: number) => {
    if (!user || !replyContent.trim()) return;
    
    const result = await socialService.addComment(postId, replyContent.trim(), parentCommentId);
    
    if (result.success) {
      setReplyContent('');
      setReplyingTo(null);
      setCommentsCount(prev => prev + 1);
      loadComments();
      onInteraction?.();
      toast.success('답글이 작성되었습니다');
    } else {
      toast.error('답글 작성에 실패했습니다: ' + result.error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '드라이빙존 미션 게시물',
          text: '이 멋진 미션 게시물을 확인해보세요!',
          url: window.location.href
        });
      } catch (error) {
        // 사용자가 공유를 취소한 경우
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('링크가 클립보드에 복사되었습니다');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString();
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`flex space-x-3 ${isReply ? 'ml-8' : ''}`}>
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">
          {comment.user?.name?.[0] || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-gray-900">
              {comment.user?.name || '익명'}
            </h4>
            <span className="text-xs text-gray-500">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-700">{comment.content}</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-2">
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <ThumbsUp className="h-3 w-3 mr-1" />
            {comment.likesCount}
          </Button>
          
          {!isReply && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs"
              onClick={() => setReplyingTo(comment.id)}
            >
              <Reply className="h-3 w-3 mr-1" />
              답글
            </Button>
          )}
        </div>

        {/* 답글 입력 */}
        {replyingTo === comment.id && (
          <SlideIn direction="down" className="mt-3">
            <div className="flex space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="답글을 입력하세요..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[60px] text-sm"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setReplyingTo(null)}
                  >
                    취소
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleAddReply(comment.id)}
                    disabled={!replyContent.trim()}
                  >
                    답글 작성
                  </Button>
                </div>
              </div>
            </div>
          </SlideIn>
        )}

        {/* 답글 목록 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* 상호작용 버튼들 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* 좋아요 버튼 */}
          <HoverScale>
            <Button
              variant={isLiked ? "default" : "outline"}
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'hover:bg-red-50 hover:text-red-600 hover:border-red-200'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </Button>
          </HoverScale>

          {/* 댓글 버튼 */}
          <HoverScale>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{commentsCount}</span>
            </Button>
          </HoverScale>

          {/* 공유 버튼 */}
          <HoverScale>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center space-x-2"
            >
              <Share2 className="h-4 w-4" />
              <span>공유</span>
            </Button>
          </HoverScale>
        </div>

        {/* 반응형 이모지 */}
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Flame className="h-4 w-4 text-orange-500" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Star className="h-4 w-4 text-yellow-500" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Award className="h-4 w-4 text-purple-500" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Target className="h-4 w-4 text-blue-500" />
          </Button>
        </div>
      </div>

      {/* 댓글 섹션 */}
      {showComments && (
        <SlideIn direction="down">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">댓글 {commentsCount}개</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 새 댓글 작성 */}
              {user && (
                <div className="flex space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {user.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="댓글을 입력하세요..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex justify-end mt-2">
                      <Button 
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="flex items-center space-x-2"
                      >
                        <Send className="h-3 w-3" />
                        <span>댓글 작성</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 댓글 목록 */}
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="sm" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  첫 번째 댓글을 작성해보세요!
                </div>
              ) : (
                <StaggerContainer delay={0.1} staggerDelay={0.05}>
                  <div className="space-y-4">
                    {comments.map((comment, index) => (
                      <StaggerItem key={comment.id} index={index}>
                        <CommentItem comment={comment} />
                      </StaggerItem>
                    ))}
                  </div>
                </StaggerContainer>
              )}
            </CardContent>
          </Card>
        </SlideIn>
      )}

      {/* 소셜 활동 통계 */}
      <div className="grid grid-cols-4 gap-4">
        <HoverScale>
          <Card className="p-3">
            <div className="text-center">
              <Heart className="h-5 w-5 text-red-500 mx-auto mb-1" />
              <p className="text-lg font-bold">{likesCount}</p>
              <p className="text-xs text-gray-500">좋아요</p>
            </div>
          </Card>
        </HoverScale>

        <HoverScale>
          <Card className="p-3">
            <div className="text-center">
              <MessageCircle className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-lg font-bold">{commentsCount}</p>
              <p className="text-xs text-gray-500">댓글</p>
            </div>
          </Card>
        </HoverScale>

        <HoverScale>
          <Card className="p-3">
            <div className="text-center">
              <Share2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <p className="text-lg font-bold">0</p>
              <p className="text-xs text-gray-500">공유</p>
            </div>
          </Card>
        </HoverScale>

        <HoverScale>
          <Card className="p-3">
            <div className="text-center">
              <Zap className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
              <p className="text-lg font-bold">+{Math.floor(likesCount * 1.5 + commentsCount * 2)}</p>
              <p className="text-xs text-gray-500">포인트</p>
            </div>
          </Card>
        </HoverScale>
      </div>
    </div>
  );
}