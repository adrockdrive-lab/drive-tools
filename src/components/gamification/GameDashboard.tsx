'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { LevelSystem } from './LevelSystem';
import { PaybackCounter } from './PaybackCounter';
import { ProgressRing } from './ProgressRing';
import { MissionCard } from './MissionCard';
import { ParticleSystem } from './ParticleSystem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';

interface DashboardStats {
  totalPayback: number;
  completedMissions: number;
  totalMissions: number;
  currentLevel: number;
  currentExp: number;
  expToNext: number;
  streak: number;
}

interface SocialActivity {
  id: string;
  userName: string;
  action: string;
  amount?: number;
  timeAgo: string;
}

// Mock social activity data
const MOCK_SOCIAL_ACTIVITIES: SocialActivity[] = [
  { id: '1', userName: '김○○', action: '재능충 챌린지 완료', amount: 20000, timeAgo: '방금 전' },
  { id: '2', userName: '이○○', action: 'SNS 인증 미션 완료', amount: 10000, timeAgo: '2분 전' },
  { id: '3', userName: '박○○', action: '친구 추천 성공', amount: 50000, timeAgo: '5분 전' },
  { id: '4', userName: '최○○', action: '후기 쓰기 완료', timeAgo: '7분 전' },
];

export function GameDashboard() {
  const router = useRouter();
  const {
    user,
    missions,
    userMissions,
    totalPayback,
    isLoading,
    initializeApp
  } = useAppStore();

  const [showParticles, setShowParticles] = useState(false);
  const [socialActivities] = useState<SocialActivity[]>(MOCK_SOCIAL_ACTIVITIES);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute for "time ago" display
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Calculate dashboard stats
  const stats: DashboardStats = {
    totalPayback,
    completedMissions: userMissions.filter(um =>
      um.status === 'completed' || um.status === 'verified'
    ).length,
    totalMissions: missions.length,
    currentLevel: user?.level || 1,
    currentExp: user?.experiencePoints || 0,
    expToNext: Math.max(1000, (user?.level || 1) * 1000),
    streak: user?.currentStreak || 0
  };

  const overallProgress = stats.totalMissions > 0
    ? (stats.completedMissions / stats.totalMissions) * 100
    : 0;

  const handleLevelUp = (newLevel: number) => {
    setShowParticles(true);
    // Could trigger additional celebrations or unlock new features
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />
      
      {/* Particle Effects */}
      <ParticleSystem
        trigger={showParticles}
        type="celebration"
        intensity="high"
        onComplete={() => setShowParticles(false)}
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.h1
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            환영합니다, {user?.name || '운전자'}님! 🎉
          </motion.h1>
          <motion.p
            className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            미션을 완료하고 페이백을 받아보세요. 지금까지 <strong>{stats.completedMissions}</strong>개의 미션을 완료하셨습니다!
          </motion.p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Total Payback */}
          <Card className="text-center overflow-hidden relative bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-700 dark:text-green-300">총 페이백</CardTitle>
            </CardHeader>
            <CardContent>
              <PaybackCounter
                amount={stats.totalPayback}
                size="xl"
                color="success"
                glowEffect={true}
              />
            </CardContent>
          </Card>

          {/* Mission Progress */}
          <Card className="text-center relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-700 dark:text-blue-300">미션 진행도</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-2">
              <ProgressRing
                progress={overallProgress}
                size="lg"
                color="#3B82F6"
                animated={true}
              />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {stats.completedMissions}/{stats.totalMissions} 완료
              </p>
            </CardContent>
          </Card>

          {/* Level System */}
          <Card className="col-span-2 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm text-purple-700 dark:text-purple-300">레벨 시스템</CardTitle>
            </CardHeader>
            <CardContent>
              <LevelSystem
                currentLevel={stats.currentLevel}
                currentExp={stats.currentExp}
                expToNext={stats.expToNext}
                totalExp={stats.currentExp}
                onLevelUp={handleLevelUp}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats & Social Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📊</span>
                  <span>이번 달 현황</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">연속 접속</span>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {stats.streak}일
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">이번 달 완료</span>
                  <span className="font-semibold">{stats.completedMissions}개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">다음 레벨까지</span>
                  <span className="font-semibold text-purple-600">
                    {(stats.expToNext - stats.currentExp).toLocaleString()} XP
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Social Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <motion.span
                    animate={{ rotate: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    🔥
                  </motion.span>
                  <span>실시간 활동</span>
                </CardTitle>
                <CardDescription>다른 사용자들의 최근 활동을 확인해보세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  <AnimatePresence>
                    {socialActivities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {activity.userName}님이 {activity.action}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {activity.timeAgo}
                            </p>
                          </div>
                        </div>
                        {activity.amount && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            +{activity.amount.toLocaleString()}원
                          </Badge>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Mission Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🎯 미션 현황
            </h2>
            <Button variant="outline" size="sm">
              전체 보기
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {missions.map((mission, index) => {
              const userMission = userMissions.find(um => um.missionId === mission.id);

              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.9 + (index * 0.1),
                    type: "spring",
                    stiffness: 200,
                    damping: 20
                  }}
                >
                  <MissionCard
                    mission={mission}
                    userMission={userMission}
                    onStart={() => {
                      // Navigate to mission page
                      console.log('Navigating to mission:', mission.missionType);
                      router.push(`/missions/${mission.missionType}`);
                    }}
                    onContinue={() => {
                      console.log('Continuing mission:', mission.missionType);
                      router.push(`/missions/${mission.missionType}`);
                    }}
                    onViewDetails={() => {
                      console.log('Viewing mission details:', mission.missionType);
                      router.push(`/missions/${mission.missionType}`);
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Call-to-Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center py-12"
        >
          <Card className="inline-block p-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0">
            <div className="max-w-md mx-auto">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-4xl mb-4"
              >
                🚀
              </motion.div>
              <h3 className="text-xl font-bold mb-2">모든 미션을 완료하고</h3>
              <p className="text-indigo-100 mb-4">최대 87,000원의 페이백을 받아보세요!</p>
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold"
                onClick={() => setShowParticles(true)}
              >
                지금 시작하기 ✨
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// Loading skeleton component
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header skeleton */}
        <div className="text-center space-y-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-96 mx-auto animate-pulse" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto animate-pulse" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>

        {/* Mission cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
