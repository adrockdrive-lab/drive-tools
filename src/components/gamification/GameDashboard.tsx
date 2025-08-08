'use client';

import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { MissionCard } from './MissionCard';

export function GameDashboard() {
  const {
    user,
    missions,
    userMissions,
    totalPayback,
    isLoading
  } = useAppStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  const completedCount = userMissions.filter(um =>
    um.status === 'completed' || um.status === 'verified'
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Status Bar */}


      <Header />

      <div className="px-4 py-6 space-y-6">
        {/* Header Section - Mobile First */}
        <div className="gradient-card rounded-3xl p-6 text-white border border-border">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold">
                안녕하세요, {user?.name || '운전자'}님! 👋
              </h1>
              <p className="text-muted-foreground text-sm mt-2">
                미션을 완료하고 페이백을 받아보세요
              </p>
            </div>

            <div className="flex gap-3">
              <div className="glass rounded-2xl px-4 py-3 flex-1">
                <div className="text-muted-foreground text-xs">완료한 미션</div>
                <div className="font-bold text-lg">{completedCount}개</div>
              </div>
              <div className="glass rounded-2xl px-4 py-3 flex-1">
                <div className="text-muted-foreground text-xs">현재 레벨</div>
                <div className="font-bold text-lg">Lv.{user?.level || 1}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Payback - Large Card */}
          <div className="col-span-2 bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-4 text-white">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">💰</span>
                <span className="text-white/80 text-sm">총 페이백</span>
              </div>
              <div className="text-2xl font-bold">
                {totalPayback.toLocaleString()}원
              </div>
              <div className="text-white/80 text-xs">
                지금까지 적립한 금액
              </div>
            </div>
          </div>

          {/* Progress Card */}
          <div className="gradient-card rounded-2xl p-4 border border-border">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl">📊</span>
                <span className="text-muted-foreground text-xs">진행률</span>
              </div>
              <div className="text-xl font-bold text-white">
                {Math.round((completedCount / missions.length) * 100)}%
              </div>
            </div>
          </div>

          {/* Streak Card */}
          <div className="gradient-card rounded-2xl p-4 border border-border">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🔥</span>
                <span className="text-muted-foreground text-xs">연속</span>
              </div>
              <div className="text-xl font-bold text-white">
                {user?.currentStreak || 0}일
              </div>
            </div>
          </div>
        </div>

        {/* Mission Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              🎯 미션 현황
            </h2>
          </div>

          {/* Mission Cards */}
          <div className="space-y-3">
            {missions.map((mission, index) => {
              const userMission = userMissions.find(um => um.missionId === mission.id);

              return (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  userMission={userMission}
                  size="large"
                />
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-6 text-white text-center">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">모든 미션을 완료하고</h3>
              <p className="text-white/90 text-sm">최대 87,000원의 페이백을 받아보세요!</p>
            </div>
            <Button
              size="lg"
              className="bg-white text-orange-500 hover:bg-gray-100 font-semibold w-full"
            >
              지금 시작하기 🚀
            </Button>
          </div>
        </div>

        {/* Bottom Spacing for Mobile */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
