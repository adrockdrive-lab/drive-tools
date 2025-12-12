'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { toast } from 'sonner'

interface MissionSubmissionFormProps {
  mission: {
    id: number
    title: string
    mission_type: string
    description?: string
    proof_requirements?: any
  }
  onSubmit: (proofData: any, files: File[]) => void
  isLoading?: boolean
}

export default function MissionSubmissionForm({ mission, onSubmit, isLoading = false }: MissionSubmissionFormProps) {
  const [formData, setFormData] = useState<any>({})
  const [files, setFiles] = useState<File[]>([])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = () => {
    // 각 미션별 필수 필드 검증
    const requiredFields = getRequiredFields(mission.mission_type)
    const missingFields = requiredFields.filter(field => !formData[field])
    
    if (missingFields.length > 0) {
      toast.error(`필수 항목을 모두 입력해주세요: ${missingFields.join(', ')}`)
      return
    }

    onSubmit(formData, files)
  }

  const getRequiredFields = (missionType: string): string[] => {
    switch (missionType) {
      case 'challenge':
        return ['challengeType', 'score', 'description']
      case 'sns':
        return ['platform', 'postUrl', 'description']
      case 'review':
        return ['platform', 'rating', 'reviewText']
      case 'attendance':
        return ['checkInMethod']
      case 'referral':
        return ['referredName', 'referredPhone']
      default:
        return []
    }
  }

  const renderChallengeForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="challengeType">챌린지 유형</Label>
        <Select onValueChange={(value) => handleInputChange('challengeType', value)}>
          <SelectTrigger>
            <SelectValue placeholder="챌린지 유형을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="driving_test">필기시험</SelectItem>
            <SelectItem value="practice_test">실기시험</SelectItem>
            <SelectItem value="simulation">시뮬레이션</SelectItem>
            <SelectItem value="road_test">도로주행</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="score">점수</Label>
        <Input
          id="score"
          type="number"
          min="0"
          max="100"
          placeholder="점수를 입력하세요"
          value={formData.score || ''}
          onChange={(e) => handleInputChange('score', parseInt(e.target.value))}
        />
      </div>

      <div>
        <Label htmlFor="description">상세 설명</Label>
        <Textarea
          id="description"
          placeholder="챌린지 수행 내용을 자세히 설명해주세요"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="photos">증빙 사진 (필수)</Label>
        <Input
          id="photos"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
        <p className="text-xs text-gray-600 mt-1">시험 결과지, 수료증 등의 사진을 업로드해주세요.</p>
      </div>
    </div>
  )

  const renderSNSForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="platform">SNS 플랫폼</Label>
        <Select onValueChange={(value) => handleInputChange('platform', value)}>
          <SelectTrigger>
            <SelectValue placeholder="플랫폼을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="instagram">인스타그램</SelectItem>
            <SelectItem value="facebook">페이스북</SelectItem>
            <SelectItem value="tiktok">틱톡</SelectItem>
            <SelectItem value="youtube">유튜브</SelectItem>
            <SelectItem value="blog">블로그</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="postUrl">게시물 링크</Label>
        <Input
          id="postUrl"
          type="url"
          placeholder="https://instagram.com/p/..."
          value={formData.postUrl || ''}
          onChange={(e) => handleInputChange('postUrl', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="hashtags">해시태그</Label>
        <Input
          id="hashtags"
          placeholder="#드라이빙존 #운전연수 #안전운전"
          value={formData.hashtags || ''}
          onChange={(e) => handleInputChange('hashtags', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="description">게시물 내용</Label>
        <Textarea
          id="description"
          placeholder="작성한 게시물의 내용을 입력해주세요"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="screenshots">스크린샷 (필수)</Label>
        <Input
          id="screenshots"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
        <p className="text-xs text-gray-600 mt-1">게시물과 좋아요/댓글 수를 보여주는 스크린샷을 업로드해주세요.</p>
      </div>
    </div>
  )

  const renderReviewForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="platform">리뷰 플랫폼</Label>
        <Select onValueChange={(value) => handleInputChange('platform', value)}>
          <SelectTrigger>
            <SelectValue placeholder="플랫폼을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="google">구글</SelectItem>
            <SelectItem value="naver">네이버</SelectItem>
            <SelectItem value="kakao">카카오맵</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="rating">평점</Label>
        <Select onValueChange={(value) => handleInputChange('rating', parseInt(value))}>
          <SelectTrigger>
            <SelectValue placeholder="평점을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">⭐⭐⭐⭐⭐ (5점)</SelectItem>
            <SelectItem value="4">⭐⭐⭐⭐ (4점)</SelectItem>
            <SelectItem value="3">⭐⭐⭐ (3점)</SelectItem>
            <SelectItem value="2">⭐⭐ (2점)</SelectItem>
            <SelectItem value="1">⭐ (1점)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="reviewText">리뷰 내용</Label>
        <Textarea
          id="reviewText"
          placeholder="작성한 리뷰 내용을 입력해주세요"
          value={formData.reviewText || ''}
          onChange={(e) => handleInputChange('reviewText', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="reviewUrl">리뷰 링크 (선택)</Label>
        <Input
          id="reviewUrl"
          type="url"
          placeholder="리뷰 페이지 링크"
          value={formData.reviewUrl || ''}
          onChange={(e) => handleInputChange('reviewUrl', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="screenshots">리뷰 스크린샷 (필수)</Label>
        <Input
          id="screenshots"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
        <p className="text-xs text-gray-600 mt-1">작성한 리뷰의 스크린샷을 업로드해주세요.</p>
      </div>
    </div>
  )

  const renderAttendanceForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="checkInMethod">출석 방법</Label>
        <Select onValueChange={(value) => handleInputChange('checkInMethod', value)}>
          <SelectTrigger>
            <SelectValue placeholder="출석 방법을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gps">GPS 위치 인증</SelectItem>
            <SelectItem value="qr">QR 코드 스캔</SelectItem>
            <SelectItem value="manual">수동 체크인</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.checkInMethod === 'gps' && (
        <div>
          <Button 
            type="button" 
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    handleInputChange('location', {
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude,
                      accuracy: position.coords.accuracy
                    })
                    toast.success('위치 정보가 확인되었습니다.')
                  },
                  () => toast.error('위치 정보를 가져올 수 없습니다.')
                )
              }
            }}
          >
            현재 위치 확인
          </Button>
        </div>
      )}

      <div>
        <Label htmlFor="notes">참고사항</Label>
        <Textarea
          id="notes"
          placeholder="출석과 관련된 특별한 사항이 있다면 입력해주세요"
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
        />
      </div>
    </div>
  )

  const renderReferralForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="referredName">추천받은 분 이름</Label>
        <Input
          id="referredName"
          placeholder="추천받은 분의 이름을 입력하세요"
          value={formData.referredName || ''}
          onChange={(e) => handleInputChange('referredName', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="referredPhone">추천받은 분 전화번호</Label>
        <Input
          id="referredPhone"
          placeholder="010-0000-0000"
          value={formData.referredPhone || ''}
          onChange={(e) => handleInputChange('referredPhone', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="relationship">관계</Label>
        <Select onValueChange={(value) => handleInputChange('relationship', value)}>
          <SelectTrigger>
            <SelectValue placeholder="관계를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="family">가족</SelectItem>
            <SelectItem value="friend">친구</SelectItem>
            <SelectItem value="colleague">동료</SelectItem>
            <SelectItem value="neighbor">이웃</SelectItem>
            <SelectItem value="other">기타</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">추천 경위</Label>
        <Textarea
          id="notes"
          placeholder="어떻게 추천하게 되었는지 간단히 설명해주세요"
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
        />
      </div>
    </div>
  )

  const renderFormByType = () => {
    switch (mission.mission_type) {
      case 'challenge':
        return renderChallengeForm()
      case 'sns':
        return renderSNSForm()
      case 'review':
        return renderReviewForm()
      case 'attendance':
        return renderAttendanceForm()
      case 'referral':
        return renderReferralForm()
      default:
        return <div>지원하지 않는 미션 타입입니다.</div>
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="text-2xl">
            {mission.mission_type === 'challenge' && '🏆'}
            {mission.mission_type === 'sns' && '📱'}
            {mission.mission_type === 'review' && '⭐'}
            {mission.mission_type === 'attendance' && '✅'}
            {mission.mission_type === 'referral' && '👥'}
          </div>
          {mission.title}
        </CardTitle>
        {mission.description && (
          <p className="text-muted-foreground">{mission.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {renderFormByType()}

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? '제출 중...' : '미션 제출하기'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}