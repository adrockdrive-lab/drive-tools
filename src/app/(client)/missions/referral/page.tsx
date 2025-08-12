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

export default function ReferralMissionPage() {
  const router = useRouter()
  const { user, missions, userMissions, loadUserMissions, loadPaybacks } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [referrals, setReferrals] = useState([
    { name: '', phone: '', store: '' },
    { name: '', phone: '', store: '' },
    { name: '', phone: '', store: '' }
  ])

  // 추천 미션 찾기
  const referralMission = missions.find(m => m.missionType === 'referral')
  const userParticipation = userMissions.find(um => um.missionId === referralMission?.id)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    setLoading(false)
  }, [user, router])

  const handleStartMission = async () => {
    if (!user || !referralMission) return

    try {
      setSubmitting(true)
      const result = await missionService.startMissionParticipation(user.id, referralMission.id)

      if (result.success) {
        toast.success('추천 미션이 시작되었습니다!')
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
    if (!user || !referralMission) return

    // 최소 1명의 추천 정보가 있는지 확인
    const validReferrals = referrals.filter(ref => ref.name.trim() && ref.phone.trim())
    if (validReferrals.length === 0) {
      toast.error('최소 1명의 지인 정보를 입력해주세요.')
      return
    }

    try {
      setSubmitting(true)

      const proofData = {
        type: 'referral',
        referrals: validReferrals,
        submittedAt: new Date().toISOString()
      }

      const result = await missionService.completeMissionParticipation(
        user.id,
        referralMission.id,
        proofData
      )

      if (result.success) {
        toast.success('친구 추천 미션이 완료되었습니다!')
        await loadUserMissions()
        await loadPaybacks()
        setReferrals([
          { name: '', phone: '', store: '' },
          { name: '', phone: '', store: '' },
          { name: '', phone: '', store: '' }
        ])
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

  const updateReferral = (index: number, field: string, value: string) => {
    const newReferrals = [...referrals]
    newReferrals[index] = { ...newReferrals[index], [field]: value }
    setReferrals(newReferrals)
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
                                  <h1 className="text-2xl font-bold text-gray-900">친구 추천</h1>
            <p className="text-gray-600">지인 추천하고 페이백 받기 (1인당 5만원)</p>
          </div>
        </div>

        {referralMission ? (
          <Card className="gradient-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">👥</span>
                  <div>
                    <CardTitle className="text-black text-xl">
                      {referralMission.title}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                      추천 미션
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
                <h3 className="text-black font-semibold mb-2">미션 설명</h3>
                <p className="text-muted-foreground">
                  {referralMission.description}
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-purple-600 font-bold text-lg">
                      최대 15만원
                    </div>
                    <div className="text-gray-600 text-sm">
                      보상 금액 (1인당 5만원)
                    </div>
                  </div>
                  <span className="text-3xl">💰</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-700 mb-2">📋 참여 방법</h4>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• 지인의 이름과 전화번호 입력</li>
                  <li>• 등록 매장 선택</li>
                  <li>• 관리자가 전화 확인 후 승인</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-xl">
                <h4 className="font-semibold text-green-700 mb-2">🎁 혜택</h4>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• 1인당 5만원 페이백</li>
                  <li>• 최대 15만원까지 받을 수 있습니다</li>
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
                <div className="space-y-6">
                  <div>
                    <h3 className="text-black font-semibold mb-3">지인 정보 입력</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      추천할 지인의 정보를 입력해주세요. 관리자가 전화 확인 후 승인됩니다.
                    </p>
                  </div>

                  {referrals.map((referral, index) => (
                    <div key={index} className="space-y-3 p-4 border border-gray-200 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700">지인 {index + 1}</h4>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <Label htmlFor={`name-${index}`} className="text-black text-sm">
                            이름
                          </Label>
                          <Input
                            id={`name-${index}`}
                            type="text"
                            placeholder="지인 이름"
                            value={referral.name}
                            onChange={(e) => updateReferral(index, 'name', e.target.value)}
                            className="bg-gray-50 border-gray-300 text-black mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`phone-${index}`} className="text-black text-sm">
                            전화번호
                          </Label>
                          <Input
                            id={`phone-${index}`}
                            type="tel"
                            placeholder="010-0000-0000"
                            value={referral.phone}
                            onChange={(e) => updateReferral(index, 'phone', e.target.value)}
                            className="bg-gray-50 border-gray-300 text-black mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`store-${index}`} className="text-black text-sm">
                            등록 매장
                          </Label>
                          <Input
                            id={`store-${index}`}
                            type="text"
                            placeholder="등록할 매장명"
                            value={referral.store}
                            onChange={(e) => updateReferral(index, 'store', e.target.value)}
                            className="bg-gray-50 border-gray-300 text-black mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    onClick={handleCompleteMission}
                    disabled={submitting || referrals.filter(ref => ref.name.trim() && ref.phone.trim()).length === 0}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-500/90 hover:to-emerald-600/90"
                  >
                    {submitting ? '완료 중...' : '미션 완료하기'}
                  </Button>
                </div>
              )}

              {userParticipation?.status === 'completed' && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">✅</div>
                  <h3 className="text-black font-semibold mb-1">미션 완료!</h3>
                  <p className="text-muted-foreground">
                    축하합니다! 추천 미션을 성공적으로 완료했습니다.
                  </p>
                  <div className="mt-4">
                    <Button
                      onClick={() => router.push('/dashboard')}
                      variant="outline"
                      className="border-border text-black hover:bg-secondary"
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
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-semibold text-black mb-2">
                진행 가능한 추천 미션이 없습니다
              </h3>
              <p className="text-muted-foreground">
                새로운 추천 미션이 곧 추가될 예정입니다.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
