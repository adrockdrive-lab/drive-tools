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

export default function ChallengeMissionPage() {
  const router = useRouter()
  const { user, missions, userMissions, loadUserMissions, loadPaybacks } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [certificateImage, setCertificateImage] = useState<File | null>(null)
  const [certificateImageUrl, setCertificateImageUrl] = useState('')

  // 챌린지 미션 찾기
  const challengeMission = missions.find(m => m.missionType === 'challenge')
  const userParticipation = userMissions.find(um => um.missionId === challengeMission?.id)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    setLoading(false)
  }, [user, router])

  const handleStartMission = async () => {
    if (!user || !challengeMission) return

    try {
      setSubmitting(true)
      const result = await missionService.startMissionParticipation(user.id, challengeMission.id)

      if (result.success) {
        toast.success('챌린지 미션이 시작되었습니다!')
        await loadUserMissions()
        await loadPaybacks()
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
    if (!user || !challengeMission) return

    if (!certificateImage) {
      toast.error('도장 사진을 업로드해주세요.')
      return
    }

    try {
      setSubmitting(true)

      const proofData = {
        type: 'challenge',
        certificateImageUrl: certificateImageUrl,
        submittedAt: new Date().toISOString()
      }

      const result = await missionService.completeMissionParticipation(
        user.id,
        challengeMission.id,
        proofData
      )

      if (result.success) {
        toast.success('재능충 미션이 완료되었습니다!')
        await loadUserMissions()
        await loadPaybacks()
        setCertificateImage(null)
        setCertificateImageUrl('')
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCertificateImage(file)
      // 실제로는 이미지를 서버에 업로드하고 URL을 받아와야 함
      setCertificateImageUrl(URL.createObjectURL(file))
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
            <h1 className="text-2xl font-bold text-gray-900">재능충</h1>
            <p className="text-gray-600">합격 등록하고 페이백 받기</p>
          </div>
        </div>

        {challengeMission ? (
          <Card className="gradient-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🎯</span>
                  <div>
                    <CardTitle className="text-black text-xl">
                      {challengeMission.title}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                      재능충 미션
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
                  {challengeMission.description}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-green-600 font-bold text-lg">
                      2만원
                    </div>
                    <div className="text-gray-600 text-sm">
                      보상 금액
                    </div>
                  </div>
                  <span className="text-3xl">💰</span>
                </div>
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
                    <Label htmlFor="certificateImage" className="text-black">
                      도장 사진 업로드
                    </Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        id="certificateImage"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="certificateImage"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        📷 사진 선택
                      </label>
                    </div>
                    {certificateImageUrl && (
                      <div className="mt-2">
                        <img
                          src={certificateImageUrl}
                          alt="도장 사진"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                    <p className="text-muted-foreground text-xs mt-1">
                      합격증 또는 도장이 찍힌 사진을 업로드해주세요
                    </p>
                  </div>
                      type="url"
                      placeholder="https://example.com/certificate"
                      value={proofUrl}
                      onChange={(e) => setProofUrl(e.target.value)}
                      className="bg-secondary/50 border-border text-black mt-1"
                    />
                    <p className="text-muted-foreground text-xs mt-1">
                      학습 증명서나 인증서 URL을 입력해주세요
                    </p>
                  </div>

                  <Button
                    onClick={handleCompleteMission}
                    disabled={submitting || !proofUrl.trim() || !studyHours.trim()}
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
                    축하합니다! 챌린지 미션을 성공적으로 완료했습니다.
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
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-black mb-2">
                진행 가능한 챌린지 미션이 없습니다
              </h3>
              <p className="text-muted-foreground">
                새로운 챌린지 미션이 곧 추가될 예정입니다.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
