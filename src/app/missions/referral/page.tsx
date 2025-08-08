'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { missionService, type Mission } from '@/lib/services/missions'
import { referralService } from '@/lib/services/referrals'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function ReferralMissionPage() {
  const [loading, setLoading] = useState(true)
  const [mission, setMission] = useState<Mission | null>(null)
  const [user, setUser] = useState<any>(null)
  const [referralCode, setReferralCode] = useState('')
  const [friendName, setFriendName] = useState('')
  const [friendPhone, setFriendPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [referrals, setReferrals] = useState<any[]>([])

  useEffect(() => {
    loadMissionData()
  }, [])

  const loadMissionData = async () => {
    try {
      setLoading(true)

      // 사용자 정보 로드
      const userData = localStorage.getItem('user')
      if (userData) {
        const currentUser = JSON.parse(userData)
        setUser(currentUser)

        // 추천 미션 조회
        const result = await missionService.getUserMissions(currentUser.id)
        if (result.success && result.missions) {
          const referralMission = result.missions.find(m => m.mission_type === 'referral')
          setMission(referralMission || null)
        }

        // 추천 목록 조회
        const referralResult = await referralService.getUserReferrals(currentUser.id)
        if (referralResult.success && referralResult.referrals) {
          setReferrals(referralResult.referrals)
        }
      }
    } catch (error) {
      console.error('미션 데이터 로드 오류:', error)
      toast.error('미션을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartMission = async () => {
    if (!user || !mission) return

    try {
      setSubmitting(true)
      const result = await missionService.startMission(user.id, mission.id)
      if (result.success) {
        toast.success('추천 미션이 시작되었습니다!')
        loadMissionData()
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

  const handleAddReferral = async () => {
    if (!user) return

    if (!friendName.trim() || !friendPhone.trim()) {
      toast.error('친구 이름과 전화번호를 입력해주세요.')
      return
    }

    try {
      setSubmitting(true)
      const result = await referralService.addReferral(user.id, friendName, friendPhone)
      if (result.success) {
        toast.success('친구가 추천 목록에 추가되었습니다!')
        setFriendName('')
        setFriendPhone('')
        loadMissionData()
      } else {
        toast.error(result.error || '추천 추가에 실패했습니다.')
      }
    } catch (error) {
      console.error('추천 추가 오류:', error)
      toast.error('추천 추가에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const copyReferralCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code)
      toast.success('추천 코드가 복사되었습니다!')
    }
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="text-muted-foreground"
          >
            ← 뒤로
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">친구 추천 미션</h1>
            <p className="text-muted-foreground">친구를 추천하고 보상을 받아보세요</p>
          </div>
        </div>

        {mission ? (
          <Card className="gradient-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">👥</span>
                  <div>
                    <CardTitle className="text-white text-xl">
                      {mission.title}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                      추천 미션
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`${
                    mission.status === 'completed'
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : mission.status === 'in_progress'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}
                >
                  {mission.status === 'completed' ? '완료' :
                   mission.status === 'in_progress' ? '진행 중' : '대기'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="text-white font-semibold mb-2">미션 설명</h3>
                <p className="text-muted-foreground">
                  {mission.description}
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold text-lg">
                      {mission.reward_amount.toLocaleString()}원
                    </div>
                    <div className="text-muted-foreground text-sm">
                      보상 금액
                    </div>
                  </div>
                  <span className="text-3xl">💰</span>
                </div>
              </div>

              {mission.status === 'pending' && (
                <Button
                  onClick={handleStartMission}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  {submitting ? '시작 중...' : '미션 시작하기'}
                </Button>
              )}

              {mission.status === 'in_progress' && (
                <div className="space-y-6">
                  {/* 추천 코드 섹션 */}
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">내 추천 코드</h4>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={user?.referral_code || '코드 없음'}
                        readOnly
                        className="bg-background border-border text-white"
                      />
                      <Button
                        onClick={copyReferralCode}
                        variant="outline"
                        size="sm"
                        className="border-border text-white hover:bg-secondary"
                      >
                        복사
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-xs mt-2">
                      이 코드를 친구에게 공유하세요
                    </p>
                  </div>

                  {/* 친구 추가 폼 */}
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">친구 추가하기</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="friendName" className="text-white">
                          친구 이름
                        </Label>
                        <Input
                          id="friendName"
                          type="text"
                          placeholder="홍길동"
                          value={friendName}
                          onChange={(e) => setFriendName(e.target.value)}
                          className="bg-secondary/50 border-border text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="friendPhone" className="text-white">
                          친구 전화번호
                        </Label>
                        <Input
                          id="friendPhone"
                          type="tel"
                          placeholder="010-0000-0000"
                          value={friendPhone}
                          onChange={(e) => setFriendPhone(e.target.value)}
                          className="bg-secondary/50 border-border text-white mt-1"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleAddReferral}
                      disabled={submitting || !friendName.trim() || !friendPhone.trim()}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-500/90 hover:to-emerald-600/90"
                    >
                      {submitting ? '추가 중...' : '친구 추가하기'}
                    </Button>
                  </div>

                  {/* 추천 목록 */}
                  {referrals.length > 0 && (
                    <div>
                      <h4 className="text-white font-semibold mb-3">추천한 친구 목록</h4>
                      <div className="space-y-2">
                        {referrals.map((referral) => (
                          <div key={referral.id} className="bg-secondary/50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-white font-medium">
                                  {referral.referee_name}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                  {referral.referee_phone}
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={`${
                                  referral.is_verified
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                }`}
                              >
                                {referral.is_verified ? '가입 완료' : '대기 중'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {mission.status === 'completed' && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">✅</div>
                  <h3 className="text-white font-semibold mb-1">미션 완료!</h3>
                  <p className="text-muted-foreground">
                    축하합니다! 추천 미션을 성공적으로 완료했습니다.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="gradient-card border-border">
            <CardContent className="text-center py-8">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-semibold text-white mb-2">
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
