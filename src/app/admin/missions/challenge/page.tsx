'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertCircle, CheckCircle, Clock, Eye, Filter, Search } from 'lucide-react'
import { adminService } from '@/lib/services/admin'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ChallengeSubmission {
  id: string
  userId: string
  userName: string
  userPhone: string
  missionId: string
  missionTitle: string
  submissionData: {
    images?: string[]
    videos?: string[]
    description?: string
    category?: string
    skillLevel?: string
  }
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  reviewComment?: string
  rewardAmount?: number
  storeId: number
  storeName: string
}

export default function ChallengeMissionPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<ChallengeSubmission[]>([])
  const [loading, setLoading] = useState(true)
  
  // 관리자 및 지점 상태
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [stores, setStores] = useState<{ id: number; name: string }[]>([])
  const [adminId, setAdminId] = useState<string>('')
  const [selectedSubmission, setSelectedSubmission] = useState<ChallengeSubmission | null>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [rewardAmount, setRewardAmount] = useState<number>(0)
  
  // 필터 상태
  const [statusFilter, setStatusFilter] = useState('all')
  const [storeFilter, setStoreFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // 통계 데이터
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalReward: 0
  })

  // 관리자 인증 및 지점 로딩
  const initializeAdmin = async () => {
    try {
      const currentAdmin = adminService.getCurrentAdmin()
      if (!currentAdmin) {
        router.push('/admin/login')
        return
      }

      setAdminId(currentAdmin.id)

      // 역할에 따라 지점 목록 조회
      let storesResult
      if (currentAdmin.role === 'super_admin') {
        storesResult = await adminService.getAllStores()
      } else {
        storesResult = await adminService.getAdminStores(currentAdmin.id)
      }

      if (storesResult.success && storesResult.stores) {
        setStores(storesResult.stores)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/admin/login')
    }
  }

  useEffect(() => {
    initializeAdmin()
    loadSubmissions()
  }, [])
  
  // 지점 필터 변경 시 다시 로드
  useEffect(() => {
    loadSubmissions()
  }, [selectedStoreId])

  useEffect(() => {
    applyFilters()
    calculateStats()
  }, [submissions, statusFilter, storeFilter, searchQuery, categoryFilter])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const currentAdmin = adminService.getCurrentAdmin()
      if (!currentAdmin) return
      
      // 실제 데이터베이스에서 재능충 미션 데이터 가져오기
      const result = await adminService.getUserMissions(currentAdmin.id, selectedStoreId || undefined)
      
      if (result.success && result.data) {
        // 재능충 미션만 필터링하여 ChallengeSubmission 형태로 변환
        const challengeMissions = result.data
          .filter(mission => mission.missionType === 'challenge')
          .map(mission => ({
            id: mission.id,
            userId: mission.userId,
            userName: mission.userName,
            userPhone: mission.userPhone,
            missionId: mission.id,
            missionTitle: '재능충 미션',
            submissionData: {
              images: mission.proofData?.images || [],
              description: mission.proofData?.description || '',
              category: mission.proofData?.category || 'creative',
              skillLevel: mission.proofData?.skillLevel || 'beginner'
            },
            status: mission.status === 'completed' ? 'approved' : mission.status === 'pending' ? 'pending' : 'rejected',
            submittedAt: mission.submittedAt || mission.createdAt,
            reviewedAt: mission.completedAt,
            reviewedBy: 'admin',
            reviewComment: mission.rejectionReason || '',
            rewardAmount: mission.rewardAmount || 0,
            storeId: mission.storeId,
            storeName: mission.storeName
          } as ChallengeSubmission))
        
        setSubmissions(challengeMissions)
        return
      }
      
      // 실제 데이터가 없으면 목업 데이터 사용 
      const mockData: ChallengeSubmission[] = [
        {
          id: '1',
          userId: 'user1',
          userName: '김재능',
          userPhone: '010-1234-5678',
          missionId: 'challenge-1',
          missionTitle: '드리프트 기술 영상',
          submissionData: {
            images: ['https://example.com/drift1.jpg'],
            videos: ['https://example.com/drift1.mp4'],
            description: '완벽한 360도 드리프트 성공!',
            category: 'driving_skill',
            skillLevel: 'advanced'
          },
          status: 'pending',
          submittedAt: '2025-09-11T10:30:00Z',
          storeId: 1,
          storeName: '영등포운전면허학원'
        },
        {
          id: '2',
          userId: 'user2',
          userName: '이창작',
          userPhone: '010-9876-5432',
          missionId: 'challenge-2',
          missionTitle: '안전운전 교육 자료 제작',
          submissionData: {
            images: ['https://example.com/infographic.jpg'],
            description: '초보자를 위한 안전운전 인포그래픽',
            category: 'education',
            skillLevel: 'intermediate'
          },
          status: 'approved',
          submittedAt: '2025-09-10T15:20:00Z',
          reviewedAt: '2025-09-11T09:00:00Z',
          reviewedBy: 'admin1',
          reviewComment: '매우 유용한 교육자료입니다',
          rewardAmount: 15000,
          storeId: 1,
          storeName: '영등포운전면허학원'
        }
      ]
      setSubmissions(mockData)
    } catch (error) {
      console.error('Error loading challenge submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = submissions

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter)
    }

    if (storeFilter !== 'all') {
      filtered = filtered.filter(sub => sub.storeId.toString() === storeFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(sub => sub.submissionData.category === categoryFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(sub => 
        sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.missionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.userPhone.includes(searchQuery)
      )
    }

    setFilteredSubmissions(filtered)
  }

  const calculateStats = () => {
    const total = submissions.length
    const pending = submissions.filter(sub => sub.status === 'pending').length
    const approved = submissions.filter(sub => sub.status === 'approved').length
    const rejected = submissions.filter(sub => sub.status === 'rejected').length
    const totalReward = submissions.reduce((sum, sub) => sum + (sub.rewardAmount || 0), 0)

    setStats({ total, pending, approved, rejected, totalReward })
  }

  const handleReview = async (submissionId: string, status: 'approved' | 'rejected') => {
    try {
      // TODO: 실제 API 호출
      console.log('Reviewing submission:', submissionId, status, reviewComment, rewardAmount)
      
      // 임시로 로컬 상태 업데이트
      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionId 
          ? { 
              ...sub, 
              status, 
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'current_admin',
              reviewComment,
              rewardAmount: status === 'approved' ? rewardAmount : 0
            }
          : sub
      ))
      
      setSelectedSubmission(null)
      setReviewComment('')
      setRewardAmount(0)
    } catch (error) {
      console.error('Error reviewing submission:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <AlertCircle className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">재능충 미션 관리</h1>
          <p className="text-muted-foreground">
            사진, 동영상 및 창작물 제출 미션을 관리합니다
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 제출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">검토 대기</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">승인됨</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">거절됨</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 지급액</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalReward.toLocaleString()}원</div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            필터 및 검색
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="사용자명, 미션명, 전화번호 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="pending">검토 대기</SelectItem>
                <SelectItem value="approved">승인됨</SelectItem>
                <SelectItem value="rejected">거절됨</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 카테고리</SelectItem>
                <SelectItem value="driving_skill">운전 기술</SelectItem>
                <SelectItem value="education">교육 자료</SelectItem>
                <SelectItem value="safety">안전 캠페인</SelectItem>
                <SelectItem value="creative">창작 콘텐츠</SelectItem>
              </SelectContent>
            </Select>
            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger>
                <SelectValue placeholder="지점 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 지점</SelectItem>
                <SelectItem value="1">영등포운전면허학원</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setStatusFilter('all')
                setStoreFilter('all')
                setCategoryFilter('all')
                setSearchQuery('')
              }}
            >
              필터 초기화
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 제출물 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>제출물 목록 ({filteredSubmissions.length}건)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">조건에 맞는 제출물이 없습니다</div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <div key={submission.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{submission.missionTitle}</h3>
                        <Badge className={getStatusColor(submission.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(submission.status)}
                            {submission.status === 'pending' ? '검토 대기' :
                             submission.status === 'approved' ? '승인됨' : '거절됨'}
                          </div>
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p><strong>제출자:</strong> {submission.userName} ({submission.userPhone})</p>
                        <p><strong>지점:</strong> {submission.storeName}</p>
                        <p><strong>카테고리:</strong> {submission.submissionData.category}</p>
                        <p><strong>제출일:</strong> {new Date(submission.submittedAt).toLocaleString('ko-KR')}</p>
                        {submission.rewardAmount && (
                          <p><strong>지급액:</strong> {submission.rewardAmount.toLocaleString()}원</p>
                        )}
                      </div>
                      {submission.submissionData.description && (
                        <p className="text-sm bg-gray-50 p-2 rounded">
                          <strong>설명:</strong> {submission.submissionData.description}
                        </p>
                      )}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          상세보기
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{submission.missionTitle} - 상세 검토</DialogTitle>
                          <DialogDescription>
                            {submission.userName}님이 제출한 재능충 미션을 검토합니다
                          </DialogDescription>
                        </DialogHeader>
                        {selectedSubmission && (
                          <div className="space-y-4">
                            {/* 제출물 미리보기 */}
                            <div>
                              <h4 className="font-medium mb-2">제출된 콘텐츠</h4>
                              {selectedSubmission.submissionData.images && (
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  {selectedSubmission.submissionData.images.map((img, idx) => (
                                    <div key={idx} className="bg-gray-100 p-4 rounded text-center text-sm text-muted-foreground">
                                      이미지 {idx + 1} (미리보기 구현 예정)
                                    </div>
                                  ))}
                                </div>
                              )}
                              {selectedSubmission.submissionData.videos && (
                                <div className="grid grid-cols-1 gap-2 mb-2">
                                  {selectedSubmission.submissionData.videos.map((vid, idx) => (
                                    <div key={idx} className="bg-gray-100 p-4 rounded text-center text-sm text-muted-foreground">
                                      동영상 {idx + 1} (플레이어 구현 예정)
                                    </div>
                                  ))}
                                </div>
                              )}
                              {selectedSubmission.submissionData.description && (
                                <div className="bg-gray-50 p-3 rounded">
                                  <strong>설명:</strong> {selectedSubmission.submissionData.description}
                                </div>
                              )}
                            </div>

                            {/* 검토 폼 */}
                            {selectedSubmission.status === 'pending' && (
                              <div className="space-y-4 border-t pt-4">
                                <div>
                                  <label className="text-sm font-medium">검토 의견</label>
                                  <Textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="승인/거절 사유를 입력하세요"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">지급 금액 (승인 시)</label>
                                  <Input
                                    type="number"
                                    value={rewardAmount}
                                    onChange={(e) => setRewardAmount(Number(e.target.value))}
                                    placeholder="0"
                                    max="20000"
                                    className="mt-1"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    재능충 미션 최대 지급액: 20,000원
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleReview(selectedSubmission.id, 'approved')}
                                    className="flex-1"
                                    disabled={!reviewComment}
                                  >
                                    승인
                                  </Button>
                                  <Button
                                    onClick={() => handleReview(selectedSubmission.id, 'rejected')}
                                    variant="destructive"
                                    className="flex-1"
                                    disabled={!reviewComment}
                                  >
                                    거절
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* 기존 검토 정보 */}
                            {selectedSubmission.status !== 'pending' && (
                              <div className="border-t pt-4">
                                <h4 className="font-medium mb-2">검토 결과</h4>
                                <div className="bg-gray-50 p-3 rounded space-y-1 text-sm">
                                  <p><strong>상태:</strong> {selectedSubmission.status === 'approved' ? '승인됨' : '거절됨'}</p>
                                  <p><strong>검토일:</strong> {selectedSubmission.reviewedAt ? new Date(selectedSubmission.reviewedAt).toLocaleString('ko-KR') : '-'}</p>
                                  <p><strong>검토자:</strong> {selectedSubmission.reviewedBy || '-'}</p>
                                  <p><strong>검토 의견:</strong> {selectedSubmission.reviewComment || '-'}</p>
                                  {selectedSubmission.rewardAmount && (
                                    <p><strong>지급액:</strong> {selectedSubmission.rewardAmount.toLocaleString()}원</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}