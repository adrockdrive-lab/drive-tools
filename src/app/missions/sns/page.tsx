'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { missionService } from '@/lib/services/missions'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function SNSMissionPage() {
  const router = useRouter()
  const { user, missions, userMissions, loadUserMissions, loadPaybacks } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [snsUrl, setSnsUrl] = useState('')

  // SNS 미션 찾기
  const snsMission = missions.find(m => m.missionType === 'sns')
  const userParticipation = userMissions.find(um => um.missionId === snsMission?.id)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    setLoading(false)
  }, [user, router])

  const validateSNSUrl = (url: string) => {
    const snsPattern = /^https?:\/\/(www\.)?(instagram|facebook|twitter|tiktok|youtube)\.com\/.+/
    return snsPattern.test(url)
  }

  const handleStartMission = async () => {
    if (!user || !snsMission) return

    try {
      setSubmitting(true)
      const result = await missionService.startMissionParticipation(user.id, snsMission.id)

      if (result.success) {
        toast.success('SNS 미션이 시작되었습니다!')
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
    if (!user || !snsMission) return

    if (!snsUrl.trim()) {
      toast.error('SNS 링크를 입력해주세요.')
      return
    }

    if (!validateSNSUrl(snsUrl)) {
      toast.error('올바른 SNS 링크를 입력해주세요. (Instagram, Facebook, Twitter, TikTok, YouTube)')
      return
    }

    try {
      setSubmitting(true)

      const platform = snsUrl.includes('instagram') ? 'instagram' :
                     snsUrl.includes('facebook') ? 'facebook' :
                     snsUrl.includes('twitter') ? 'twitter' :
                     snsUrl.includes('tiktok') ? 'tiktok' : 'youtube'

      const proofData = {
        type: 'sns',
        snsUrl,
        platform,
        submittedAt: new Date().toISOString()
      }

      const result = await missionService.completeMissionParticipation(
        user.id,
        snsMission.id,
        proofData
      )

      if (result.success) {
        toast.success('SNS 미션이 완료되었습니다!')
        await loadUserMissions()
        await loadPaybacks()
        setSnsUrl('')
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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-4">
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
            <h1 className="text-2xl font-bold text-white">SNS 미션</h1>
            <p className="text-muted-foreground">운전면허 합격을 SNS에 자랑하고 보상을 받아보세요</p>
          </div>
        </div>

        {snsMission ? (
          <Card className="gradient-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">📱</span>
                  <div>
                    <CardTitle className="text-white text-xl">
                      {snsMission.title}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                      SNS 미션
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
                <h3 className="text-white font-semibold mb-2">미션 설명</h3>
                <p className="text-muted-foreground">
                  {snsMission.description}
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold text-lg">
                      {snsMission.rewardAmount.toLocaleString()}원
                    </div>
                    <div className="text-muted-foreground text-sm">
                      보상 금액
                    </div>
                  </div>
                  <span className="text-3xl">💰</span>
                </div>
              </div>

              <div className="bg-blue-500/20 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-400 mb-2">📋 참여 방법</h4>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>• 운전면허 합격 사진을 SNS에 업로드</li>
                  <li>• 게시물 공개 설정 필수</li>
                  <li>• 해당 게시물 링크를 제출</li>
                </ul>
              </div>

              <div className="bg-yellow-500/20 p-4 rounded-xl">
                <h4 className="font-semibold text-yellow-400 mb-2">📱 지원 플랫폼</h4>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>• Instagram, Facebook, Twitter, TikTok, YouTube</li>
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
                  <div>
                    <Label htmlFor="snsUrl" className="text-white">
                      SNS 게시물 링크
                    </Label>
                    <Input
                      id="snsUrl"
                      type="url"
                      placeholder="https://instagram.com/p/..."
                      value={snsUrl}
                      onChange={(e) => setSnsUrl(e.target.value)}
                      className="bg-secondary/50 border-border text-white mt-1"
                    />
                    <p className="text-muted-foreground text-xs mt-1">
                      운전면허 합격 사진이 포함된 게시물의 링크를 입력해주세요.
                    </p>
                  </div>

                  <Button
                    onClick={handleCompleteMission}
                    disabled={submitting || !snsUrl.trim()}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-500/90 hover:to-emerald-600/90"
                  >
                    {submitting ? '완료 중...' : '미션 완료하기'}
                  </Button>
                </div>
              )}

              {userParticipation?.status === 'completed' && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">✅</div>
                  <h3 className="text-white font-semibold mb-1">미션 완료!</h3>
                  <p className="text-muted-foreground">
                    축하합니다! SNS 미션을 성공적으로 완료했습니다.
                  </p>
                  <div className="mt-4">
                    <Button
                      onClick={() => router.push('/dashboard')}
                      variant="outline"
                      className="border-border text-white hover:bg-secondary"
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
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                진행 가능한 SNS 미션이 없습니다
              </h3>
              <p className="text-muted-foreground">
                새로운 SNS 미션이 곧 추가될 예정입니다.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
