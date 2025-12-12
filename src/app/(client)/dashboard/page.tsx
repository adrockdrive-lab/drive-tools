'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Award, TrendingUp, Trophy, Zap } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAppStore()
  const [stats, setStats] = useState({
    level: 1,
    xp: 0,
    nextLevelXP: 100,
    coins: 0,
    streak: 0,
    completedMissions: 0,
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // 사용자 통계 로드
    setStats({
      level: user.level || 1,
      xp: user.xp || 0,
      nextLevelXP: ((user.level || 1) + 1) * 100,
      coins: user.coins || 0,
      streak: user.consecutive_days || 0,
      completedMissions: 0,
    })
  }, [user, router])

  const xpProgress = (stats.xp / stats.nextLevelXP) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600 mt-2">안녕하세요, {user?.nickname || user?.name}님!</p>
        </div>

        {/* 레벨 카드 */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm opacity-90">현재 레벨</p>
                <p className="text-4xl font-bold">Level {stats.level}</p>
              </div>
              <Trophy className="h-16 w-16 opacity-80" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{stats.xp} XP</span>
                <span>{stats.nextLevelXP} XP</span>
              </div>
              <Progress value={xpProgress} className="bg-white/20 h-3" />
            </div>
          </CardContent>
        </Card>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Trophy className="h-4 w-4 mr-2 text-yellow-600" />
                코인
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">{stats.coins}</p>
              <p className="text-xs text-gray-500 mt-1">사용 가능한 코인</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-orange-600" />
                연속 출석
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{stats.streak}일</p>
              <p className="text-xs text-gray-500 mt-1">계속 이어가세요!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Zap className="h-4 w-4 mr-2 text-green-600" />
                완료한 미션
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.completedMissions}개</p>
              <p className="text-xs text-gray-500 mt-1">총 완료 미션</p>
            </CardContent>
          </Card>
        </div>

        {/* 빠른 액션 */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 액션</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => router.push('/missions/attendance')}
                className="h-24 flex flex-col items-center justify-center"
              >
                <Award className="h-8 w-8 mb-2" />
                <span>출석 미션</span>
              </Button>
              <Button
                onClick={() => router.push('/missions/challenge')}
                className="h-24 flex flex-col items-center justify-center"
                variant="outline"
              >
                <Trophy className="h-8 w-8 mb-2" />
                <span>챌린지</span>
              </Button>
              <Button
                onClick={() => router.push('/missions/review')}
                className="h-24 flex flex-col items-center justify-center"
                variant="outline"
              >
                <Zap className="h-8 w-8 mb-2" />
                <span>후기 작성</span>
              </Button>
              <Button
                onClick={() => router.push('/profile')}
                className="h-24 flex flex-col items-center justify-center"
                variant="outline"
              >
                <TrendingUp className="h-8 w-8 mb-2" />
                <span>내 프로필</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 최근 활동 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>아직 활동이 없습니다.</p>
              <p className="text-sm mt-2">미션을 시작해보세요!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
