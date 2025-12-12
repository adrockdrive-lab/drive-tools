'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertCircle, CheckCircle, Clock, Eye, Filter, Search, MapPin, Calendar, Users, Target } from 'lucide-react'
import { adminService } from '@/lib/services/admin'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface AttendanceSubmission {
  id: string
  userId: string
  userName: string
  userPhone: string
  missionId: string
  missionTitle: string
  submissionData: {
    checkInTime: string
    location: {
      latitude: number
      longitude: number
      address: string
      accuracy: number
    }
    checkInMethod: 'gps' | 'qr' | 'manual'
    deviceInfo?: {
      platform: string
      userAgent: string
    }
    attendanceStreak?: number
    isConsecutive?: boolean
    photos?: string[]
  }
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  reviewComment?: string
  rewardAmount?: number
  storeId: number
  storeName: string
  expectedLocation: {
    latitude: number
    longitude: number
    address: string
    radius: number
  }
  distanceFromExpected?: number
}

export default function AttendanceMissionPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<AttendanceSubmission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<AttendanceSubmission[]>([])
  const [loading, setLoading] = useState(true)
  
  // 관리자 및 지점 상태
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [stores, setStores] = useState<{ id: number; name: string }[]>([])
  const [adminId, setAdminId] = useState<string>('')
  const [selectedSubmission, setSelectedSubmission] = useState<AttendanceSubmission | null>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [rewardAmount, setRewardAmount] = useState<number>(0)
  
  // 필터 상태
  const [statusFilter, setStatusFilter] = useState('all')
  const [storeFilter, setStoreFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [methodFilter, setMethodFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  // 통계 데이터
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalReward: 0,
    todayAttendance: 0,
    avgStreak: 0,
    locationAccuracy: {
      accurate: 0,
      suspicious: 0,
      invalid: 0
    },
    byMethod: {
      gps: 0,
      qr: 0,
      manual: 0
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
  }, [submissions, statusFilter, storeFilter, searchQuery, methodFilter, dateFilter])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const currentAdmin = adminService.getCurrentAdmin()
      if (!currentAdmin) return
      
      // 실제 데이터베이스에서 출석 미션 데이터 가져오기
      const result = await adminService.getUserMissions(currentAdmin.id, selectedStoreId || undefined)
      
      if (result.success && result.data) {
        // 출석 미션만 필터링하여 AttendanceSubmission 형태로 변환
        const attendanceMissions = result.data
          .filter(mission => mission.missionType === 'attendance')
          .map(mission => ({
            id: mission.id,
            userId: mission.userId,
            userName: mission.userName,
            userPhone: mission.userPhone,
            missionId: mission.id,
            missionTitle: '출석 미션',
            submissionData: {
              checkInMethod: mission.proofData?.checkInMethod || 'gps',
              location: mission.proofData?.location || { latitude: 0, longitude: 0 },
              accuracy: mission.proofData?.accuracy || 0,
              timestamp: mission.proofData?.timestamp || new Date().toISOString(),
              qrCodeData: mission.proofData?.qrCodeData,
              manualCode: mission.proofData?.manualCode,
              consecutiveDays: mission.proofData?.consecutiveDays || 1,
              weeklyStreak: mission.proofData?.weeklyStreak || 1,
              monthlyTotal: mission.proofData?.monthlyTotal || 1
            },
            status: mission.status === 'completed' ? 'approved' : mission.status === 'pending' ? 'pending' : 'rejected',
            submittedAt: mission.submittedAt || mission.createdAt,
            reviewedAt: mission.completedAt,
            reviewedBy: 'admin',
            reviewComment: mission.rejectionReason || '',
            rewardAmount: mission.rewardAmount || 0,
            storeId: mission.storeId,
            storeName: mission.storeName,
            distanceFromExpected: mission.proofData?.distanceFromExpected || 0
          } as AttendanceSubmission))
        
        setSubmissions(attendanceMissions)
        return
      }
      
      // 실제 데이터가 없으면 목업 데이터 사용 
      const mockData: AttendanceSubmission[] = [
        {
          id: '1',
          userId: 'user1',
          userName: '김출석',
          userPhone: '010-1234-5678',
          missionId: 'attendance-1',
          missionTitle: '매일 출석 체크',
          submissionData: {
            checkInTime: '2025-09-11T09:15:00Z',
            location: {
              latitude: 37.5326,
              longitude: 126.9036,
              address: '서울시 영등포구 양평로 123',
              accuracy: 5
            },
            checkInMethod: 'gps',
            deviceInfo: {
              platform: 'iOS',
              userAgent: 'Mozilla/5.0...'
            },
            attendanceStreak: 7,
            isConsecutive: true,
            photos: ['checkin1.jpg']
          },
          status: 'pending',
          submittedAt: '2025-09-11T09:15:30Z',
          storeId: 1,
          storeName: '영등포운전면허학원',
          expectedLocation: {
            latitude: 37.5325,
            longitude: 126.9035,
            address: '서울시 영등포구 양평로 121',
            radius: 50
          },
          distanceFromExpected: 12
        },
        {
          id: '2',
          userId: 'user2',
          userName: '박정시',
          userPhone: '010-9876-5432',
          missionId: 'attendance-2',
          missionTitle: 'QR 코드 출석',
          submissionData: {
            checkInTime: '2025-09-11T10:30:00Z',
            location: {
              latitude: 37.5325,
              longitude: 126.9035,
              address: '서울시 영등포구 양평로 121',
              accuracy: 2
            },
            checkInMethod: 'qr',
            attendanceStreak: 3,
            isConsecutive: true
          },
          status: 'approved',
          submittedAt: '2025-09-11T10:30:15Z',
          reviewedAt: '2025-09-11T11:00:00Z',
          reviewedBy: 'admin1',
          reviewComment: 'QR 스캔으로 정확한 위치 확인됨',
          rewardAmount: 1000,
          storeId: 1,
          storeName: '영등포운전면허학원',
          expectedLocation: {
            latitude: 37.5325,
            longitude: 126.9035,
            address: '서울시 영등포구 양평로 121',
            radius: 50
          },
          distanceFromExpected: 0
        },
        {
          id: '3',
          userId: 'user3',
          userName: '이수상',
          userPhone: '010-5555-7777',
          missionId: 'attendance-3',
          missionTitle: '위치 기반 출석',
          submissionData: {
            checkInTime: '2025-09-10T14:45:00Z',
            location: {
              latitude: 37.5400,
              longitude: 126.9100,
              address: '서울시 중구 명동 123',
              accuracy: 20
            },
            checkInMethod: 'gps',
            attendanceStreak: 1,
            isConsecutive: false
          },
          status: 'rejected',
          submittedAt: '2025-09-10T14:45:30Z',
          reviewedAt: '2025-09-11T08:00:00Z',
          reviewedBy: 'admin1',
          reviewComment: '지정된 위치에서 너무 멀리 떨어져 있습니다 (850m)',
          storeId: 1,
          storeName: '영등포운전면허학원',
          expectedLocation: {
            latitude: 37.5325,
            longitude: 126.9035,
            address: '서울시 영등포구 양평로 121',
            radius: 50
          },
          distanceFromExpected: 850
        }
      ]
      setSubmissions(mockData)
    } catch (error) {
      console.error('Error loading attendance submissions:', error)
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

    if (methodFilter !== 'all') {
      filtered = filtered.filter(sub => sub.submissionData.checkInMethod === methodFilter)
    }

    if (dateFilter !== 'all') {
      const today = new Date()
      const filterDate = new Date(today)
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter(sub => 
            new Date(sub.submissionData.checkInTime) >= filterDate
          )
          break
        case 'yesterday':
          filterDate.setDate(filterDate.getDate() - 1)
          filterDate.setHours(0, 0, 0, 0)
          const yesterdayEnd = new Date(filterDate)
          yesterdayEnd.setHours(23, 59, 59, 999)
          filtered = filtered.filter(sub => {
            const checkInDate = new Date(sub.submissionData.checkInTime)
            return checkInDate >= filterDate && checkInDate <= yesterdayEnd
          })
          break
        case 'week':
          filterDate.setDate(filterDate.getDate() - 7)
          filtered = filtered.filter(sub => 
            new Date(sub.submissionData.checkInTime) >= filterDate
          )
          break
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(sub => 
        sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.missionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.userPhone.includes(searchQuery) ||
        sub.submissionData.location.address.toLowerCase().includes(searchQuery.toLowerCase())
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

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayAttendance = submissions.filter(sub => 
      new Date(sub.submissionData.checkInTime) >= today
    ).length

    const avgStreak = submissions.length > 0 
      ? submissions.reduce((sum, sub) => sum + (sub.submissionData.attendanceStreak || 0), 0) / submissions.length 
      : 0

    const locationAccuracy = {
      accurate: submissions.filter(sub => (sub.distanceFromExpected || 0) <= 50).length,
      suspicious: submissions.filter(sub => {
        const distance = sub.distanceFromExpected || 0
        return distance > 50 && distance <= 200
      }).length,
      invalid: submissions.filter(sub => (sub.distanceFromExpected || 0) > 200).length
    }

    const byMethod = {
      gps: submissions.filter(sub => sub.submissionData.checkInMethod === 'gps').length,
      qr: submissions.filter(sub => sub.submissionData.checkInMethod === 'qr').length,
      manual: submissions.filter(sub => sub.submissionData.checkInMethod === 'manual').length
    }

    setStats({ 
      total, pending, approved, rejected, totalReward, 
      todayAttendance, avgStreak, locationAccuracy, byMethod 
    })
  }

  const handleReview = async (submissionId: string, status: 'approved' | 'rejected') => {
    try {
      // TODO: 실제 API 호출
      console.log('Reviewing attendance submission:', submissionId, status, reviewComment, rewardAmount)
      
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
      console.error('Error reviewing attendance submission:', error)
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'gps': return '📍'
      case 'qr': return '📱'
      case 'manual': return '✋'
      default: return '📍'
    }
  }

  const getMethodName = (method: string) => {
    switch (method) {
      case 'gps': return 'GPS 위치'
      case 'qr': return 'QR 스캔'
      case 'manual': return '수동 체크'
      default: return method
    }
  }

  const getLocationAccuracyColor = (distance: number) => {
    if (distance <= 50) return 'text-green-600'
    if (distance <= 200) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getLocationAccuracyText = (distance: number) => {
    if (distance <= 50) return '정확'
    if (distance <= 200) return '의심스러움'
    return '부정확'
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
          <h1 className="text-3xl font-bold tracking-tight">출석 미션 관리</h1>
          <p className="text-muted-foreground">
            위치 기반 출석 체크 미션을 관리합니다
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 출석</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 출석</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.todayAttendance}</div>
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
            <CardTitle className="text-sm font-medium">평균 연속</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.avgStreak.toFixed(1)}일</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 지급액</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalReward.toLocaleString()}원</div>
          </CardContent>
        </Card>
      </div>

      {/* 위치 정확도 및 방법별 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              위치 정확도 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.locationAccuracy.accurate}</div>
                <div className="text-sm text-muted-foreground">정확 (50m 이내)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.locationAccuracy.suspicious}</div>
                <div className="text-sm text-muted-foreground">의심 (50-200m)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.locationAccuracy.invalid}</div>
                <div className="text-sm text-muted-foreground">부정확 (200m+)</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>출석 방법별 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl mb-1">📍</div>
                <div className="font-semibold">{stats.byMethod.gps}</div>
                <div className="text-sm text-muted-foreground">GPS</div>
              </div>
              <div>
                <div className="text-2xl mb-1">📱</div>
                <div className="font-semibold">{stats.byMethod.qr}</div>
                <div className="text-sm text-muted-foreground">QR</div>
              </div>
              <div>
                <div className="text-2xl mb-1">✋</div>
                <div className="font-semibold">{stats.byMethod.manual}</div>
                <div className="text-sm text-muted-foreground">수동</div>
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
                placeholder="사용자명, 주소 검색..."
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
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="출석 방법" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 방법</SelectItem>
                <SelectItem value="gps">GPS 위치</SelectItem>
                <SelectItem value="qr">QR 스캔</SelectItem>
                <SelectItem value="manual">수동 체크</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="날짜 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 기간</SelectItem>
                <SelectItem value="today">오늘</SelectItem>
                <SelectItem value="yesterday">어제</SelectItem>
                <SelectItem value="week">1주일</SelectItem>
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
                setMethodFilter('all')
                setDateFilter('all')
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
          <CardTitle>출석 기록 목록 ({filteredSubmissions.length}건)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">조건에 맞는 출석 기록이 없습니다</div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <div key={submission.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getMethodIcon(submission.submissionData.checkInMethod)}</span>
                        <h3 className="font-semibold">{submission.missionTitle}</h3>
                        {submission.submissionData.attendanceStreak && submission.submissionData.attendanceStreak > 1 && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            🔥 {submission.submissionData.attendanceStreak}일 연속
                          </Badge>
                        )}
                        <Badge className={getStatusColor(submission.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(submission.status)}
                            {submission.status === 'pending' ? '검토 대기' :
                             submission.status === 'approved' ? '승인됨' : '거절됨'}
                          </div>
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p><strong>출석자:</strong> {submission.userName} ({submission.userPhone})</p>
                        <p><strong>출석 방법:</strong> {getMethodName(submission.submissionData.checkInMethod)}</p>
                        <p><strong>출석 시간:</strong> {new Date(submission.submissionData.checkInTime).toLocaleString('ko-KR')}</p>
                        <p><strong>지점:</strong> {submission.storeName}</p>
                        <p><strong>위치:</strong> {submission.submissionData.location.address}</p>
                        {submission.distanceFromExpected !== undefined && (
                          <p>
                            <strong>위치 정확도:</strong> 
                            <span className={`ml-1 font-medium ${getLocationAccuracyColor(submission.distanceFromExpected)}`}>
                              {getLocationAccuracyText(submission.distanceFromExpected)} ({submission.distanceFromExpected}m 차이)
                            </span>
                          </p>
                        )}
                        {submission.rewardAmount && (
                          <p><strong>지급액:</strong> {submission.rewardAmount.toLocaleString()}원</p>
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
                            {submission.userName}님의 출석 기록을 검토합니다
                          </DialogDescription>
                        </DialogHeader>
                        {selectedSubmission && (
                          <div className="space-y-4">
                            {/* 출석 상세 정보 */}
                            <div>
                              <h4 className="font-medium mb-2">출석 상세 정보</h4>
                              <div className="bg-gray-50 p-4 rounded space-y-3">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>출석 방법:</strong> {getMethodName(selectedSubmission.submissionData.checkInMethod)}
                                  </div>
                                  <div>
                                    <strong>출석 시간:</strong> {new Date(selectedSubmission.submissionData.checkInTime).toLocaleString('ko-KR')}
                                  </div>
                                  <div>
                                    <strong>연속 출석:</strong> {selectedSubmission.submissionData.attendanceStreak}일
                                  </div>
                                  <div>
                                    <strong>연속성:</strong> {selectedSubmission.submissionData.isConsecutive ? '✓ 연속' : '❌ 중단'}
                                  </div>
                                </div>
                                
                                <div className="border-t pt-3">
                                  <h5 className="font-medium mb-2">위치 정보</h5>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <strong>실제 위치:</strong><br />
                                      <span className="text-muted-foreground">
                                        {selectedSubmission.submissionData.location.address}<br />
                                        위도: {selectedSubmission.submissionData.location.latitude}, 
                                        경도: {selectedSubmission.submissionData.location.longitude}<br />
                                        정확도: ±{selectedSubmission.submissionData.location.accuracy}m
                                      </span>
                                    </div>
                                    <div>
                                      <strong>기대 위치:</strong><br />
                                      <span className="text-muted-foreground">
                                        {selectedSubmission.expectedLocation.address}<br />
                                        위도: {selectedSubmission.expectedLocation.latitude}, 
                                        경도: {selectedSubmission.expectedLocation.longitude}<br />
                                        허용 반경: {selectedSubmission.expectedLocation.radius}m
                                      </span>
                                    </div>
                                    {selectedSubmission.distanceFromExpected !== undefined && (
                                      <div>
                                        <strong>위치 차이:</strong> 
                                        <span className={`ml-1 font-medium ${getLocationAccuracyColor(selectedSubmission.distanceFromExpected)}`}>
                                          {selectedSubmission.distanceFromExpected}m ({getLocationAccuracyText(selectedSubmission.distanceFromExpected)})
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {selectedSubmission.submissionData.deviceInfo && (
                                  <div className="border-t pt-3">
                                    <h5 className="font-medium mb-2">기기 정보</h5>
                                    <div className="text-sm text-muted-foreground">
                                      <p><strong>플랫폼:</strong> {selectedSubmission.submissionData.deviceInfo.platform}</p>
                                      <p><strong>User Agent:</strong> {selectedSubmission.submissionData.deviceInfo.userAgent.substring(0, 50)}...</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 출석 증명 사진 */}
                            {selectedSubmission.submissionData.photos && selectedSubmission.submissionData.photos.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">출석 증명 사진</h4>
                                <div className="grid grid-cols-2 gap-2">
                                  {selectedSubmission.submissionData.photos.map((photo, idx) => (
                                    <div key={idx} className="bg-gray-100 p-4 rounded text-center text-sm text-muted-foreground">
                                      사진 {idx + 1} (미리보기 구현 예정)
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
                                    max="5000"
                                    className="mt-1"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    출석 미션 최대 지급액: 5,000원 (연속 출석 보너스 별도)
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