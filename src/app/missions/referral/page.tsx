'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function ReferralMissionPage() {
  const router = useRouter()
  const { user, isAuthenticated, userMissions, referrals, updateUserMission, addReferral } = useAppStore()
  
  const [newReferral, setNewReferral] = useState({
    name: '',
    phone: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [referralLink, setReferralLink] = useState('')

  // 현재 미션 상태 가져오기
  const currentMission = userMissions.find(um => um.missionId === 4) // mission_id 4 = referral
  const missionStatus = currentMission?.status || 'pending'

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/register')
      return
    }

    // 추천 링크 생성
    if (user) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      setReferralLink(`${baseUrl}/register?ref=${user.id}`)
    }
  }, [isAuthenticated, router, user])

  const validateForm = () => {
    if (!newReferral.name.trim()) {
      toast.error('친구 이름을 입력해주세요.')
      return false
    }

    if (!newReferral.phone.trim()) {
      toast.error('친구 휴대폰 번호를 입력해주세요.')
      return false
    }

    // 휴대폰 번호 형식 검증
    const phoneRegex = /^010-?\d{4}-?\d{4}$/
    const formattedPhone = newReferral.phone.replace(/[^\d]/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '010$2$3')
    if (!phoneRegex.test(formattedPhone)) {
      toast.error('올바른 휴대폰 번호를 입력해주세요.')
      return false
    }

    // 이미 등록된 번호인지 확인
    const isDuplicate = referrals.some(ref => ref.refereePhone === formattedPhone)
    if (isDuplicate) {
      toast.error('이미 등록된 휴대폰 번호입니다.')
      return false
    }

    // 최대 3명 제한
    if (referrals.length >= 3) {
      toast.error('최대 3명까지만 추천할 수 있습니다.')
      return false
    }

    return true
  }

  const addNewReferral = async () => {
    if (!validateForm() || !user) return

    setIsSubmitting(true)

    try {
      const formattedPhone = newReferral.phone.replace(/[^\d]/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '010-$2-$3')
      
      // 임시로 로컬에 추가 (실제로는 서버에 저장)
      const newReferralData = {
        id: `temp_${Date.now()}`,
        referrerId: user.id,
        refereeName: newReferral.name,
        refereePhone: formattedPhone,
        isVerified: false,
        rewardPaid: false,
        createdAt: new Date().toISOString()
      }
      
      // 로컬 스토어 업데이트
      await addReferral(newReferralData)

      toast.success('친구가 추가되었습니다!')
      
      // 폼 초기화
      setNewReferral({ name: '', phone: '' })

      // 3명 모두 추가되면 미션 진행 상태로 변경
      if (referrals.length + 1 >= 3) {
        const proofData = {
          type: 'referral' as const,
          referrals: [...referrals, {
            name: newReferral.name,
            phone: formattedPhone,
            registeredAt: null,
            verified: false
          }],
          submittedAt: new Date().toISOString()
        }

        // 미션 서비스 사용
        const { startMission, submitMissionProof } = await import('@/lib/services/missions')
        
        if (currentMission) {
          // 기존 미션 진행 상태로 업데이트
          const updatedUserMission = {
            ...currentMission,
            status: 'in_progress' as const,
            proofData
          }
          updateUserMission(updatedUserMission)
        } else {
          // 새 미션 시작
          const { userMission: newMission, error: startError } = await startMission(user.id, 4)
          if (!startError && newMission) {
            updateUserMission({
              ...newMission,
              status: 'in_progress',
              proofData
            })
          }
        }
        
        toast.success('친구 추천 미션이 진행 중입니다! 친구들이 가입하면 페이백을 받을 수 있습니다.')
      }

    } catch (error) {
      toast.error('친구 추가에 실패했습니다.')
      console.error('Add referral error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      toast.success('추천 링크가 복사되었습니다!')
    } catch (error) {
      toast.error('링크 복사에 실패했습니다.')
    }
  }

  const getVerifiedCount = () => {
    return referrals.filter(ref => ref.isVerified).length
  }

  const getPendingCount = () => {
    return referrals.filter(ref => !ref.isVerified).length
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
                  👥 친구 추천 미션
                </h1>
                <p className="text-gray-600">친구 추천하고 5만원 받자!</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">50,000원</div>
              <div className="text-sm text-gray-500">친구 1명당</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Status */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {referrals.length}/3
                  </div>
                  <div className="text-sm text-gray-500">등록된 친구</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {getVerifiedCount()}
                  </div>
                  <div className="text-sm text-gray-500">가입 완료</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {(getVerifiedCount() * 50000).toLocaleString()}원
                  </div>
                  <div className="text-sm text-gray-500">예상 페이백</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mission Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>미션 안내</CardTitle>
              <CardDescription>
                친구를 추천하고 함께 혜택을 받아보세요!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📋 참여 방법</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• 친구 정보 등록 (최대 3명)</li>
                  <li>• 추천 링크를 친구에게 전달</li>
                  <li>• 친구가 가입하면 페이백 지급</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">🎁 혜택</h4>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• 친구 1명 가입당: 50,000원 페이백</li>
                  <li>• 최대 3명까지 추천 가능</li>
                  <li>• 총 최대 150,000원까지!</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Referral Link */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>나의 추천 링크</CardTitle>
              <CardDescription>
                이 링크를 친구들에게 공유해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={copyReferralLink}>
                  복사
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add Friend Form */}
          {referrals.length < 3 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>친구 추가</CardTitle>
                <CardDescription>
                  추천할 친구의 정보를 입력해주세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">친구 이름</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="홍길동"
                      value={newReferral.name}
                      onChange={(e) => setNewReferral(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">휴대폰 번호</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="010-0000-0000"
                      value={newReferral.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '')
                        const formatted = value.replace(/(\d{3})(\d{4})(\d{4})/, '010-$2-$3')
                        setNewReferral(prev => ({ ...prev, phone: formatted }))
                      }}
                    />
                  </div>
                </div>
                <Button 
                  onClick={addNewReferral}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? '추가 중...' : '친구 추가'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Friends List */}
          {referrals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>등록된 친구들</CardTitle>
                <CardDescription>
                  친구들의 가입 현황을 확인해보세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referrals.map((referral, index) => (
                    <div 
                      key={referral.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-semibold">{referral.refereeName}</div>
                        <div className="text-sm text-gray-500">{referral.refereePhone}</div>
                      </div>
                      <div className="text-right">
                        {referral.isVerified ? (
                          <div>
                            <div className="text-green-600 text-sm font-semibold">✓ 가입 완료</div>
                            <div className="text-green-600 text-xs">50,000원 적립</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-yellow-600 text-sm font-semibold">⏳ 대기 중</div>
                            <div className="text-gray-500 text-xs">가입 대기</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}