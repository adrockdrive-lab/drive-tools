'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { missionService } from '@/lib/services/missions'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function AttendanceMissionPage() {
  const router = useRouter()
  const { user, missions, userMissions, loadUserMissions, loadPaybacks } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // 출석 미션 찾기
  const attendanceMission = missions.find(m => m.missionType === 'attendance')
  const userParticipation = userMissions.find(um => um.missionId === attendanceMission?.id)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    setLoading(false)
  }, [user, router])

  const handleStartMission = async () => {
    if (!user || !attendanceMission) return

    try {
      setSubmitting(true)
      const result = await missionService.startMissionParticipation(user.id, attendanceMission.id)

      if (result.success) {
        toast.success('출석 미션이 시작되었습니다!')
        await loadUserMissions()
      } else {
        toast.error(result.error || '미션 시작에 실패했습니다.')
      }
    } catch (error) {
      console.error('미션 시작 오류:', error)
      toast.error('미션 시작에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCompleteMission = async () => {
    if (!user || !attendanceMission) return

    try {
      setSubmitting(true)

      const proofData = {
        type: 'attendance',
        attendanceDate: new Date().toISOString(),
        submittedAt: new Date().toISOString()
      }

      const result = await missionService.completeMissionParticipation(
        user.id,
        attendanceMission.id,
        proofData
      )

      if (result.success) {
        toast.success('출석 미션이 완료되었습니다!')
        await loadUserMissions()
        await loadPaybacks()
      } else {
        toast.error(result.error || '미션 완료에 실패했습니다.')
      }
    } catch (error) {
      console.error('미션 완료 오류:', error)
      toast.error('미션 완료에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="text-muted-foreground"
          >
            ← 대시보드로
          </Button>
          <div>
                      <h1 className="text-2xl font-bold text-gray-900">출석 미션</h1>
          <p className="text-gray-600">매일 출석하고 보상을 받아보세요</p>
          </div>
        </div>

        {attendanceMission ? (
          <Card className="bg-white border-gray-200 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">📅</span>
                  <div>
                    <CardTitle className="text-gray-900 text-xl">
                      {attendanceMission.title}
                    </CardTitle>
                    <p className="text-gray-600 text-sm">
                      출석 미션
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`${
                    userParticipation?.status === 'completed'
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : userParticipation?.status === 'in_progress'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}
                >
                  {userParticipation?.status === 'completed' ? '완료' :
                   userParticipation?.status === 'in_progress' ? '진행 중' : '대기'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="text-gray-900 font-semibold mb-2">미션 설명</h3>
                <p className="text-gray-600">
                  {attendanceMission.description}
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className='flex flex-col gap-2'>
                    <div className="text-blue-600 font-bold text-lg">
                      {attendanceMission.rewardAmount.toLocaleString()}원
                    </div>
                    <div className="text-gray-600 text-sm">
                      보상 금액
                    </div>
                  </div>
                  <span className="text-3xl">💰</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-700 mb-2">📋 참여 방법</h4>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• 매일 출석 체크</li>
                  <li>• 연속 출석 시 추가 보상</li>
                  <li>• 출석 버튼을 눌러 완료</li>
                </ul>
              </div>

              {!userParticipation && (
                <Button
                  onClick={handleStartMission}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  {submitting ? '시작 중...' : '미션 시작하기'}
                </Button>
              )}

              {userParticipation?.status === 'in_progress' && (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <div className="text-4xl mb-2">📅</div>
                    <h3 className="text-gray-900 font-semibold mb-1">오늘 출석하기</h3>
                    <p className="text-gray-600">
                      출석 버튼을 눌러 오늘의 출석을 완료하세요.
                    </p>
                  </div>

                  <Button
                    onClick={handleCompleteMission}
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-500/90 hover:to-emerald-600/90"
                  >
                    {submitting ? '완료 중...' : '출석하기'}
                  </Button>
                </div>
              )}

              {userParticipation?.status === 'completed' && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">✅</div>
                  <h3 className="text-gray-900 font-semibold mb-1">출석 완료!</h3>
                  <p className="text-gray-600">
                    축하합니다! 오늘의 출석을 완료했습니다.
                  </p>
                  <div className="mt-4">
                    <Button
                      onClick={() => router.push('/dashboard')}
                      variant="outline"
                      className="border-border text-black hover:bg-secondary"
                    >
                      대시보드로 돌아가기
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="gradient-card border-border">
            <CardContent className="text-center py-8">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-black mb-2">
                진행 가능한 출석 미션이 없습니다
              </h3>
              <p className="text-muted-foreground">
                새로운 출석 미션이 곧 추가될 예정입니다.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
