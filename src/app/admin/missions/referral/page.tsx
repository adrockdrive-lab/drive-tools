'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertCircle, CheckCircle, Clock, Eye, Filter, Search, Users, UserPlus, DollarSign, TrendingUp, Link2 } from 'lucide-react'
import { adminService } from '@/lib/services/admin'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ReferralSubmission {
  id: string
  referrerId: string
  referrerName: string
  referrerPhone: string
  missionId: string
  missionTitle: string
  submissionData: {
    referredUserName: string
    referredUserPhone: string
    referredUserEmail?: string
    relationshipToReferrer: string
    referralCode?: string
    registrationDate: string
    firstClassDate?: string
    completedRegistration: boolean
    paymentCompleted: boolean
    referralMethod: 'direct' | 'code' | 'link' | 'app'
    verificationProof?: string[]
  }
  referredUserId?: string
  status: 'pending' | 'approved' | 'rejected' | 'verification_needed'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  reviewComment?: string
  rewardAmount?: number
  bonusAmount?: number
  storeId: number
  storeName: string
  referralTier: 'bronze' | 'silver' | 'gold' | 'platinum'
  isFirstTimeReferral: boolean
}

export default function ReferralMissionPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<ReferralSubmission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<ReferralSubmission[]>([])
  const [loading, setLoading] = useState(true)
  
  // 관리자 및 지점 상태
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [stores, setStores] = useState<{ id: number; name: string }[]>([])
  const [adminId, setAdminId] = useState<string>('')
  const [selectedSubmission, setSelectedSubmission] = useState<ReferralSubmission | null>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [rewardAmount, setRewardAmount] = useState<number>(0)
  const [bonusAmount, setBonusAmount] = useState<number>(0)
  
  // 필터 상태
  const [statusFilter, setStatusFilter] = useState('all')
  const [storeFilter, setStoreFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [tierFilter, setTierFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')

  // 통계 데이터
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    verificationNeeded: 0,
    totalReward: 0,
    totalReferrals: 0,
    conversionRate: 0,
    byTier: {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0
    },
    byMethod: {
      direct: 0,
      code: 0,
      link: 0,
      app: 0
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
  }, [submissions, statusFilter, storeFilter, searchQuery, tierFilter, methodFilter])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const currentAdmin = adminService.getCurrentAdmin()
      if (!currentAdmin) return
      
      // 실제 데이터베이스에서 추천 미션 데이터 가져오기
      const result = await adminService.getUserMissions(currentAdmin.id, selectedStoreId || undefined)
      
      if (result.success && result.data) {
        // 추천 미션만 필터링하여 ReferralSubmission 형태로 변환
        const referralMissions = result.data
          .filter(mission => mission.missionType === 'referral')
          .map(mission => ({
            id: mission.id,
            referrerId: mission.userId,
            referrerName: mission.userName,
            referrerPhone: mission.userPhone,
            missionId: mission.id,
            missionTitle: '추천 미션',
            referralData: mission.proofData?.referrals || [{
              name: mission.proofData?.referredName || '',
              phone: mission.proofData?.referredPhone || '',
              relationship: mission.proofData?.relationship || '지인',
              referralMethod: mission.proofData?.referralMethod || 'word_of_mouth',
              registrationDate: mission.proofData?.registrationDate,
              verified: mission.status === 'completed'
            }],
            totalReferrals: mission.proofData?.referrals?.length || 1,
            verifiedReferrals: mission.status === 'completed' ? 1 : 0,
            status: mission.status === 'completed' ? 'approved' : mission.status === 'pending' ? 'pending' : 'rejected',
            submittedAt: mission.submittedAt || mission.createdAt,
            reviewedAt: mission.completedAt,
            reviewedBy: 'admin',
            reviewComment: mission.rejectionReason || '',
            rewardAmount: mission.rewardAmount || 0,
            bonusAmount: mission.proofData?.bonusAmount || 0,
            storeId: mission.storeId,
            storeName: mission.storeName,
            referralTier: mission.proofData?.tier || 'bronze',
            isFirstTimeReferral: mission.proofData?.isFirstTime || true
          } as ReferralSubmission))
        
        setSubmissions(referralMissions)
        return
      }
      
      // 실제 데이터가 없으면 목업 데이터 사용 
      const mockData: ReferralSubmission[] = [
        {
          id: '1',
          referrerId: 'user1',
          referrerName: '김추천',
          referrerPhone: '010-1234-5678',
          missionId: 'referral-1',
          missionTitle: '친구 추천하기',
          submissionData: {
            referredUserName: '박신규',
            referredUserPhone: '010-9999-8888',
            referredUserEmail: 'newuser@example.com',
            relationshipToReferrer: '회사 동료',
            referralCode: 'REF2025001',
            registrationDate: '2025-09-11',
            firstClassDate: '2025-09-15',
            completedRegistration: true,
            paymentCompleted: true,
            referralMethod: 'code',
            verificationProof: ['registration_screenshot.jpg', 'payment_receipt.jpg']
          },
          referredUserId: 'newuser1',
          status: 'pending',
          submittedAt: '2025-09-11T10:30:00Z',
          storeId: 1,
          storeName: '영등포운전면허학원',
          referralTier: 'gold',
          isFirstTimeReferral: false
        },
        {
          id: '2',
          referrerId: 'user2',
          referrerName: '이소개',
          referrerPhone: '010-9876-5432',
          missionId: 'referral-2',
          missionTitle: '신규 회원 추천',
          submissionData: {
            referredUserName: '최첫번째',
            referredUserPhone: '010-1111-2222',
            referredUserEmail: 'first@example.com',
            relationshipToReferrer: '친구',
            registrationDate: '2025-09-10',
            firstClassDate: '2025-09-12',
            completedRegistration: true,
            paymentCompleted: true,
            referralMethod: 'direct',
            verificationProof: ['friend_proof.jpg']
          },
          referredUserId: 'newuser2',
          status: 'approved',
          submittedAt: '2025-09-10T15:20:00Z',
          reviewedAt: '2025-09-11T09:00:00Z',
          reviewedBy: 'admin1',
          reviewComment: '신규 회원 등록 및 수강료 납부 확인됨. 첫 추천 보너스 지급',
          rewardAmount: 50000,
          bonusAmount: 20000,
          storeId: 1,
          storeName: '영등포운전면허학원',
          referralTier: 'silver',
          isFirstTimeReferral: true
        },
        {
          id: '3',
          referrerId: 'user3',
          referrerName: '정의심',
          referrerPhone: '010-5555-7777',
          missionId: 'referral-3',
          missionTitle: '추천 회원 등록',
          submissionData: {
            referredUserName: '한미완성',
            referredUserPhone: '010-3333-4444',
            relationshipToReferrer: '가족',
            registrationDate: '2025-09-09',
            completedRegistration: true,
            paymentCompleted: false,
            referralMethod: 'link'
          },
          status: 'verification_needed',
          submittedAt: '2025-09-09T14:30:00Z',
          storeId: 1,
          storeName: '영등포운전면허학원',
          referralTier: 'bronze',
          isFirstTimeReferral: true
        },
        {
          id: '4',
          referrerId: 'user4',
          referrerName: '박단골',
          referrerPhone: '010-7777-8888',
          missionId: 'referral-4',
          missionTitle: '다중 추천 미션',
          submissionData: {
            referredUserName: '송마지막',
            referredUserPhone: '010-6666-7777',
            relationshipToReferrer: '지인',
            registrationDate: '2025-09-08',
            firstClassDate: '2025-09-10',
            completedRegistration: true,
            paymentCompleted: true,
            referralMethod: 'app'
          },
          referredUserId: 'newuser4',
          status: 'approved',
          submittedAt: '2025-09-08T11:00:00Z',
          reviewedAt: '2025-09-09T14:00:00Z',
          reviewedBy: 'admin1',
          reviewComment: '플래티넘 회원 다중 추천 성공. 높은 등급 보너스 지급',
          rewardAmount: 80000,
          bonusAmount: 30000,
          storeId: 1,
          storeName: '영등포운전면허학원',
          referralTier: 'platinum',
          isFirstTimeReferral: false
        }
      ]
      setSubmissions(mockData)
    } catch (error) {
      console.error('Error loading referral submissions:', error)
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

    if (tierFilter !== 'all') {
      filtered = filtered.filter(sub => sub.referralTier === tierFilter)
    }

    if (methodFilter !== 'all') {
      filtered = filtered.filter(sub => sub.submissionData.referralMethod === methodFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(sub => 
        sub.referrerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.submissionData.referredUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.referrerPhone.includes(searchQuery) ||
        sub.submissionData.referredUserPhone.includes(searchQuery) ||
        sub.submissionData.referralCode?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredSubmissions(filtered)
  }

  const calculateStats = () => {
    const total = submissions.length
    const pending = submissions.filter(sub => sub.status === 'pending').length
    const approved = submissions.filter(sub => sub.status === 'approved').length
    const rejected = submissions.filter(sub => sub.status === 'rejected').length
    const verificationNeeded = submissions.filter(sub => sub.status === 'verification_needed').length
    const totalReward = submissions.reduce((sum, sub) => sum + (sub.rewardAmount || 0) + (sub.bonusAmount || 0), 0)
    const totalReferrals = submissions.filter(sub => sub.referredUserId).length
    const conversionRate = total > 0 ? (approved / total) * 100 : 0

    const byTier = {
      bronze: submissions.filter(sub => sub.referralTier === 'bronze').length,
      silver: submissions.filter(sub => sub.referralTier === 'silver').length,
      gold: submissions.filter(sub => sub.referralTier === 'gold').length,
      platinum: submissions.filter(sub => sub.referralTier === 'platinum').length
    }

    const byMethod = {
      direct: submissions.filter(sub => sub.submissionData.referralMethod === 'direct').length,
      code: submissions.filter(sub => sub.submissionData.referralMethod === 'code').length,
      link: submissions.filter(sub => sub.submissionData.referralMethod === 'link').length,
      app: submissions.filter(sub => sub.submissionData.referralMethod === 'app').length
    }

    setStats({ 
      total, pending, approved, rejected, verificationNeeded, 
      totalReward, totalReferrals, conversionRate, byTier, byMethod 
    })
  }

  const handleReview = async (submissionId: string, status: 'approved' | 'rejected' | 'verification_needed') => {
    try {
      // TODO: 실제 API 호출
      console.log('Reviewing referral submission:', submissionId, status, reviewComment, rewardAmount, bonusAmount)
      
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
              bonusAmount: status === 'approved' ? bonusAmount : 0
            }
          : sub
      ))
      
      setSelectedSubmission(null)
      setReviewComment('')
      setRewardAmount(0)
      setBonusAmount(0)
    } catch (error) {
      console.error('Error reviewing referral submission:', error)
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return '🥉'
      case 'silver': return '🥈'
      case 'gold': return '🥇'
      case 'platinum': return '💎'
      default: return '⭐'
    }
  }

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'bronze': return '브론즈'
      case 'silver': return '실버'
      case 'gold': return '골드'
      case 'platinum': return '플래티넘'
      default: return tier
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-orange-100 text-orange-800'
      case 'silver': return 'bg-gray-100 text-gray-800'
      case 'gold': return 'bg-yellow-100 text-yellow-800'
      case 'platinum': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'direct': return '👥'
      case 'code': return '🔢'
      case 'link': return '🔗'
      case 'app': return '📱'
      default: return '💌'
    }
  }

  const getMethodName = (method: string) => {
    switch (method) {
      case 'direct': return '직접 추천'
      case 'code': return '추천 코드'
      case 'link': return '추천 링크'
      case 'app': return '앱 내 추천'
      default: return method
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'verification_needed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <AlertCircle className="h-4 w-4" />
      case 'verification_needed': return <Eye className="h-4 w-4" />
      default: return null
    }
  }

  const getStatusName = (status: string) => {
    switch (status) {
      case 'pending': return '검토 대기'
      case 'approved': return '승인됨'
      case 'rejected': return '거절됨'
      case 'verification_needed': return '추가 확인 필요'
      default: return status
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">친구추천 미션 관리</h1>
          <p className="text-muted-foreground">
            신규 회원 추천 미션을 관리합니다
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 추천</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">성공 추천</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalReferrals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">성공률</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.conversionRate.toFixed(1)}%</div>
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
            <CardTitle className="text-sm font-medium">확인 필요</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.verificationNeeded}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 지급액</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalReward.toLocaleString()}원</div>
          </CardContent>
        </Card>
      </div>

      {/* 등급별 및 방법별 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>추천자 등급별 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl mb-1">🥉</div>
                <div className="font-semibold">{stats.byTier.bronze}</div>
                <div className="text-sm text-muted-foreground">브론즈</div>
              </div>
              <div>
                <div className="text-2xl mb-1">🥈</div>
                <div className="font-semibold">{stats.byTier.silver}</div>
                <div className="text-sm text-muted-foreground">실버</div>
              </div>
              <div>
                <div className="text-2xl mb-1">🥇</div>
                <div className="font-semibold">{stats.byTier.gold}</div>
                <div className="text-sm text-muted-foreground">골드</div>
              </div>
              <div>
                <div className="text-2xl mb-1">💎</div>
                <div className="font-semibold">{stats.byTier.platinum}</div>
                <div className="text-sm text-muted-foreground">플래티넘</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>추천 방법별 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl mb-1">👥</div>
                <div className="font-semibold">{stats.byMethod.direct}</div>
                <div className="text-sm text-muted-foreground">직접</div>
              </div>
              <div>
                <div className="text-2xl mb-1">🔢</div>
                <div className="font-semibold">{stats.byMethod.code}</div>
                <div className="text-sm text-muted-foreground">코드</div>
              </div>
              <div>
                <div className="text-2xl mb-1">🔗</div>
                <div className="font-semibold">{stats.byMethod.link}</div>
                <div className="text-sm text-muted-foreground">링크</div>
              </div>
              <div>
                <div className="text-2xl mb-1">📱</div>
                <div className="font-semibold">{stats.byMethod.app}</div>
                <div className="text-sm text-muted-foreground">앱</div>
              </div>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="추천자, 피추천자, 코드 검색..."
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
                <SelectItem value="verification_needed">확인 필요</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger>
                <SelectValue placeholder="등급 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 등급</SelectItem>
                <SelectItem value="bronze">브론즈</SelectItem>
                <SelectItem value="silver">실버</SelectItem>
                <SelectItem value="gold">골드</SelectItem>
                <SelectItem value="platinum">플래티넘</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="추천 방법" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 방법</SelectItem>
                <SelectItem value="direct">직접 추천</SelectItem>
                <SelectItem value="code">추천 코드</SelectItem>
                <SelectItem value="link">추천 링크</SelectItem>
                <SelectItem value="app">앱 내 추천</SelectItem>
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
                setTierFilter('all')
                setMethodFilter('all')
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
          <CardTitle>친구추천 목록 ({filteredSubmissions.length}건)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">조건에 맞는 추천이 없습니다</div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <div key={submission.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xl">{getMethodIcon(submission.submissionData.referralMethod)}</span>
                        <h3 className="font-semibold">{submission.missionTitle}</h3>
                        <Badge className={getTierColor(submission.referralTier)}>
                          {getTierIcon(submission.referralTier)} {getTierName(submission.referralTier)}
                        </Badge>
                        {submission.isFirstTimeReferral && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            🎉 첫 추천
                          </Badge>
                        )}
                        <Badge className={getStatusColor(submission.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(submission.status)}
                            {getStatusName(submission.status)}
                          </div>
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p><strong>추천자:</strong> {submission.referrerName} ({submission.referrerPhone})</p>
                        <p><strong>피추천자:</strong> {submission.submissionData.referredUserName} ({submission.submissionData.referredUserPhone})</p>
                        <p><strong>관계:</strong> {submission.submissionData.relationshipToReferrer}</p>
                        <p><strong>추천 방법:</strong> {getMethodName(submission.submissionData.referralMethod)}</p>
                        {submission.submissionData.referralCode && (
                          <p><strong>추천 코드:</strong> {submission.submissionData.referralCode}</p>
                        )}
                        <p><strong>등록일:</strong> {new Date(submission.submissionData.registrationDate).toLocaleDateString('ko-KR')}</p>
                        {submission.submissionData.firstClassDate && (
                          <p><strong>첫 수업:</strong> {new Date(submission.submissionData.firstClassDate).toLocaleDateString('ko-KR')}</p>
                        )}
                        <div className="flex items-center gap-4 mt-1">
                          <span className={`text-xs px-2 py-1 rounded ${submission.submissionData.completedRegistration ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {submission.submissionData.completedRegistration ? '✓ 회원가입 완료' : '❌ 회원가입 미완료'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${submission.submissionData.paymentCompleted ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {submission.submissionData.paymentCompleted ? '✓ 결제 완료' : '⏳ 결제 대기'}
                          </span>
                        </div>
                        {(submission.rewardAmount || submission.bonusAmount) && (
                          <p className="mt-2">
                            <strong>지급 예정:</strong> 
                            {submission.rewardAmount && <span className="ml-1">기본 {submission.rewardAmount.toLocaleString()}원</span>}
                            {submission.bonusAmount && <span className="ml-1">보너스 {submission.bonusAmount.toLocaleString()}원</span>}
                            {submission.rewardAmount && submission.bonusAmount && (
                              <span className="ml-1 font-semibold">
                                (총 {(submission.rewardAmount + submission.bonusAmount).toLocaleString()}원)
                              </span>
                            )}
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
                            {submission.referrerName}님의 친구추천을 검토합니다
                          </DialogDescription>
                        </DialogHeader>
                        {selectedSubmission && (
                          <div className="space-y-4">
                            {/* 추천 상세 정보 */}
                            <div>
                              <h4 className="font-medium mb-2">추천 상세 정보</h4>
                              <div className="bg-gray-50 p-4 rounded space-y-3">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>추천자:</strong><br />
                                    {selectedSubmission.referrerName}<br />
                                    {selectedSubmission.referrerPhone}
                                  </div>
                                  <div>
                                    <strong>피추천자:</strong><br />
                                    {selectedSubmission.submissionData.referredUserName}<br />
                                    {selectedSubmission.submissionData.referredUserPhone}<br />
                                    {selectedSubmission.submissionData.referredUserEmail && (
                                      <span className="text-muted-foreground">{selectedSubmission.submissionData.referredUserEmail}</span>
                                    )}
                                  </div>
                                  <div>
                                    <strong>관계:</strong> {selectedSubmission.submissionData.relationshipToReferrer}
                                  </div>
                                  <div>
                                    <strong>추천 방법:</strong> {getMethodName(selectedSubmission.submissionData.referralMethod)}
                                  </div>
                                  {selectedSubmission.submissionData.referralCode && (
                                    <div>
                                      <strong>추천 코드:</strong> {selectedSubmission.submissionData.referralCode}
                                    </div>
                                  )}
                                  <div>
                                    <strong>추천자 등급:</strong> 
                                    <span className={`ml-1 px-2 py-1 rounded text-xs ${getTierColor(selectedSubmission.referralTier)}`}>
                                      {getTierIcon(selectedSubmission.referralTier)} {getTierName(selectedSubmission.referralTier)}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="border-t pt-3">
                                  <h5 className="font-medium mb-2">가입 및 결제 현황</h5>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <strong>회원가입:</strong> 
                                      <span className={`ml-1 ${selectedSubmission.submissionData.completedRegistration ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedSubmission.submissionData.completedRegistration ? '✓ 완료' : '❌ 미완료'}
                                      </span>
                                    </div>
                                    <div>
                                      <strong>결제:</strong> 
                                      <span className={`ml-1 ${selectedSubmission.submissionData.paymentCompleted ? 'text-blue-600' : 'text-yellow-600'}`}>
                                        {selectedSubmission.submissionData.paymentCompleted ? '✓ 완료' : '⏳ 대기'}
                                      </span>
                                    </div>
                                    <div>
                                      <strong>등록일:</strong> {new Date(selectedSubmission.submissionData.registrationDate).toLocaleDateString('ko-KR')}
                                    </div>
                                    {selectedSubmission.submissionData.firstClassDate && (
                                      <div>
                                        <strong>첫 수업:</strong> {new Date(selectedSubmission.submissionData.firstClassDate).toLocaleDateString('ko-KR')}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 증명 자료 */}
                            {selectedSubmission.submissionData.verificationProof && selectedSubmission.submissionData.verificationProof.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">증명 자료</h4>
                                <div className="grid grid-cols-2 gap-2">
                                  {selectedSubmission.submissionData.verificationProof.map((proof, idx) => (
                                    <div key={idx} className="bg-gray-100 p-4 rounded text-center text-sm text-muted-foreground">
                                      증명 자료 {idx + 1} (미리보기 구현 예정)
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 검토 폼 */}
                            {(selectedSubmission.status === 'pending' || selectedSubmission.status === 'verification_needed') && (
                              <div className="space-y-4 border-t pt-4">
                                <div>
                                  <label className="text-sm font-medium">검토 의견</label>
                                  <Textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="승인/거절/추가확인 사유를 입력하세요"
                                    className="mt-1"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">기본 지급액</label>
                                    <Input
                                      type="number"
                                      value={rewardAmount}
                                      onChange={(e) => setRewardAmount(Number(e.target.value))}
                                      placeholder="0"
                                      max="150000"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">보너스</label>
                                    <Input
                                      type="number"
                                      value={bonusAmount}
                                      onChange={(e) => setBonusAmount(Number(e.target.value))}
                                      placeholder="0"
                                      max="50000"
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  친구추천 미션 최대 지급액: 150,000원 + 보너스 50,000원<br />
                                  등급별 보너스: 브론즈 5,000원, 실버 10,000원, 골드 20,000원, 플래티넘 30,000원
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
                                    onClick={() => handleReview(selectedSubmission.id, 'verification_needed')}
                                    variant="outline"
                                    className="flex-1"
                                    disabled={!reviewComment}
                                  >
                                    추가 확인
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
                            {selectedSubmission.status === 'approved' || selectedSubmission.status === 'rejected' ? (
                              <div className="border-t pt-4">
                                <h4 className="font-medium mb-2">검토 결과</h4>
                                <div className="bg-gray-50 p-3 rounded space-y-1 text-sm">
                                  <p><strong>상태:</strong> {getStatusName(selectedSubmission.status)}</p>
                                  <p><strong>검토일:</strong> {selectedSubmission.reviewedAt ? new Date(selectedSubmission.reviewedAt).toLocaleString('ko-KR') : '-'}</p>
                                  <p><strong>검토자:</strong> {selectedSubmission.reviewedBy || '-'}</p>
                                  <p><strong>검토 의견:</strong> {selectedSubmission.reviewComment || '-'}</p>
                                  {selectedSubmission.rewardAmount && (
                                    <p><strong>기본 지급액:</strong> {selectedSubmission.rewardAmount.toLocaleString()}원</p>
                                  )}
                                  {selectedSubmission.bonusAmount && (
                                    <p><strong>보너스:</strong> {selectedSubmission.bonusAmount.toLocaleString()}원</p>
                                  )}
                                  {selectedSubmission.rewardAmount && selectedSubmission.bonusAmount && (
                                    <p><strong>총 지급액:</strong> {(selectedSubmission.rewardAmount + selectedSubmission.bonusAmount).toLocaleString()}원</p>
                                  )}
                                </div>
                              </div>
                            ) : null}
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