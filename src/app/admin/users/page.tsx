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
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // 임시로 storeId를 70으로 설정
  const storeId = 70

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      // 실제로는 사용자 목록을 가져오는 API 호출
      // 임시 데이터
      const mockUsers: UserData[] = [
        {
          id: '1',
          name: '김철수',
          phone: '010-1234-5678',
          storeName: '강남지점',
          totalMissions: 5,
          completedMissions: 3,
          totalPayback: 25000,
          createdAt: '2025-01-10'
        },
        {
          id: '2',
          name: '이영희',
          phone: '010-2345-6789',
          storeName: '강남지점',
          totalMissions: 3,
          completedMissions: 2,
          totalPayback: 15000,
          createdAt: '2025-01-12'
        }
      ]
      setUsers(mockUsers)
    } catch (error) {
      toast.error('사용자 데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
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
        <h1 className="text-3xl font-bold text-white">사용자 관리</h1>
        <p className="text-muted-foreground">지점별 사용자 목록 및 관리</p>
      </div>

      {/* Search */}
      <Card className="gradient-card border-border">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-white">검색</Label>
              <Input
                id="search"
                placeholder="사용자명, 전화번호로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-secondary/50 border-border text-white"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={loadUsers}
                variant="outline"
                className="border-border text-white hover:bg-secondary"
              >
                새로고침
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-white">사용자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">사용자</TableHead>
                <TableHead className="text-white">지점</TableHead>
                <TableHead className="text-white">미션 현황</TableHead>
                <TableHead className="text-white">총 보상</TableHead>
                <TableHead className="text-white">가입일</TableHead>
                <TableHead className="text-white">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-white">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{user.storeName}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {user.completedMissions}/{user.totalMissions}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {user.totalMissions > 0 ? Math.round(user.completedMissions / user.totalMissions * 100) : 0}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">
                    {user.totalPayback.toLocaleString()}원
                  </TableCell>
                  <TableCell className="text-white">{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" className="border-border text-white hover:bg-secondary">
                      상세보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
