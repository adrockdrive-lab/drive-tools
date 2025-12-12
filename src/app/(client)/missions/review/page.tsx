'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Award, CheckCircle2, Star, MessageSquare } from 'lucide-react'

export default function ReviewPage() {
  const router = useRouter()
  const { user } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewText, setReviewText] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // 제출 상태 확인
    checkSubmissionStatus()
  }, [user, router])

  const checkSubmissionStatus = async () => {
    try {
      // TODO: API 연결
      // const { data } = await supabase
      //   .from('mission_participations')
      //   .select('*')
      //   .eq('user_id', user!.id)
      //   .eq('mission_type', 'review')
      //   .single()

      // setSubmitted(data?.status === 'submitted' || data?.status === 'verified')
    } catch (error) {
      console.error('Error checking submission:', error)
    }
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('별점을 선택해주세요.')
      return
    }

    if (!reviewText.trim() || reviewText.trim().length < 10) {
      toast.error('후기를 10자 이상 작성해주세요.')
      return
    }

    setLoading(true)
    try {
      // TODO: API 연결
      // await supabase.from('mission_participations').insert({
      //   user_id: user!.id,
      //   mission_type: 'review',
      //   proof_data: { rating, reviewText },
      //   status: 'submitted'
      // })

      setSubmitted(true)
      toast.success('후기를 제출했습니다! +50 XP, +30 코인을 획득했습니다!')
    } catch (error) {
      toast.error('후기 제출에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            ← 뒤로
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">후기 작성 미션</h1>
          <p className="text-gray-600 mt-2">학원 후기를 작성하고 보상을 받으세요!</p>
        </div>

        {/* 미션 정보 카드 */}
        <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
          <CardContent className="py-6">
            <h3 className="text-2xl font-bold mb-2">미션 목표</h3>
            <p className="text-lg">학원 이용 후기 작성</p>
            <div className="mt-4 flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                <span>+50 XP</span>
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                <span>+30 코인</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 제출 폼 또는 상태 */}
        {submitted ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">제출 완료!</h3>
              <p className="text-gray-600 mb-4">소중한 후기 감사합니다.</p>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                대시보드로 돌아가기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 제출 폼 */}
            <Card>
              <CardHeader>
                <CardTitle>후기 작성</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>별점</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-10 w-10 transition-colors ${
                            star <= (hoveredRating || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {rating === 0
                      ? '별점을 선택해주세요'
                      : `${rating}점을 선택하셨습니다`}
                  </p>
                </div>

                <div>
                  <Label htmlFor="review">후기 내용</Label>
                  <Textarea
                    id="review"
                    placeholder="학원 이용 경험을 자유롭게 작성해주세요 (최소 10자)"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="mt-2 min-h-[200px]"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {reviewText.length}자 / 최소 10자
                  </p>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading || rating === 0 || reviewText.trim().length < 10}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  size="lg"
                >
                  {loading ? '제출 중...' : '후기 제출하기'}
                </Button>
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
                    <Star className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">1. 별점 선택</p>
                      <p className="text-sm text-gray-600">
                        학원 이용 만족도를 별점으로 표현해주세요
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">2. 후기 작성</p>
                      <p className="text-sm text-gray-600">
                        솔직하고 구체적인 후기를 작성해주세요 (최소 10자)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">3. 미션 제출</p>
                      <p className="text-sm text-gray-600">
                        모든 정보를 입력하고 제출 버튼을 누르세요
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
