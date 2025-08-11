'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function SNSMissionPage() {
  const router = useRouter()
  const { user, isAuthenticated, userMissions, updateUserMission } = useAppStore()

  const [snsUrl, setSnsUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 현재 미션 상태 가져오기
  const currentMission = userMissions.find(um => um.missionId === 2) // mission_id 2 = sns
  const missionStatus = currentMission?.status || 'pending'

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/register')
      return
    }
  }, [isAuthenticated, router])

  const validateSNSUrl = (url: string) => {
    const snsPattern = /^https?:\/\/(www\.)?(instagram|facebook|twitter|tiktok|youtube)\.com\/.+/
    return snsPattern.test(url)
  }

  const validateForm = () => {
    if (!snsUrl.trim()) {
      toast.error('SNS 링크를 입력해주세요.')
      return false
    }

    if (!validateSNSUrl(snsUrl)) {
      toast.error('올바른 SNS 링크를 입력해주세요. (Instagram, Facebook, Twitter, TikTok, YouTube)')
      return false
    }

    return true
  }

  const submitMission = async () => {
    if (!validateForm() || !user) return

    setIsSubmitting(true)

    try {
      const platform = snsUrl.includes('instagram') ? 'instagram' as const :
                     snsUrl.includes('facebook') ? 'facebook' as const :
                     snsUrl.includes('twitter') ? 'twitter' as const :
                     snsUrl.includes('tiktok') ? 'tiktok' as const : 'other' as const

      const proofData = {
        type: 'sns' as const,
        snsUrl,
        platform,
        submittedAt: new Date().toISOString()
      }

      // 미션 서비스 사용
      const { startMission, completeMission } = await import('@/lib/services/missions')

      if (currentMission) {
        // 기존 미션 완료
        const { error } = await completeMission(user.id, '2', JSON.stringify(proofData))
        if (error) throw new Error(error)

        // 로컬 상태 업데이트
        const updatedMission = {
          ...currentMission,
          status: 'completed' as const,
          proofData
        }
        updateUserMission(updatedMission)
      } else {
        // 새 미션 시작 후 완료
        const { error: startError } = await startMission(user.id, '2')
        if (startError) throw new Error(startError)

        const { error: completeError } = await completeMission(user.id, '2', JSON.stringify(proofData))
        if (completeError) throw new Error(completeError)

        // 로컬 상태 업데이트
        const newMission = {
          id: `temp-${Date.now()}`,
          userId: user.id,
          missionId: 2,
          status: 'completed' as const,
          proofData,
          completedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
        updateUserMission(newMission)
      }

      toast.success('미션이 제출되었습니다! 검토 후 페이백이 지급됩니다.')

      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error) {
      toast.error('미션 제출에 실패했습니다.')
      console.error('Submit error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Status Bar */}


      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 px-4 py-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="text-white hover:bg-white/20 p-2"
          >
            ←
          </Button>
          <span className="text-3xl">📱</span>
          <div>
            <h1 className="text-xl font-bold">SNS 인증 미션</h1>
            <p className="text-white/80 text-sm">합격을 자랑하고 페이백 받자!</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="text-white/80 text-sm">페이백 보상</div>
          <div className="text-2xl font-bold">10,000원</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-4">
        {/* Mission Status */}
        {missionStatus !== 'pending' && (
          <div className="gradient-card rounded-2xl p-6 text-center border border-border">
            {missionStatus === 'completed' && (
              <>
                <div className="text-4xl mb-2">⏳</div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">검토 중</h3>
                <p className="text-muted-foreground">제출하신 내용을 검토 중입니다. 검토 완료 후 페이백이 지급됩니다.</p>
              </>
            )}
            {missionStatus === 'verified' && (
              <>
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-lg font-semibold text-green-400 mb-2">미션 완료!</h3>
                <p className="text-muted-foreground">축하합니다! 10,000원 페이백이 지급되었습니다.</p>
              </>
            )}
          </div>
        )}

        {/* Mission Details */}
        <div className="gradient-card rounded-2xl p-6 border border-border">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-2">미션 안내</h2>
            <p className="text-muted-foreground">운전면허 합격을 SNS에 자랑하고 페이백을 받아보세요!</p>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-500/20 p-4 rounded-xl">
              <h4 className="font-semibold text-blue-400 mb-2">📋 참여 방법</h4>
              <ul className="text-muted-foreground text-sm space-y-1">
                <li>• 운전면허 합격 사진을 SNS에 업로드</li>
                <li>• 게시물 공개 설정 필수</li>
                <li>• 해당 게시물 링크를 제출</li>
              </ul>
            </div>

            <div className="bg-green-500/20 p-4 rounded-xl">
              <h4 className="font-semibold text-green-400 mb-2">🎁 혜택</h4>
              <ul className="text-muted-foreground text-sm space-y-1">
                <li>• 페이백: 10,000원</li>
              </ul>
            </div>

            <div className="bg-yellow-500/20 p-4 rounded-xl">
              <h4 className="font-semibold text-yellow-400 mb-2">📱 지원 플랫폼</h4>
              <ul className="text-muted-foreground text-sm space-y-1">
                <li>• Instagram, Facebook, Twitter, TikTok, YouTube</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submission Form */}
        {missionStatus === 'pending' && (
          <div className="gradient-card rounded-2xl p-6 border border-border">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white">미션 인증</h2>
              <p className="text-muted-foreground">SNS에 업로드한 게시물 링크를 제출해주세요.</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="snsUrl" className="text-white">SNS 게시물 링크</Label>
                <Input
                  id="snsUrl"
                  type="url"
                  placeholder="https://instagram.com/p/..."
                  value={snsUrl}
                  onChange={(e) => setSnsUrl(e.target.value)}
                  className="bg-secondary/50 border-border text-white"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  운전면허 합격 사진이 포함된 게시물의 링크를 입력해주세요.
                </p>
              </div>

              <Button
                onClick={submitMission}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                size="lg"
              >
                {isSubmitting ? '제출 중...' : '미션 제출하기'}
              </Button>
            </div>
          </div>
        )}

        {/* Bottom Spacing for Mobile */}
        <div className="h-20"></div>
      </div>
    </div>
  )
}
