'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Calendar, CheckCircle2, Clock, Trophy } from 'lucide-react'

export default function AttendancePage() {
  const router = useRouter()
  const { user } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [todayChecked, setTodayChecked] = useState(false)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // 출석 상태 확인
    checkAttendanceStatus()
  }, [user, router])

  const checkAttendanceStatus = async () => {
    try {
      // TODO: API 연결
      // const { data } = await supabase
      //   .from('attendance')
      //   .select('*')
      //   .eq('user_id', user!.id)
      //   .eq('date', new Date().toISOString().split('T')[0])
      //   .single()

      // setTodayChecked(!!data)
      setStreak(user?.consecutive_days || 0)
    } catch (error) {
      console.error('Error checking attendance:', error)
    }
  }

  const handleCheckIn = async () => {
    if (todayChecked) {
      toast.error('오늘은 이미 출석했습니다!')
      return
    }

    setLoading(true)
    try {
      // TODO: API 연결
      // await supabase.from('attendance').insert({
      //   user_id: user!.id,
      //   date: new Date().toISOString().split('T')[0]
      // })

      // 임시 처리
      setTodayChecked(true)
      setStreak(streak + 1)
      toast.success('출석 완료! +10 XP, +5 코인을 획득했습니다!')
    } catch (error) {
      toast.error('출석 처리에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            ← 뒤로
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">출석 미션</h1>
          <p className="text-gray-600 mt-2">매일 출석하고 보상을 받으세요!</p>
        </div>

        {/* 연속 출석 카드 */}
        <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <CardContent className="py-8 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4" />
            <p className="text-sm opacity-90 mb-2">연속 출석</p>
            <p className="text-5xl font-bold mb-4">{streak}일</p>
            {streak > 0 && (
              <p className="text-sm opacity-90">계속 이어가세요! 🔥</p>
            )}
          </CardContent>
        </Card>

        {/* 출석 체크 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>오늘의 출석</CardTitle>
          </CardHeader>
          <CardContent>
            {todayChecked ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <p className="text-xl font-bold text-gray-900 mb-2">출석 완료!</p>
                <p className="text-gray-600">내일 다시 만나요 😊</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <p className="text-xl font-bold text-gray-900 mb-4">오늘 출석하기</p>
                <Button
                  onClick={handleCheckIn}
                  disabled={loading}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? '처리 중...' : '출석 체크'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 보상 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>출석 보상</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium">매일 출석</p>
                    <p className="text-sm text-gray-600">+10 XP, +5 코인</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium">7일 연속 출석</p>
                    <p className="text-sm text-gray-600">+50 XP, +30 코인</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{streak}/7</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium">30일 연속 출석</p>
                    <p className="text-sm text-gray-600">+200 XP, +150 코인</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{streak}/30</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 출석 캘린더 */}
        <Card>
          <CardHeader>
            <CardTitle>이번 달 출석 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>캘린더 기능은 곧 추가될 예정입니다</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
