'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { adminService } from '@/lib/services/admin'
import {
  Award,
  Ban,
  Calendar,
  CheckCircle2,
  Coins,
  Edit,
  Eye,
  Mail,
  Phone,
  RotateCw,
  Search,
  Shield,
  TrendingUp,
  User,
  Users,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface UserData {
  id: string
  name: string
  nickname: string
  phone: string
  email: string
  storeName: string
  level: number
  xp: number
  coins: number
  cashBalance: number
  consecutiveDays: number
  totalMissionsCompleted: number
  badgesCount: number
  createdAt: string
  isActive: boolean
  isBanned: boolean
}

export default function UsersV2Page() {
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [storeFilter, setStoreFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  useEffect(() => {
    checkAdminAuth()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, storeFilter, levelFilter, statusFilter])

  const checkAdminAuth = async () => {
    try {
      const currentAdmin = adminService.getCurrentAdmin()
      if (!currentAdmin) {
        router.push('/admin/login')
        return
      }
      loadUsers()
    } catch (error) {
      router.push('/admin/login')
    }
  }

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const mockUsers: UserData[] = [
        {
          id: '1',
          name: '홍길동',
          nickname: '길동이',
          phone: '010-1234-5678',
          email: 'hong@example.com',
          storeName: '강남점',
          level: 15,
          xp: 2500,
          coins: 1200,
          cashBalance: 15000,
          consecutiveDays: 7,
          totalMissionsCompleted: 25,
          badgesCount: 5,
          createdAt: '2025-10-01',
          isActive: true,
          isBanned: false,
        },
        {
          id: '2',
          name: '김철수',
          nickname: '철수',
          phone: '010-2345-6789',
          email: 'kim@example.com',
          storeName: '홍대점',
          level: 8,
          xp: 1200,
          coins: 600,
          cashBalance: 5000,
          consecutiveDays: 3,
          totalMissionsCompleted: 12,
          badgesCount: 3,
          createdAt: '2025-10-15',
          isActive: true,
          isBanned: false,
        },
        {
          id: '3',
          name: '이영희',
          nickname: '영희',
          phone: '010-3456-7890',
          email: 'lee@example.com',
          storeName: '판교점',
          level: 22,
          xp: 4500,
          coins: 2100,
          cashBalance: 25000,
          consecutiveDays: 15,
          totalMissionsCompleted: 45,
          badgesCount: 8,
          createdAt: '2025-09-20',
          isActive: true,
          isBanned: false,
        },
      ]
      setUsers(mockUsers)
    } catch (error) {
      toast.error('사용자 데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (storeFilter !== 'all') {
      filtered = filtered.filter((u) => u.storeName === storeFilter)
    }

    if (levelFilter !== 'all') {
      const [min, max] = levelFilter.split('-').map(Number)
      filtered = filtered.filter((u) => u.level >= min && u.level <= max)
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter((u) => u.isActive && !u.isBanned)
      } else if (statusFilter === 'banned') {
        filtered = filtered.filter((u) => u.isBanned)
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.nickname?.toLowerCase().includes(query) ||
          u.phone.includes(query) ||
          u.email?.toLowerCase().includes(query)
      )
    }

    setFilteredUsers(filtered)
  }

  const openDetailDialog = (user: UserData) => {
    setSelectedUser(user)
    setDetailDialogOpen(true)
  }

  const handleBanUser = (userId: string) => {
    if (!confirm('정말 이 사용자를 정지하시겠습니까?')) return

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBanned: true, isActive: false } : u))
    )
    toast.success('사용자가 정지되었습니다.')
  }

  const handleUnbanUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBanned: false, isActive: true } : u))
    )
    toast.success('사용자 정지가 해제되었습니다.')
  }

  const getStatusBadge = (user: UserData) => {
    if (user.isBanned) {
      return <Badge className="bg-red-50 text-red-700 border-red-200">정지됨</Badge>
    }
    if (user.isActive) {
      return <Badge className="bg-green-50 text-green-700 border-green-200">활성</Badge>
    }
    return <Badge className="bg-gray-50 text-gray-700 border-gray-200">비활성</Badge>
  }

  const getLevelBadge = (level: number) => {
    if (level >= 50) {
      return <Badge className="bg-purple-600">레벨 {level}</Badge>
    } else if (level >= 20) {
      return <Badge className="bg-blue-600">레벨 {level}</Badge>
    } else if (level >= 10) {
      return <Badge className="bg-green-600">레벨 {level}</Badge>
    }
    return <Badge className="bg-gray-600">레벨 {level}</Badge>
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
        <p className="text-gray-600 mt-2">전체 사용자 정보를 확인하고 관리하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{users.length}명</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">활성 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.isActive && !u.isBanned).length}명
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">평균 레벨</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(users.reduce((sum, u) => sum + u.level, 0) / users.length)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 미션 완료</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {users.reduce((sum, u) => sum + u.totalMissionsCompleted, 0)}건
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>검색</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="이름, 닉네임, 전화번호..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>지점</Label>
              <Select value={storeFilter} onValueChange={setStoreFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="강남점">강남점</SelectItem>
                  <SelectItem value="홍대점">홍대점</SelectItem>
                  <SelectItem value="판교점">판교점</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>레벨</Label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="1-10">1-10</SelectItem>
                  <SelectItem value="11-20">11-20</SelectItem>
                  <SelectItem value="21-50">21-50</SelectItem>
                  <SelectItem value="51-100">51-100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>상태</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="banned">정지됨</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={loadUsers} className="w-full">
                <RotateCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>사용자 목록 ({filteredUsers.length}명)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>사용자</TableHead>
                <TableHead>지점</TableHead>
                <TableHead>레벨</TableHead>
                <TableHead>XP</TableHead>
                <TableHead>미션 완료</TableHead>
                <TableHead>연속 출석</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">@{user.nickname}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{user.storeName}</TableCell>
                  <TableCell>{getLevelBadge(user.level)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>{user.xp.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>{user.totalMissionsCompleted}건</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>{user.consecutiveDays}일</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDetailDialog(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {user.isBanned ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600"
                          onClick={() => handleUnbanUser(user.id)}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() => handleBanUser(user.id)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">사용자가 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>사용자 상세 정보</DialogTitle>
            <DialogDescription>
              {selectedUser?.name}님의 상세 정보
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">기본 정보</TabsTrigger>
                <TabsTrigger value="stats">통계</TabsTrigger>
                <TabsTrigger value="missions">미션 내역</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">이름</Label>
                    <div className="mt-1 font-medium">{selectedUser.name}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">닉네임</Label>
                    <div className="mt-1 font-medium">{selectedUser.nickname}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">전화번호</Label>
                    <div className="mt-1 font-medium flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedUser.phone}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-600">이메일</Label>
                    <div className="mt-1 font-medium flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedUser.email}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-600">소속 지점</Label>
                    <div className="mt-1 font-medium">{selectedUser.storeName}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">가입일</Label>
                    <div className="mt-1 font-medium">{selectedUser.createdAt}</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">레벨</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedUser.level}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">경험치</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedUser.xp.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">코인</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedUser.coins.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">캐시</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedUser.cashBalance.toLocaleString()}원
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">미션 완료</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {selectedUser.totalMissionsCompleted}건
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">뱃지</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedUser.badgesCount}개
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="missions">
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>미션 내역이 곧 추가됩니다</p>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
