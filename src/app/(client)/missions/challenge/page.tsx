'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Award, CheckCircle2, Clock, Upload } from 'lucide-react'

export default function ChallengePage() {
  const router = useRouter()
  const { user } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [studyHours, setStudyHours] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')

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
      //   .eq('mission_type', 'challenge')
      //   .single()

      // setSubmitted(data?.status === 'submitted' || data?.status === 'verified')
    } catch (error) {
      console.error('Error checking submission:', error)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('파일 크기는 10MB 이하여야 합니다.')
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    if (!imageFile) {
      toast.error('도장 사진을 업로드해주세요.')
      return
    }

    if (!studyHours || parseInt(studyHours) > 14) {
      toast.error('학습 시간을 올바르게 입력해주세요 (최대 14시간)')
      return
    }

    setLoading(true)
    try {
      // TODO: API 연결
      // 1. 이미지 업로드
      // const { url } = await uploadMissionProof(user!.id, 'challenge', imageFile)

      // 2. 미션 제출
      // await supabase.from('mission_participations').insert({
      //   user_id: user!.id,
      //   mission_type: 'challenge',
      //   proof_data: { imageUrl: url, studyHours: parseInt(studyHours) },
      //   status: 'submitted'
      // })

      setSubmitted(true)
      toast.success('미션을 제출했습니다! 관리자 승인을 기다려주세요.')
    } catch (error) {
      toast.error('미션 제출에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            ← 뒤로
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">14시간 챌린지</h1>
          <p className="text-gray-600 mt-2">14시간 안에 면허 취득하고 보상을 받으세요!</p>
        </div>

        {/* 미션 정보 카드 */}
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardContent className="py-6">
            <h3 className="text-2xl font-bold mb-2">미션 목표</h3>
            <p className="text-lg">총 학습 시간 14시간 이내 면허 취득</p>
            <div className="mt-4 flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                <span>+500 XP</span>
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                <span>+300 코인</span>
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
              <p className="text-gray-600 mb-4">관리자 검토 후 승인될 예정입니다.</p>
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
                <CardTitle>미션 제출</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="image">도장 사진 업로드</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="image"
                      className="cursor-pointer inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      사진 선택
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-purple-200"
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    합격증 또는 도장이 찍힌 사진을 업로드해주세요 (최대 10MB)
                  </p>
                </div>

                <div>
                  <Label htmlFor="hours">총 학습 시간 (시간)</Label>
                  <Input
                    id="hours"
                    type="number"
                    min="1"
                    max="14"
                    placeholder="예: 12"
                    value={studyHours}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      if (val > 14) {
                        toast.error('학습 시간은 최대 14시간까지 입력 가능합니다.')
                        setStudyHours('14')
                      } else {
                        setStudyHours(e.target.value)
                      }
                    }}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    총 학습 시간을 입력해주세요 (최대 14시간)
                  </p>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading || !imageFile || !studyHours}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  {loading ? '제출 중...' : '미션 제출하기'}
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
                    <Clock className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">1. 학습 시간 기록</p>
                      <p className="text-sm text-gray-600">
                        총 학습 시간이 14시간 이내인지 확인하세요
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Upload className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">2. 증빙 자료 준비</p>
                      <p className="text-sm text-gray-600">
                        합격증 또는 도장이 찍힌 사진을 준비하세요
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
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
