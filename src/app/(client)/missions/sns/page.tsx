'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Award, CheckCircle2, Upload, ExternalLink, Share2 } from 'lucide-react'

export default function SnsPage() {
  const router = useRouter()
  const { user } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [snsUrl, setSnsUrl] = useState('')
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
      //   .eq('mission_type', 'sns')
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
    if (!snsUrl.trim()) {
      toast.error('SNS 게시물 URL을 입력해주세요.')
      return
    }

    // URL 형식 간단 검증
    try {
      new URL(snsUrl)
    } catch (error) {
      toast.error('올바른 URL 형식이 아닙니다.')
      return
    }

    if (!imageFile) {
      toast.error('캡처 이미지를 업로드해주세요.')
      return
    }

    setLoading(true)
    try {
      // TODO: API 연결
      // 1. 이미지 업로드
      // const { url } = await uploadMissionProof(user!.id, 'sns', imageFile)

      // 2. 미션 제출
      // await supabase.from('mission_participations').insert({
      //   user_id: user!.id,
      //   mission_type: 'sns',
      //   proof_data: { snsUrl, imageUrl: url },
      //   status: 'submitted'
      // })

      setSubmitted(true)
      toast.success('미션을 제출했습니다! +40 XP, +25 코인을 획득했습니다!')
    } catch (error) {
      toast.error('미션 제출에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            ← 뒤로
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">SNS 공유 미션</h1>
          <p className="text-gray-600 mt-2">SNS에 학원을 공유하고 보상을 받으세요!</p>
        </div>

        {/* 미션 정보 카드 */}
        <Card className="bg-gradient-to-r from-pink-600 to-rose-600 text-white">
          <CardContent className="py-6">
            <h3 className="text-2xl font-bold mb-2">미션 목표</h3>
            <p className="text-lg">SNS에 학원 홍보 게시물 공유</p>
            <div className="mt-4 flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                <span>+40 XP</span>
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                <span>+25 코인</span>
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
                  <Label htmlFor="url">SNS 게시물 URL</Label>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://instagram.com/p/..."
                      value={snsUrl}
                      onChange={(e) => setSnsUrl(e.target.value)}
                      className="flex-1"
                    />
                    {snsUrl && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(snsUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    인스타그램, 페이스북 등의 게시물 링크를 입력하세요
                  </p>
                </div>

                <div>
                  <Label htmlFor="image">게시물 캡처 이미지</Label>
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
                      캡처 이미지 선택
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-pink-200"
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    게시물 캡처 이미지를 업로드해주세요 (최대 10MB)
                  </p>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading || !snsUrl || !imageFile}
                  className="w-full bg-pink-600 hover:bg-pink-700"
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
                    <Share2 className="h-5 w-5 text-pink-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">1. SNS에 게시물 작성</p>
                      <p className="text-sm text-gray-600">
                        인스타그램, 페이스북 등에 학원 관련 게시물을 작성하세요
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Upload className="h-5 w-5 text-pink-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">2. 게시물 캡처</p>
                      <p className="text-sm text-gray-600">
                        작성한 게시물을 캡처하여 이미지로 저장하세요
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <ExternalLink className="h-5 w-5 text-pink-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">3. URL과 이미지 제출</p>
                      <p className="text-sm text-gray-600">
                        게시물 URL과 캡처 이미지를 함께 제출하세요
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 작성 예시 */}
            <Card>
              <CardHeader>
                <CardTitle>작성 예시</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    &ldquo;드라이빙 존에서 운전면허 취득 완료! 🚗
                    <br />
                    친절한 강사님들과 체계적인 교육 덕분에 단기간에 합격할 수 있었어요!
                    <br />
                    운전면허 준비하시는 분들께 강력 추천합니다 👍
                    <br />
                    #운전면허 #드라이빙존 #운전학원&rdquo;
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  위와 같이 학원 이름과 경험을 포함하여 작성해주세요
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
