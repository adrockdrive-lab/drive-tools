'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
          referrals: [...referrals.map(ref => ({
            name: ref.refereeName,
            phone: ref.refereePhone,
            registeredAt: null, // Referral 타입에는 registeredAt이 없어서 null로 설정
            verified: ref.isVerified
          })), {
            name: newReferral.name,
            phone: formattedPhone,
            registeredAt: null,
            verified: false
          }],
          submittedAt: new Date().toISOString()
        }

        // 미션 서비스 사용
        const { startMission } = await import('@/lib/services/missions')

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
    } catch {
      toast.error('링크 복사에 실패했습니다.')
    }
  }

  const getVerifiedCount = () => {
    return referrals.filter(ref => ref.isVerified).length
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
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 px-4 py-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="text-white hover:bg-white/20 p-2"
          >
            ←
          </Button>
          <span className="text-3xl">👥</span>
          <div>
            <h1 className="text-xl font-bold">친구 추천 미션</h1>
            <p className="text-white/80 text-sm">친구 추천하고 5만원 받자!</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="text-white/80 text-sm">페이백 보상</div>
          <div className="text-2xl font-bold">50,000원</div>
          <div className="text-sm text-white/80">친구 1명당</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-4">
        {/* Progress Status */}
        <div className="gradient-card rounded-2xl p-6 border border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary mb-1">
                {referrals.length}/3
              </div>
              <div className="text-muted-foreground text-sm">등록된 친구</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400 mb-1">
                {getVerifiedCount()}
              </div>
              <div className="text-muted-foreground text-sm">가입 완료</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {(getVerifiedCount() * 50000).toLocaleString()}원
              </div>
              <div className="text-muted-foreground text-sm">예상 페이백</div>
            </div>
          </div>
        </div>

        {/* Mission Details */}
        <div className="gradient-card rounded-2xl p-6 border border-border">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-2">미션 안내</h2>
            <p className="text-muted-foreground">친구를 추천하고 함께 혜택을 받아보세요!</p>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-500/20 p-4 rounded-xl">
              <h4 className="font-semibold text-blue-400 mb-2">📋 참여 방법</h4>
              <ul className="text-muted-foreground text-sm space-y-1">
                <li>• 친구 정보 등록 (최대 3명)</li>
                <li>• 추천 링크를 친구에게 전달</li>
                <li>• 친구가 가입하면 페이백 지급</li>
              </ul>
            </div>

            <div className="bg-green-500/20 p-4 rounded-xl">
              <h4 className="font-semibold text-green-400 mb-2">🎁 혜택</h4>
              <ul className="text-muted-foreground text-sm space-y-1">
                <li>• 친구 1명 가입당: 50,000원 페이백</li>
                <li>• 최대 3명까지 추천 가능</li>
                <li>• 총 최대 150,000원까지!</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Referral Link */}
        <div className="gradient-card rounded-2xl p-6 border border-border">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-2">나의 추천 링크</h2>
            <p className="text-muted-foreground">이 링크를 친구들에게 공유해주세요.</p>
          </div>

          <div className="flex space-x-2">
            <Input
              value={referralLink}
              readOnly
              className="flex-1 bg-secondary/50 border-border text-white"
            />
            <Button onClick={copyReferralLink} className="bg-primary hover:bg-primary/90">
              복사
            </Button>
          </div>
        </div>

        {/* Add Friend Form */}
        {referrals.length < 3 && (
          <div className="gradient-card rounded-2xl p-6 border border-border">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white mb-2">친구 추가</h2>
              <p className="text-muted-foreground">추천할 친구의 정보를 입력해주세요.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white">친구 이름</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="홍길동"
                    value={newReferral.name}
                    onChange={(e) => setNewReferral(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-secondary/50 border-border text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-white">휴대폰 번호</Label>
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
                    className="bg-secondary/50 border-border text-white"
                  />
                </div>
              </div>
              <Button
                onClick={addNewReferral}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                {isSubmitting ? '추가 중...' : '친구 추가'}
              </Button>
            </div>
          </div>
        )}

        {/* Friends List */}
        {referrals.length > 0 && (
          <div className="gradient-card rounded-2xl p-6 border border-border">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white mb-2">등록된 친구들</h2>
              <p className="text-muted-foreground">친구들의 가입 현황을 확인해보세요.</p>
            </div>

            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl"
                >
                  <div>
                    <div className="font-semibold text-white">{referral.refereeName}</div>
                    <div className="text-sm text-muted-foreground">{referral.refereePhone}</div>
                  </div>
                  <div className="text-right">
                    {referral.isVerified ? (
                      <div>
                        <div className="text-green-400 text-sm font-semibold">✓ 가입 완료</div>
                        <div className="text-green-400 text-xs">50,000원 적립</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-yellow-400 text-sm font-semibold">⏳ 대기 중</div>
                        <div className="text-muted-foreground text-xs">가입 대기</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Spacing for Mobile */}
        <div className="h-20"></div>
      </div>
    </div>
  )
}
