'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { missionService } from '@/lib/services/missions'
import { Check, Eye, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface MissionSubmissionViewerProps {
  submissions: {
    id: string
    userId: string
    userName: string
    userPhone: string
    missionTitle: string
    missionType: MissionType
    status: 'pending' | 'approved' | 'rejected'
    proofData: ProofData
    submittedAt: string
    rewardAmount: number
    storeName: string
  }[]
  onApprove: (submissionId: string) => void
  onReject: (submissionId: string, reason: string) => void
}

export function MissionSubmissionViewer({
  submissions,
  onApprove,
  onReject
}: MissionSubmissionViewerProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set())
  const [isBulkApproveOpen, setIsBulkApproveOpen] = useState(false)
  const [isBulkRejectOpen, setIsBulkRejectOpen] = useState(false)
  const [bulkRejectReason, setBulkRejectReason] = useState('')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">검토 대기</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-500">승인됨</Badge>
      case 'rejected':
        return <Badge variant="destructive">거절됨</Badge>
      default:
        return <Badge variant="outline">알 수 없음</Badge>
    }
  }

  const renderProofData = (proofData: ProofData) => {
    switch (proofData.type) {
      case 'challenge':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">공부 시간</h4>
              <p>{proofData.studyHours}시간</p>
            </div>
            <div>
              <h4 className="font-semibold">합격증 사진</h4>
              {proofData.certificateImageUrl && (
                <div className="mt-2">
                  <Image
                    src={proofData.certificateImageUrl}
                    alt="합격증"
                    width={300}
                    height={200}
                    className="rounded-lg border"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => window.open(proofData.certificateImageUrl, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    다운로드
                  </Button>
                </div>
              )}
            </div>
          </div>
        )

      case 'sns':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">SNS 플랫폼</h4>
              <p className="capitalize">{proofData.platform}</p>
            </div>
            <div>
              <h4 className="font-semibold">게시물 링크</h4>
              <a
                href={proofData.snsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {proofData.snsUrl}
              </a>
            </div>
          </div>
        )

      case 'review':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold">리뷰 링크들</h4>
            {proofData.reviews.map((review, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <p className="font-medium capitalize">{review.platform}</p>
                <a
                  href={review.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {review.url}
                </a>
                <p className="text-sm text-gray-500">
                  완료일: {format(new Date(review.completedAt), 'yyyy-MM-dd HH:mm')}
                </p>
              </div>
            ))}
          </div>
        )

      case 'referral':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold">추천인 정보</h4>
            {proofData.referrals.map((referral, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p><strong>이름:</strong> {referral.name}</p>
                    <p><strong>전화번호:</strong> {referral.phone}</p>
                  </div>
                  <Badge variant={referral.verified ? "default" : "secondary"}>
                    {referral.verified ? '확인됨' : '미확인'}
                  </Badge>
                </div>
                {referral.registeredAt && (
                  <p className="text-sm text-gray-500 mt-2">
                    가입일: {format(new Date(referral.registeredAt), 'yyyy-MM-dd')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )

      case 'attendance':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">출석 정보</h4>
              <p>출석일: {format(new Date(proofData.date), 'yyyy-MM-dd')}</p>
              <p>연속 출석: {proofData.consecutiveDays}일</p>
              <p>총 출석: {proofData.totalDays}일</p>
              <p>보상: {proofData.reward ? proofData.reward.toLocaleString() : '0'}원</p>
            </div>
          </div>
        )

      default:
        return <p>알 수 없는 미션 타입입니다.</p>
    }
  }

  const handleReject = () => {
    if (selectedSubmission && rejectReason.trim()) {
      onReject(selectedSubmission.id, rejectReason)
      setIsRejectDialogOpen(false)
      setRejectReason('')
      setSelectedSubmission(null)
    }
  }

  const handleSelectSubmission = (submissionId: string, checked: boolean) => {
    const newSelected = new Set(selectedSubmissions)
    if (checked) {
      newSelected.add(submissionId)
    } else {
      newSelected.delete(submissionId)
    }
    setSelectedSubmissions(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingSubmissions = submissions
        .filter(s => s.status === 'pending')
        .map(s => s.id)
      setSelectedSubmissions(new Set(pendingSubmissions))
    } else {
      setSelectedSubmissions(new Set())
    }
  }

  const handleBulkApprove = async () => {
    for (const submissionId of selectedSubmissions) {
      await onApprove(submissionId)
    }
    setSelectedSubmissions(new Set())
    setIsBulkApproveOpen(false)
  }

  const handleBulkReject = async () => {
    if (!bulkRejectReason.trim()) return
    
    for (const submissionId of selectedSubmissions) {
      await onReject(submissionId, bulkRejectReason)
    }
    setSelectedSubmissions(new Set())
    setBulkRejectReason('')
    setIsBulkRejectOpen(false)
  }

  const pendingSubmissions = submissions.filter(s => s.status === 'pending')
  const selectedCount = selectedSubmissions.size

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      {pendingSubmissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>일괄 처리</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedCount === pendingSubmissions.length && pendingSubmissions.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm">전체 선택 ({pendingSubmissions.length}개)</span>
                </label>
                <span className="text-sm text-gray-500">
                  {selectedCount}개 선택됨
                </span>
              </div>
              <div className="flex space-x-2">
                <Dialog open={isBulkApproveOpen} onOpenChange={setIsBulkApproveOpen}>
                  <DialogTrigger asChild>
                    <Button
                      disabled={selectedCount === 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      일괄 승인 ({selectedCount})
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>일괄 승인 확인</DialogTitle>
                    </DialogHeader>
                    <p>선택된 {selectedCount}개의 제출물을 승인하시겠습니까?</p>
                    <div className="flex space-x-2">
                      <Button onClick={handleBulkApprove} className="flex-1">
                        승인
                      </Button>
                      <Button onClick={() => setIsBulkApproveOpen(false)} variant="outline" className="flex-1">
                        취소
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isBulkRejectOpen} onOpenChange={setIsBulkRejectOpen}>
                  <DialogTrigger asChild>
                    <Button
                      disabled={selectedCount === 0}
                      variant="destructive"
                    >
                      <X className="w-4 h-4 mr-2" />
                      일괄 거절 ({selectedCount})
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>일괄 거절</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p>선택된 {selectedCount}개의 제출물을 거절하시겠습니까?</p>
                      <div>
                        <label className="text-sm font-medium">거절 사유</label>
                        <textarea
                          value={bulkRejectReason}
                          onChange={(e) => setBulkRejectReason(e.target.value)}
                          className="w-full mt-1 p-2 border rounded-md"
                          rows={3}
                          placeholder="거절 사유를 입력해주세요..."
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleBulkReject}
                          disabled={!bulkRejectReason.trim()}
                          variant="destructive"
                          className="flex-1"
                        >
                          거절하기
                        </Button>
                        <Button
                          onClick={() => {
                            setIsBulkRejectOpen(false)
                            setBulkRejectReason('')
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>미션 제출물 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">선택</TableHead>
                <TableHead>사용자</TableHead>
                <TableHead>미션</TableHead>
                <TableHead>제출일</TableHead>
                <TableHead>보상금</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    {submission.status === 'pending' && (
                      <Checkbox
                        checked={selectedSubmissions.has(submission.id)}
                        onCheckedChange={(checked) => handleSelectSubmission(submission.id, checked as boolean)}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{submission.userName}</p>
                      <p className="text-sm text-gray-500">{submission.userPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{submission.missionTitle}</p>
                      <p className="text-sm text-gray-500">{submission.storeName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(submission.submittedAt), 'yyyy-MM-dd HH:mm')}
                  </TableCell>
                  <TableCell>
                    {submission.rewardAmount ? submission.rewardAmount.toLocaleString() : '0'}원
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(submission.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>제출물 상세보기</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold">사용자 정보</h4>
                                <p>이름: {submission.userName}</p>
                                <p>전화번호: {submission.userPhone}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold">미션 정보</h4>
                                <p>미션: {submission.missionTitle}</p>
                                <p>지점: {submission.storeName}</p>
                                <p>보상금: {submission.rewardAmount ? submission.rewardAmount.toLocaleString() : '0'}원</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold">제출 내용</h4>
                              {renderProofData(submission.proofData)}
                            </div>

                            {submission.status === 'pending' && (
                              <div className="flex space-x-2 pt-4 border-t">
                                <Button
                                  onClick={() => onApprove(submission.id)}
                                  className="flex-1"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  승인
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedSubmission(submission)
                                    setIsRejectDialogOpen(true)
                                  }}
                                  className="flex-1"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  거절
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 거절 사유 입력 다이얼로그 */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>거절 사유 입력</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">거절 사유</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
                rows={4}
                placeholder="거절 사유를 입력해주세요..."
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleReject}
                variant="destructive"
                disabled={!rejectReason.trim()}
                className="flex-1"
              >
                거절하기
              </Button>
              <Button
                onClick={() => {
                  setIsRejectDialogOpen(false)
                  setRejectReason('')
                }}
                variant="outline"
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
