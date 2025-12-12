'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { adminService } from '@/lib/services/admin'
import type { UserData } from '@/types'
import { format } from 'date-fns'
import { Search, TrendingUp, User, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function UserProgressPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [stores, setStores] = useState<{ id: number; name: string }[]>([])
  const [adminId, setAdminId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'totalMissions' | 'completedMissions' | 'totalPayback'>('totalMissions')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const checkAdminAuth = useCallback(async () => {
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

      await loadUsers(currentAdmin.id)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/admin/login')
    }
  }, [router])

  const loadUsers = useCallback(async (adminId: string) => {
    setLoading(true)
    try {
      const result = await adminService.getUsers(adminId, selectedStoreId || undefined)
      if (result.success && result.data) {
        setUsers(result.data)
      } else {
        toast.error(result.error || '사용자 데이터를 불러오는데 실패했습니다.')
      }
    } catch (error) {
      toast.error('사용자 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [selectedStoreId])

  const processAndSortUsers = useCallback(() => {
    let filtered = users.filter(user => {
      if (!user) return false
      const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (user.phone || '').includes(searchTerm)
      return matchesSearch
    })

    // 정렬
    filtered.sort((a, b) => {
      if (!a || !b) return 0
      
      let aValue: string | number, bValue: string | number

      switch (sortBy) {
        case 'name':
          aValue = a.name || ''
          bValue = b.name || ''
          break
        case 'totalMissions':
          aValue = a.totalMissions || 0
          bValue = b.totalMissions || 0
          break
        case 'completedMissions':
          aValue = a.completedMissions || 0
          bValue = b.completedMissions || 0
          break
        case 'totalPayback':
          aValue = a.totalPayback || 0
          bValue = b.totalPayback || 0
          break
        default:
          aValue = a.totalMissions || 0
          bValue = b.totalMissions || 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredUsers(filtered)
  }, [users, searchTerm, sortBy, sortOrder])

  useEffect(() => {
    checkAdminAuth()
  }, [checkAdminAuth])

  useEffect(() => {
    processAndSortUsers()
  }, [processAndSortUsers])

  const getCompletionRate = (user: UserData) => {
    if (!user || (user.totalMissions || 0) === 0) return 0
    return Math.round(((user.completedMissions || 0) / (user.totalMissions || 1)) * 100)
  }

  const getPerformanceLevel = (user: UserData) => {
    const completionRate = getCompletionRate(user)
    if (completionRate >= 80) return { level: '우수', color: 'bg-green-100 text-green-800' }
    if (completionRate >= 60) return { level: '양호', color: 'bg-blue-100 text-blue-800' }
    if (completionRate >= 40) return { level: '보통', color: 'bg-yellow-100 text-yellow-800' }
    return { level: '개선필요', color: 'bg-red-100 text-red-800' }
  }

  const totalStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u && (u.totalMissions || 0) > 0).length,
    avgCompletionRate: users.length > 0 ? Math.round(users.reduce((sum, u) => sum + getCompletionRate(u), 0) / users.length) : 0,
    totalPaybackAmount: users.reduce((sum, u) => sum + (u?.totalPayback || 0), 0)
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="text-2xl">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">사용자 진행 현황</h1>
          <p className="text-gray-600">사용자별 미션 수행 및 진행 상황 모니터링</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="w-4 h-4 mr-2" />
              전체 사용자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalUsers}명</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <User className="w-4 h-4 mr-2" />
              활성 사용자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalStats.activeUsers}명</div>
            <p className="text-xs text-gray-500">미션 참여 사용자</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              평균 완료율
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalStats.avgCompletionRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 페이백</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {totalStats.totalPaybackAmount.toLocaleString()}원
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>필터 및 정렬</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">검색</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="이름 또는 전화번호"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="store">지점</Label>
              <Select value={selectedStoreId?.toString() || ''} onValueChange={(value) => {
                const storeId = value ? parseInt(value) : null
                setSelectedStoreId(storeId)
                if (adminId) {
                  loadUsers(adminId)
                }
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
            </div>
            <div>
              <Label htmlFor="sortBy">정렬 기준</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">이름</SelectItem>
                  <SelectItem value="totalMissions">총 미션수</SelectItem>
                  <SelectItem value="completedMissions">완료 미션수</SelectItem>
                  <SelectItem value="totalPayback">총 페이백</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sortOrder">정렬 순서</Label>
              <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">높은순</SelectItem>
                  <SelectItem value="asc">낮은순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>사용자 정보</TableHead>
                  <TableHead>지점</TableHead>
                  <TableHead className="text-center">총 미션</TableHead>
                  <TableHead className="text-center">완료 미션</TableHead>
                  <TableHead className="text-center">완료율</TableHead>
                  <TableHead className="text-center">성과 등급</TableHead>
                  <TableHead className="text-right">총 페이백</TableHead>
                  <TableHead className="text-center">가입일</TableHead>
                  <TableHead className="text-center">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  if (!user) return null
                  
                  const completionRate = getCompletionRate(user)
                  const performance = getPerformanceLevel(user)
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name || '-'}</div>
                          <div className="text-sm text-gray-500">{user.phone || '-'}</div>
                        </div>
                      </TableCell>
                      <TableCell>{user.storeName || '-'}</TableCell>
                      <TableCell className="text-center font-medium">{user.totalMissions || 0}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-green-600 font-medium">{user.completedMissions || 0}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{completionRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={performance.color}>
                          {performance.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {(user.totalPayback || 0).toLocaleString()}원
                      </TableCell>
                      <TableCell className="text-center text-sm text-gray-500">
                        {user.createdAt ? format(new Date(user.createdAt), 'yyyy-MM-dd') : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                        >
                          상세보기
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                }).filter(Boolean)}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      조건에 맞는 사용자가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}