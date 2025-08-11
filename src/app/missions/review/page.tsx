'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function ReviewMissionPage() {
  const router = useRouter()
  const { user, isAuthenticated, userMissions, updateUserMission } = useAppStore()

  const [reviews, setReviews] = useState({
    smartplace: '',
    drivelicense: '',
    driveway: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 현재 미션 상태 가져오기
  const currentMission = userMissions.find(um => um.missionId === 3) // mission_id 3 = review
  const missionStatus = currentMission?.status || 'pending'

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/register')
      return
    }
  }, [isAuthenticated, router])

  const platforms = [
    {
      key: 'smartplace' as keyof typeof reviews,
      name: '스마트플레이스',
      placeholder: 'https://smartplace.naver.com/...',
      description: '네이버 스마트플레이스'
    },
    {
      key: 'drivelicense' as keyof typeof reviews,
      name: '운전면허플러스',
      placeholder: 'https://drivelicenseplus.com/...',
      description: '운전면허플러스 사이트'
    },
    {
      key: 'driveway' as keyof typeof reviews,
      name: '도로로',
      placeholder: 'https://driveway.co.kr/...',
      description: '도로로 사이트'
    }
  ]

  const handleReviewChange = (platform: keyof typeof reviews, value: string) => {
    setReviews(prev => ({
      ...prev,
      [platform]: value
    }))
  }

  const validateForm = () => {
    const completedReviews = Object.values(reviews).filter(url => url.trim()).length

    if (completedReviews < 3) {
      toast.error('3개 플랫폼 모두에 후기를 작성해주세요.')
      return false
    }

    // 각 URL이 유효한지 검사
    for (const [platform, url] of Object.entries(reviews)) {
      if (url && !url.startsWith('http')) {
        toast.error(`${platform} 링크가 올바르지 않습니다. (http:// 또는 https:// 로 시작해야 합니다)`)
        return false
      }
    }

    return true
  }

  const submitMission = async () => {
    if (!validateForm() || !user) return

    setIsSubmitting(true)

    try {
      const reviewData = platforms.map(platform => ({
        platform: platform.key,
        url: reviews[platform.key],
        completedAt: new Date().toISOString()
      }))

      const proofData = {
        type: 'review' as const,
        reviews: reviewData,
        submittedAt: new Date().toISOString()
      }

      // 미션 서비스 사용
      const { startMission, completeMission } = await import('@/lib/services/missions')

      if (currentMission) {
        // 기존 미션 완료
        const { error } = await completeMission(user.id, '3', JSON.stringify(proofData))
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
        const { error: startError } = await startMission(user.id, '3')
        if (startError) throw new Error(startError)

        const { error: completeError } = await completeMission(user.id, '3', JSON.stringify(proofData))
        if (completeError) throw new Error(completeError)

        // 로컬 상태 업데이트
        const newMission = {
          id: `temp-${Date.now()}`,
          userId: user.id,
          missionId: 3,
          status: 'completed' as const,
          proofData,
          completedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
        updateUserMission(newMission)
      }

      toast.success('미션이 제출되었습니다! 검토 후 커피쿠폰이 지급됩니다.')

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

  const getCompletedCount = () => {
    return Object.values(reviews).filter(url => url.trim()).length
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
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-4 py-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="text-white hover:bg-white/20 p-2"
          >
            ←
          </Button>
          <span className="text-3xl">📝</span>
          <div>
            <h1 className="text-xl font-bold">후기 쓰기 미션</h1>
            <p className="text-white/80 text-sm">진짜 후기, 진짜 혜택!</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="text-white/80 text-sm">페이백 보상</div>
          <div className="text-2xl font-bold">커피쿠폰</div>
          <div className="text-sm text-white/80">+ 월 20만원 장학금 추첨</div>
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
                <p className="text-muted-foreground">제출하신 내용을 검토 중입니다. 검토 완료 후 커피쿠폰이 지급됩니다.</p>
              </>
            )}
            {missionStatus === 'verified' && (
              <>
                <div className="text-4xl mb-2">☕</div>
                <h3 className="text-lg font-semibold text-green-400 mb-2">미션 완료!</h3>
                <p className="text-muted-foreground">축하합니다! 커피쿠폰이 지급되었습니다.</p>
              </>
            )}
          </div>
        )}

        {/* Progress Counter */}
        {missionStatus === 'pending' && (
          <div className="gradient-card rounded-2xl p-6 text-center border border-border">
            <div className="text-4xl font-bold text-primary mb-2">
              {getCompletedCount()}/3
            </div>
            <p className="text-muted-foreground">완료된 후기</p>
          </div>
        )}

        {/* Mission Details */}
        <div className="gradient-card rounded-2xl p-6 border border-border">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-2">미션 안내</h2>
            <p className="text-muted-foreground">3개 플랫폼에 진솔한 후기를 작성하고 혜택을 받아보세요!</p>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-500/20 p-4 rounded-xl">
              <h4 className="font-semibold text-blue-400 mb-2">📋 참여 방법</h4>
              <ul className="text-muted-foreground text-sm space-y-1">
                <li>• 3개 플랫폼 모두에 후기 작성</li>
                <li>• 실제 교육 경험을 바탕으로 한 진솔한 후기</li>
                <li>• 각 플랫폼의 후기 링크 제출</li>
              </ul>
            </div>

            <div className="bg-green-500/20 p-4 rounded-xl">
              <h4 className="font-semibold text-green-400 mb-2">🎁 혜택</h4>
              <ul className="text-muted-foreground text-sm space-y-1">
                <li>• 즉시 지급: 커피쿠폰</li>
                <li>• 추첨 혜택: 월 20만원 장학금 추첨</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Review Forms */}
        {missionStatus === 'pending' && (
          <div className="space-y-4">
            {platforms.map((platform, index) => (
              <div key={platform.key} className="gradient-card rounded-2xl p-4 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-white">
                      {index + 1}. {platform.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {platform.description}에서 후기를 작성하고 링크를 제출해주세요.
                    </p>
                  </div>
                  {reviews[platform.key] && (
                    <span className="text-green-400 text-sm">✓ 완료</span>
                  )}
                </div>

                <div>
                  <Label htmlFor={platform.key} className="text-white">후기 링크</Label>
                  <Input
                    id={platform.key}
                    type="url"
                    placeholder={platform.placeholder}
                    value={reviews[platform.key]}
                    onChange={(e) => handleReviewChange(platform.key, e.target.value)}
                    className="bg-secondary/50 border-border text-white"
                  />
                </div>
              </div>
            ))}

            {/* Submit Button */}
            <div className="gradient-card rounded-2xl p-6 border border-border">
              <Button
                onClick={submitMission}
                disabled={isSubmitting || getCompletedCount() < 3}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                size="lg"
              >
                {isSubmitting ? '제출 중...' :
                 getCompletedCount() < 3 ? `후기 ${3 - getCompletedCount()}개 더 필요` :
                 '미션 제출하기'}
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
