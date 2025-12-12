'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertCircle, CheckCircle, Clock, Eye, Filter, Search, ExternalLink, Image, Share2 } from 'lucide-react'
import { adminService } from '@/lib/services/admin'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface SNSSubmission {
  id: string
  userId: string
  userName: string
  userPhone: string
  missionId: string
  missionTitle: string
  submissionData: {
    platform: 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'blog'
    postUrl?: string
    screenshots?: string[]
    description?: string
    hashtags?: string[]
    followers?: number
    engagement?: {
      likes: number
      comments: number
      shares: number
    }
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

export default function SNSMissionPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<SNSSubmission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<SNSSubmission[]>([])
  const [loading, setLoading] = useState(true)
  
  // 관리자 및 지점 상태
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [stores, setStores] = useState<{ id: number; name: string }[]>([])
  const [adminId, setAdminId] = useState<string>('')
  const [selectedSubmission, setSelectedSubmission] = useState<SNSSubmission | null>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [rewardAmount, setRewardAmount] = useState<number>(0)
  
  // 필터 상태
  const [statusFilter, setStatusFilter] = useState('all')
  const [storeFilter, setStoreFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')

  // 통계 데이터
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalReward: 0,
    byPlatform: {
      instagram: 0,
      facebook: 0,
      youtube: 0,
      tiktok: 0,
      blog: 0
    }
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
  }, [submissions, statusFilter, storeFilter, searchQuery, platformFilter])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const currentAdmin = adminService.getCurrentAdmin()
      if (!currentAdmin) return
      
      // 실제 데이터베이스에서 SNS 미션 데이터 가져오기
      const result = await adminService.getUserMissions(currentAdmin.id, selectedStoreId || undefined)
      
      if (result.success && result.data) {
        // SNS 미션만 필터링하여 SNSSubmission 형태로 변환
        const snsMissions = result.data
          .filter(mission => mission.missionType === 'sns')
          .map(mission => ({
            id: mission.id,
            userId: mission.userId,
            userName: mission.userName,
            userPhone: mission.userPhone,
            missionId: mission.id,
            missionTitle: 'SNS 미션',
            submissionData: {
              platform: mission.proofData?.platform || 'instagram',
              postUrl: mission.proofData?.snsUrl || mission.proofData?.postUrl || '',
              content: mission.proofData?.content || '',
              hashtags: mission.proofData?.hashtags || [],
              images: mission.proofData?.images || [],
              metrics: {
                views: mission.proofData?.metrics?.views || 0,
                likes: mission.proofData?.metrics?.likes || 0,
                comments: mission.proofData?.metrics?.comments || 0,
                shares: mission.proofData?.metrics?.shares || 0
              },
              verified: mission.status === 'completed'
            },
            status: mission.status === 'completed' ? 'approved' : mission.status === 'pending' ? 'pending' : 'rejected',
            submittedAt: mission.submittedAt || mission.createdAt,
            reviewedAt: mission.completedAt,
            reviewedBy: 'admin',
            reviewComment: mission.rejectionReason || '',
            rewardAmount: mission.rewardAmount || 0,
            storeId: mission.storeId,
            storeName: mission.storeName
          } as SNSSubmission))
        
        setSubmissions(snsMissions)
        return
      }
      
      // 실제 데이터가 없으면 목업 데이터 사용 
      const mockData: SNSSubmission[] = [
        {
          id: '1',
          userId: 'user1',
          userName: '김인플',
          userPhone: '010-1234-5678',
          missionId: 'sns-1',
          missionTitle: '인스타그램 운전 후기 포스팅',
          submissionData: {
            platform: 'instagram',
            postUrl: 'https://instagram.com/p/example1',
            screenshots: ['https://example.com/screenshot1.jpg'],
            description: '영등포운전면허학원에서 면허 취득 후기 포스팅',
            hashtags: ['#운전면허', '#영등포운전면허학원', '#운전초보'],
            followers: 1200,
            engagement: {
              likes: 45,
              comments: 8,
              shares: 3
            }
          },
          status: 'pending',
          submittedAt: '2025-09-11T10:30:00Z',
          storeId: 1,
          storeName: '영등포운전면허학원'
        },
        {
          id: '2',
          userId: 'user2',
          userName: '박유튜버',
          userPhone: '010-9876-5432',
          missionId: 'sns-2',
          missionTitle: '유튜브 운전 학습 영상 업로드',
          submissionData: {
            platform: 'youtube',
            postUrl: 'https://youtube.com/watch?v=example',
            screenshots: ['https://example.com/youtube-thumb.jpg'],
            description: '안전운전 노하우 공유 영상',
            hashtags: ['운전학원', '안전운전', '초보운전자'],
            followers: 850,
            engagement: {
              likes: 23,
              comments: 12,
              shares: 5
            }
          },
          status: 'approved',
          submittedAt: '2025-09-10T15:20:00Z',
          reviewedAt: '2025-09-11T09:00:00Z',
          reviewedBy: 'admin1',
          reviewComment: '영상 품질이 좋고 교육적 가치가 높습니다',
          rewardAmount: 8000,
          storeId: 1,
          storeName: '영등포운전면허학원'
        },
        {
          id: '3',
          userId: 'user3',
          userName: '이블로거',
          userPhone: '010-5555-7777',
          missionId: 'sns-3',
          missionTitle: '블로그 운전면허 취득 후기',
          submissionData: {
            platform: 'blog',
            postUrl: 'https://blog.naver.com/example/review',
            screenshots: ['https://example.com/blog-screenshot.jpg'],
            description: '상세한 운전면허 취득 과정 및 팁 공유',
            hashtags: ['운전면허후기', '운전학원추천', '면허시험팁'],
            engagement: {
              likes: 67,
              comments: 15,
              shares: 8
            }
          },
          status: 'rejected',
          submittedAt: '2025-09-09T14:30:00Z',
          reviewedAt: '2025-09-10T11:00:00Z',
          reviewedBy: 'admin1',
          reviewComment: '내용이 너무 짧고 학원 관련 언급이 부족합니다',
          storeId: 1,
          storeName: '영등포운전면허학원'
        }
      ]
      setSubmissions(mockData)
    } catch (error) {
      console.error('Error loading SNS submissions:', error)
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

    if (platformFilter !== 'all') {
      filtered = filtered.filter(sub => sub.submissionData.platform === platformFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(sub => 
        sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.missionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.userPhone.includes(searchQuery) ||
        sub.submissionData.postUrl?.toLowerCase().includes(searchQuery.toLowerCase())
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

    const byPlatform = {
      instagram: submissions.filter(sub => sub.submissionData.platform === 'instagram').length,
      facebook: submissions.filter(sub => sub.submissionData.platform === 'facebook').length,
      youtube: submissions.filter(sub => sub.submissionData.platform === 'youtube').length,
      tiktok: submissions.filter(sub => sub.submissionData.platform === 'tiktok').length,
      blog: submissions.filter(sub => sub.submissionData.platform === 'blog').length
    }

    setStats({ total, pending, approved, rejected, totalReward, byPlatform })
  }

  const handleReview = async (submissionId: string, status: 'approved' | 'rejected') => {
    try {
      // TODO: 실제 API 호출
      console.log('Reviewing SNS submission:', submissionId, status, reviewComment, rewardAmount)
      
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
      console.error('Error reviewing SNS submission:', error)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return '📷'
      case 'facebook': return '👤'
      case 'youtube': return '📺'
      case 'tiktok': return '🎵'
      case 'blog': return '📝'
      default: return '📱'
    }
  }

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'instagram': return '인스타그램'
      case 'facebook': return '페이스북'
      case 'youtube': return '유튜브'
      case 'tiktok': return '틱톡'
      case 'blog': return '블로그'
      default: return platform
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
          <h1 className="text-3xl font-bold tracking-tight">SNS 미션 관리</h1>
          <p className="text-muted-foreground">
            소셜미디어 콘텐츠 제출 미션을 관리합니다
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 제출</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
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

      {/* 플랫폼별 통계 */}
      <Card>
        <CardHeader>
          <CardTitle>플랫폼별 제출 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl mb-1">📷</div>
              <div className="font-semibold">{stats.byPlatform.instagram}</div>
              <div className="text-sm text-muted-foreground">인스타그램</div>
            </div>
            <div>
              <div className="text-2xl mb-1">👤</div>
              <div className="font-semibold">{stats.byPlatform.facebook}</div>
              <div className="text-sm text-muted-foreground">페이스북</div>
            </div>
            <div>
              <div className="text-2xl mb-1">📺</div>
              <div className="font-semibold">{stats.byPlatform.youtube}</div>
              <div className="text-sm text-muted-foreground">유튜브</div>
            </div>
            <div>
              <div className="text-2xl mb-1">🎵</div>
              <div className="font-semibold">{stats.byPlatform.tiktok}</div>
              <div className="text-sm text-muted-foreground">틱톡</div>
            </div>
            <div>
              <div className="text-2xl mb-1">📝</div>
              <div className="font-semibold">{stats.byPlatform.blog}</div>
              <div className="text-sm text-muted-foreground">블로그</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 필터 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            필터 및 검색
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="사용자명, URL, 전화번호 검색..."
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
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger>
                <SelectValue placeholder="플랫폼 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 플랫폼</SelectItem>
                <SelectItem value="instagram">인스타그램</SelectItem>
                <SelectItem value="facebook">페이스북</SelectItem>
                <SelectItem value="youtube">유튜브</SelectItem>
                <SelectItem value="tiktok">틱톡</SelectItem>
                <SelectItem value="blog">블로그</SelectItem>
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
                setPlatformFilter('all')
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
          <CardTitle>SNS 제출물 목록 ({filteredSubmissions.length}건)</CardTitle>
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
                        <span className="text-xl">{getPlatformIcon(submission.submissionData.platform)}</span>
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
                        <p><strong>플랫폼:</strong> {getPlatformName(submission.submissionData.platform)}</p>
                        <p><strong>지점:</strong> {submission.storeName}</p>
                        <p><strong>제출일:</strong> {new Date(submission.submittedAt).toLocaleString('ko-KR')}</p>
                        {submission.submissionData.postUrl && (
                          <p>
                            <strong>게시물 URL:</strong> 
                            <a 
                              href={submission.submissionData.postUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 ml-1 inline-flex items-center gap-1"
                            >
                              링크 보기 <ExternalLink className="h-3 w-3" />
                            </a>
                          </p>
                        )}
                        {submission.submissionData.followers && (
                          <p><strong>팔로워:</strong> {submission.submissionData.followers.toLocaleString()}명</p>
                        )}
                        {submission.submissionData.engagement && (
                          <p>
                            <strong>참여도:</strong> 
                            좋아요 {submission.submissionData.engagement.likes} · 
                            댓글 {submission.submissionData.engagement.comments} · 
                            공유 {submission.submissionData.engagement.shares}
                          </p>
                        )}
                        {submission.rewardAmount && (
                          <p><strong>지급액:</strong> {submission.rewardAmount.toLocaleString()}원</p>
                        )}
                      </div>
                      {submission.submissionData.description && (
                        <p className="text-sm bg-gray-50 p-2 rounded">
                          <strong>설명:</strong> {submission.submissionData.description}
                        </p>
                      )}
                      {submission.submissionData.hashtags && submission.submissionData.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {submission.submissionData.hashtags.map((tag, idx) => (
                            <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
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
                            {submission.userName}님이 제출한 SNS 미션을 검토합니다
                          </DialogDescription>
                        </DialogHeader>
                        {selectedSubmission && (
                          <div className="space-y-4">
                            {/* 제출물 미리보기 */}
                            <div>
                              <h4 className="font-medium mb-2">SNS 콘텐츠 정보</h4>
                              <div className="bg-gray-50 p-4 rounded space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{getPlatformIcon(selectedSubmission.submissionData.platform)}</span>
                                  <strong>플랫폼:</strong> {getPlatformName(selectedSubmission.submissionData.platform)}
                                </div>
                                {selectedSubmission.submissionData.postUrl && (
                                  <p>
                                    <strong>게시물:</strong> 
                                    <a 
                                      href={selectedSubmission.submissionData.postUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 ml-1 inline-flex items-center gap-1"
                                    >
                                      {selectedSubmission.submissionData.postUrl} <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </p>
                                )}
                                {selectedSubmission.submissionData.followers && (
                                  <p><strong>팔로워 수:</strong> {selectedSubmission.submissionData.followers.toLocaleString()}명</p>
                                )}
                                {selectedSubmission.submissionData.engagement && (
                                  <div>
                                    <strong>참여도:</strong>
                                    <ul className="ml-4 mt-1">
                                      <li>좋아요: {selectedSubmission.submissionData.engagement.likes}</li>
                                      <li>댓글: {selectedSubmission.submissionData.engagement.comments}</li>
                                      <li>공유: {selectedSubmission.submissionData.engagement.shares}</li>
                                    </ul>
                                  </div>
                                )}
                                {selectedSubmission.submissionData.description && (
                                  <p><strong>내용 설명:</strong> {selectedSubmission.submissionData.description}</p>
                                )}
                                {selectedSubmission.submissionData.hashtags && selectedSubmission.submissionData.hashtags.length > 0 && (
                                  <div>
                                    <strong>해시태그:</strong>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {selectedSubmission.submissionData.hashtags.map((tag, idx) => (
                                        <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 스크린샷 */}
                            {selectedSubmission.submissionData.screenshots && (
                              <div>
                                <h4 className="font-medium mb-2">제출된 스크린샷</h4>
                                <div className="grid grid-cols-1 gap-2">
                                  {selectedSubmission.submissionData.screenshots.map((screenshot, idx) => (
                                    <div key={idx} className="bg-gray-100 p-4 rounded text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                                      <Image className="h-4 w-4" />
                                      스크린샷 {idx + 1} (미리보기 구현 예정)
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

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
                                    max="10000"
                                    className="mt-1"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    SNS 미션 최대 지급액: 10,000원
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