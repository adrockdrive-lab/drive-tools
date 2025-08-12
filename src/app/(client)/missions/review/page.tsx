'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { missionService } from '@/lib/services/missions'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function ReviewMissionPage() {
  const router = useRouter()
  const { user, missions, userMissions, loadUserMissions, loadPaybacks } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState('5')

  // 리뷰 미션 찾기
  const reviewMission = missions.find(m => m.missionType === 'review')
  const userParticipation = userMissions.find(um => um.missionId === reviewMission?.id)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    setLoading(false)
  }, [user, router])

  const handleStartMission = async () => {
    if (!user || !reviewMission) return

    try {
      setSubmitting(true)
      const result = await missionService.startMissionParticipation(user.id, reviewMission.id)

      if (result.success) {
        toast.success('리뷰 미션이 시작되었습니다!')
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
    if (!user || !reviewMission) return

    if (!reviewText.trim()) {
      toast.error('리뷰 내용을 입력해주세요.')
      return
    }

    if (reviewText.length < 10) {
      toast.error('리뷰는 최소 10자 이상 작성해주세요.')
      return
    }

    try {
      setSubmitting(true)

      const proofData = {
        type: 'review',
        reviewText,
        rating: parseInt(rating),
        submittedAt: new Date().toISOString()
      }

      const result = await missionService.completeMissionParticipation(
        user.id,
        reviewMission.id,
        proofData
      )

      if (result.success) {
        toast.success('리뷰 미션이 완료되었습니다!')
        await loadUserMissions()
        await loadPaybacks()
        setReviewText('')
        setRating('5')
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
            <h1 className="text-2xl font-bold text-black">리뷰 미션</h1>
            <p className="text-muted-foreground">드라이빙존에 대한 리뷰를 작성하고 보상을 받아보세요</p>
          </div>
        </div>

        {reviewMission ? (
          <Card className="gradient-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">⭐</span>
                  <div>
                    <CardTitle className="text-black text-xl">
                      {reviewMission.title}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                      리뷰 미션
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
                  {reviewMission.description}
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-black font-bold text-lg">
                      {reviewMission.rewardAmount.toLocaleString()}원
                    </div>
                    <div className="text-muted-foreground text-sm">
                      보상 금액
                    </div>
                  </div>
                  <span className="text-3xl">💰</span>
                </div>
              </div>

              <div className="bg-blue-500/20 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-400 mb-2">📋 참여 방법</h4>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>• 드라이빙존에 대한 솔직한 리뷰 작성</li>
                  <li>• 최소 10자 이상 작성</li>
                  <li>• 별점 평가 포함</li>
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
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rating" className="text-black">
                      별점 평가
                    </Label>
                    <select
                      id="rating"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="w-full bg-secondary/50 border border-border text-black rounded-md px-3 py-2 mt-1"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5점)</option>
                      <option value="4">⭐⭐⭐⭐ (4점)</option>
                      <option value="3">⭐⭐⭐ (3점)</option>
                      <option value="2">⭐⭐ (2점)</option>
                      <option value="1">⭐ (1점)</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="reviewText" className="text-black">
                      리뷰 내용
                    </Label>
                    <Textarea
                      id="reviewText"
                      placeholder="드라이빙존에 대한 솔직한 리뷰를 작성해주세요..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="bg-secondary/50 border-border text-black mt-1 min-h-[120px]"
                    />
                    <p className="text-muted-foreground text-xs mt-1">
                      최소 10자 이상 작성해주세요. ({reviewText.length}/10)
                    </p>
                  </div>

                  <Button
                    onClick={handleCompleteMission}
                    disabled={submitting || !reviewText.trim() || reviewText.length < 10}
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
                    축하합니다! 리뷰 미션을 성공적으로 완료했습니다.
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
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-lg font-semibold text-black mb-2">
                진행 가능한 리뷰 미션이 없습니다
              </h3>
              <p className="text-muted-foreground">
                새로운 리뷰 미션이 곧 추가될 예정입니다.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
