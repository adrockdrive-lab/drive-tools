'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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
import { Textarea } from '@/components/ui/textarea'
import { adminService } from '@/lib/services/admin'
import type { UserMissionData } from '@/types'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function AdminPaybacksPage() {
  const [missions, setMissions] = useState<UserMissionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedMission, setSelectedMission] = useState<UserMissionData | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // 임시로 storeId를 70으로 설정
  const storeId = 70

  useEffect(() => {
    loadMissions()
  }, [])

  const loadMissions = async () => {
    setIsLoading(true)
    try {
      const result = await adminService.getUserMissions(storeId)
      if (result.success && result.data) {
        setMissions(result.data)
      }
    } catch (error) {
      toast.error('페이백 데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprovePayback = async (participationId: string) => {
    try {
      const result = await adminService.approvePayback(participationId)
      if (result.success) {
        toast.success('페이백이 승인되었습니다.')
        loadMissions()
      } else {
        toast.error(result.error || '페이백 승인에 실패했습니다.')
      }
    } catch (error) {
      toast.error('페이백 승인 중 오류가 발생했습니다.')
    }
  }

  const handleRejectPayback = async (participationId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('거부 사유를 입력해주세요.')
      return
    }

    try {
      const result = await adminService.rejectPayback(participationId, rejectionReason)
      if (result.success) {
        toast.success('페이백이 거부되었습니다.')
        setRejectionReason('')
        setSelectedMission(null)
        loadMissions()
      } else {
        toast.error(result.error || '페이백 거부에 실패했습니다.')
      }
    } catch (error) {
      toast.error('페이백 거부 중 오류가 발생했습니다.')
    }
  }

  const filteredMissions = missions.filter(mission => {
    const matchesSearch =
      mission.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.userPhone.includes(searchTerm) ||
      mission.missionTitle.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || mission.paybackStatus === statusFilter

    return matchesSearch && matchesStatus
  })

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
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const paybackStats = {
    total: missions.filter(m => m.status === 'completed').length,
    pending: missions.filter(m => m.paybackStatus === 'pending').length,
    paid: missions.filter(m => m.paybackStatus === 'paid').length,
    rejected: missions.filter(m => m.paybackStatus === 'rejected').length,
    totalAmount: missions
      .filter(m => m.paybackStatus === 'paid')
      .reduce((sum, m) => sum + (m.paybackAmount || 0), 0)
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
        <h1 className="text-3xl font-bold text-white">페이백 관리</h1>
        <p className="text-muted-foreground">미션 완료에 대한 보상 지급 관리</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 완료</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{paybackStats.total}</div>
          </CardContent>
        </Card>
        <Card className="gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">대기중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{paybackStats.pending}</div>
          </CardContent>
        </Card>
        <Card className="gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">지급완료</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{paybackStats.paid}</div>
          </CardContent>
        </Card>
        <Card className="gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">거부됨</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{paybackStats.rejected}</div>
          </CardContent>
        </Card>
        <Card className="gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 지급액</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{paybackStats.totalAmount.toLocaleString()}원</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="gradient-card border-border">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-white">검색</Label>
              <Input
                id="search"
                placeholder="사용자명, 전화번호, 미션명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-secondary/50 border-border text-white"
              />
            </div>
            <div>
              <Label htmlFor="status" className="text-white">상태 필터</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-secondary/50 border border-border text-white rounded-md px-3 py-2"
              >
                <option value="all">전체</option>
                <option value="pending">대기중</option>
                <option value="paid">지급완료</option>
                <option value="rejected">거부됨</option>
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

      {/* Paybacks Table */}
      <Card className="gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-white">페이백 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">사용자</TableHead>
                <TableHead className="text-white">미션</TableHead>
                <TableHead className="text-white">완료일</TableHead>
                <TableHead className="text-white">보상</TableHead>
                <TableHead className="text-white">페이백 상태</TableHead>
                <TableHead className="text-white">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMissions
                .filter(mission => mission.status === 'completed')
                .map((mission) => (
                <TableRow key={mission.id}>
                  <TableCell className="text-white">
                    <div>
                      <div className="font-medium">{mission.userName}</div>
                      <div className="text-sm text-muted-foreground">{mission.userPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">
                    <div>
                      <div className="font-medium">{mission.missionTitle}</div>
                      <div className="text-sm text-muted-foreground">{mission.missionType}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{formatDate(mission.completedAt)}</TableCell>
                  <TableCell className="text-white">{mission.rewardAmount.toLocaleString()}원</TableCell>
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setSelectedMission(mission)}
                            >
                              거부
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-secondary border-border">
                            <DialogHeader>
                              <DialogTitle className="text-white">페이백 거부</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="reason" className="text-white">거부 사유</Label>
                                <Textarea
                                  id="reason"
                                  placeholder="거부 사유를 입력하세요..."
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  className="bg-secondary/50 border-border text-white"
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setRejectionReason('')
                                    setSelectedMission(null)
                                  }}
                                  className="border-border text-white hover:bg-secondary"
                                >
                                  취소
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleRejectPayback(mission.id)}
                                >
                                  거부
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
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
