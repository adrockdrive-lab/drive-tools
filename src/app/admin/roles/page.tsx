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
import { adminService } from '@/lib/services/admin'
import { supabase } from '@/lib/supabase'
import type { UserRole, UserWithRoles } from '@/types'
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

export default function AdminRolesPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserWithRoles[]>([])
  const [roles, setRoles] = useState<UserRole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [adminId, setAdminId] = useState<string>('')

  // TanStack Table 상태
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  useEffect(() => {
    checkUserPermission()
    loadData()
  }, [])

  const checkUserPermission = async () => {
    try {
      const currentAdmin = adminService.getCurrentAdmin()
      if (!currentAdmin) {
        toast.error('로그인이 필요합니다.')
        router.push('/admin/login')
        return
      }

      setAdminId(currentAdmin.id)

      // 슈퍼관리자는 모든 권한을 가짐
      if (currentAdmin.name === '슈퍼관리자') {
        return
      }

      // 다른 관리자들은 기본적으로 역할 관리 권한을 가짐 (임시)
    } catch (error) {
      console.error('Permission check error:', error)
      toast.error('권한 확인에 실패했습니다.')
      router.push('/admin/dashboard')
    }
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      // 역할 목록 조회
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('name')

      if (rolesError) throw rolesError
      setRoles(rolesData)

      // 사용자 목록 조회 (역할 포함)
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          *,
          user_role_assignments!user_role_assignments_user_id_fkey(
            role_id,
            is_active,
            user_roles!inner(
              name,
              display_name
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // 사용자 데이터 가공
      const processedUsers: UserWithRoles[] = usersData.map((user: any) => ({
        ...user,
        roles: user.user_role_assignments
          .filter((assignment: any) => assignment.is_active)
          .map((assignment: any) => assignment.user_roles)
      }))

      setUsers(processedUsers)
    } catch (error) {
      console.error('Load data error:', error)
      toast.error('데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    try {
      // 기존 역할 비활성화
      await supabase
        .from('user_role_assignments')
        .update({ is_active: false })
        .eq('user_id', userId)

      // 새 역할 할당
      const { error } = await supabase
        .from('user_role_assignments')
        .insert({
          user_id: userId,
          role_id: newRoleId,
          is_active: true
        })

      if (error) throw error

      toast.success('사용자 역할이 변경되었습니다.')
      loadData()
    } catch (error) {
      console.error('Role change error:', error)
      toast.error('역할 변경에 실패했습니다.')
    }
  }

  const getRoleBadge = (roleName: string) => {
    const roleColors: Record<string, string> = {
      super_admin: 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200',
      branch_manager: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200',
      store_manager: 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200',
      customer: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border border-gray-200'
    }

    const roleNames: Record<string, string> = {
      super_admin: '슈퍼 관리자',
      branch_manager: '지점장',
      store_manager: '매장 매니저',
      customer: '고객'
    }

    return (
      <Badge className={`${roleColors[roleName] || 'bg-gray-50 text-gray-600 border border-gray-200'} px-3 py-1 text-sm font-medium rounded-full`}>
        {roleNames[roleName] || roleName}
      </Badge>
    )
  }

  // TanStack Table 컬럼 정의
  const columns: ColumnDef<UserWithRoles>[] = [
    {
      accessorKey: 'name',
      header: '사용자',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.name}</div>
          <div className="text-sm text-gray-500">{row.original.id.substring(0, 8)}...</div>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: '전화번호',
      cell: ({ row }) => (
        <span className="text-gray-700">{row.original.phone}</span>
      ),
    },
    {
      accessorKey: 'roles',
      header: '현재 역할',
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.roles.map((role) => (
            <div key={role.id}>
              {getRoleBadge(role.name)}
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'roleChange',
      header: '역할 변경',
      cell: ({ row }) => {
        const isCustomer = row.original.roles.some(role => role.name === 'customer')
        return isCustomer ? (
          <div className="text-sm text-gray-500 italic bg-gray-100 px-3 py-1 rounded-md">
            고객 전용
          </div>
        ) : (
          <Select
            value={row.original.roles[0]?.id || ''}
            onValueChange={(value) => handleRoleChange(row.original.id, value)}
          >
            <SelectTrigger className="w-40 border-gray-300 text-gray-900 bg-white hover:bg-gray-50 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="역할 선택" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              {roles
                .filter(role => role.name !== 'customer') // 고객 역할 제외
                .map(role => (
                  <SelectItem key={role.id} value={role.id} className="hover:bg-gray-50">
                    {role.display_name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: '가입일',
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt)
        const isValidDate = !isNaN(date.getTime())

        return (
          <span className="text-gray-700">
            {isValidDate
              ? date.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              : '날짜 없음'
            }
          </span>
        )
      },
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">사용자 권한 관리</h1>
        <p className="text-gray-600">사용자별 권한 할당 및 관리</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="search" className="text-gray-700 font-medium mb-2 block">검색</Label>
              <Input
                id="search"
                placeholder="이름 또는 전화번호로 검색"
                value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn('name')?.setFilterValue(event.target.value)
                }
                className="border-gray-300 text-gray-900 bg-white focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="role-filter" className="text-gray-700 font-medium mb-2 block">역할</Label>
              <Select
                value={(table.getColumn('roles')?.getFilterValue() as string) ?? 'all'}
                onValueChange={(value) => {
                  table.getColumn('roles')?.setFilterValue(value === 'all' ? '' : value)
                }}
              >
                <SelectTrigger className="border-gray-300 text-gray-900 bg-white focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="모든 역할" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all">모든 역할</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
