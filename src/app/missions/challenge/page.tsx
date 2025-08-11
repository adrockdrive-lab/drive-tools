'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { missionService, type Mission } from '@/lib/services/missions'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function ChallengeMissionPage() {
  const [loading, setLoading] = useState(true)
  const [mission, setMission] = useState<Mission | null>(null)
  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [proofUrl, setProofUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadMissionData()
  }, [])

  const loadMissionData = async () => {
    try {
      setLoading(true)

      // 사용자 정보 로드 (실제로는 인증된 사용자 ID 사용)
      const userData = localStorage.getItem('user')
      if (userData) {
        const currentUser = JSON.parse(userData)
        setUser(currentUser)

        // 챌린지 미션 조회
        const result = await missionService.getUserMissions(currentUser.id)
        if (result.success && result.missions) {
          const challengeMission = result.missions.find(m => m.mission_type === 'challenge')
          setMission(challengeMission || null)
        }
      }
    } catch (error) {
      console.error('미션 데이터 로드 오류:', error)
      toast.error('미션을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartMission = async () => {
    if (!user || !mission) return

    try {
      setSubmitting(true)
      const result = await missionService.startMission(user.id as string, mission.id)
      if (result.success) {
        toast.success('챌린지 미션이 시작되었습니다!')
        loadMissionData() // 데이터 새로고침
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
    if (!user || !mission) return

    if (!proofUrl.trim()) {
      toast.error('증명 URL을 입력해주세요.')
      return
    }

    try {
      setSubmitting(true)
      const result = await missionService.completeMission(user.id as string, mission.id, proofUrl)
      if (result.success) {
        toast.success('챌린지 미션이 완료되었습니다!')
        loadMissionData() // 데이터 새로고침
        setProofUrl('')
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
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary rounded mb-4"></div>
            <div className="h-64 bg-secondary rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="text-muted-foreground"
          >
            ← 뒤로
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">챌린지 미션</h1>
            <p className="text-muted-foreground">도전적인 미션을 완료하고 보상을 받아보세요</p>
          </div>
        </div>

        {mission ? (
          <Card className="gradient-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🎯</span>
                  <div>
                    <CardTitle className="text-white text-xl">
                      {mission.title}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                      챌린지 미션
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`${
                    mission.status === 'completed'
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : mission.status === 'in_progress'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}
                >
                  {mission.status === 'completed' ? '완료' :
                   mission.status === 'in_progress' ? '진행 중' : '대기'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="text-white font-semibold mb-2">미션 설명</h3>
                <p className="text-muted-foreground">
                  {mission.description}
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold text-lg">
                      {mission.reward_amount.toLocaleString()}원
                    </div>
                    <div className="text-muted-foreground text-sm">
                      보상 금액
                    </div>
                  </div>
                  <span className="text-3xl">💰</span>
                </div>
              </div>

              {mission.status === 'pending' && (
                <Button
                  onClick={handleStartMission}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  {submitting ? '시작 중...' : '미션 시작하기'}
                </Button>
              )}

              {mission.status === 'in_progress' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="proofUrl" className="text-white">
                      증명 URL
                    </Label>
                    <Input
                      id="proofUrl"
                      type="url"
                      placeholder="https://example.com/proof"
                      value={proofUrl}
                      onChange={(e) => setProofUrl(e.target.value)}
                      className="bg-secondary/50 border-border text-white mt-1"
                    />
                    <p className="text-muted-foreground text-xs mt-1">
                      미션 완료 증명을 위한 URL을 입력해주세요
                    </p>
                  </div>

                  <Button
                    onClick={handleCompleteMission}
                    disabled={submitting || !proofUrl.trim()}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-500/90 hover:to-emerald-600/90"
                  >
                    {submitting ? '완료 중...' : '미션 완료하기'}
                  </Button>
                </div>
              )}

              {mission.status === 'completed' && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">✅</div>
                  <h3 className="text-white font-semibold mb-1">미션 완료!</h3>
                  <p className="text-muted-foreground">
                    축하합니다! 챌린지 미션을 성공적으로 완료했습니다.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="gradient-card border-border">
            <CardContent className="text-center py-8">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                진행 가능한 챌린지 미션이 없습니다
              </h3>
              <p className="text-muted-foreground">
                새로운 챌린지 미션이 곧 추가될 예정입니다.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
