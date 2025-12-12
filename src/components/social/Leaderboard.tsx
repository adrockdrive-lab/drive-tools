'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { HoverScale, SlideIn, CountUp } from '@/components/animations/MicroInteractions';
import { StaggerContainer, StaggerItem } from '@/components/animations/PageTransition';
import { Spinner } from '@/components/animations/LoadingAnimations';
import { socialService } from '@/lib/services/social';
import { useAppStore } from '@/lib/store';
import { 
  Trophy, 
  Medal, 
  Crown,
  Star,
  Zap,
  TrendingUp,
  Calendar,
  Target,
  DollarSign,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    phone: string;
  };
  score: number;
  level: number;
}

type LeaderboardType = 'missions' | 'experience' | 'payback' | 'weekly' | 'monthly';

const leaderboardTypes: {
  key: LeaderboardType;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
}[] = [
  {
    key: 'experience',
    label: '경험치',
    icon: Star,
    description: '총 경험치 랭킹',
    color: 'text-yellow-600'
  },
  {
    key: 'missions',
    label: '미션 완료',
    icon: Target,
    description: '완료한 미션 수',
    color: 'text-blue-600'
  },
  {
    key: 'payback',
    label: '페이백',
    icon: DollarSign,
    description: '받은 페이백 총액',
    color: 'text-green-600'
  },
  {
    key: 'weekly',
    label: '주간 점수',
    icon: TrendingUp,
    description: '이번 주 활동 점수',
    color: 'text-purple-600'
  },
  {
    key: 'monthly',
    label: '월간 점수',
    icon: Calendar,
    description: '이번 달 활동 점수',
    color: 'text-red-600'
  }
];

export function Leaderboard() {
  const { user } = useAppStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeType, setActiveType] = useState<LeaderboardType>('experience');

  useEffect(() => {
    loadLeaderboard(activeType);
  }, [activeType]);

  const loadLeaderboard = async (type: LeaderboardType) => {
    setIsLoading(true);
    
    const result = await socialService.getLeaderboard(type, 50);
    
    if (result.success) {
      setLeaderboard(result.leaderboard || []);
      
      // 현재 사용자의 순위 찾기
      if (user) {
        const userEntry = result.leaderboard?.find(entry => entry.user.id === user.id);
        setUserRank(userEntry || null);
      }
    } else {
      toast.error('리더보드를 불러올 수 없습니다: ' + result.error);
    }
    
    setIsLoading(false);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-600';
    if (rank <= 10) return 'bg-gradient-to-r from-blue-400 to-blue-600';
    return 'bg-gradient-to-r from-gray-400 to-gray-600';
  };

  const formatScore = (type: LeaderboardType, score: number) => {
    switch (type) {
      case 'payback':
        return `${score.toLocaleString()}원`;
      case 'experience':
        return `${score.toLocaleString()} XP`;
      default:
        return score.toLocaleString();
    }
  };

  const currentType = leaderboardTypes.find(t => t.key === activeType)!;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Trophy className="h-8 w-8 text-yellow-600" />
          <h1 className="text-3xl font-bold text-gray-900">리더보드</h1>
        </div>
        <p className="text-gray-600">친구들과 경쟁하며 더 높은 순위에 도전하세요!</p>
      </div>

      {/* 내 순위 카드 */}
      {userRank && (
        <SlideIn direction="down">
          <HoverScale>
            <Card className={`border-2 ${getRankBadgeColor(userRank.rank).replace('bg-gradient-to-r', 'border-gradient-to-r')}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-full ${getRankBadgeColor(userRank.rank)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      #{userRank.rank}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">내 순위</h3>
                      <p className="text-gray-600">{currentType.description}</p>
                      <Badge className="mt-1 bg-blue-100 text-blue-800">
                        레벨 {userRank.level}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900">
                      <CountUp to={userRank.score} suffix={activeType === 'payback' ? '원' : activeType === 'experience' ? ' XP' : ''} />
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatScore(activeType, userRank.score)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </HoverScale>
        </SlideIn>
      )}

      {/* 타입 선택 탭 */}
      <Tabs value={activeType} onValueChange={(value) => setActiveType(value as LeaderboardType)}>
        <div className="flex justify-center">
          <TabsList className="grid grid-cols-5 w-full max-w-4xl">
            {leaderboardTypes.map(type => {
              const IconComponent = type.icon;
              return (
                <TabsTrigger 
                  key={type.key} 
                  value={type.key}
                  className="flex flex-col space-y-1 h-16"
                >
                  <IconComponent className={`h-4 w-4 ${type.color}`} />
                  <span className="text-xs">{type.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {leaderboardTypes.map(type => (
          <TabsContent key={type.key} value={type.key} className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : leaderboard.length === 0 ? (
              <SlideIn direction="up">
                <Card>
                  <CardContent className="text-center py-12">
                    <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      아직 순위가 없습니다
                    </h3>
                    <p className="text-gray-600">
                      미션을 완료하고 첫 번째 순위에 올라보세요!
                    </p>
                  </CardContent>
                </Card>
              </SlideIn>
            ) : (
              <StaggerContainer delay={0.2} staggerDelay={0.05}>
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <StaggerItem key={entry.user.id} index={index}>
                      <HoverScale scale={1.02}>
                        <Card className={`${
                          entry.user.id === user?.id 
                            ? 'ring-2 ring-blue-500 bg-blue-50/50' 
                            : entry.rank <= 3 
                            ? 'bg-gradient-to-r from-gray-50 to-white shadow-md' 
                            : ''
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                {/* 순위 표시 */}
                                <div className="flex items-center justify-center w-12 h-12">
                                  {entry.rank <= 3 ? (
                                    <div className={`w-10 h-10 rounded-full ${getRankBadgeColor(entry.rank)} flex items-center justify-center shadow-md`}>
                                      {getRankIcon(entry.rank)}
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                      <span className="text-lg font-bold text-gray-600">
                                        {entry.rank}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* 사용자 정보 */}
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className={`
                                      ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                                        entry.rank === 2 ? 'bg-gray-100 text-gray-800' :
                                        entry.rank === 3 ? 'bg-amber-100 text-amber-800' :
                                        'bg-blue-100 text-blue-800'}
                                    `}>
                                      {entry.user.name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      {entry.user.name}
                                      {entry.user.id === user?.id && (
                                        <Badge variant="secondary" className="ml-2 text-xs">
                                          나
                                        </Badge>
                                      )}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      레벨 {entry.level}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* 점수 */}
                              <div className="text-right">
                                <p className={`text-lg font-bold ${type.color}`}>
                                  <CountUp 
                                    to={entry.score} 
                                    suffix={
                                      type.key === 'payback' ? '원' : 
                                      type.key === 'experience' ? ' XP' : ''
                                    } 
                                  />
                                </p>
                                <p className="text-xs text-gray-500">
                                  {type.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </HoverScale>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* 하단 정보 */}
      <SlideIn direction="up" delay={0.5}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HoverScale>
            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">순위는 매일</p>
                <p className="text-xs text-gray-500">자정에 업데이트됩니다</p>
              </CardContent>
            </Card>
          </HoverScale>
          
          <HoverScale>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">전체 참가자</p>
                <p className="text-lg font-bold text-gray-900">
                  <CountUp to={leaderboard.length} suffix="명" />
                </p>
              </CardContent>
            </Card>
          </HoverScale>
          
          <HoverScale>
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">이번 주 챔피언</p>
                <p className="text-sm font-bold text-gray-900">
                  {leaderboard.length > 0 ? leaderboard[0].user.name : '없음'}
                </p>
              </CardContent>
            </Card>
          </HoverScale>
        </div>
      </SlideIn>
    </div>
  );
}