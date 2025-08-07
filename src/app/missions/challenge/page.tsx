'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from '@/components/mission/FileUpload'
import { toast } from 'sonner'

export default function ChallengeMissionPage() {
  const router = useRouter()
  const { user, isAuthenticated, userMissions, updateUserMission } = useAppStore()
  
  const [studyHours, setStudyHours] = useState('')
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 현재 미션 상태 가져오기
  const currentMission = userMissions.find(um => um.missionId === 1) // mission_id 1 = challenge
  const missionStatus = currentMission?.status || 'pending'

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/register')
      return
    }
  }, [isAuthenticated, router])


  const validateForm = () => {
    const hours = parseFloat(studyHours)
    
    if (!studyHours || isNaN(hours)) {
      toast.error('교육시간을 입력해주세요.')
      return false
    }

    if (hours <= 0 || hours > 14) {
      toast.error('교육시간은 1시간 이상 14시간 이하여야 합니다.')
      return false
    }

    if (!certificateUrl) {
      toast.error('합격 인증서 파일을 업로드해주세요.')
      return false
    }

    return true
  }


  const submitMission = async () => {
    if (!validateForm() || !user) return

    setIsSubmitting(true)

    try {
      // 미션 데이터 생성
      const proofData = {
        type: 'challenge' as const,
        studyHours: parseFloat(studyHours),
        certificateImageUrl: certificateUrl!,
        submittedAt: new Date().toISOString()
      }

      // 미션 서비스 사용
      const { startMission, submitMissionProof } = await import('@/lib/services/missions')
      
      if (currentMission) {
        // 기존 미션 증명 데이터 제출
        const { userMission, error } = await submitMissionProof(user.id, 1, proofData)
        if (error || !userMission) throw new Error(error || '미션 제출에 실패했습니다.')
        updateUserMission(userMission)
      } else {
        // 새 미션 시작 후 증명 데이터 제출
        const { userMission: newMission, error: startError } = await startMission(user.id, 1)
        if (startError || !newMission) throw new Error(startError || '미션 시작에 실패했습니다.')
        
        const { userMission: completedMission, error: submitError } = await submitMissionProof(user.id, 1, proofData)
        if (submitError || !completedMission) throw new Error(submitError || '미션 제출에 실패했습니다.')
        
        updateUserMission(completedMission)
      }
      
      toast.success('미션이 제출되었습니다! 검토 후 페이백이 지급됩니다.')
      
      // 대시보드로 이동
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
                  🏆 재능충 챌린지
                </h1>
                <p className="text-gray-600">교육시간 14시간 이내 합격 도전!</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">20,000원</div>
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
                      <p className="text-gray-600">축하합니다! 20,000원 페이백이 지급되었습니다.</p>
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
                재능충 챌린지는 교육시간 14시간 이내에 운전면허 시험에 합격하는 미션입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📋 참여 조건</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• 교육시간 14시간 이내로 합격</li>
                  <li>• 합격증 또는 면허증 사진 제출</li>
                  <li>• 실제 교육시간 정확히 입력</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">🎁 혜택</h4>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• 페이백: 20,000원</li>
                  <li>• 추가 혜택: 매달 30만원 상품권 추첨</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">⚠️ 주의사항</h4>
                <ul className="text-yellow-800 text-sm space-y-1">
                  <li>• 허위 정보 제출 시 페이백이 취소됩니다</li>
                  <li>• 검토 후 페이백이 지급됩니다 (영업일 기준 3-5일)</li>
                  <li>• 문의사항은 고객센터로 연락 바랍니다</li>
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
                  교육시간과 합격 인증서를 제출해주세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Study Hours Input */}
                <div>
                  <Label htmlFor="studyHours">교육시간 (시간)</Label>
                  <Input
                    id="studyHours"
                    type="number"
                    min="1"
                    max="14"
                    step="0.5"
                    placeholder="예: 12.5"
                    value={studyHours}
                    onChange={(e) => setStudyHours(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    실제 수강한 교육시간을 정확히 입력해주세요. (최대 14시간)
                  </p>
                </div>

                {/* File Upload */}
                <div>
                  <Label>합격 인증서</Label>
                  <div className="mt-2">
                    <FileUpload
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      maxSize={10 * 1024 * 1024} // 10MB
                      onUpload={(url) => setCertificateUrl(url)}
                      placeholder="합격증 또는 면허증 파일을 업로드하세요"
                      disabled={isSubmitting}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      운전면허 합격 인증서 또는 관련 증빙 파일을 업로드해주세요. (JPG, PNG, WebP, PDF)
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
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