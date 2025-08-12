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
import { supabase } from '@/lib/supabase'
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

  // storeId 제거 - 모든 데이터 조회

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      // 실제 사용자 데이터 조회
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // 각 사용자의 미션 및 페이백 정보 조회
      const usersWithStats = await Promise.all(
        usersData.map(async (user) => {
          // 사용자의 미션 참여 수
          const { count: totalMissions } = await supabase
            .from('user_missions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          // 완료된 미션 수
          const { count: completedMissions } = await supabase
            .from('user_missions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'completed')

          // 총 페이백 금액
          const { data: paybacks } = await supabase
            .from('paybacks')
            .select('amount')
            .eq('user_id', user.id)
            .eq('status', 'paid')

          const totalPayback = paybacks?.reduce((sum, p) => sum + p.amount, 0) || 0

          return {
            id: user.id,
            name: user.name,
            phone: user.phone,
            storeName: '전체', // store_id가 없으므로 전체로 표시
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
        <h1 className="text-3xl font-bold text-black">사용자 관리</h1>
        <p className="text-muted-foreground">지점별 사용자 목록 및 관리</p>
      </div>

      {/* Search */}
      <Card className="gradient-card border-border">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-black">검색</Label>
              <Input
                id="search"
                placeholder="사용자명, 전화번호로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className=" border-border text-black"
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
          <CardTitle className="text-black">사용자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-black">사용자</TableHead>
                <TableHead className="text-black">지점</TableHead>
                <TableHead className="text-black">미션 현황</TableHead>
                <TableHead className="text-black">총 보상</TableHead>
                <TableHead className="text-black">가입일</TableHead>
                <TableHead className="text-black">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-black">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-black">{user.storeName}</TableCell>
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
                  <TableCell className="text-black">
                    {user.totalPayback.toLocaleString()}원
                  </TableCell>
                  <TableCell className="text-black">{formatDate(user.createdAt)}</TableCell>
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
