'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { HoverScale, SlideIn, Bounce } from '@/components/animations/MicroInteractions';
import { StaggerContainer, StaggerItem } from '@/components/animations/PageTransition';
import { Spinner } from '@/components/animations/LoadingAnimations';
import { OptimizedImage } from '@/components/performance/OptimizedImage';
import { useAppStore } from '@/lib/store';
import { 
  Share2, 
  Heart, 
  MessageCircle, 
  Eye,
  Camera,
  Hash,
  Globe,
  Users,
  Lock,
  Send,
  Trophy,
  Star,
  ThumbsUp,
  MoreHorizontal,
  Flag
} from 'lucide-react';
import { toast } from 'sonner';

type PostVisibility = 'public' | 'friends' | 'private';

interface MissionPost {
  id: number;
  userId: string;
  title: string;
  content?: string;
  imageUrls: string[];
  tags: string[];
  visibility: PostVisibility;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  isFeatured: boolean;
  createdAt: string;
  isLiked?: boolean;
  user: {
    id: string;
    name: string;
    phone: string;
  };
}

interface ShareMissionDialogProps {
  missionId?: number;
  missionTitle?: string;
  onShare: (postData: any) => void;
}

function ShareMissionDialog({ missionId, missionTitle, onShare }: ShareMissionDialogProps) {
  const [title, setTitle] = useState(missionTitle || '');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < 5) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('제목을 입력해주세요');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const postData = {
        missionId,
        title: title.trim(),
        content: content.trim(),
        tags,
        visibility,
        imageUrls: images
      };

      await onShare(postData);
      
      // 폼 초기화
      setTitle('');
      setContent('');
      setTags([]);
      setCurrentTag('');
      setVisibility('public');
      setImages([]);
      
      toast.success('미션이 성공적으로 공유되었습니다!');
    } catch (error) {
      toast.error('미션 공유에 실패했습니다');
    }
    
    setIsSubmitting(false);
  };

  return (
    <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <Share2 className="h-5 w-5" />
          <span>미션 공유하기</span>
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        {/* 제목 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            제목 *
          </label>
          <Input
            placeholder="미션 완료 후기를 제목으로..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">
            {title.length}/100
          </p>
        </div>

        {/* 내용 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            내용
          </label>
          <Textarea
            placeholder="미션을 완료하면서 느낀 점이나 경험을 공유해보세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {content.length}/500
          </p>
        </div>

        {/* 해시태그 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            해시태그 (최대 5개)
          </label>
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="태그 입력 후 Enter"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="pl-10"
                maxLength={20}
              />
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleAddTag}
              disabled={!currentTag.trim() || tags.length >= 5}
            >
              추가
            </Button>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map(tag => (
                <Badge 
                  key={tag}
                  variant="secondary" 
                  className="cursor-pointer hover:bg-red-100"
                  onClick={() => handleRemoveTag(tag)}
                >
                  #{tag} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* 공개 설정 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            공개 설정
          </label>
          <Select value={visibility} onValueChange={(value) => setVisibility(value as PostVisibility)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>전체 공개</span>
                </div>
              </SelectItem>
              <SelectItem value="friends">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>친구만</span>
                </div>
              </SelectItem>
              <SelectItem value="private">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>비공개</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 이미지 업로드 (향후 구현) */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            사진 추가
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">사진 업로드 기능은 곧 추가될 예정입니다</p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => {
              setTitle('');
              setContent('');
              setTags([]);
              setCurrentTag('');
            }}
          >
            초기화
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim()}
            className="flex-1 flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" color="white" />
                <span>공유 중...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>공유하기</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

function MissionPostCard({ post, onLike, onComment }: { 
  post: MissionPost; 
  onLike: (postId: number) => void;
  onComment: (postId: number) => void;
}) {
  const { user } = useAppStore();
  
  return (
    <HoverScale>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {post.user.name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">{post.user.name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {post.isFeatured && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Star className="h-3 w-3 mr-1" />
                  추천
                </Badge>
              )}
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 제목 */}
          <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
          
          {/* 내용 */}
          {post.content && (
            <p className="text-gray-700 leading-relaxed">{post.content}</p>
          )}
          
          {/* 이미지 */}
          {post.imageUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {post.imageUrls.slice(0, 4).map((url, index) => (
                <div key={index} className="relative aspect-square">
                  <OptimizedImage
                    src={url}
                    alt={`${post.title} 이미지 ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* 해시태그 */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-blue-600">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* 통계 */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{post.viewsCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{post.likesCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post.commentsCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Share2 className="h-4 w-4" />
              <span>{post.sharesCount.toLocaleString()}</span>
            </div>
          </div>
          
          {/* 액션 버튼 */}
          <div className="flex items-center space-x-2 pt-2 border-t">
            <Button
              variant={post.isLiked ? "default" : "outline"}
              size="sm"
              onClick={() => onLike(post.id)}
              className="flex-1"
            >
              <Heart className={`h-4 w-4 mr-2 ${post.isLiked ? 'fill-current' : ''}`} />
              좋아요
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onComment(post.id)}
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              댓글
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              공유
            </Button>
            <Button variant="ghost" size="sm">
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </HoverScale>
  );
}

export function MissionShare() {
  const { user } = useAppStore();
  const [posts, setPosts] = useState<MissionPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockPosts: MissionPost[] = [
      {
        id: 1,
        userId: 'user1',
        title: '첫 번째 챌린지 미션 완료! 🎉',
        content: '드디어 첫 미션을 완료했습니다! 생각보다 어려웠지만 보람찬 경험이었어요. 다음 미션도 기대됩니다!',
        imageUrls: [],
        tags: ['첫미션', '완료', '드라이빙존'],
        visibility: 'public',
        likesCount: 15,
        commentsCount: 3,
        sharesCount: 2,
        viewsCount: 87,
        isFeatured: true,
        createdAt: new Date().toISOString(),
        isLiked: false,
        user: {
          id: 'user1',
          name: '김민수',
          phone: '010-1234-5678'
        }
      },
      {
        id: 2,
        userId: 'user2',
        title: 'SNS 미션 후기',
        content: '친구들에게 드라이빙존을 소개하는 미션이었는데, 생각보다 많은 친구들이 관심을 가져줘서 기뻤어요!',
        imageUrls: [],
        tags: ['SNS', '추천', '친구'],
        visibility: 'public',
        likesCount: 8,
        commentsCount: 1,
        sharesCount: 0,
        viewsCount: 45,
        isFeatured: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        isLiked: true,
        user: {
          id: 'user2',
          name: '이영희',
          phone: '010-9876-5432'
        }
      }
    ];
    
    setPosts(mockPosts);
  }, []);

  const handleShare = async (postData: any) => {
    // 실제 구현에서는 API 호출
    console.log('Sharing post:', postData);
    
    // Mock: 새 포스트 추가
    const newPost: MissionPost = {
      id: Date.now(),
      userId: user?.id || 'current-user',
      title: postData.title,
      content: postData.content,
      imageUrls: postData.imageUrls || [],
      tags: postData.tags || [],
      visibility: postData.visibility || 'public',
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      viewsCount: 0,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      isLiked: false,
      user: {
        id: user?.id || 'current-user',
        name: user?.name || '나',
        phone: user?.phone || ''
      }
    };
    
    setPosts([newPost, ...posts]);
  };

  const handleLike = async (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1
          }
        : post
    ));
  };

  const handleComment = (postId: number) => {
    toast.info('댓글 기능은 곧 추가될 예정입니다');
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">미션 공유</h1>
          <p className="text-gray-600">완료한 미션을 친구들과 공유하고 소통해보세요</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <HoverScale>
              <Button className="flex items-center space-x-2">
                <Share2 className="h-4 w-4" />
                <span>미션 공유</span>
              </Button>
            </HoverScale>
          </DialogTrigger>
          <ShareMissionDialog onShare={handleShare} />
        </Dialog>
      </div>

      {/* 포스트 피드 */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : posts.length === 0 ? (
        <SlideIn direction="up">
          <Card>
            <CardContent className="text-center py-12">
              <Share2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                아직 공유된 미션이 없습니다
              </h3>
              <p className="text-gray-600 mb-4">
                첫 번째 미션을 완료하고 친구들과 공유해보세요!
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>미션 공유하기</Button>
                </DialogTrigger>
                <ShareMissionDialog onShare={handleShare} />
              </Dialog>
            </CardContent>
          </Card>
        </SlideIn>
      ) : (
        <StaggerContainer delay={0.2} staggerDelay={0.1}>
          <div className="space-y-6">
            {posts.map((post, index) => (
              <StaggerItem key={post.id} index={index}>
                <MissionPostCard
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                />
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      )}
    </div>
  );
}