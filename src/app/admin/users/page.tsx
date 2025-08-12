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
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface UserData {
  id: string
  name: string
  phone: string
  storeName: string
  totalMissions: number
  completedMissions: number
  totalPayback: number
  createdAt: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [stores, setStores] = useState<any[]>([])
  const [adminId, setAdminId] = useState<string>('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
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

      loadUsers(currentAdmin.id)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/admin/login')
    }
  }

  const loadUsers = async (adminId: string) => {
    setIsLoading(true)
    try {
      // 관리자가 관리할 수 있는 지점의 사용자들만 조회
      let query = supabase
        .from('users')
        .select(`
          *,
          stores!inner(
            name
          )
        `)
        .order('created_at', { ascending: false })

      // 특정 지점 필터링
      if (selectedStoreId) {
        query = query.eq('store_id', selectedStoreId)
      }

      const { data: usersData, error: usersError } = await query

      if (usersError) throw usersError

      // 각 사용자의 미션 및 페이백 정보 조회
      const usersWithStats = await Promise.all(
        usersData.map(async (user) => {
          // 사용자의 미션 참여 수
          let missionsQuery = supabase
            .from('mission_participations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          if (selectedStoreId) {
            missionsQuery = missionsQuery.eq('store_id', selectedStoreId)
          }

          const { count: totalMissions } = await missionsQuery

          // 완료된 미션 수
          let completedMissionsQuery = supabase
            .from('mission_participations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'completed')

          if (selectedStoreId) {
            completedMissionsQuery = completedMissionsQuery.eq('store_id', selectedStoreId)
          }

          const { count: completedMissions } = await completedMissionsQuery

          // 총 페이백 금액
          let paybacksQuery = supabase
            .from('paybacks')
            .select('amount')
            .eq('user_id', user.id)
            .eq('status', 'paid')

          if (selectedStoreId) {
            paybacksQuery = paybacksQuery.eq('store_id', selectedStoreId)
          }

          const { data: paybacks } = await paybacksQuery

          const totalPayback = paybacks?.reduce((sum, p) => sum + p.amount, 0) || 0

          return {
            id: user.id,
            name: user.name,
            phone: user.phone,
            storeName: user.stores.name,
            totalMissions: totalMissions || 0,
            completedMissions: completedMissions || 0,
            totalPayback,
            createdAt: user.created_at
          }
        })
      )

      setUsers(usersWithStats)
    } catch (error) {
      console.error('Load users error:', error)
      toast.error('사용자 데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    user.storeName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  // 서버 사이드 렌더링 중에는 로딩 상태 표시
  if (!isClient) {
    return (
      <div className="text-center py-20">
        <div className="text-2xl">로딩 중...</div>
      </div>
    )
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">사용자 관리</h1>
        <p className="text-gray-600">지점별 사용자 목록 및 관리</p>
      </div>

      {/* Search and Filter */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-gray-800 text-lg font-semibold">검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="search" className="text-gray-700 font-medium mb-2 block">검색</Label>
              <Input
                id="search"
                placeholder="사용자명, 전화번호, 지점명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-gray-300 text-gray-900 bg-white focus:border-blue-500 focus:ring-blue-500"
              />
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
                    loadUsers(adminId)
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
                onClick={() => adminId && loadUsers(adminId)}
                variant="outline"
                className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400"
              >
                새로고침
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-gray-800 text-lg font-semibold">사용자 목록</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="text-gray-700 font-semibold py-4">사용자</TableHead>
                  <TableHead className="text-gray-700 font-semibold py-4">지점</TableHead>
                  <TableHead className="text-gray-700 font-semibold py-4">미션 현황</TableHead>
                  <TableHead className="text-gray-700 font-semibold py-4">총 보상</TableHead>
                  <TableHead className="text-gray-700 font-semibold py-4">가입일</TableHead>
                  <TableHead className="text-gray-700 font-semibold py-4">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50 border-b border-gray-100">
                    <TableCell className="py-4">
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700 py-4">{user.storeName}</TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 text-xs">
                          {user.completedMissions}/{user.totalMissions}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {user.totalMissions > 0 ? Math.round(user.completedMissions / user.totalMissions * 100) : 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700 py-4 font-medium">
                      {user.totalPayback.toLocaleString()}원
                    </TableCell>
                    <TableCell className="text-gray-700 py-4">{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400"
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                      >
                        상세보기
                      </Button>
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
