'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { adminService } from '@/lib/services/admin'
import {
  CheckCircle2,
  CreditCard,
  Download,
  Filter,
  RotateCw,
  Search
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Payback {
  id: string
  userId: string
  userName: string
  userPhone: string
  storeName: string
  missionTitle: string
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  requestedAt: string
  approvedAt?: string
  paidAt?: string
}

export default function PaybacksV2Page() {
  const router = useRouter()
  const [paybacks, setPaybacks] = useState<Payback[]>([])
  const [filteredPaybacks, setFilteredPaybacks] = useState<Payback[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [storeFilter, setStoreFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAdminAuth()
  }, [])

  useEffect(() => {
    filterPaybacks()
  }, [paybacks, searchQuery, statusFilter, storeFilter])

  const checkAdminAuth = async () => {
    try {
      const currentAdmin = adminService.getCurrentAdmin()
      if (!currentAdmin) {
        router.push('/admin/login')
        return
      }
      loadPaybacks()
    } catch (error) {
      router.push('/admin/login')
    }
  }

  const loadPaybacks = async () => {
    setIsLoading(true)
    try {
      const mockPaybacks: Payback[] = [
        {
          id: '1',
          userId: 'user-1',
          userName: '홍길동',
          userPhone: '010-1234-5678',
          storeName: '강남점',
          missionTitle: 'SNS 인증 미션',
          amount: 5000,
          status: 'pending',
          requestedAt: '2025-11-10T10:00:00Z',
        },
        {
          id: '2',
          userId: 'user-2',
          userName: '김철수',
          userPhone: '010-2345-6789',
          storeName: '홍대점',
          missionTitle: '학과 시험 합격 인증',
          amount: 10000,
          status: 'pending',
          requestedAt: '2025-11-10T09:00:00Z',
        },
        {
          id: '3',
          userId: 'user-3',
          userName: '이영희',
          userPhone: '010-3456-7890',
          storeName: '강남점',
          missionTitle: '친구 추천',
          amount: 3000,
          status: 'pending',
          requestedAt: '2025-11-09T15:00:00Z',
        },
        {
          id: '4',
          userId: 'user-4',
          userName: '박민수',
          userPhone: '010-4567-8901',
          storeName: '판교점',
          missionTitle: '출석 체크',
          amount: 1000,
          status: 'approved',
          requestedAt: '2025-11-09T10:00:00Z',
          approvedAt: '2025-11-09T11:00:00Z',
        },
      ]
      setPaybacks(mockPaybacks)
    } catch (error) {
      toast.error('페이백 데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const filterPaybacks = () => {
    let filtered = paybacks

    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    if (storeFilter !== 'all') {
      filtered = filtered.filter((p) => p.storeName === storeFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.userName.toLowerCase().includes(query) ||
          p.userPhone.includes(query) ||
          p.missionTitle.toLowerCase().includes(query)
      )
    }

    setFilteredPaybacks(filtered)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPaybacks.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredPaybacks.map((p) => p.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) {
      toast.error('선택된 항목이 없습니다.')
      return
    }

    const totalAmount = filteredPaybacks
      .filter((p) => selectedIds.has(p.id))
      .reduce((sum, p) => sum + p.amount, 0)

    if (!confirm(`${selectedIds.size}건 (총 ${totalAmount.toLocaleString()}원)을 승인하시겠습니까?`)) {
      return
    }

    try {
      setPaybacks((prev) =>
        prev.map((p) =>
          selectedIds.has(p.id)
            ? { ...p, status: 'approved' as const, approvedAt: new Date().toISOString() }
            : p
        )
      )
      setSelectedIds(new Set())
      toast.success(`${selectedIds.size}건이 승인되었습니다.`)
    } catch (error) {
      toast.error('승인 처리 중 오류가 발생했습니다.')
    }
  }

  const handleExcelDownload = () => {
    toast.success('엑셀 파일 다운로드 준비 중...')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">대기 중</Badge>
      case 'approved':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">승인됨</Badge>
      case 'paid':
        return <Badge className="bg-green-50 text-green-700 border-green-200">지급 완료</Badge>
      case 'rejected':
        return <Badge className="bg-red-50 text-red-700 border-red-200">거부됨</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const selectedTotal = filteredPaybacks
    .filter((p) => selectedIds.has(p.id))
    .reduce((sum, p) => sum + p.amount, 0)

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
        <h1 className="text-3xl font-bold text-gray-900">페이백 일괄 처리</h1>
        <p className="text-gray-600 mt-2">페이백 신청을 검토하고 일괄 승인하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">대기 중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {paybacks.filter((p) => p.status === 'pending').length}건
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">승인됨</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {paybacks.filter((p) => p.status === 'approved').length}건
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">지급 완료</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {paybacks.filter((p) => p.status === 'paid').length}건
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 지급액</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {paybacks.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}원
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>검색</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="사용자명, 전화번호..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>상태</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pending">대기 중</SelectItem>
                  <SelectItem value="approved">승인됨</SelectItem>
                  <SelectItem value="paid">지급 완료</SelectItem>
                  <SelectItem value="rejected">거부됨</SelectItem>
                </SelectContent>
              </Select>
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

            <div className="flex items-end">
              <Button variant="outline" onClick={loadPaybacks} className="w-full">
                <RotateCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedIds.size > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-blue-900">
                  {selectedIds.size}건 선택됨
                </span>
                <span className="text-blue-700 ml-3">
                  총 {selectedTotal.toLocaleString()}원
                </span>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleBulkApprove} className="bg-blue-600 hover:bg-blue-700">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  일괄 승인
                </Button>
                <Button variant="outline" onClick={handleExcelDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  엑셀 다운로드
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>페이백 목록</CardTitle>
          <CardDescription>총 {filteredPaybacks.length}건</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.size === filteredPaybacks.length && filteredPaybacks.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>사용자</TableHead>
                <TableHead>지점</TableHead>
                <TableHead>미션</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>신청일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPaybacks.map((payback) => (
                <TableRow key={payback.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(payback.id)}
                      onCheckedChange={() => toggleSelect(payback.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{payback.userName}</div>
                      <div className="text-sm text-gray-500">{payback.userPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{payback.storeName}</TableCell>
                  <TableCell>{payback.missionTitle}</TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {payback.amount.toLocaleString()}원
                  </TableCell>
                  <TableCell>{getStatusBadge(payback.status)}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(payback.requestedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPaybacks.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">페이백 데이터가 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
