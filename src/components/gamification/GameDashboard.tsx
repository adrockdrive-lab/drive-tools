'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { missionService, type Mission } from '@/lib/services/missions'
import { paybackService } from '@/lib/services/paybacks'
import { referralService } from '@/lib/services/referrals'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { MissionCard } from './MissionCard'
import { ProgressRing } from './ProgressRing'

interface User {
  id: string
  name: string
  phone: string
  branch_id?: string
  referral_bonus?: number
  consecutive_days?: number
}

export default function GameDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [missions, setMissions] = useState<Mission[]>([])
  const [totalPayback, setTotalPayback] = useState(0)
  const [referralBonus, setReferralBonus] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    completedMissions: 0,
    totalMissions: 0,
    completionRate: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // 사용자 정보 로드 (실제로는 인증된 사용자 ID 사용)
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        toast.error('사용자 정보를 불러올 수 없습니다.')
        return
      }

      setUser(currentUser)

      // 미션 데이터 로드
      const missionResult = await missionService.getUserMissions(currentUser.id)
      if (missionResult.success && missionResult.missions) {
        setMissions(missionResult.missions)

        const completed = missionResult.missions.filter(m => m.status === 'completed').length
        const total = missionResult.missions.length
        setStats({
          completedMissions: completed,
          totalMissions: total,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        })
      }

      // 페이백 데이터 로드
      const paybackResult = await paybackService.getUserTotalPayback(currentUser.id)
      if (paybackResult.success) {
        setTotalPayback(paybackResult.total || 0)
      }

      // 추천 보너스 로드
      const referralResult = await referralService.getUserReferralBonus(currentUser.id)
      if (referralResult.success) {
        setReferralBonus(referralResult.bonus || 0)
      }

    } catch (error) {
      console.error('대시보드 데이터 로드 오류:', error)
      toast.error('데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentUser = async (): Promise<User | null> => {
    // 실제로는 인증된 사용자 정보를 가져와야 함
    // 임시로 로컬 스토리지에서 사용자 정보를 가져옴
    const userData = localStorage.getItem('user')
    if (userData) {
      return JSON.parse(userData)
    }
    return null
  }

  const handleMissionStart = async (missionId: string) => {
    if (!user) return

    try {
      const result = await missionService.startMission(user.id, missionId)
      if (result.success) {
        toast.success('미션이 시작되었습니다!')
        loadDashboardData() // 데이터 새로고침
      } else {
        toast.error(result.error || '미션 시작에 실패했습니다.')
      }
    } catch (error) {
      console.error('미션 시작 오류:', error)
      toast.error('미션 시작에 실패했습니다.')
    }
  }

  const handleMissionComplete = async (missionId: string) => {
    if (!user) return

    try {
      const result = await missionService.completeMission(user.id, missionId)
      if (result.success) {
        toast.success('미션이 완료되었습니다!')
        loadDashboardData() // 데이터 새로고침
      } else {
        toast.error(result.error || '미션 완료에 실패했습니다.')
      }
    } catch (error) {
      console.error('미션 완료 오류:', error)
      toast.error('미션 완료에 실패했습니다.')
    }
  }

  if (loading) {
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              안녕하세요, {user?.name}님! 👋
            </h1>
            <p className="text-muted-foreground">
              {user?.branch_id ? `${user.branch_id} 지점` : '드라이빙존'}에서 미션을 완료하고 보상을 받아보세요
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
              <div className="text-2xl font-bold text-white">
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
                  size={60}
                  strokeWidth={4}
                />
                <div>
                  <div className="text-2xl font-bold text-white">
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
              <div className="text-2xl font-bold text-white">
                {referralBonus.toLocaleString()}원
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
            <h2 className="text-xl font-bold text-white">진행 중인 미션</h2>
            <Badge variant="secondary" className="text-xs">
              {missions.filter(m => m.status === 'in_progress').length}개 진행 중
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {missions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onStart={() => handleMissionStart(mission.id)}
                onComplete={() => handleMissionComplete(mission.id)}
              />
            ))}
          </div>

          {missions.length === 0 && (
            <Card className="gradient-card border-border">
              <CardContent className="text-center py-8">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold text-white mb-2">
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
            <h3 className="text-xl font-bold text-white mb-2">
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
                className="border-border text-white hover:bg-secondary"
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
