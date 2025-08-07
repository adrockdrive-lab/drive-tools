'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-4 py-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="text-white hover:bg-white/20 p-2"
          >
            ← 
          </Button>
          <span className="text-3xl">🏆</span>
          <div>
            <h1 className="text-xl font-bold">재능충 챌린지</h1>
            <p className="text-blue-100 text-sm">14시간 이내 합격 도전!</p>
          </div>
        </div>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-blue-100 text-sm">페이백 보상</div>
          <div className="text-2xl font-bold">20,000원</div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* Status Card */}
        {missionStatus !== 'pending' && (
          <div className={`
            rounded-2xl p-6 text-center text-white
            ${missionStatus === 'completed' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-green-500 to-emerald-600'}
          `}>
            <div className="text-4xl mb-2">
              {missionStatus === 'completed' ? '⏳' : '🎉'}
            </div>
            <h3 className="text-lg font-bold mb-2">
              {missionStatus === 'completed' ? '검토 중' : '미션 완료!'}
            </h3>
            <p className="text-white/90 text-sm">
              {missionStatus === 'completed' 
                ? '제출하신 내용을 검토 중입니다. 검토 완료 후 페이백이 지급됩니다.' 
                : '축하합니다! 20,000원 페이백이 지급되었습니다.'}
            </p>
          </div>
        )}

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 참여 조건 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl">📋</span>
              <h3 className="font-bold text-gray-900">참여 조건</h3>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div>• 교육시간 14시간 이내</div>
              <div>• 합격증 사진 제출</div>
              <div>• 실제 교육시간 입력</div>
            </div>
          </div>

          {/* 혜택 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl">🎁</span>
              <h3 className="font-bold text-gray-900">혜택</h3>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div>• 페이백 20,000원</div>
              <div>• 매달 30만원 추첨</div>
            </div>
          </div>

          {/* 주의사항 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl">⚠️</span>
              <h3 className="font-bold text-gray-900">주의사항</h3>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div>• 허위 정보 시 취소</div>
              <div>• 검토 후 지급 (3-5일)</div>
            </div>
          </div>
        </div>

        {/* Submission Form */}
        {missionStatus === 'pending' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-2xl">✅</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">미션 인증</h2>
                <p className="text-gray-600 text-sm">교육시간과 합격 인증서를 제출해주세요</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Study Hours Input */}
              <div className="bg-gray-50 rounded-xl p-4">
                <Label htmlFor="studyHours" className="text-sm font-medium text-gray-700">
                  교육시간 (시간)
                </Label>
                <Input
                  id="studyHours"
                  type="number"
                  min="1"
                  max="14"
                  step="0.5"
                  placeholder="예: 12.5"
                  value={studyHours}
                  onChange={(e) => setStudyHours(e.target.value)}
                  className="mt-2 border-0 bg-white shadow-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  실제 수강한 교육시간을 정확히 입력해주세요 (최대 14시간)
                </p>
              </div>

              {/* File Upload */}
              <div className="bg-gray-50 rounded-xl p-4">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  합격 인증서
                </Label>
                <FileUpload
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  maxSize={10 * 1024 * 1024} // 10MB
                  onUpload={(url) => setCertificateUrl(url)}
                  placeholder="합격증 또는 면허증 파일을 업로드하세요"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-2">
                  운전면허 합격 인증서 파일을 업로드해주세요 (JPG, PNG, WebP, PDF)
                </p>
              </div>

              {/* Submit Button */}
              <Button 
                onClick={submitMission}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                size="lg"
              >
                {isSubmitting ? '제출 중...' : '미션 제출하기 🚀'}
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