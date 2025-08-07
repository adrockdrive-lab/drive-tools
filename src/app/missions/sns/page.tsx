'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
      const { startMission, submitMissionProof } = await import('@/lib/services/missions')
      
      if (currentMission) {
        // 기존 미션 증명 데이터 제출
        const { userMission, error } = await submitMissionProof(user.id, 2, proofData)
        if (error || !userMission) throw new Error(error || '미션 제출에 실패했습니다.')
        updateUserMission(userMission)
      } else {
        // 새 미션 시작 후 증명 데이터 제출
        const { userMission: newMission, error: startError } = await startMission(user.id, 2)
        if (startError || !newMission) throw new Error(startError || '미션 시작에 실패했습니다.')
        
        const { userMission: completedMission, error: submitError } = await submitMissionProof(user.id, 2, proofData)
        if (submitError || !completedMission) throw new Error(submitError || '미션 제출에 실패했습니다.')
        
        updateUserMission(completedMission)
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
                  📱 SNS 인증 미션
                </h1>
                <p className="text-gray-600">합격을 자랑하고 페이백 받자!</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">10,000원</div>
              <div className="text-sm text-gray-500">페이백 금액</div>
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
                      <p className="text-gray-600">제출하신 내용을 검토 중입니다. 검토 완료 후 페이백이 지급됩니다.</p>
                    </>
                  )}
                  {missionStatus === 'verified' && (
                    <>
                      <div className="text-4xl mb-2">🎉</div>
                      <h3 className="text-lg font-semibold text-green-600 mb-2">미션 완료!</h3>
                      <p className="text-gray-600">축하합니다! 10,000원 페이백이 지급되었습니다.</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mission Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>미션 안내</CardTitle>
              <CardDescription>
                운전면허 합격을 SNS에 자랑하고 페이백을 받아보세요!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📋 참여 방법</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• 운전면허 합격 사진을 SNS에 업로드</li>
                  <li>• 게시물 공개 설정 필수</li>
                  <li>• 해당 게시물 링크를 제출</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">🎁 혜택</h4>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• 페이백: 10,000원</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">📱 지원 플랫폼</h4>
                <ul className="text-yellow-800 text-sm space-y-1">
                  <li>• Instagram, Facebook, Twitter, TikTok, YouTube</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Submission Form */}
          {missionStatus === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>미션 인증</CardTitle>
                <CardDescription>
                  SNS에 업로드한 게시물 링크를 제출해주세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="snsUrl">SNS 게시물 링크</Label>
                  <Input
                    id="snsUrl"
                    type="url"
                    placeholder="https://instagram.com/p/..."
                    value={snsUrl}
                    onChange={(e) => setSnsUrl(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    운전면허 합격 사진이 포함된 게시물의 링크를 입력해주세요.
                  </p>
                </div>

                <Button 
                  onClick={submitMission}
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? '제출 중...' : '미션 제출하기'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}