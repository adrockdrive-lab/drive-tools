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

export default function AdminMissionsPage() {
  const router = useRouter()
  const [missions, setMissions] = useState<UserMissionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [stores, setStores] = useState<any[]>([])
  const [adminId, setAdminId] = useState<string>('')

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

      loadMissions(currentAdmin.id)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/admin/login')
    }
  }

  const loadMissions = async (adminId: string) => {
    setIsLoading(true)
    try {
      const result = await adminService.getUserMissions(adminId, selectedStoreId || undefined)
      if (result.success && result.data) {
        setMissions(result.data)
      } else {
        toast.error(result.error || '미션 데이터를 불러오는데 실패했습니다.')
      }
    } catch (error) {
      toast.error('미션 데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (missionId: string, newStatus: string) => {
    if (!adminId) {
      toast.error('관리자 정보를 찾을 수 없습니다.')
      return
    }

    try {
      const result = await adminService.updateMissionStatus(missionId, newStatus as any, adminId)
      if (result.success) {
        toast.success('미션 상태가 변경되었습니다.')
        loadMissions(adminId) // 목록 새로고침
      } else {
        toast.error(result.error || '미션 상태 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('Status change error:', error)
      toast.error('미션 상태 변경에 실패했습니다.')
    }
  }

  const filteredMissions = missions.filter(mission => {
    const matchesSearch =
      mission.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.userPhone.includes(searchTerm) ||
      mission.missionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.storeName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || mission.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-1 text-xs rounded-full">대기중</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 text-xs rounded-full">진행중</Badge>
      case 'completed':
        return <Badge className="bg-green-50 text-green-700 border border-green-200 px-2 py-1 text-xs rounded-full">완료</Badge>
      case 'rejected':
        return <Badge className="bg-red-50 text-red-700 border border-red-200 px-2 py-1 text-xs rounded-full">반려</Badge>
      default:
        return <Badge className="bg-gray-50 text-gray-600 border border-gray-200 px-2 py-1 text-xs rounded-full">{status}</Badge>
    }
  }

  const getMissionTypeBadge = (type: string) => {
    const typeNames: Record<string, string> = {
      challenge: '도전',
      sns: 'SNS',
      review: '리뷰',
      attendance: '출석',
      referral: '추천'
    }
    return <Badge className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 text-xs rounded-full">{typeNames[type] || type}</Badge>
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

  const missionStats = {
    total: missions.length,
    pending: missions.filter(m => m.status === 'pending').length,
    inProgress: missions.filter(m => m.status === 'in_progress').length,
    completed: missions.filter(m => m.status === 'completed').length
  }

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="text-2xl">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">미션 관리</h1>
        <p className="text-gray-600">사용자별 미션 진행 현황</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 미션</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{missionStats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">대기중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{missionStats.pending}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">진행중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{missionStats.inProgress}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">완료</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{missionStats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-gray-800 text-lg font-semibold">검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <Label htmlFor="search" className="text-gray-700 font-medium mb-2 block">검색</Label>
              <Input
                id="search"
                placeholder="사용자명, 전화번호, 미션명, 지점명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-gray-300 text-gray-900 bg-white focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="status" className="text-gray-700 font-medium mb-2 block">상태 필터</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 text-gray-900 bg-white rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="pending">대기중</option>
                <option value="in_progress">진행중</option>
                <option value="completed">완료</option>
                <option value="rejected">반려</option>
              </select>
            </div>
            <div>
              <Label htmlFor="store" className="text-gray-700 font-medium mb-2 block">지점 필터</Label>
              <select
                id="store"
                value={selectedStoreId || ''}
                onChange={(e) => {
                  const storeId = e.target.value ? parseInt(e.target.value) : null
                  setSelectedStoreId(storeId)
                  if (adminId) {
                    loadMissions(adminId)
                  }
                }}
                className="w-full border border-gray-300 text-gray-900 bg-white rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
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
                onClick={() => adminId && loadMissions(adminId)}
                variant="outline"
                className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400"
              >
                새로고침
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missions Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-gray-800 text-lg font-semibold">미션 목록</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="text-gray-700 font-semibold py-4">사용자</TableHead>
                  <TableHead className="text-gray-700 font-semibold py-4">지점</TableHead>
                  <TableHead className="text-gray-700 font-semibold py-4">미션</TableHead>
                  <TableHead className="text-gray-700 font-semibold py-4">상태</TableHead>
                  <TableHead className="text-gray-700 font-semibold py-4">시작일</TableHead>
                  <TableHead className="text-gray-700 font-semibold py-4">완료일</TableHead>
                  <TableHead className="text-gray-700 font-semibold py-4">보상</TableHead>
                  <TableHead className="text-gray-700 font-semibold py-4">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMissions.map((mission) => (
                  <TableRow key={mission.id} className="hover:bg-gray-50 border-b border-gray-100">
                    <TableCell className="py-4">
                      <div>
                        <div className="font-medium text-gray-900">{mission.userName}</div>
                        <div className="text-sm text-gray-500">{mission.userPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700 py-4">{mission.storeName}</TableCell>
                    <TableCell className="py-4">
                      <div>
                        <div className="font-medium text-gray-900">{mission.missionTitle}</div>
                        <div className="mt-1">{getMissionTypeBadge(mission.missionType)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">{getStatusBadge(mission.status)}</TableCell>
                    <TableCell className="text-gray-700 py-4">{formatDate(mission.startedAt)}</TableCell>
                    <TableCell className="text-gray-700 py-4">{formatDate(mission.completedAt)}</TableCell>
                    <TableCell className="text-gray-700 py-4 font-medium">{mission.rewardAmount.toLocaleString()}원</TableCell>
                    <TableCell className="py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400"
                          onClick={() => router.push(`/admin/missions/${mission.id}`)}
                        >
                          상세보기
                        </Button>
                        <select
                          value={mission.status}
                          onChange={(e) => handleStatusChange(mission.id, e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded bg-white text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="pending">대기중</option>
                          <option value="in_progress">진행중</option>
                          <option value="completed">완료</option>
                          <option value="rejected">반려</option>
                        </select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
