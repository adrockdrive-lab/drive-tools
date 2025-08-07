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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  const completedCount = userMissions.filter(um => 
    um.status === 'completed' || um.status === 'verified'
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="p-4 max-w-7xl mx-auto space-y-6">
        {/* Header Section - Mobile First */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                안녕하세요, {user?.name || '운전자'}님! 👋
              </h1>
              <p className="text-slate-200 text-sm sm:text-base mt-2">
                미션을 완료하고 페이백을 받아보세요
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-indigo-100">완료한 미션</div>
                <div className="font-bold text-lg">{completedCount}개</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-indigo-100">현재 레벨</div>
                <div className="font-bold text-lg">Lv.{user?.level || 1}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Payback - Large Card */}
          <div className="col-span-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 sm:p-6 text-white">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">💰</span>
                <span className="text-green-100 text-sm">총 페이백</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold">
                {totalPayback.toLocaleString()}원
              </div>
              <div className="text-green-100 text-xs sm:text-sm">
                지금까지 적립한 금액
              </div>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl">📊</span>
                <span className="text-gray-600 text-xs">진행률</span>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {Math.round((completedCount / missions.length) * 100)}%
              </div>
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🔥</span>
                <span className="text-gray-600 text-xs">연속</span>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {user?.currentStreak || 0}일
              </div>
            </div>
          </div>
        </div>

        {/* Mission Grid - Bento Style */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              🎯 미션 현황
            </h2>
          </div>
          
          {/* Bento Grid for Missions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {missions.map((mission, index) => {
              const userMission = userMissions.find(um => um.missionId === mission.id);
              
              // Assign different sizes for visual variety
              let size: 'small' | 'medium' | 'large' = 'small';
              if (index === 0) size = 'large'; // First mission gets large size
              else if (index % 3 === 1) size = 'medium'; // Every 3rd mission gets medium
              // All others get small size for better content fit
              
              return (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  userMission={userMission}
                  size={size}
                />
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl p-6 text-white text-center">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold">모든 미션을 완료하고</h3>
              <p className="text-white/90 text-sm sm:text-base">최대 87,000원의 페이백을 받아보세요!</p>
            </div>
            <Button 
              size="lg" 
              className="bg-white text-orange-500 hover:bg-gray-100 font-semibold px-8"
            >
              지금 시작하기 🚀
            </Button>
          </div>
        </div>

        {/* Bottom Spacing for Mobile */}
        <div className="h-20 sm:h-8"></div>
      </div>
    </div>
  );
}