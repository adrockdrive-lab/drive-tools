'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Crown, Gift, Star, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { gamificationService } from '@/lib/services/gamification';
import type { Streak, UserLevel } from '@/types';

import { LevelBadge } from './LevelSystem';

interface AdvancedLevelSystemProps {
  userId: string;
  className?: string;
}

interface LevelReward {
  level: number;
  experienceBonus: number;
  couponCode?: string;
  title: string;
  description: string;
  icon: string;
}

interface StreakDisplayProps {
  streak: Streak;
  type: 'daily_login' | 'mission_complete';
}

// Level progression and rewards
const LEVEL_REWARDS: LevelReward[] = [
  { level: 5, experienceBonus: 50, couponCode: 'LEVEL5', title: '첫 걸음', description: '레벨 5 달성 보너스', icon: '🎯' },
  { level: 10, experienceBonus: 100, couponCode: 'LEVEL10', title: '숙련자', description: '레벨 10 달성 보너스', icon: '⭐' },
  { level: 15, experienceBonus: 200, couponCode: 'LEVEL15', title: '전문가', description: '레벨 15 달성 보너스', icon: '🏆' },
  { level: 20, experienceBonus: 500, couponCode: 'LEVEL20', title: '마스터', description: '레벨 20 달성 보너스', icon: '👑' },
  { level: 30, experienceBonus: 1000, couponCode: 'LEVEL30', title: '레전드', description: '레벨 30 달성 보너스', icon: '💎' },
];

const LEVEL_TITLES: Record<number, { title: string; subtitle: string; color: string }> = {
  1: { title: '새싹 운전자', subtitle: '운전의 첫 걸음을 시작했습니다', color: '#10B981' },
  5: { title: '초보 드라이버', subtitle: '기본기를 익혔습니다', color: '#3B82F6' },
  10: { title: '숙련 운전자', subtitle: '안전한 운전 습관을 가졌습니다', color: '#8B5CF6' },
  15: { title: '프로 드라이버', subtitle: '전문적인 운전 실력을 보유했습니다', color: '#F59E0B' },
  20: { title: '마스터 드라이버', subtitle: '완벽한 운전 기술을 갖췄습니다', color: '#EF4444' },
  30: { title: '레전드 드라이버', subtitle: '모든 운전자의 롤모델입니다', color: '#8B5CF6' },
};

function StreakDisplay({ streak, type }: StreakDisplayProps) {
  const getStreakIcon = () => {
    switch (type) {
      case 'daily_login': return <Calendar className="w-5 h-5" />;
      case 'mission_complete': return <Target className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getStreakTitle = () => {
    switch (type) {
      case 'daily_login': return '일일 접속';
      case 'mission_complete': return '미션 완료';
      default: return '연속 참여';
    }
  };

  const getStreakColor = () => {
    if (streak.currentCount >= 30) return '#EF4444'; // Red for 30+ days
    if (streak.currentCount >= 14) return '#F59E0B'; // Orange for 14+ days
    if (streak.currentCount >= 7) return '#8B5CF6';  // Purple for 7+ days
    return '#3B82F6'; // Blue for < 7 days
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${getStreakColor()}20` }}
          >
            <div style={{ color: getStreakColor() }}>
              {getStreakIcon()}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{getStreakTitle()}</h3>
            <p className="text-sm text-gray-600">연속 {streak.currentCount}일</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: getStreakColor() }}>
            {streak.currentCount}
          </div>
          <div className="text-xs text-gray-500">최고 {streak.maxCount}일</div>
        </div>
      </div>
      
      {/* Streak progress to next milestone */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">다음 마일스톤까지</span>
          <span className="font-medium">
            {Math.max(0, getNextMilestone(streak.currentCount) - streak.currentCount)}일
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="h-2 rounded-full"
            style={{ backgroundColor: getStreakColor() }}
            initial={{ width: 0 }}
            animate={{ 
              width: `${(streak.currentCount % 7) / 7 * 100}%` 
            }}
            transition={{ duration: 1 }}
          />
        </div>
        <div className="text-xs text-gray-500 text-center">
          보너스 배수: {streak.bonusMultiplier.toFixed(1)}x
        </div>
      </div>
    </div>
  );
}

function getNextMilestone(currentCount: number): number {
  const milestones = [7, 14, 30, 60, 90, 180, 365];
  return milestones.find(m => m > currentCount) || currentCount + 30;
}

function getLevelTitle(level: number) {
  const levelKeys = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
  const targetLevel = levelKeys.find(l => level >= l) || 1;
  return LEVEL_TITLES[targetLevel];
}

export function AdvancedLevelSystem({ userId, className = '' }: AdvancedLevelSystemProps) {
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [streaks, setStreaks] = useState<{ dailyLogin?: Streak; missionComplete?: Streak }>({});
  const [loading, setLoading] = useState(true);
  const [showRewards, setShowRewards] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load user level
      const levelResult = await gamificationService.getUserLevel(userId);
      if (levelResult.success && levelResult.userLevel) {
        setUserLevel(levelResult.userLevel);
      }
      
      // Load user streaks
      const [dailyLoginResult, missionCompleteResult] = await Promise.all([
        gamificationService.getUserStreak(userId, 'daily_login'),
        gamificationService.getUserStreak(userId, 'mission_complete')
      ]);
      
      setStreaks({
        dailyLogin: dailyLoginResult.success ? dailyLoginResult.streak : undefined,
        missionComplete: missionCompleteResult.success ? missionCompleteResult.streak : undefined,
      });
      
    } catch (error) {
      console.error('사용자 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="bg-gray-200 rounded-lg h-32 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-200 rounded-lg h-24"></div>
          <div className="bg-gray-200 rounded-lg h-24"></div>
        </div>
      </div>
    );
  }

  if (!userLevel) {
    return (
      <div className={`${className} text-center py-8`}>
        <p className="text-gray-500">레벨 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const levelInfo = getLevelTitle(userLevel.level);
  const experienceToNext = 100; // Fixed 100 XP per level
  const progressPercentage = (userLevel.experiencePoints / experienceToNext) * 100;
  
  // Find next reward
  const nextReward = LEVEL_REWARDS.find(reward => reward.level > userLevel.level);
  const earnedRewards = LEVEL_REWARDS.filter(reward => reward.level <= userLevel.level);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main level display */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <LevelBadge level={userLevel.level} size="lg" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{levelInfo.title}</h2>
              <p className="text-sm text-gray-600">{levelInfo.subtitle}</p>
              <p className="text-xs text-gray-500 mt-1">레벨 {userLevel.level}</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRewards(true)}
            className="flex items-center space-x-2"
          >
            <Gift className="w-4 h-4" />
            <span>보상 보기</span>
          </Button>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">경험치</span>
            <span className="font-medium">
              {userLevel.experiencePoints.toLocaleString()} / {experienceToNext.toLocaleString()} XP
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
            </motion.div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>총 경험치: {userLevel.totalExperience.toLocaleString()} XP</span>
            {nextReward && (
              <span>다음 보상: 레벨 {nextReward.level}</span>
            )}
          </div>
        </div>
      </div>

      {/* Streaks display */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-500" />
          연속 참여 현황
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {streaks.dailyLogin && (
            <StreakDisplay streak={streaks.dailyLogin} type="daily_login" />
          )}
          {streaks.missionComplete && (
            <StreakDisplay streak={streaks.missionComplete} type="mission_complete" />
          )}
        </div>
      </div>

      {/* Upcoming rewards preview */}
      {nextReward && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{nextReward.icon}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{nextReward.title}</h4>
              <p className="text-sm text-gray-600">{nextReward.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                레벨 {nextReward.level}에서 {nextReward.experienceBonus} XP 보너스
                {nextReward.couponCode && ` + ${nextReward.couponCode} 쿠폰`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {nextReward.level - userLevel.level}레벨 남음
              </div>
              <div className="text-xs text-gray-500">
                {(nextReward.level - userLevel.level) * 100 - userLevel.experiencePoints} XP 필요
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rewards modal */}
      <AnimatePresence>
        {showRewards && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRewards(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">레벨 보상</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowRewards(false)}>
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                {LEVEL_REWARDS.map(reward => {
                  const isEarned = earnedRewards.includes(reward);
                  const isCurrent = reward.level === userLevel.level;
                  
                  return (
                    <div
                      key={reward.level}
                      className={`
                        p-4 rounded-lg border-2 transition-all
                        ${isEarned 
                          ? 'bg-green-50 border-green-200' 
                          : isCurrent 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-gray-50 border-gray-200'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{reward.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900">
                              레벨 {reward.level} - {reward.title}
                            </h4>
                            {isEarned && <Crown className="w-4 h-4 text-yellow-500" />}
                          </div>
                          <p className="text-sm text-gray-600">{reward.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            보상: {reward.experienceBonus} XP
                            {reward.couponCode && ` + ${reward.couponCode} 쿠폰`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}