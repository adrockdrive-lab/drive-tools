'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { HoverScale, SlideIn, CountUp } from '@/components/animations/MicroInteractions';
import { StaggerContainer, StaggerItem } from '@/components/animations/PageTransition';
import { Spinner } from '@/components/animations/LoadingAnimations';
import { socialService } from '@/lib/services/social';
import { useAppStore } from '@/lib/store';
import { 
  User, 
  Edit3, 
  Save, 
  X,
  Trophy,
  Star,
  Target,
  DollarSign,
  Calendar,
  MapPin,
  Globe,
  Heart,
  MessageCircle,
  UserPlus,
  UserCheck,
  Settings,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfileData {
  userId: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  location?: string;
  websiteUrl?: string;
  isPublic: boolean;
  showAchievements: boolean;
  showStatistics: boolean;
  allowFriendRequests: boolean;
  socialLinks: Record<string, string>;
}

interface UserStatistics {
  userId: string;
  totalMissionsCompleted: number;
  totalExperiencePoints: number;
  currentLevel: number;
  currentStreak: number;
  maxStreak: number;
  totalPaybackEarned: number;
  totalReferrals: number;
  friendsCount: number;
  likesReceived: number;
  weeklyScore: number;
  monthlyScore: number;
  lastActivityAt: string;
}

interface UserProfileProps {
  userId?: string; // 없으면 현재 사용자의 프로필
  isOwnProfile?: boolean;
}

export function UserProfile({ userId, isOwnProfile = false }: UserProfileProps) {
  const { user } = useAppStore();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfileData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const targetUserId = userId || user?.id;
  const isMyProfile = isOwnProfile || targetUserId === user?.id;

  useEffect(() => {
    if (targetUserId) {
      loadUserProfile();
      loadUserStatistics();
    }
  }, [targetUserId]);

  const loadUserProfile = async () => {
    if (!targetUserId) return;
    
    setIsLoading(true);
    const result = await socialService.getUserProfile(targetUserId);
    
    if (result.success) {
      setProfile(result.profile || getDefaultProfile(targetUserId));
    } else {
      toast.error('프로필을 불러올 수 없습니다: ' + result.error);
    }
    setIsLoading(false);
  };

  const loadUserStatistics = async () => {
    if (!targetUserId) return;
    
    const result = await socialService.getUserStatistics(targetUserId);
    
    if (result.success) {
      setStatistics(result.statistics || null);
    } else {
      toast.error('통계를 불러올 수 없습니다: ' + result.error);
    }
  };

  const getDefaultProfile = (userId: string): UserProfileData => ({
    userId,
    isPublic: true,
    showAchievements: true,
    showStatistics: true,
    allowFriendRequests: true,
    socialLinks: {}
  });

  const handleEditProfile = () => {
    setEditedProfile({ ...profile! });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!editedProfile) return;
    
    const result = await socialService.updateUserProfile(editedProfile);
    
    if (result.success) {
      setProfile(editedProfile);
      setIsEditing(false);
      toast.success('프로필이 저장되었습니다');
    } else {
      toast.error('프로필 저장에 실패했습니다: ' + result.error);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(null);
    setIsEditing(false);
  };

  const StatCard = ({ icon: Icon, label, value, color }: { 
    icon: React.ElementType; 
    label: string; 
    value: string | number; 
    color: string;
  }) => (
    <HoverScale>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>
                {typeof value === 'number' ? <CountUp to={value} /> : value}
              </p>
            </div>
            <Icon className={`h-8 w-8 ${color}`} />
          </div>
        </CardContent>
      </Card>
    </HoverScale>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile || !user) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            프로필을 찾을 수 없습니다
          </h3>
          <p className="text-gray-600">
            요청한 사용자의 프로필이 존재하지 않거나 접근할 수 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 프로필 헤더 */}
      <SlideIn direction="down">
        <Card>
          <CardContent className="p-0">
            {/* 커버 이미지 */}
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
              {profile.coverImageUrl && (
                <img 
                  src={profile.coverImageUrl} 
                  alt="Cover" 
                  className="w-full h-32 object-cover"
                />
              )}
              
              {/* 편집 버튼 */}
              {isMyProfile && (
                <div className="absolute top-4 right-4">
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleSaveProfile}>
                        <Save className="h-3 w-3 mr-1" />
                        저장
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        <X className="h-3 w-3 mr-1" />
                        취소
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={handleEditProfile}>
                      <Edit3 className="h-3 w-3 mr-1" />
                      편집
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {/* 프로필 정보 */}
            <div className="p-6">
              <div className="flex items-start space-x-4 -mt-16">
                {/* 프로필 이미지 */}
                <Avatar className="h-24 w-24 border-4 border-white bg-white">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Profile" />
                  ) : (
                    <AvatarFallback className="text-2xl">
                      {user.name?.[0] || 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex-1 mt-16">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {user.name}
                      </h1>
                      <p className="text-gray-600">{user.phone}</p>
                      {statistics && (
                        <Badge className="mt-1">
                          레벨 {statistics.currentLevel}
                        </Badge>
                      )}
                    </div>
                    
                    {/* 액션 버튼 */}
                    {!isMyProfile && (
                      <div className="flex space-x-2">
                        <Button size="sm">
                          <UserPlus className="h-3 w-3 mr-1" />
                          친구 추가
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          메시지
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* 자기소개 */}
                  <div className="mt-4">
                    {isEditing ? (
                      <Textarea
                        placeholder="자기소개를 입력하세요..."
                        value={editedProfile?.bio || ''}
                        onChange={(e) => setEditedProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                        className="resize-none"
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-700">
                        {profile.bio || '아직 자기소개가 없습니다.'}
                      </p>
                    )}
                  </div>
                  
                  {/* 위치 및 웹사이트 */}
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                    {(profile.location || isEditing) && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        {isEditing ? (
                          <Input
                            placeholder="위치"
                            value={editedProfile?.location || ''}
                            onChange={(e) => setEditedProfile(prev => prev ? {...prev, location: e.target.value} : null)}
                            className="h-6 text-xs"
                          />
                        ) : (
                          <span>{profile.location}</span>
                        )}
                      </div>
                    )}
                    
                    {(profile.websiteUrl || isEditing) && (
                      <div className="flex items-center space-x-1">
                        <Globe className="h-3 w-3" />
                        {isEditing ? (
                          <Input
                            placeholder="웹사이트 URL"
                            value={editedProfile?.websiteUrl || ''}
                            onChange={(e) => setEditedProfile(prev => prev ? {...prev, websiteUrl: e.target.value} : null)}
                            className="h-6 text-xs"
                          />
                        ) : (
                          <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.websiteUrl}
                          </a>
                        )}
                      </div>
                    )}
                    
                    {statistics && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          마지막 활동: {new Date(statistics.lastActivityAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </SlideIn>

      {/* 탭 네비게이션 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="statistics">통계</TabsTrigger>
          {isMyProfile && <TabsTrigger value="settings">설정</TabsTrigger>}
        </TabsList>

        {/* 개요 탭 */}
        <TabsContent value="overview" className="mt-6">
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                icon={Target}
                label="완료한 미션"
                value={statistics.totalMissionsCompleted}
                color="text-blue-600"
              />
              <StatCard
                icon={Star}
                label="경험치"
                value={`${statistics.totalExperiencePoints.toLocaleString()} XP`}
                color="text-yellow-600"
              />
              <StatCard
                icon={DollarSign}
                label="총 페이백"
                value={`${statistics.totalPaybackEarned.toLocaleString()}원`}
                color="text-green-600"
              />
              <StatCard
                icon={User}
                label="친구 수"
                value={statistics.friendsCount}
                color="text-purple-600"
              />
            </div>
          )}

          {/* 최근 활동 */}
          <SlideIn direction="up">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>최근 활동</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  최근 활동 정보가 없습니다.
                </p>
              </CardContent>
            </Card>
          </SlideIn>
        </TabsContent>

        {/* 통계 탭 */}
        <TabsContent value="statistics" className="mt-6">
          {statistics ? (
            <StaggerContainer delay={0.2} staggerDelay={0.1}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StaggerItem index={0}>
                  <Card>
                    <CardHeader>
                      <CardTitle>미션 통계</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>완료한 미션</span>
                        <span className="font-semibold">{statistics.totalMissionsCompleted}개</span>
                      </div>
                      <div className="flex justify-between">
                        <span>현재 연속 기록</span>
                        <span className="font-semibold">{statistics.currentStreak}일</span>
                      </div>
                      <div className="flex justify-between">
                        <span>최대 연속 기록</span>
                        <span className="font-semibold">{statistics.maxStreak}일</span>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>

                <StaggerItem index={1}>
                  <Card>
                    <CardHeader>
                      <CardTitle>점수 및 레벨</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>현재 레벨</span>
                        <span className="font-semibold">레벨 {statistics.currentLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>총 경험치</span>
                        <span className="font-semibold">{statistics.totalExperiencePoints.toLocaleString()} XP</span>
                      </div>
                      <div className="flex justify-between">
                        <span>이번 주 점수</span>
                        <span className="font-semibold">{statistics.weeklyScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>이번 달 점수</span>
                        <span className="font-semibold">{statistics.monthlyScore}</span>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>

                <StaggerItem index={2}>
                  <Card>
                    <CardHeader>
                      <CardTitle>소셜 통계</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>친구 수</span>
                        <span className="font-semibold">{statistics.friendsCount}명</span>
                      </div>
                      <div className="flex justify-between">
                        <span>받은 좋아요</span>
                        <span className="font-semibold">{statistics.likesReceived}개</span>
                      </div>
                      <div className="flex justify-between">
                        <span>추천한 친구</span>
                        <span className="font-semibold">{statistics.totalReferrals}명</span>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>

                <StaggerItem index={3}>
                  <Card>
                    <CardHeader>
                      <CardTitle>페이백 통계</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>총 페이백</span>
                        <span className="font-semibold">{statistics.totalPaybackEarned.toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between">
                        <span>평균 페이백</span>
                        <span className="font-semibold">
                          {statistics.totalMissionsCompleted > 0 
                            ? Math.round(statistics.totalPaybackEarned / statistics.totalMissionsCompleted).toLocaleString()
                            : 0}원
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              </div>
            </StaggerContainer>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">통계 데이터를 불러올 수 없습니다.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 설정 탭 (본인만) */}
        {isMyProfile && (
          <TabsContent value="settings" className="mt-6">
            <SlideIn direction="up">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>프로필 설정</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 공개/비공개 설정 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">개인정보 공개 설정</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4" />
                          <div>
                            <p className="font-medium">공개 프로필</p>
                            <p className="text-sm text-gray-500">다른 사용자가 내 프로필을 볼 수 있습니다</p>
                          </div>
                        </div>
                        <Button
                          variant={profile.isPublic ? "default" : "outline"}
                          size="sm"
                          onClick={() => setProfile(prev => prev ? {...prev, isPublic: !prev.isPublic} : null)}
                        >
                          {profile.isPublic ? "공개" : "비공개"}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Trophy className="h-4 w-4" />
                          <div>
                            <p className="font-medium">업적 공개</p>
                            <p className="text-sm text-gray-500">내 업적과 배지를 공개합니다</p>
                          </div>
                        </div>
                        <Button
                          variant={profile.showAchievements ? "default" : "outline"}
                          size="sm"
                          onClick={() => setProfile(prev => prev ? {...prev, showAchievements: !prev.showAchievements} : null)}
                        >
                          {profile.showAchievements ? "공개" : "비공개"}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4" />
                          <div>
                            <p className="font-medium">통계 공개</p>
                            <p className="text-sm text-gray-500">미션 완료 통계를 공개합니다</p>
                          </div>
                        </div>
                        <Button
                          variant={profile.showStatistics ? "default" : "outline"}
                          size="sm"
                          onClick={() => setProfile(prev => prev ? {...prev, showStatistics: !prev.showStatistics} : null)}
                        >
                          {profile.showStatistics ? "공개" : "비공개"}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <UserPlus className="h-4 w-4" />
                          <div>
                            <p className="font-medium">친구 요청 허용</p>
                            <p className="text-sm text-gray-500">다른 사용자가 친구 요청을 보낼 수 있습니다</p>
                          </div>
                        </div>
                        <Button
                          variant={profile.allowFriendRequests ? "default" : "outline"}
                          size="sm"
                          onClick={() => setProfile(prev => prev ? {...prev, allowFriendRequests: !prev.allowFriendRequests} : null)}
                        >
                          {profile.allowFriendRequests ? "허용" : "차단"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}