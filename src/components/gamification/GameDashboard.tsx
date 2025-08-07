'use client';

import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div className="min-h-screen flex items-center justify-center">
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
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            환영합니다, {user?.name || '운전자'}님!
          </h1>
          <p className="text-lg text-gray-600">
            미션을 완료하고 페이백을 받아보세요. 지금까지 <strong>{completedCount}</strong>개의 미션을 완료하셨습니다!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>총 페이백</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {totalPayback.toLocaleString()}원
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>완료된 미션</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {completedCount}/{missions.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>현재 레벨</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                레벨 {user?.level || 1}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mission Cards */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🎯 미션 현황
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map((mission) => {
              const userMission = userMissions.find(um => um.missionId === mission.id);
              
              return (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  userMission={userMission}
                />
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-12">
          <Card className="inline-block p-8 bg-blue-600 text-white">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-bold mb-2">모든 미션을 완료하고</h3>
              <p className="mb-4">최대 87,000원의 페이백을 받아보세요!</p>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                지금 시작하기
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}