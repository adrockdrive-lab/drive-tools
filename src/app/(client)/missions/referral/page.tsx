'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Award, UserPlus, Users, Gift, CheckCircle2 } from 'lucide-react'

export default function ReferralPage() {
  const router = useRouter()
  const { user } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [refereeName, setRefereeName] = useState('')
  const [refereePhone, setRefereePhone] = useState('')
  const [referrals, setReferrals] = useState<any[]>([])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // 추천인 목록 로드
    loadReferrals()
  }, [user, router])

  const loadReferrals = async () => {
    try {
      // TODO: API 연결
      // const { data } = await supabase
      //   .from('referrals')
      //   .select('*')
      //   .eq('referrer_id', user!.id)
      //   .order('created_at', { ascending: false })

      // setReferrals(data || [])
    } catch (error) {
      console.error('Error loading referrals:', error)
    }
  }

  const handleSubmit = async () => {
    if (!refereeName.trim()) {
      toast.error('추천인 이름을 입력해주세요.')
      return
    }

    if (!refereePhone.trim()) {
      toast.error('추천인 전화번호를 입력해주세요.')
      return
    }

    // 전화번호 형식 검증
    const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/
    if (!phoneRegex.test(refereePhone.replace(/-/g, ''))) {
      toast.error('올바른 전화번호 형식이 아닙니다.')
      return
    }

    setLoading(true)
    try {
      // TODO: API 연결
      // await supabase.from('referrals').insert({
      //   referrer_id: user!.id,
      //   referee_name: refereeName,
      //   referee_phone: refereePhone,
      //   is_verified: false,
      //   reward_paid: false
      // })

      toast.success('추천인을 등록했습니다! 등록이 확인되면 보상이 지급됩니다.')
      setRefereeName('')
      setRefereePhone('')
      loadReferrals()
    } catch (error) {
      toast.error('추천인 등록에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            ← 뒤로
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">추천인 미션</h1>
          <p className="text-gray-600 mt-2">친구를 추천하고 보상을 받으세요!</p>
        </div>

        {/* 미션 정보 카드 */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="py-6">
            <h3 className="text-2xl font-bold mb-2">미션 목표</h3>
            <p className="text-lg">학원에 친구 추천하기</p>
            <div className="mt-4 flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                <span>+100 XP</span>
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                <span>+50 코인</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="py-6 text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">{referrals.length}</p>
              <p className="text-sm text-gray-600">추천한 친구</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-6 text-center">
              <Gift className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">
                {referrals.filter((r) => r.rewardPaid).length}
              </p>
              <p className="text-sm text-gray-600">보상 지급됨</p>
            </CardContent>
          </Card>
        </div>

        {/* 추천인 등록 폼 */}
        <Card>
          <CardHeader>
            <CardTitle>친구 추천하기</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">추천인 이름</Label>
              <Input
                id="name"
                placeholder="홍길동"
                value={refereeName}
                onChange={(e) => setRefereeName(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="phone">추천인 전화번호</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                value={refereePhone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9-]/g, '')
                  setRefereePhone(value)
                }}
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-2">
                하이픈(-)을 포함하여 입력해주세요
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || !refereeName || !refereePhone}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              {loading ? '등록 중...' : '추천인 등록하기'}
            </Button>
          </CardContent>
        </Card>

        {/* 추천인 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>내가 추천한 친구들</CardTitle>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>아직 추천한 친구가 없습니다.</p>
                <p className="text-sm mt-2">친구를 추천하고 보상을 받으세요!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <UserPlus className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{referral.refereeName}</p>
                        <p className="text-sm text-gray-600">{referral.refereePhone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {referral.rewardPaid ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle2 className="h-5 w-5 mr-1" />
                          <span className="text-sm font-medium">지급완료</span>
                        </div>
                      ) : referral.isVerified ? (
                        <span className="text-sm text-blue-600 font-medium">확인됨</span>
                      ) : (
                        <span className="text-sm text-gray-500">확인 대기</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 미션 가이드 */}
        <Card>
          <CardHeader>
            <CardTitle>미션 가이드</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <UserPlus className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">1. 친구 정보 입력</p>
                  <p className="text-sm text-gray-600">
                    학원에 등록할 친구의 이름과 전화번호를 입력하세요
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">2. 등록 확인</p>
                  <p className="text-sm text-gray-600">
                    친구가 실제로 학원에 등록하면 관리자가 확인합니다
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Gift className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">3. 보상 지급</p>
                  <p className="text-sm text-gray-600">
                    확인이 완료되면 자동으로 보상이 지급됩니다
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
