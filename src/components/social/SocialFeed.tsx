'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { HoverScale, SlideIn, CountUp } from '@/components/animations/MicroInteractions';
import { StaggerContainer, StaggerItem } from '@/components/animations/PageTransition';
import { Spinner } from '@/components/animations/LoadingAnimations';
import { socialService } from '@/lib/services/social';
import { useAppStore } from '@/lib/store';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye,
  MoreHorizontal,
  Flag,
  Bookmark,
  ExternalLink,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface PostAuthor {
  id: string;
  name: string;
  phone: string;
}

interface MissionPost {
  id: number;
  userId: string;
  missionParticipationId?: number;
  title: string;
  content?: string;
  imageUrls: string[];
  tags: string[];
  visibility: 'public' | 'friends' | 'private';
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  user?: PostAuthor;
}

interface SocialFeedProps {
  feedType?: 'public' | 'friends' | 'featured';
  userId?: string; // 특정 사용자의 포스트만 보기
}

export function SocialFeed({ feedType = 'public', userId }: SocialFeedProps) {
  const { user } = useAppStore();
  const [posts, setPosts] = useState<MissionPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadPosts();
  }, [feedType, userId]);

  const loadPosts = async () => {
    setIsLoading(true);
    
    const result = await socialService.getMissionPosts(feedType, userId);
    
    if (result.success) {
      setPosts(result.posts || []);
      // 좋아요한 포스트 확인
      if (user) {
        loadUserLikes();
      }
    } else {
      toast.error('포스트를 불러올 수 없습니다: ' + result.error);
    }
    
    setIsLoading(false);
  };

  const loadUserLikes = async () => {
    if (!user) return;
    
    const result = await socialService.getUserLikedPosts(user.id);
    if (result.success) {
      setLikedPosts(new Set(result.likedPostIds || []));
    }
  };

  const handleLike = async (postId: number) => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    const isLiked = likedPosts.has(postId);
    const result = await socialService.togglePostLike(postId, !isLiked);
    
    if (result.success) {
      // 좋아요 상태 업데이트
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });
      
      // 포스트의 좋아요 수 업데이트
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likesCount: post.likesCount + (isLiked ? -1 : 1) }
          : post
      ));
    } else {
      toast.error('좋아요 처리에 실패했습니다: ' + result.error);
    }
  };

  const handleShare = async (post: MissionPost) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content,
          url: window.location.href
        });
      } catch (error) {
        // 사용자가 공유를 취소한 경우
      }
    } else {
      // Web Share API가 지원되지 않는 경우 클립보드에 복사
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

  const PostCard = ({ post, index }: { post: MissionPost; index: number }) => {
    const isLiked = likedPosts.has(post.id);

    return (
      <StaggerItem index={index}>
        <HoverScale scale={1.01}>
          <Card className={`${post.isFeatured ? 'ring-2 ring-yellow-400 shadow-lg' : ''}`}>
            {post.isFeatured && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 text-sm font-medium">
                추천 포스트
              </div>
            )}
            
            <CardHeader className="pb-3">
              {/* 작성자 정보 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {post.user?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{post.user?.name || '익명'}</p>
                    <p className="text-sm text-gray-500 flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(post.createdAt)}</span>
                    </p>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 제목 */}
              <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
              
              {/* 내용 */}
              {post.content && (
                <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
              )}
              
              {/* 이미지들 */}
              {post.imageUrls.length > 0 && (
                <div className={`grid gap-2 ${
                  post.imageUrls.length === 1 ? 'grid-cols-1' :
                  post.imageUrls.length === 2 ? 'grid-cols-2' :
                  'grid-cols-2'
                }`}>
                  {post.imageUrls.slice(0, 4).map((imageUrl, idx) => (
                    <div key={idx} className="relative">
                      <img 
                        src={imageUrl} 
                        alt={`Post image ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {idx === 3 && post.imageUrls.length > 4 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            +{post.imageUrls.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* 태그들 */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* 상호작용 통계 */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <CountUp to={post.viewsCount} />
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <CountUp to={post.likesCount} />
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <CountUp to={post.commentsCount} />
                  </div>
                </div>
                
                <Badge variant="outline" className="text-xs">
                  {post.visibility === 'public' ? '공개' :
                   post.visibility === 'friends' ? '친구' : '비공개'}
                </Badge>
              </div>
              
              {/* 액션 버튼들 */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-1 ${
                      isLiked ? 'bg-red-500 hover:bg-red-600 text-white' : ''
                    }`}
                  >
                    <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
                    <span>좋아요</span>
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    댓글
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleShare(post)}
                  >
                    <Share2 className="h-3 w-3 mr-1" />
                    공유
                  </Button>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm">
                    <Bookmark className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Flag className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </HoverScale>
      </StaggerItem>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 피드 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {feedType === 'featured' ? '추천 피드' :
             feedType === 'friends' ? '친구 피드' : '전체 피드'}
          </h2>
          <p className="text-gray-600">
            {feedType === 'featured' ? '엄선된 인기 미션 게시물' :
             feedType === 'friends' ? '친구들의 최신 미션 활동' : '모든 사용자의 미션 게시물'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <TrendingUp className="h-3 w-3 mr-1" />
            인기순
          </Button>
          <Button variant="outline" size="sm">
            <Clock className="h-3 w-3 mr-1" />
            최신순
          </Button>
        </div>
      </div>

      {/* 피드 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HoverScale>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 게시물</p>
                  <p className="text-2xl font-bold text-gray-900">
                    <CountUp to={posts.length} />
                  </p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </HoverScale>

        <HoverScale>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 좋아요</p>
                  <p className="text-2xl font-bold text-gray-900">
                    <CountUp to={posts.reduce((sum, post) => sum + post.likesCount, 0)} />
                  </p>
                </div>
                <Heart className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </HoverScale>

        <HoverScale>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                  <p className="text-2xl font-bold text-gray-900">
                    <CountUp to={new Set(posts.map(p => p.userId)).size} />
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </HoverScale>
      </div>

      {/* 포스트 목록 */}
      {posts.length === 0 ? (
        <SlideIn direction="up">
          <Card>
            <CardContent className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                아직 게시물이 없습니다
              </h3>
              <p className="text-gray-600">
                첫 번째 미션을 완료하고 경험을 공유해보세요!
              </p>
            </CardContent>
          </Card>
        </SlideIn>
      ) : (
        <StaggerContainer delay={0.2} staggerDelay={0.1}>
          <div className="space-y-6">
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </div>
        </StaggerContainer>
      )}
    </div>
  );
}