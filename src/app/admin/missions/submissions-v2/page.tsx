'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { adminService } from '@/lib/services/admin'
import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileImage,
  Filter,
  RotateCw,
  Search,
  X,
  XCircle,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Submission {
  id: string
  userId: string
  userName: string
  userPhone: string
  missionId: string
  missionTitle: string
  missionType: string
  submittedAt: string
  proofData: {
    images?: string[]
    text?: string
    [key: string]: any
  }
  status: 'pending' | 'approved' | 'rejected'
}

const REJECTION_TEMPLATES = [
  '증빙 자료가 불명확합니다',
  '미션 요구사항을 충족하지 않습니다',
  '중복 제출입니다',
  '사진 품질이 좋지 않습니다',
  '증빙 자료가 누락되었습니다',
]

export default function SubmissionsV2Page() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [imageZoom, setImageZoom] = useState(1)
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    checkAdminAuth()
  }, [])

  useEffect(() => {
    filterSubmissions()
  }, [submissions, searchQuery, statusFilter])

  const checkAdminAuth = async () => {
    try {
      const currentAdmin = adminService.getCurrentAdmin()
      if (!currentAdmin) {
        router.push('/admin/login')
        return
      }

      loadSubmissions()
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/admin/login')
    }
  }

  const loadSubmissions = async () => {
    setIsLoading(true)
    try {
      // TODO: 실제 API 호출로 대체
      // const result = await adminService.getMissionSubmissions()

      // 임시 데이터
      const mockSubmissions: Submission[] = [
        {
          id: '1',
          userId: 'user-1',
          userName: '홍길동',
          userPhone: '010-1234-5678',
          missionId: 'mission-1',
          missionTitle: 'SNS 인증 미션',
          missionType: 'sns',
          submittedAt: '2025-11-10T10:30:00Z',
          proofData: {
            images: [
              'https://picsum.photos/800/600?random=1',
              'https://picsum.photos/800/600?random=2',
            ],
            text: 'SNS에 후기를 작성했습니다!',
          },
          status: 'pending',
        },
        {
          id: '2',
          userId: 'user-2',
          userName: '김철수',
          userPhone: '010-2345-6789',
          missionId: 'mission-2',
          missionTitle: '학과 시험 합격 인증',
          missionType: 'challenge',
          submittedAt: '2025-11-10T09:15:00Z',
          proofData: {
            images: ['https://picsum.photos/800/600?random=3'],
          },
          status: 'pending',
        },
        {
          id: '3',
          userId: 'user-3',
          userName: '이영희',
          userPhone: '010-3456-7890',
          missionId: 'mission-3',
          missionTitle: '첫 친구 추천하기',
          missionType: 'referral',
          submittedAt: '2025-11-10T08:00:00Z',
          proofData: {
            text: '친구가 가입 완료했습니다',
          },
          status: 'pending',
        },
      ]

      setSubmissions(mockSubmissions)
    } catch (error) {
      toast.error('제출물을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const filterSubmissions = () => {
    let filtered = submissions

    // 상태 필터
    if (statusFilter !== 'all') {
      filtered = filtered.filter((s) => s.status === statusFilter)
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.userName.toLowerCase().includes(query) ||
          s.userPhone.includes(query) ||
          s.missionTitle.toLowerCase().includes(query)
      )
    }

    setFilteredSubmissions(filtered)
  }

  const handleApprove = async (submissionId: string) => {
    try {
      // TODO: 실제 API 호출로 대체
      // await adminService.approveSubmission(submissionId)

      setSubmissions((prev) =>
        prev.map((s) => (s.id === submissionId ? { ...s, status: 'approved' as const } : s))
      )
      toast.success('제출물이 승인되었습니다.')
      setSelectedSubmission(null)
    } catch (error) {
      toast.error('승인 처리 중 오류가 발생했습니다.')
    }
  }

  const handleReject = () => {
    if (!selectedSubmission) return

    if (!rejectionReason.trim()) {
      toast.error('거부 사유를 입력해주세요.')
      return
    }

    try {
      // TODO: 실제 API 호출로 대체
      // await adminService.rejectSubmission(selectedSubmission.id, rejectionReason, adminNotes)

      setSubmissions((prev) =>
        prev.map((s) => (s.id === selectedSubmission.id ? { ...s, status: 'rejected' as const } : s))
      )
      toast.success('제출물이 거부되었습니다.')
      setRejectionDialogOpen(false)
      setSelectedSubmission(null)
      setRejectionReason('')
      setAdminNotes('')
    } catch (error) {
      toast.error('거부 처리 중 오류가 발생했습니다.')
    }
  }

  const openImageViewer = (submission: Submission, index: number = 0) => {
    setSelectedSubmission(submission)
    setSelectedImageIndex(index)
    setImageZoom(1)
    setImageViewerOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            대기 중
          </Badge>
        )
      case 'approved':
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            승인됨
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            거부됨
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <div className="text-lg text-gray-600">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">미션 제출물 검토</h1>
        <p className="text-gray-600 mt-2">사용자가 제출한 미션 증빙 자료를 검토하고 승인/거부하세요</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <Label>검색</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="사용자명, 전화번호, 미션명..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <Label>상태</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pending">대기 중</SelectItem>
                  <SelectItem value="approved">승인됨</SelectItem>
                  <SelectItem value="rejected">거부됨</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Refresh */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={loadSubmissions}
                className="w-full"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSubmissions.map((submission) => (
          <Card key={submission.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-bold text-gray-900">{submission.userName}</span>
                    {getStatusBadge(submission.status)}
                  </div>
                  <div className="text-sm text-gray-600">{submission.userPhone}</div>
                </div>
                <div className="text-sm text-gray-500">{formatDate(submission.submittedAt)}</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mission Info */}
              <div>
                <div className="text-sm text-gray-600 mb-1">미션</div>
                <div className="font-medium text-gray-900">{submission.missionTitle}</div>
                <Badge variant="outline" className="mt-2">
                  {submission.missionType}
                </Badge>
              </div>

              {/* Proof Data */}
              {submission.proofData.images && submission.proofData.images.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">첨부 이미지</div>
                  <div className="grid grid-cols-3 gap-2">
                    {submission.proofData.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => openImageViewer(submission, index)}
                      >
                        <Image
                          src={image}
                          alt={`증빙 ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {submission.proofData.text && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">텍스트 증빙</div>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-900">
                    {submission.proofData.text}
                  </div>
                </div>
              )}

              {/* Actions */}
              {submission.status === 'pending' && (
                <div className="flex space-x-2 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(submission.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    승인
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      setSelectedSubmission(submission)
                      setRejectionDialogOpen(true)
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    거부
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredSubmissions.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileImage className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">제출물이 없습니다</p>
              <p className="text-sm text-gray-400">필터 조건을 변경하거나 새로고침해보세요</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Viewer Dialog */}
      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>이미지 뷰어</DialogTitle>
            <DialogDescription>
              {selectedSubmission?.missionTitle} - {selectedSubmission?.userName}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission?.proofData.images && (
            <div className="space-y-4">
              {/* Image */}
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={selectedSubmission.proofData.images[selectedImageIndex]}
                  alt={`증빙 ${selectedImageIndex + 1}`}
                  fill
                  className="object-contain"
                  style={{ transform: `scale(${imageZoom})` }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setImageZoom((z) => Math.max(0.5, z - 0.25))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setImageZoom((z) => Math.min(3, z + 0.25))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setImageZoom(1)}>
                    100%
                  </Button>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={selectedImageIndex === 0}
                    onClick={() => setSelectedImageIndex((i) => i - 1)}
                  >
                    이전
                  </Button>
                  <span className="text-sm text-gray-600 flex items-center">
                    {selectedImageIndex + 1} / {selectedSubmission.proofData.images?.length}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={
                      selectedImageIndex === (selectedSubmission.proofData.images?.length || 1) - 1
                    }
                    onClick={() => setSelectedImageIndex((i) => i + 1)}
                  >
                    다음
                  </Button>
                </div>

                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  다운로드
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>제출물 거부</DialogTitle>
            <DialogDescription>거부 사유를 입력해주세요</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Quick Templates */}
            <div>
              <Label>빠른 선택</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {REJECTION_TEMPLATES.map((template) => (
                  <Button
                    key={template}
                    size="sm"
                    variant="outline"
                    onClick={() => setRejectionReason(template)}
                  >
                    {template}
                  </Button>
                ))}
              </div>
            </div>

            {/* Rejection Reason */}
            <div>
              <Label htmlFor="rejection-reason">거부 사유 *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="사용자에게 표시될 거부 사유를 입력하세요"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>

            {/* Admin Notes */}
            <div>
              <Label htmlFor="admin-notes">관리자 메모 (선택)</Label>
              <Textarea
                id="admin-notes"
                placeholder="내부용 메모 (사용자에게 표시되지 않음)"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>
              취소
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleReject}>
              거부하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
