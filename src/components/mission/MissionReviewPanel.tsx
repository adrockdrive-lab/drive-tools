'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { missionService } from '@/lib/services/missions'

interface MissionReviewPanelProps {
  initialFilter?: {
    status?: string
    missionType?: string
  }
}

export default function MissionReviewPanel({ initialFilter }: MissionReviewPanelProps) {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [adminNote, setAdminNote] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const [filters, setFilters] = useState({
    status: initialFilter?.status || 'submitted',
    missionType: initialFilter?.missionType || '',
    page: 1,
    limit: 20
  })

  useEffect(() => {
    loadSubmissions()
  }, [filters])

  const loadSubmissions = async () => {
    setLoading(true)
    try {
      const result = await missionService.getSubmittedMissions(filters)
      if (result.success) {
        setSubmissions(result.missions || [])
      } else {
        toast.error(result.error || '미션 제출 목록을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      toast.error('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (submissionId: string, note?: string) => {
    setIsProcessing(true)
    try {
      const result = await missionService.approveMission(submissionId, note)
      if (result.success) {
        toast.success('미션이 승인되었습니다.')
        loadSubmissions() // 목록 새로고침
        setIsApproveDialogOpen(false)
        setAdminNote('')
        setSelectedSubmission(null)
      } else {
        toast.error(result.error || '승인에 실패했습니다.')
      }
    } catch (error) {
      toast.error('승인 중 오류가 발생했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (submissionId: string, reason: string) => {
    setIsProcessing(true)
    try {
      const result = await missionService.rejectMission(submissionId, reason)
      if (result.success) {
        toast.success('미션이 반려되었습니다.')
        loadSubmissions() // 목록 새로고침
        setIsRejectDialogOpen(false)
        setRejectReason('')
        setSelectedSubmission(null)
      } else {
        toast.error(result.error || '반려에 실패했습니다.')
      }
    } catch (error) {
      toast.error('반려 중 오류가 발생했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">검토 대기</Badge>
      case 'verified':
        return <Badge variant="outline" className="bg-green-100 text-green-800">승인</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">반려</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMissionIcon = (type: string) => {
    switch (type) {
      case 'challenge': return '🏆'
      case 'sns': return '📱'
      case 'review': return '⭐'
      case 'attendance': return '✅'
      case 'referral': return '👥'
      default: return '📝'
    }
  }

  const renderProofData = (proofData: any, missionType: string) => {
    if (!proofData) return <p className="text-gray-500">제출된 증빙 자료가 없습니다.</p>

    switch (missionType) {
      case 'challenge':
        return (
          <div className="space-y-3">
            <div>
              <Label className="font-medium">챌린지 유형:</Label>
              <p className="text-sm text-gray-700">{proofData.challengeType || 'N/A'}</p>
            </div>
            <div>
              <Label className="font-medium">점수:</Label>
              <p className="text-sm text-gray-700">{proofData.score || 'N/A'}점</p>
            </div>
            <div>
              <Label className="font-medium">설명:</Label>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{proofData.description || 'N/A'}</p>
            </div>
          </div>
        )

      case 'sns':
        return (
          <div className="space-y-3">
            <div>
              <Label className="font-medium">플랫폼:</Label>
              <p className="text-sm text-gray-700">{proofData.platform || 'N/A'}</p>
            </div>
            <div>
              <Label className="font-medium">게시물 링크:</Label>
              {proofData.postUrl ? (
                <a href={proofData.postUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                  {proofData.postUrl}
                </a>
              ) : (
                <p className="text-sm text-gray-500">N/A</p>
              )}
            </div>
            <div>
              <Label className="font-medium">해시태그:</Label>
              <p className="text-sm text-gray-700">{proofData.hashtags || 'N/A'}</p>
            </div>
            <div>
              <Label className="font-medium">게시물 내용:</Label>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{proofData.description || 'N/A'}</p>
            </div>
          </div>
        )

      case 'review':
        return (
          <div className="space-y-3">
            <div>
              <Label className="font-medium">플랫폼:</Label>
              <p className="text-sm text-gray-700">{proofData.platform || 'N/A'}</p>
            </div>
            <div>
              <Label className="font-medium">평점:</Label>
              <p className="text-sm text-gray-700">
                {'⭐'.repeat(proofData.rating || 0)} ({proofData.rating || 0}/5)
              </p>
            </div>
            <div>
              <Label className="font-medium">리뷰 내용:</Label>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{proofData.reviewText || 'N/A'}</p>
            </div>
            {proofData.reviewUrl && (
              <div>
                <Label className="font-medium">리뷰 링크:</Label>
                <a href={proofData.reviewUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                  {proofData.reviewUrl}
                </a>
              </div>
            )}
          </div>
        )

      case 'attendance':
        return (
          <div className="space-y-3">
            <div>
              <Label className="font-medium">출석 방법:</Label>
              <p className="text-sm text-gray-700">{proofData.checkInMethod || 'N/A'}</p>
            </div>
            {proofData.location && (
              <div>
                <Label className="font-medium">위치 정보:</Label>
                <p className="text-sm text-gray-700">
                  위도: {proofData.location.latitude}, 경도: {proofData.location.longitude}
                </p>
              </div>
            )}
            <div>
              <Label className="font-medium">참고사항:</Label>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{proofData.notes || 'N/A'}</p>
            </div>
          </div>
        )

      case 'referral':
        return (
          <div className="space-y-3">
            <div>
              <Label className="font-medium">추천받은 분:</Label>
              <p className="text-sm text-gray-700">{proofData.referredName || 'N/A'}</p>
            </div>
            <div>
              <Label className="font-medium">전화번호:</Label>
              <p className="text-sm text-gray-700">{proofData.referredPhone || 'N/A'}</p>
            </div>
            <div>
              <Label className="font-medium">관계:</Label>
              <p className="text-sm text-gray-700">{proofData.relationship || 'N/A'}</p>
            </div>
            <div>
              <Label className="font-medium">추천 경위:</Label>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{proofData.notes || 'N/A'}</p>
            </div>
          </div>
        )

      default:
        return (
          <div>
            <Label className="font-medium">제출 데이터:</Label>
            <pre className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(proofData, null, 2)}
            </pre>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* 필터 */}
      <Card>
        <CardHeader>
          <CardTitle>미션 검토</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div>
              <Label>상태</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value, page: 1})}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">검토 대기</SelectItem>
                  <SelectItem value="verified">승인됨</SelectItem>
                  <SelectItem value="rejected">반려됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>미션 타입</Label>
              <Select value={filters.missionType} onValueChange={(value) => setFilters({...filters, missionType: value, page: 1})}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  <SelectItem value="challenge">챌린지</SelectItem>
                  <SelectItem value="sns">SNS</SelectItem>
                  <SelectItem value="review">리뷰</SelectItem>
                  <SelectItem value="attendance">출석</SelectItem>
                  <SelectItem value="referral">추천</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={loadSubmissions} disabled={loading}>
              새로고침
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 제출 목록 */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <p>로딩 중...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">제출된 미션이 없습니다.</p>
          </div>
        ) : (
          submissions.map((submission) => (
            <Card key={submission.id} className="w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{getMissionIcon(submission.mission_definitions.mission_type)}</span>
                    <div>
                      <h3 className="text-lg font-semibold">{submission.mission_definitions.title}</h3>
                      <p className="text-sm text-gray-600">
                        {submission.users.name} ({submission.users.phone})
                      </p>
                    </div>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(submission.status)}
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      ₩{submission.mission_definitions.reward_amount.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <Label className="font-medium text-base">제출 내용</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    {renderProofData(submission.proof_data, submission.mission_definitions.mission_type)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">제출 일시:</Label>
                    <p className="text-gray-700">
                      {new Date(submission.completed_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">미션 타입:</Label>
                    <p className="text-gray-700">{submission.mission_definitions.mission_type}</p>
                  </div>
                </div>

                {submission.admin_note && (
                  <div>
                    <Label className="font-medium">관리자 메모:</Label>
                    <p className="text-sm text-gray-700 mt-1 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      {submission.admin_note}
                    </p>
                  </div>
                )}

                {submission.status === 'submitted' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Dialog open={isApproveDialogOpen && selectedSubmission?.id === submission.id} 
                            onOpenChange={(open) => {
                              setIsApproveDialogOpen(open)
                              if (!open) setSelectedSubmission(null)
                            }}>
                      <DialogTrigger asChild>
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          승인
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>미션 승인</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p>이 미션을 승인하시겠습니까?</p>
                          <div>
                            <Label htmlFor="adminNote">관리자 메모 (선택)</Label>
                            <Textarea
                              id="adminNote"
                              placeholder="승인과 함께 남길 메모가 있다면 입력하세요"
                              value={adminNote}
                              onChange={(e) => setAdminNote(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApprove(submission.id, adminNote)}
                              disabled={isProcessing}
                              className="flex-1"
                            >
                              {isProcessing ? '승인 중...' : '승인 확정'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsApproveDialogOpen(false)
                                setSelectedSubmission(null)
                                setAdminNote('')
                              }}
                              className="flex-1"
                            >
                              취소
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isRejectDialogOpen && selectedSubmission?.id === submission.id} 
                            onOpenChange={(open) => {
                              setIsRejectDialogOpen(open)
                              if (!open) setSelectedSubmission(null)
                            }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          반려
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>미션 반려</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p>이 미션을 반려하시겠습니까?</p>
                          <div>
                            <Label htmlFor="rejectReason">반려 사유 (필수)</Label>
                            <Textarea
                              id="rejectReason"
                              placeholder="반려 사유를 입력해주세요"
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              required
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleReject(submission.id, rejectReason)}
                              disabled={isProcessing || !rejectReason.trim()}
                              variant="destructive"
                              className="flex-1"
                            >
                              {isProcessing ? '반려 중...' : '반려 확정'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsRejectDialogOpen(false)
                                setSelectedSubmission(null)
                                setRejectReason('')
                              }}
                              className="flex-1"
                            >
                              취소
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}