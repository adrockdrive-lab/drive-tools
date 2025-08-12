'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { MissionCard } from './MissionCard'
import { ProgressRing } from './ProgressRing'

export default function GameDashboard() {
  const { user, missions, userMissions, totalPayback, referrals, isLoading } = useAppStore()
  const [stats, setStats] = useState({
    completedMissions: 0,
    totalMissions: 0,
    completionRate: 0
  })

  // 통계 계산
  useEffect(() => {
    if (userMissions && missions) {
      const completed = userMissions.filter(m => m.status === 'completed').length
      const total = missions.length
      setStats({
        completedMissions: completed,
        totalMissions: total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      })
    }
  }, [userMissions, missions])

  // 사용자 정보 확인
  useEffect(() => {
    if (!user) {
      toast.error('사용자 정보를 불러올 수 없습니다.')
    }
  }, [user])



  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-secondary rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 환영 메시지 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">
              안녕하세요, {user?.name}님! 👋
            </h1>
            <p className="text-muted-foreground">
              드라이빙존에서 미션을 완료하고 보상을 받아보세요
            </p>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="gradient-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                총 페이백
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {totalPayback.toLocaleString()}원
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                지금까지 받은 총 보상
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                미션 완료율
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <ProgressRing
                  progress={stats.completionRate}
                  size="lg"
                />
                <div>
                  <div className="text-2xl font-bold text-black">
                    {stats.completionRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.completedMissions}/{stats.totalMissions} 완료
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                추천 보너스
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {referrals.length > 0 ? referrals.length * 50000 : 0}원
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                친구 추천으로 받은 보상
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 미션 그리드 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-black">진행 중인 미션</h2>
            <Badge variant="secondary" className="text-xs">
              {userMissions.filter(m => m.status === 'in_progress').length}개 진행 중
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {missions.map((mission) => {
              const userMission = userMissions.find(um => um.missionId === mission.id)
              const missionWithStatus = {
                ...mission,
                status: userMission?.status || 'pending'
              }

              return (
                <MissionCard
                  key={mission.id}
                  mission={missionWithStatus}
                />
              )
            })}
          </div>

          {missions.length === 0 && (
            <Card className="gradient-card border-border">
              <CardContent className="text-center py-8">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  진행 가능한 미션이 없습니다
                </h3>
                <p className="text-muted-foreground">
                  새로운 미션이 곧 추가될 예정입니다.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CTA 섹션 */}
        <Card className="gradient-card border-border">
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-black mb-2">
              더 많은 보상을 받아보세요!
            </h3>
            <p className="text-muted-foreground mb-4">
              미션을 완료하고 페이백을 받아보세요. 친구를 추천하면 추가 보상도 받을 수 있습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                onClick={() => window.location.href = '/missions/challenge'}
              >
                챌린지 미션
              </Button>
              <Button
                variant="outline"
                className="border-border text-black hover:bg-secondary"
                onClick={() => window.location.href = '/missions/referral'}
              >
                친구 추천
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
