'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Calendar, Flame, Gift } from 'lucide-react'

export default function AttendanceMissionPage() {
  const router = useRouter()
  const { user, isAuthenticated, userMissions, updateUserMission } = useAppStore()
  
  const [attendanceData, setAttendanceData] = useState({
    todayChecked: false,
    consecutiveDays: 0,
    totalDays: 0,
    weeklyProgress: [false, false, false, false, false, false, false], // 이번 주 출석
    monthlyReward: 0
  })
  const [isChecking, setIsChecking] = useState(false)

  // 현재 미션 상태 가져오기
  const currentMission = userMissions.find(um => um.missionId === 5) // mission_id 5 = attendance
  const missionStatus = currentMission?.status || 'pending'

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/register')
      return
    }
    
    // 출석 데이터 로드
    loadAttendanceData()
  }, [isAuthenticated, router])

  const loadAttendanceData = async () => {
    if (!user) return

    try {
      // 실제로는 API를 통해 출석 데이터를 가져옵니다
      // 여기서는 로컬 스토리지를 사용한 모의 데이터
      const today = new Date().toDateString()
      const lastChecked = localStorage.getItem('lastAttendanceDate')
      const consecutiveStr = localStorage.getItem('consecutiveDays')
      const totalStr = localStorage.getItem('totalAttendanceDays')
      
      const todayChecked = lastChecked === today
      const consecutiveDays = todayChecked ? parseInt(consecutiveStr || '1') : 0
      const totalDays = parseInt(totalStr || '0')
      
      // 이번 주 출석 현황 (모의 데이터)
      const weeklyProgress = Array(7).fill(false).map((_, i) => i < Math.min(consecutiveDays, 7))
      
      setAttendanceData({
        todayChecked,
        consecutiveDays,
        totalDays,
        weeklyProgress,
        monthlyReward: Math.min(totalDays * 1000, 30000) // 일당 1000원, 최대 30000원
      })
    } catch (error) {
      console.error('Failed to load attendance data:', error)
    }
  }

  const checkAttendance = async () => {
    if (!user || attendanceData.todayChecked) return

    setIsChecking(true)

    try {
      const today = new Date().toDateString()
      const newConsecutiveDays = attendanceData.consecutiveDays + 1
      const newTotalDays = attendanceData.totalDays + 1
      
      // 로컬 스토리지에 저장 (실제로는 API 호출)
      localStorage.setItem('lastAttendanceDate', today)
      localStorage.setItem('consecutiveDays', newConsecutiveDays.toString())
      localStorage.setItem('totalAttendanceDays', newTotalDays.toString())
      
      // 출석 데이터 업데이트
      const newWeeklyProgress = [...attendanceData.weeklyProgress]
      const todayIndex = new Date().getDay()
      newWeeklyProgress[todayIndex] = true
      
      setAttendanceData(prev => ({
        ...prev,
        todayChecked: true,
        consecutiveDays: newConsecutiveDays,
        totalDays: newTotalDays,
        weeklyProgress: newWeeklyProgress,
        monthlyReward: Math.min(newTotalDays * 1000, 30000)
      }))

      // 출석체크 보상 지급
      const baseReward = 1000
      const consecutiveBonus = Math.min(newConsecutiveDays * 100, 1000) // 연속 보너스 최대 1000원
      const totalReward = baseReward + consecutiveBonus

      // 미션 진행 상태 업데이트
      const proofData = {
        type: 'attendance' as const,
        date: today,
        consecutiveDays: newConsecutiveDays,
        totalDays: newTotalDays,
        reward: totalReward,
        submittedAt: new Date().toISOString()
      }

      // 미션 서비스 사용
      const { startMission, submitMissionProof } = await import('@/lib/services/missions')
      
      if (currentMission) {
        // 기존 미션 업데이트
        const updatedMission = {
          ...currentMission,
          status: 'in_progress' as const,
          proofData
        }
        updateUserMission(updatedMission)
      } else {
        // 새 미션 시작
        const { userMission: newMission, error: startError } = await startMission(user.id, 5)
        if (!startError && newMission) {
          updateUserMission({
            ...newMission,
            status: 'in_progress',
            proofData
          })
        }
      }
      
      // 성공 메시지
      let message = `출석체크 완료! +${totalReward.toLocaleString()}원 적립`
      if (newConsecutiveDays >= 7) {
        message += ` 🔥 ${newConsecutiveDays}일 연속!`
      }
      
      toast.success(message)

    } catch (error) {
      toast.error('출석체크에 실패했습니다.')
      console.error('Attendance check error:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const getDayName = (index: number) => {
    const days = ['일', '월', '화', '수', '목', '금', '토']
    return days[index]
  }

  const getStreakMessage = () => {
    const { consecutiveDays } = attendanceData
    if (consecutiveDays === 0) return '첫 출석을 시작해보세요!'
    if (consecutiveDays < 7) return `${consecutiveDays}일 연속 출석 중!`
    if (consecutiveDays < 30) return `🔥 ${consecutiveDays}일 연속! 대단해요!`
    return `🏆 ${consecutiveDays}일 연속! 출석 마스터!`
  }

  const getNextRewardInfo = () => {
    const { consecutiveDays } = attendanceData
    const nextMilestone = Math.ceil((consecutiveDays + 1) / 7) * 7
    const daysToNext = nextMilestone - consecutiveDays
    
    if (daysToNext <= 0) return null
    
    return {
      days: daysToNext,
      reward: nextMilestone * 500, // 주간 보너스
      milestone: nextMilestone
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  const nextReward = getNextRewardInfo()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/dashboard')}
              >
                ← 대시보드
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  📅 출석체크 미션
                </h1>
                <p className="text-gray-600">매일 출석하고 보상 받기!</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">
                {attendanceData.monthlyReward.toLocaleString()}원
              </div>
              <div className="text-sm text-gray-500">이번 달 적립</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Today's Check-in */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-yellow-400/10" />
            <CardContent className="pt-8 relative">
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {attendanceData.todayChecked ? '✅' : '📅'}
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {attendanceData.todayChecked ? '오늘 출석 완료!' : '오늘 출석하기'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {getStreakMessage()}
                </p>
                
                {!attendanceData.todayChecked ? (
                  <Button
                    onClick={checkAttendance}
                    disabled={isChecking}
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                  >
                    {isChecking ? '출석 중...' : '출석체크 하기'}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      오늘 출석 완료 ✨
                    </Badge>
                    <p className="text-sm text-gray-500">
                      내일도 출석해서 연속 기록을 이어가세요!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>이번 주 출석</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {attendanceData.weeklyProgress.map((checked, index) => (
                  <div
                    key={index}
                    className={`aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-semibold ${
                      checked
                        ? 'bg-green-100 border-green-300 text-green-800'
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div>{getDayName(index)}</div>
                      <div className="text-xs mt-1">
                        {checked ? '✓' : '-'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {attendanceData.consecutiveDays}
                </div>
                <div className="text-sm text-gray-500">연속 출석</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {attendanceData.totalDays}
                </div>
                <div className="text-sm text-gray-500">총 출석일</div>
              </CardContent>
            </Card>

            <Card className="md:col-span-1 col-span-2">
              <CardContent className="pt-6 text-center">
                <Gift className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {attendanceData.monthlyReward.toLocaleString()}원
                </div>
                <div className="text-sm text-gray-500">이번 달 적립</div>
              </CardContent>
            </Card>
          </div>

          {/* Next Milestone */}
          {nextReward && (
            <Card>
              <CardHeader>
                <CardTitle>다음 목표</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-gray-600 mb-2">
                    {nextReward.days}일 더 출석하면
                  </p>
                  <div className="text-xl font-bold text-purple-600">
                    +{nextReward.reward.toLocaleString()}원 보너스
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {nextReward.milestone}일 연속 출석 달성!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mission Guide */}
          <Card>
            <CardHeader>
              <CardTitle>출석체크 안내</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">💰 보상 체계</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• 기본 보상: 1,000원/일</li>
                  <li>• 연속 보너스: +100원/일 (최대 1,000원)</li>
                  <li>• 주간 보너스: 7일 연속시 추가 보상</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">🏆 달성 혜택</h4>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• 7일 연속: 5,000원 추가</li>
                  <li>• 30일 연속: 20,000원 추가</li>
                  <li>• 매월 최대 30,000원 적립 가능</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">📝 참여 방법</h4>
                <ul className="text-yellow-800 text-sm space-y-1">
                  <li>• 매일 한 번씩 출석체크 버튼 클릭</li>
                  <li>• 자정이 지나면 새로운 출석 가능</li>
                  <li>• 연속 출석으로 더 큰 보상 획득</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}