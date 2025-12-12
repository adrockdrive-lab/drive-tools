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
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function AdminMissionsPage() {
  const router = useRouter()
  const [missions, setMissions] = useState<UserMissionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [stores, setStores] = useState<{ id: number; name: string }[]>([])
  const [adminId, setAdminId] = useState<string>('')

  // TanStack Table 상태
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  useEffect(() => {
    checkAdminAuth()
  }, [router])

  const checkAdminAuth = async () => {
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
        // 슈퍼 관리자는 모든 지점 접근 가능
        storesResult = await adminService.getAllStores()
      } else {
        // 지점장, 매장 매니저는 할당된 지점만 접근 가능
        storesResult = await adminService.getAdminStores(currentAdmin.id)
      }

      if (storesResult.success && storesResult.stores) {
        setStores(storesResult.stores)
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
      const result = await adminService.updateMissionStatus(missionId, newStatus as 'pending' | 'in_progress' | 'completed' | 'verified', adminId)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-1 text-xs rounded-full">대기중</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 text-xs rounded-full">진행중</Badge>
      case 'completed':
        return <Badge className="bg-green-50 text-green-700 border border-green-200 px-2 py-1 text-xs rounded-full">완료</Badge>
      case 'verified':
        return <Badge className="bg-green-50 text-green-700 border border-green-200 px-2 py-1 text-xs rounded-full">승인됨</Badge>
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

  // TanStack Table 컬럼 정의
  const columns: ColumnDef<UserMissionData>[] = [
    {
      accessorKey: 'userName',
      header: '사용자',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.userName}</div>
          <div className="text-sm text-gray-500">{row.original.userPhone}</div>
        </div>
      ),
    },
    {
      accessorKey: 'storeName',
      header: '지점',
      cell: ({ row }) => (
        <span className="text-gray-700">{row.original.storeName}</span>
      ),
    },
    {
      accessorKey: 'missionTitle',
      header: '미션',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.missionTitle}</div>
          <div className="mt-1">{getMissionTypeBadge(row.original.missionType)}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'startedAt',
      header: '시작일',
      cell: ({ row }) => (
        <span className="text-gray-700">{formatDate(row.original.startedAt)}</span>
      ),
    },
    {
      accessorKey: 'completedAt',
      header: '완료일',
      cell: ({ row }) => (
        <span className="text-gray-700">{formatDate(row.original.completedAt)}</span>
      ),
    },
    {
      accessorKey: 'rewardAmount',
      header: '보상',
      cell: ({ row }) => (
        <span className="text-gray-700 font-medium">
          {row.original.rewardAmount ? row.original.rewardAmount.toLocaleString() : '0'}원
        </span>
      ),
    },
    {
      id: 'actions',
      header: '액션',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400"
            onClick={() => router.push(`/admin/missions/${row.original.id}`)}
          >
            상세보기
          </Button>
          <select
            value={row.original.status}
            onChange={(e) => handleStatusChange(row.original.id, e.target.value)}
            className="text-xs px-2 py-1 border border-gray-300 rounded bg-white text-gray-700 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="pending">대기중</option>
            <option value="in_progress">진행중</option>
            <option value="completed">완료</option>
            <option value="verified">승인됨</option>
          </select>
        </div>
      ),
    },
  ]

  // TanStack Table 설정
  const table = useReactTable({
    data: missions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  })

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">미션 관리</h1>
          <p className="text-gray-600">사용자별 미션 진행 현황</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/missions/definitions')}
          >
            미션 정의 관리
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 미션</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missionStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">대기중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missionStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">진행중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missionStats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">완료</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missionStats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <Label htmlFor="search" className="text-gray-700 font-medium mb-2 block">검색</Label>
              <Input
                id="search"
                placeholder="사용자명, 전화번호, 미션명, 지점명으로 검색..."
                value={(table.getColumn('userName')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn('userName')?.setFilterValue(event.target.value)
                }
                className="border-gray-300 text-gray-900 bg-white focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="status" className="text-gray-700 font-medium mb-2 block">상태 필터</Label>
              <select
                id="status"
                value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'}
                onChange={(e) => {
                  const value = e.target.value
                  table.getColumn('status')?.setFilterValue(value === 'all' ? '' : value)
                }}
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
      <Card>
        <CardHeader className="border-b">
          <CardTitle>미션 목록</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-gray-50 hover:bg-gray-50">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-gray-700 font-semibold py-4 cursor-pointer hover:bg-gray-100"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="bg-white hover:bg-gray-50 border-b border-gray-100"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      미션이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4 px-6 border-t border-gray-200">
            <div className="flex-1 text-sm text-gray-700">
              총 {table.getFilteredRowModel().rows.length}개 중{' '}
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}개
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              >
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              >
                다음
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
