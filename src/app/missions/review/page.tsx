'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
      const { startMission, submitMissionProof } = await import('@/lib/services/missions')
      
      if (currentMission) {
        // 기존 미션 증명 데이터 제출
        const { userMission, error } = await submitMissionProof(user.id, 3, proofData)
        if (error || !userMission) throw new Error(error || '미션 제출에 실패했습니다.')
        updateUserMission(userMission)
      } else {
        // 새 미션 시작 후 증명 데이터 제출
        const { userMission: newMission, error: startError } = await startMission(user.id, 3)
        if (startError || !newMission) throw new Error(startError || '미션 시작에 실패했습니다.')
        
        const { userMission: completedMission, error: submitError } = await submitMissionProof(user.id, 3, proofData)
        if (submitError || !completedMission) throw new Error(submitError || '미션 제출에 실패했습니다.')
        
        updateUserMission(completedMission)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                  📝 후기 쓰기 미션
                </h1>
                <p className="text-gray-600">진짜 후기, 진짜 혜택!</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">커피쿠폰</div>
              <div className="text-sm text-gray-500">+ 월 20만원 장학금 추첨</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Mission Status */}
          {missionStatus !== 'pending' && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="text-center">
                  {missionStatus === 'completed' && (
                    <>
                      <div className="text-4xl mb-2">⏳</div>
                      <h3 className="text-lg font-semibold text-yellow-600 mb-2">검토 중</h3>
                      <p className="text-gray-600">제출하신 내용을 검토 중입니다. 검토 완료 후 커피쿠폰이 지급됩니다.</p>
                    </>
                  )}
                  {missionStatus === 'verified' && (
                    <>
                      <div className="text-4xl mb-2">☕</div>
                      <h3 className="text-lg font-semibold text-green-600 mb-2">미션 완료!</h3>
                      <p className="text-gray-600">축하합니다! 커피쿠폰이 지급되었습니다.</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Counter */}
          {missionStatus === 'pending' && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {getCompletedCount()}/3
                  </div>
                  <p className="text-gray-600">완료된 후기</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mission Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>미션 안내</CardTitle>
              <CardDescription>
                3개 플랫폼에 진솔한 후기를 작성하고 혜택을 받아보세요!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📋 참여 방법</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• 3개 플랫폼 모두에 후기 작성</li>
                  <li>• 실제 교육 경험을 바탕으로 한 진솔한 후기</li>
                  <li>• 각 플랫폼의 후기 링크 제출</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">🎁 혜택</h4>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• 즉시 지급: 커피쿠폰</li>
                  <li>• 추첨 혜택: 월 20만원 장학금 추첨</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Review Forms */}
          {missionStatus === 'pending' && (
            <div className="space-y-6">
              {platforms.map((platform, index) => (
                <Card key={platform.key}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>
                        {index + 1}. {platform.name}
                      </span>
                      {reviews[platform.key] && (
                        <span className="text-green-600 text-sm">✓ 완료</span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {platform.description}에서 후기를 작성하고 링크를 제출해주세요.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor={platform.key}>후기 링크</Label>
                      <Input
                        id={platform.key}
                        type="url"
                        placeholder={platform.placeholder}
                        value={reviews[platform.key]}
                        onChange={(e) => handleReviewChange(platform.key, e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Submit Button */}
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    onClick={submitMission}
                    disabled={isSubmitting || getCompletedCount() < 3}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? '제출 중...' : 
                     getCompletedCount() < 3 ? `후기 ${3 - getCompletedCount()}개 더 필요` : 
                     '미션 제출하기'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}