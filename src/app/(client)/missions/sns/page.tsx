'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { missionService } from '@/lib/services/missions'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function SnsMissionPage() {
  const router = useRouter()
  const { user, missions, userMissions } = useAppStore()
  const [snsUrl, setSnsUrl] = useState('')
  const [platform, setPlatform] = useState('instagram')
  const [isLoading, setIsLoading] = useState(false)

  const mission = missions.find(m => m.missionType === 'sns')
  const userParticipation = userMissions.find(um => um.missionId === mission?.id)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
  }, [user, router])

  const handleStartMission = async () => {
    if (!user || !mission) return

    setIsLoading(true)
    try {
      const result = await missionService.startMissionParticipation(user.id, mission.id)
      if (result.success) {
        toast.success('SNS 미션이 시작되었습니다!')
        window.location.reload()
      } else {
        toast.error(result.error || '미션 시작에 실패했습니다.')
      }
    } catch (error) {
      toast.error('미션 시작 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteMission = async () => {
    if (!user || !mission || !snsUrl) {
      toast.error('SNS URL을 입력해주세요.')
      return
    }

    setIsLoading(true)
    try {
      const proofData = {
        snsUrl,
        platform
      }

      const result = await missionService.completeMissionParticipation(user.id, mission.id, proofData)
      if (result.success) {
        toast.success('SNS 미션이 완료되었습니다!')
        router.push('/dashboard')
      } else {
        toast.error(result.error || '미션 완료에 실패했습니다.')
      }
    } catch (error) {
      toast.error('미션 완료 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-black">SNS 미션</CardTitle>
            <p className="text-muted-foreground">
              드라이빙존을 SNS에 공유하고 리워드를 받아보세요!
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {!userParticipation ? (
              <div className="text-center space-y-4">
                <div className="text-6xl">📱</div>
                <h3 className="text-lg font-semibold text-black">SNS 공유 미션</h3>
                <p className="text-muted-foreground">
                  드라이빙존에서의 경험을 SNS에 공유하고 10,000원을 받아보세요!
                </p>
                <Button
                  onClick={handleStartMission}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  {isLoading ? '시작 중...' : '미션 시작'}
                </Button>
              </div>
            ) : userParticipation.status === 'in_progress' ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl mb-4">📸</div>
                  <h3 className="text-lg font-semibold text-black mb-2">SNS 공유하기</h3>
                  <p className="text-muted-foreground">
                    드라이빙존에서의 경험을 SNS에 공유하고 URL을 입력해주세요.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="platform" className="text-black">SNS 플랫폼</Label>
                    <select
                      id="platform"
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full bg-secondary/50 border border-border text-black rounded-md px-3 py-2"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter</option>
                      <option value="youtube">YouTube</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="snsUrl" className="text-black">SNS URL</Label>
                    <Input
                      id="snsUrl"
                      type="url"
                      placeholder="https://www.instagram.com/p/..."
                      value={snsUrl}
                      onChange={(e) => setSnsUrl(e.target.value)}
                      className="bg-secondary/50 border-border text-black"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      공유한 SNS 게시물의 URL을 입력해주세요.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => router.push('/dashboard')}
                    variant="outline"
                    className="flex-1 border-border text-black hover:bg-secondary"
                  >
                    대시보드로
                  </Button>
                  <Button
                    onClick={handleCompleteMission}
                    disabled={isLoading || !snsUrl}
                    className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  >
                    {isLoading ? '완료 중...' : '미션 완료'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-6xl">✅</div>
                <h3 className="text-lg font-semibold text-black">미션 완료!</h3>
                <p className="text-muted-foreground">
                  SNS 미션을 성공적으로 완료했습니다.
                </p>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  대시보드로 돌아가기
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
