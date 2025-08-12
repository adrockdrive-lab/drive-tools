'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { adminService } from '@/lib/services/admin'
import type { UserMissionData } from '@/types'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [userMissions, setUserMissions] = useState<UserMissionData[]>([])
  const [stats, setStats] = useState<{
    totalUsers: number
    totalMissions: number
    completedMissions: number
    totalPayback: number
    completionRate: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [stores, setStores] = useState<any[]>([])
  const [adminId, setAdminId] = useState<string>('')
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    try {
      const currentAdmin = adminService.getCurrentAdmin()
      if (!currentAdmin) {
        router.push('/admin/login')
        return
      }

      setAdminId(currentAdmin.id)

      // 관리자가 관리할 수 있는 지점 목록 조회
      const { success, stores: adminStores } = await adminService.getAdminStores(currentAdmin.id)
      if (success && adminStores) {
        setStores(adminStores)
      }

      loadData(currentAdmin.id)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/admin/login')
    }
  }

  const loadData = async (adminId: string) => {
    setIsLoading(true)
    try {
      const [missionsResult, statsResult] = await Promise.all([
        adminService.getUserMissions(adminId, selectedStoreId || undefined),
        adminService.getStoreStats(adminId, selectedStoreId || undefined)
      ])

      if (missionsResult.success) {
        setUserMissions(missionsResult.data || [])
      } else {
        toast.error(missionsResult.error || '미션 데이터를 불러오는데 실패했습니다.')
      }

      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats)
      } else {
        toast.error(statsResult.error || '통계 데이터를 불러오는데 실패했습니다.')
      }
    } catch (error) {
      toast.error('데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprovePayback = async (participationId: string) => {
    if (!adminId) {
      toast.error('관리자 정보를 찾을 수 없습니다.')
      return
    }

    try {
      const result = await adminService.approvePayback(participationId, adminId)
      if (result.success) {
        toast.success('페이백이 승인되었습니다.')
        loadData(adminId)
      } else {
        toast.error(result.error || '페이백 승인에 실패했습니다.')
      }
    } catch (error) {
      toast.error('페이백 승인 중 오류가 발생했습니다.')
    }
  }

  const handleRejectPayback = async (participationId: string) => {
    if (!adminId) {
      toast.error('관리자 정보를 찾을 수 없습니다.')
      return
    }

    if (!rejectionReason.trim()) {
      toast.error('거부 사유를 입력해주세요.')
      return
    }

    try {
      const result = await adminService.rejectPayback(participationId, rejectionReason, adminId)
      if (result.success) {
        toast.success('페이백이 거부되었습니다.')
        setRejectionReason('')
        loadData(adminId)
      } else {
        toast.error(result.error || '페이백 거부에 실패했습니다.')
      }
    } catch (error) {
      toast.error('페이백 거부 중 오류가 발생했습니다.')
    }
  }

  const filteredMissions = userMissions.filter(mission =>
    mission.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mission.userPhone.includes(searchTerm) ||
    mission.missionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mission.storeName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">대기중</Badge>
      case 'in_progress':
        return <Badge variant="outline">진행중</Badge>
      case 'completed':
        return <Badge variant="default">완료</Badge>
      case 'rejected':
        return <Badge variant="destructive">반려</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaybackStatusBadge = (status: string | null) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default">지급완료</Badge>
      case 'pending':
        return <Badge variant="outline">대기중</Badge>
      case 'rejected':
        return <Badge variant="destructive">거부됨</Badge>
      default:
        return <Badge variant="secondary">미처리</Badge>
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '-'

      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return '-'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-2xl">로딩 중...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600">지점별 사용자 미션 현황</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="gradient-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">총 사용자</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stats.totalUsers.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="gradient-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">총 미션</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stats.totalMissions.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="gradient-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">완료율</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stats.completionRate}%</div>
            </CardContent>
          </Card>
          <Card className="gradient-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">총 지급액</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stats.totalPayback.toLocaleString()}원</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      <Card className="gradient-card border-border">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-gray-900">검색</Label>
              <Input
                id="search"
                placeholder="사용자명, 전화번호, 미션명, 지점명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-border text-gray-900"
              />
            </div>
            <div>
              <Label htmlFor="store" className="text-gray-900">지점 필터</Label>
              <select
                id="store"
                value={selectedStoreId || ''}
                onChange={(e) => {
                  const storeId = e.target.value ? parseInt(e.target.value) : null
                  setSelectedStoreId(storeId)
                  if (adminId) {
                    loadData(adminId)
                  }
                }}
                className="w-full border border-border text-gray-900 rounded-md px-3 py-2"
              >
                <option value="">전체 지점</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => adminId && loadData(adminId)}
                variant="outline"
                className="border-border text-gray-700 hover:bg-gray-100"
              >
                새로고침
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-gray-900">사용자 미션 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-900">사용자</TableHead>
                <TableHead className="text-gray-900">지점</TableHead>
                <TableHead className="text-gray-900">미션</TableHead>
                <TableHead className="text-gray-900">상태</TableHead>
                <TableHead className="text-gray-900">시작일</TableHead>
                <TableHead className="text-gray-900">완료일</TableHead>
                <TableHead className="text-gray-900">보상</TableHead>
                <TableHead className="text-gray-900">페이백</TableHead>
                <TableHead className="text-gray-900">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-muted-foreground mb-2">미션 데이터가 없습니다.</p>
                    <p className="text-sm text-muted-foreground">사용자가 아직 미션에 참여하지 않았습니다.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMissions.map((mission) => (
                <TableRow key={mission.id}>
                  <TableCell className="text-gray-900">
                    <div>
                      <div className="font-medium">{mission.userName}</div>
                      <div className="text-sm text-gray-600">{mission.userPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-900">{mission.storeName}</TableCell>
                  <TableCell className="text-gray-900">
                    <div>
                      <div className="font-medium">{mission.missionTitle}</div>
                      <div className="text-sm text-gray-600">{mission.missionType}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(mission.status)}</TableCell>
                  <TableCell className="text-gray-900">{formatDate(mission.startedAt)}</TableCell>
                  <TableCell className="text-gray-900">{formatDate(mission.completedAt)}</TableCell>
                  <TableCell className="text-gray-900">{mission.rewardAmount.toLocaleString()}원</TableCell>
                  <TableCell>{getPaybackStatusBadge(mission.paybackStatus)}</TableCell>
                  <TableCell>
                    {mission.status === 'completed' && !mission.paybackStatus && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprovePayback(mission.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          승인
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const reason = prompt('거부 사유를 입력하세요:')
                            if (reason) {
                              setRejectionReason(reason)
                              handleRejectPayback(mission.id)
                            }
                          }}
                        >
                          거부
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
