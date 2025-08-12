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
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function AdminMissionsPage() {
  const [missions, setMissions] = useState<UserMissionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // storeId 제거 - 모든 데이터 조회

  useEffect(() => {
    loadMissions()
  }, [])

  const loadMissions = async () => {
    setIsLoading(true)
    try {
      const result = await adminService.getUserMissions()
      if (result.success && result.data) {
        setMissions(result.data)
      }
    } catch (error) {
      toast.error('미션 데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMissions = missions.filter(mission => {
    const matchesSearch =
      mission.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.userPhone.includes(searchTerm) ||
      mission.missionTitle.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || mission.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">대기중</Badge>
      case 'in_progress':
        return <Badge variant="outline">진행중</Badge>
      case 'completed':
        return <Badge variant="default">완료</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
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
    return <Badge variant="outline">{typeNames[type] || type}</Badge>
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
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
        <h1 className="text-3xl font-bold text-black">미션 관리</h1>
        <p className="text-muted-foreground">사용자별 미션 진행 현황</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 미션</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{missionStats.total}</div>
          </CardContent>
        </Card>
        <Card className="gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">대기중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{missionStats.pending}</div>
          </CardContent>
        </Card>
        <Card className="gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">진행중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{missionStats.inProgress}</div>
          </CardContent>
        </Card>
        <Card className="gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">완료</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{missionStats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="gradient-card border-border">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-black">검색</Label>
              <Input
                id="search"
                placeholder="사용자명, 전화번호, 미션명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className=" border-border text-black"
              />
            </div>
            <div>
              <Label htmlFor="status" className="text-black">상태 필터</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full  border border-border text-black rounded-md px-3 py-2"
              >
                <option value="all">전체</option>
                <option value="pending">대기중</option>
                <option value="in_progress">진행중</option>
                <option value="completed">완료</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={loadMissions}
                variant="outline"
                className="border-border text-white hover:bg-secondary"
              >
                새로고침
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missions Table */}
      <Card className="gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-black">미션 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-black">사용자</TableHead>
                <TableHead className="text-black">미션</TableHead>
                <TableHead className="text-black">상태</TableHead>
                <TableHead className="text-black">시작일</TableHead>
                <TableHead className="text-black">완료일</TableHead>
                <TableHead className="text-black">보상</TableHead>
                <TableHead className="text-black">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMissions.map((mission) => (
                <TableRow key={mission.id}>
                  <TableCell className="text-black">
                    <div>
                      <div className="font-medium">{mission.userName}</div>
                      <div className="text-sm text-muted-foreground">{mission.userPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-black">
                    <div>
                      <div className="font-medium">{mission.missionTitle}</div>
                      <div className="mt-1">{getMissionTypeBadge(mission.missionType)}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(mission.status)}</TableCell>
                  <TableCell className="text-black">{formatDate(mission.startedAt)}</TableCell>
                  <TableCell className="text-black">{formatDate(mission.completedAt)}</TableCell>
                  <TableCell className="text-black">{mission.rewardAmount.toLocaleString()}원</TableCell>
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
