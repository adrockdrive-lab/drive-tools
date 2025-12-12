'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertCircle, CheckCircle, Clock, Eye, Filter, Search, Star, MessageSquare, ExternalLink, Coffee } from 'lucide-react'
import { adminService } from '@/lib/services/admin'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ReviewSubmission {
  id: string
  userId: string
  userName: string
  userPhone: string
  missionId: string
  missionTitle: string
  submissionData: {
    platform: 'google' | 'naver' | 'kakao' | 'blog' | 'other'
    reviewUrl?: string
    reviewText: string
    rating: number
    reviewImages?: string[]
    reviewDate: string
    verified?: boolean
    helpful?: number
  }
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  reviewComment?: string
  rewardAmount?: number
  couponType?: 'coffee' | 'discount' | 'cash'
  couponQuantity?: number
  storeId: number
  storeName: string
}

export default function ReviewMissionPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<ReviewSubmission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<ReviewSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<ReviewSubmission | null>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [rewardAmount, setRewardAmount] = useState<number>(0)
  const [couponType, setCouponType] = useState<'coffee' | 'discount' | 'cash'>('coffee')
  const [couponQuantity, setCouponQuantity] = useState<number>(1)
  
  // 필터 상태
  const [statusFilter, setStatusFilter] = useState('all')
  const [storeFilter, setStoreFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  
  // 관리자 및 지점 상태
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [stores, setStores] = useState<{ id: number; name: string }[]>([])
  const [adminId, setAdminId] = useState<string>('')

  // 통계 데이터
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalReward: 0,
    totalCoupons: 0,
    avgRating: 0,
    byPlatform: {
      google: 0,
      naver: 0,
      kakao: 0,
      blog: 0,
      other: 0
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
  }, [submissions, statusFilter, storeFilter, searchQuery, platformFilter, ratingFilter])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const currentAdmin = adminService.getCurrentAdmin()
      if (!currentAdmin) return
      
      // 실제 데이터베이스에서 리뷰 미션 데이터 가져오기
      const result = await adminService.getUserMissions(currentAdmin.id, selectedStoreId || undefined)
      
      if (result.success && result.data) {
        // 리뷰 미션만 필터링하여 ReviewSubmission 형태로 변환
        const reviewMissions = result.data
          .filter(mission => mission.missionType === 'review')
          .map(mission => ({
            id: mission.id,
            userId: mission.userId,
            userName: mission.userName,
            userPhone: mission.userPhone,
            missionId: mission.id,
            missionTitle: '후기 작성 미션',
            submissionData: {
              platform: mission.proofData?.platform || 'google',
              reviewUrl: mission.proofData?.reviewUrl || '',
              reviewText: mission.proofData?.reviewText || '',
              rating: mission.proofData?.rating || 5,
              reviewImages: mission.proofData?.images || [],
              reviewDate: mission.submittedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
              verified: mission.status === 'completed',
              helpful: 0
            },
            status: mission.status === 'completed' ? 'approved' : mission.status === 'pending' ? 'pending' : 'rejected',
            submittedAt: mission.submittedAt || mission.createdAt,
            reviewedAt: mission.completedAt,
            reviewedBy: 'admin',
            reviewComment: mission.rejectionReason || '',
            rewardAmount: mission.rewardAmount || 0,
            couponType: mission.proofData?.couponType || 'coffee',
            couponQuantity: mission.proofData?.couponQuantity || 1,
            storeId: mission.storeId,
            storeName: mission.storeName
          } as ReviewSubmission))
        
        setSubmissions(reviewMissions)
        return
      }
      
      // 실제 데이터가 없으면 목업 데이터 사용 
      const mockData: ReviewSubmission[] = [
        {
          id: '1',
          userId: 'user1',
          userName: '김후기',
          userPhone: '010-1234-5678',
          missionId: 'review-1',
          missionTitle: '구글 리뷰 작성',
          submissionData: {
            platform: 'google',
            reviewUrl: 'https://g.page/r/example/review',
            reviewText: '영등포운전면허학원에서 면허를 취득했습니다. 강사님들이 정말 친절하시고 체계적으로 가르쳐주셔서 한 번에 합격할 수 있었어요. 시설도 깔끔하고 주차도 편리합니다. 추천해요!',
            rating: 5,
            reviewImages: ['review1.jpg', 'review2.jpg'],
            reviewDate: '2025-09-11',
            verified: true,
            helpful: 3
          },
          status: 'pending',
          submittedAt: '2025-09-11T10:30:00Z',
          storeId: 1,
          storeName: '영등포운전면허학원'
        },
        {
          id: '2',
          userId: 'user2',
          userName: '박평점',
          userPhone: '010-9876-5432',
          missionId: 'review-2',
          missionTitle: '네이버 후기 작성',
          submissionData: {
            platform: 'naver',
            reviewUrl: 'https://place.naver.com/example/review',
            reviewText: '친구 추천으로 이곳에서 면허를 땄는데 정말 만족합니다. 이론부터 실기까지 차근차근 알려주시고, 특히 도로주행 연습을 많이 시켜주셔서 실전에서 떨지 않고 할 수 있었어요.',
            rating: 4,
            reviewDate: '2025-09-10',
            verified: true,
            helpful: 7
          },
          status: 'approved',
          submittedAt: '2025-09-10T15:20:00Z',
          reviewedAt: '2025-09-11T09:00:00Z',
          reviewedBy: 'admin1',
          reviewComment: '상세하고 도움이 되는 후기입니다',
          couponType: 'coffee',
          couponQuantity: 2,
          storeId: 1,
          storeName: '영등포운전면허학원'
        },
        {
          id: '3',
          userId: 'user3',
          userName: '이솔직',
          userPhone: '010-5555-7777',
          missionId: 'review-3',
          missionTitle: '카카오맵 리뷰',
          submissionData: {
            platform: 'kakao',
            reviewUrl: 'https://place.map.kakao.com/example',
            reviewText: '짧지만 좋았어요',
            rating: 3,
            reviewDate: '2025-09-09',
            verified: false,
            helpful: 0
          },
          status: 'rejected',
          submittedAt: '2025-09-09T14:30:00Z',
          reviewedAt: '2025-09-10T11:00:00Z',
          reviewedBy: 'admin1',
          reviewComment: '후기 내용이 너무 간단하고 구체적인 정보가 부족합니다',
          storeId: 1,
          storeName: '영등포운전면허학원'
        }
      ]
      setSubmissions(mockData)
    } catch (error) {
      console.error('Error loading review submissions:', error)
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

    if (ratingFilter !== 'all') {
      const rating = parseInt(ratingFilter)
      filtered = filtered.filter(sub => sub.submissionData.rating === rating)
    }

    if (searchQuery) {
      filtered = filtered.filter(sub => 
        sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.missionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.userPhone.includes(searchQuery) ||
        sub.submissionData.reviewText.toLowerCase().includes(searchQuery.toLowerCase())
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
    const totalCoupons = submissions.reduce((sum, sub) => sum + (sub.couponQuantity || 0), 0)
    const avgRating = submissions.length > 0 
      ? submissions.reduce((sum, sub) => sum + sub.submissionData.rating, 0) / submissions.length 
      : 0

    const byPlatform = {
      google: submissions.filter(sub => sub.submissionData.platform === 'google').length,
      naver: submissions.filter(sub => sub.submissionData.platform === 'naver').length,
      kakao: submissions.filter(sub => sub.submissionData.platform === 'kakao').length,
      blog: submissions.filter(sub => sub.submissionData.platform === 'blog').length,
      other: submissions.filter(sub => sub.submissionData.platform === 'other').length
    }

    setStats({ total, pending, approved, rejected, totalReward, totalCoupons, avgRating, byPlatform })
  }

  const handleReview = async (submissionId: string, status: 'approved' | 'rejected') => {
    try {
      // TODO: 실제 API 호출
      console.log('Reviewing review submission:', submissionId, status, reviewComment, couponType, couponQuantity)
      
      // 임시로 로컬 상태 업데이트
      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionId 
          ? { 
              ...sub, 
              status, 
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'current_admin',
              reviewComment,
              rewardAmount: status === 'approved' ? rewardAmount : 0,
              couponType: status === 'approved' ? couponType : undefined,
              couponQuantity: status === 'approved' ? couponQuantity : undefined
            }
          : sub
      ))
      
      setSelectedSubmission(null)
      setReviewComment('')
      setRewardAmount(0)
      setCouponType('coffee')
      setCouponQuantity(1)
    } catch (error) {
      console.error('Error reviewing review submission:', error)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'google': return '🔍'
      case 'naver': return '🟢'
      case 'kakao': return '💬'
      case 'blog': return '📝'
      default: return '⭐'
    }
  }

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'google': return '구글'
      case 'naver': return '네이버'
      case 'kakao': return '카카오맵'
      case 'blog': return '블로그'
      case 'other': return '기타'
      default: return platform
    }
  }

  const getCouponTypeIcon = (type: string) => {
    switch (type) {
      case 'coffee': return <Coffee className="h-4 w-4" />
      case 'discount': return '💰'
      case 'cash': return '💵'
      default: return '🎁'
    }
  }

  const getCouponTypeName = (type: string) => {
    switch (type) {
      case 'coffee': return '커피 쿠폰'
      case 'discount': return '할인 쿠폰'
      case 'cash': return '현금'
      default: return type
    }
  }

  const renderStars = (rating: number, size = 'sm') => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    )
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
          <h1 className="text-3xl font-bold tracking-tight">후기 미션 관리</h1>
          <p className="text-muted-foreground">
            온라인 리뷰 및 후기 작성 미션을 관리합니다
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 후기</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">평균 평점</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.avgRating.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 쿠폰</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalCoupons}</div>
          </CardContent>
        </Card>
      </div>

      {/* 플랫폼별 통계 */}
      <Card>
        <CardHeader>
          <CardTitle>플랫폼별 후기 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl mb-1">🔍</div>
              <div className="font-semibold">{stats.byPlatform.google}</div>
              <div className="text-sm text-muted-foreground">구글</div>
            </div>
            <div>
              <div className="text-2xl mb-1">🟢</div>
              <div className="font-semibold">{stats.byPlatform.naver}</div>
              <div className="text-sm text-muted-foreground">네이버</div>
            </div>
            <div>
              <div className="text-2xl mb-1">💬</div>
              <div className="font-semibold">{stats.byPlatform.kakao}</div>
              <div className="text-sm text-muted-foreground">카카오맵</div>
            </div>
            <div>
              <div className="text-2xl mb-1">📝</div>
              <div className="font-semibold">{stats.byPlatform.blog}</div>
              <div className="text-sm text-muted-foreground">블로그</div>
            </div>
            <div>
              <div className="text-2xl mb-1">⭐</div>
              <div className="font-semibold">{stats.byPlatform.other}</div>
              <div className="text-sm text-muted-foreground">기타</div>
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
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="사용자명, 후기 내용 검색..."
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
                <SelectItem value="google">구글</SelectItem>
                <SelectItem value="naver">네이버</SelectItem>
                <SelectItem value="kakao">카카오맵</SelectItem>
                <SelectItem value="blog">블로그</SelectItem>
                <SelectItem value="other">기타</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="평점 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 평점</SelectItem>
                <SelectItem value="5">5점</SelectItem>
                <SelectItem value="4">4점</SelectItem>
                <SelectItem value="3">3점</SelectItem>
                <SelectItem value="2">2점</SelectItem>
                <SelectItem value="1">1점</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStoreId?.toString() || 'all'} onValueChange={(value) => {
              const storeId = value === 'all' ? null : parseInt(value)
              setSelectedStoreId(storeId)
              setStoreFilter(value)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="지점 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 지점</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setStatusFilter('all')
                setStoreFilter('all')
                setPlatformFilter('all')
                setRatingFilter('all')
                setSearchQuery('')
                setSelectedStoreId(null)
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
          <CardTitle>후기 제출물 목록 ({filteredSubmissions.length}건)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">조건에 맞는 후기가 없습니다</div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <div key={submission.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getPlatformIcon(submission.submissionData.platform)}</span>
                        <h3 className="font-semibold">{submission.missionTitle}</h3>
                        {renderStars(submission.submissionData.rating)}
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
                        <p><strong>후기 작성일:</strong> {new Date(submission.submissionData.reviewDate).toLocaleDateString('ko-KR')}</p>
                        <p><strong>제출일:</strong> {new Date(submission.submittedAt).toLocaleString('ko-KR')}</p>
                        {submission.submissionData.verified && (
                          <p><strong>인증:</strong> <span className="text-green-600">✓ 인증됨</span></p>
                        )}
                        {submission.submissionData.helpful && submission.submissionData.helpful > 0 && (
                          <p><strong>도움됨:</strong> {submission.submissionData.helpful}명</p>
                        )}
                        {submission.couponType && submission.couponQuantity && (
                          <p className="flex items-center gap-1">
                            <strong>지급 쿠폰:</strong> 
                            {getCouponTypeIcon(submission.couponType)}
                            {getCouponTypeName(submission.couponType)} {submission.couponQuantity}개
                          </p>
                        )}
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm">
                          <strong>후기 내용:</strong> {submission.submissionData.reviewText}
                        </p>
                        {submission.submissionData.reviewUrl && (
                          <p className="mt-2">
                            <strong>리뷰 링크:</strong> 
                            <a 
                              href={submission.submissionData.reviewUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 ml-1 inline-flex items-center gap-1"
                            >
                              원본 보기 <ExternalLink className="h-3 w-3" />
                            </a>
                          </p>
                        )}
                      </div>
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
                            {submission.userName}님이 제출한 후기 미션을 검토합니다
                          </DialogDescription>
                        </DialogHeader>
                        {selectedSubmission && (
                          <div className="space-y-4">
                            {/* 후기 상세 정보 */}
                            <div>
                              <h4 className="font-medium mb-2">후기 상세 정보</h4>
                              <div className="bg-gray-50 p-4 rounded space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xl">{getPlatformIcon(selectedSubmission.submissionData.platform)}</span>
                                    <strong>{getPlatformName(selectedSubmission.submissionData.platform)}</strong>
                                  </div>
                                  {renderStars(selectedSubmission.submissionData.rating, 'md')}
                                </div>
                                <div>
                                  <strong>후기 내용:</strong>
                                  <p className="mt-2 p-3 bg-white rounded border text-sm">
                                    {selectedSubmission.submissionData.reviewText}
                                  </p>
                                </div>
                                <div className="text-sm space-y-1">
                                  <p><strong>작성일:</strong> {new Date(selectedSubmission.submissionData.reviewDate).toLocaleDateString('ko-KR')}</p>
                                  {selectedSubmission.submissionData.reviewUrl && (
                                    <p>
                                      <strong>원본 링크:</strong> 
                                      <a 
                                        href={selectedSubmission.submissionData.reviewUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 ml-1 inline-flex items-center gap-1"
                                      >
                                        {selectedSubmission.submissionData.reviewUrl} <ExternalLink className="h-3 w-3" />
                                      </a>
                                    </p>
                                  )}
                                  {selectedSubmission.submissionData.verified !== undefined && (
                                    <p><strong>인증 여부:</strong> {selectedSubmission.submissionData.verified ? '✓ 인증됨' : '❌ 미인증'}</p>
                                  )}
                                  {selectedSubmission.submissionData.helpful !== undefined && (
                                    <p><strong>도움됨:</strong> {selectedSubmission.submissionData.helpful}명</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* 후기 이미지 */}
                            {selectedSubmission.submissionData.reviewImages && selectedSubmission.submissionData.reviewImages.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">첨부 이미지</h4>
                                <div className="grid grid-cols-2 gap-2">
                                  {selectedSubmission.submissionData.reviewImages.map((image, idx) => (
                                    <div key={idx} className="bg-gray-100 p-4 rounded text-center text-sm text-muted-foreground">
                                      이미지 {idx + 1} (미리보기 구현 예정)
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
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">쿠폰 타입</label>
                                    <Select value={couponType} onValueChange={(value: any) => setCouponType(value)}>
                                      <SelectTrigger className="mt-1">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="coffee">커피 쿠폰</SelectItem>
                                        <SelectItem value="discount">할인 쿠폰</SelectItem>
                                        <SelectItem value="cash">현금</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">수량/금액</label>
                                    <Input
                                      type="number"
                                      value={couponQuantity}
                                      onChange={(e) => setCouponQuantity(Number(e.target.value))}
                                      min="1"
                                      max="5"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">현금 지급 (선택)</label>
                                    <Input
                                      type="number"
                                      value={rewardAmount}
                                      onChange={(e) => setRewardAmount(Number(e.target.value))}
                                      placeholder="0"
                                      max="40000"
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  후기 미션 최대: 커피 쿠폰 3잔 또는 현금 40,000원
                                </p>
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
                                  {selectedSubmission.couponType && (
                                    <p className="flex items-center gap-1">
                                      <strong>지급 쿠폰:</strong> 
                                      {getCouponTypeIcon(selectedSubmission.couponType)}
                                      {getCouponTypeName(selectedSubmission.couponType)} {selectedSubmission.couponQuantity}개
                                    </p>
                                  )}
                                  {selectedSubmission.rewardAmount && (
                                    <p><strong>현금 지급:</strong> {selectedSubmission.rewardAmount.toLocaleString()}원</p>
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