'use client'

import { Badge } from '@/components/ui/badge'
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
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function AdminRolesPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserWithRoles[]>([])
  const [roles, setRoles] = useState<UserRole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [hasPermission, setHasPermission] = useState(false)
  const [adminId, setAdminId] = useState<string>('')

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
        setHasPermission(true)
        return
      }

      // 다른 관리자들은 기본적으로 역할 관리 권한을 가짐 (임시)
      setHasPermission(true)
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

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm)

    const matchesRole = selectedRole === 'all' ||
      user.roles.some(role => role.name === selectedRole)

    return matchesSearch && matchesRole
  })

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

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-gray-900">권한 없음</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">역할 관리 권한이 없습니다.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">사용자 역할 관리</h1>
        <p className="text-gray-600">사용자별 역할을 관리하고 권한을 설정합니다.</p>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-gray-800 text-lg font-semibold">필터</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="search" className="text-gray-700 font-medium mb-2 block">검색</Label>
              <Input
                id="search"
                placeholder="이름 또는 전화번호로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-gray-300 text-gray-900 bg-white focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="role-filter" className="text-gray-700 font-medium mb-2 block">역할</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
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
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-gray-800 text-lg font-semibold">사용자 목록</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-300 text-6xl mb-4">👥</div>
              <p className="text-gray-500">사용자가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="text-gray-700 font-semibold py-4">사용자</TableHead>
                    <TableHead className="text-gray-700 font-semibold py-4">전화번호</TableHead>
                    <TableHead className="text-gray-700 font-semibold py-4">현재 역할</TableHead>
                    <TableHead className="text-gray-700 font-semibold py-4">역할 변경</TableHead>
                    <TableHead className="text-gray-700 font-semibold py-4">가입일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50 border-b border-gray-100">
                      <TableCell className="py-4">
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.id}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 py-4">{user.phone}</TableCell>
                      <TableCell className="py-4">
                        <div className="flex gap-2">
                          {user.roles.map((role) => (
                            <div key={role.id}>
                              {getRoleBadge(role.name)}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {user.roles.some(role => role.name === 'customer') ? (
                          <div className="text-sm text-gray-500 italic bg-gray-100 px-3 py-1 rounded-md">
                            고객 전용
                          </div>
                        ) : (
                          <Select
                            value={user.roles[0]?.id || ''}
                            onValueChange={(value) => handleRoleChange(user.id, value)}
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
                        )}
                      </TableCell>
                      <TableCell className="text-gray-700 py-4">
                        {new Date(user.created_at).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
