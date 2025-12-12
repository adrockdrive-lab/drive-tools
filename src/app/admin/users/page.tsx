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
import type { UserData } from '@/types'
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

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [stores, setStores] = useState<any[]>([])
  const [adminId, setAdminId] = useState<string>('')
  const [isClient, setIsClient] = useState(false)

  // TanStack Table 상태
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

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

      loadUsers(currentAdmin.id)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/admin/login')
    }
  }

  const loadUsers = async (adminId: string) => {
    setIsLoading(true)
    try {
      const result = await adminService.getUsers(adminId, selectedStoreId || undefined)
      console.log('Load users result:', result)
      if (result.success && result.data) {
        console.log('Users data:', result.data)
        setUsers(result.data)
      } else {
        toast.error(result.error || '사용자 데이터를 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('Load users error:', error)
      toast.error('사용자 데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // TanStack Table 컬럼 정의
  const columns: ColumnDef<UserData>[] = [
    {
      accessorKey: 'name',
      header: '사용자',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.name}</div>
          <div className="text-sm text-gray-500">{row.original.phone}</div>
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
      accessorKey: 'missionStats',
      header: '미션 현황',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 text-xs">
            {row.original.completedMissions}/{row.original.totalMissions}
          </Badge>
          <span className="text-sm text-gray-500">
            {row.original.totalMissions > 0
              ? Math.round(row.original.completedMissions / row.original.totalMissions * 100)
              : 0}%
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'totalPayback',
      header: '총 보상',
      cell: ({ row }) => (
        <span className="text-gray-700 font-medium">
          {row.original.totalPayback ? row.original.totalPayback.toLocaleString() : '0'}원
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: '가입일',
      cell: ({ row }) => (
        <span className="text-gray-700">
          {new Date(row.original.createdAt).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '액션',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400"
          onClick={() => router.push(`/admin/users/${row.original.id}`)}
        >
          상세보기
        </Button>
      ),
    },
  ]

  // TanStack Table 설정
  const table = useReactTable({
    data: users,
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

  // 디버깅: 테이블 상태 확인
  console.log('Table columns:', columns.map(col => ({ id: col.id, accessorKey: (col as any).accessorKey })))
  console.log('Table data:', users)

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
      <Card>
        <CardHeader className="border-b">
          <CardTitle>검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="search" className="text-gray-700 font-medium mb-2 block">검색</Label>
              <Input
                id="search"
                placeholder="사용자명, 전화번호, 지점명으로 검색..."
                value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn('name')?.setFilterValue(event.target.value)
                }
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
      <Card>
        <CardHeader className="border-b">
          <CardTitle>사용자 목록</CardTitle>
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
                      사용자가 없습니다.
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
