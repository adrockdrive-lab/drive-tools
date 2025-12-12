'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import {
  CheckCircle2,
  Edit,
  Plus,
  Shield,
  Trash2,
  X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface Permission {
  resource: string
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
}

interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  userCount: number
}

export default function RolesPage() {
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'Super Admin',
      description: '모든 권한 보유',
      permissions: [
        { resource: 'users', create: true, read: true, update: true, delete: true },
        { resource: 'missions', create: true, read: true, update: true, delete: true },
        { resource: 'paybacks', create: true, read: true, update: true, delete: true },
        { resource: 'reports', create: true, read: true, update: true, delete: true },
      ],
      userCount: 2,
    },
    {
      id: '2',
      name: 'Admin',
      description: '지점 관리자',
      permissions: [
        { resource: 'users', create: false, read: true, update: true, delete: false },
        { resource: 'missions', create: true, read: true, update: true, delete: false },
        { resource: 'paybacks', create: false, read: true, update: true, delete: false },
        { resource: 'reports', create: false, read: true, update: true, delete: false },
      ],
      userCount: 5,
    },
    {
      id: '3',
      name: 'Staff',
      description: '일반 직원',
      permissions: [
        { resource: 'users', create: false, read: true, update: false, delete: false },
        { resource: 'missions', create: false, read: true, update: false, delete: false },
        { resource: 'paybacks', create: false, read: true, update: true, delete: false },
        { resource: 'reports', create: false, read: true, update: false, delete: false },
      ],
      userCount: 12,
    },
  ])

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const resources = [
    { id: 'users', name: '사용자 관리' },
    { id: 'missions', name: '미션 관리' },
    { id: 'paybacks', name: '페이백 관리' },
    { id: 'reports', name: '신고 관리' },
    { id: 'analytics', name: '통계 분석' },
    { id: 'settings', name: '설정' },
  ]

  const actions = [
    { id: 'create', name: '생성' },
    { id: 'read', name: '조회' },
    { id: 'update', name: '수정' },
    { id: 'delete', name: '삭제' },
  ]

  const openEditDialog = (role: Role) => {
    setSelectedRole(role)
    setEditDialogOpen(true)
  }

  const handleSave = () => {
    if (!selectedRole) return

    setRoles(roles.map((r) => (r.id === selectedRole.id ? selectedRole : r)))
    toast.success('권한이 업데이트되었습니다.')
    setEditDialogOpen(false)
  }

  const togglePermission = (resource: string, action: keyof Permission) => {
    if (!selectedRole) return

    setSelectedRole({
      ...selectedRole,
      permissions: selectedRole.permissions.map((p) =>
        p.resource === resource ? { ...p, [action]: !p[action] } : p
      ),
    })
  }

  const hasPermission = (resource: string, action: keyof Permission): boolean => {
    if (!selectedRole) return false
    const perm = selectedRole.permissions.find((p) => p.resource === resource)
    return perm ? perm[action] : false
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">권한 관리</h1>
          <p className="text-gray-600 mt-2">역할별 권한을 설정하세요</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          역할 추가
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                  </div>
                  <CardDescription>{role.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-2">권한 요약</div>
                <div className="space-y-1">
                  {role.permissions.slice(0, 3).map((perm) => (
                    <div key={perm.resource} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 capitalize">{perm.resource}</span>
                      <div className="flex space-x-1">
                        {perm.create && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        {perm.read && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                        {perm.update && <CheckCircle2 className="h-4 w-4 text-yellow-600" />}
                        {perm.delete && <CheckCircle2 className="h-4 w-4 text-red-600" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">사용자 수</span>
                  <Badge className="bg-blue-50 text-blue-700">{role.userCount}명</Badge>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEditDialog(role)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    편집
                  </Button>
                  {role.id !== '1' && (
                    <Button size="sm" variant="outline" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>권한 매트릭스</CardTitle>
          <CardDescription>역할별 세부 권한 현황</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>역할</TableHead>
                {resources.map((resource) => (
                  <TableHead key={resource.id} className="text-center">
                    {resource.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  {resources.map((resource) => {
                    const perm = role.permissions.find((p) => p.resource === resource.id)
                    const permCount = perm
                      ? [perm.create, perm.read, perm.update, perm.delete].filter(Boolean).length
                      : 0

                    return (
                      <TableCell key={resource.id} className="text-center">
                        <Badge
                          className={
                            permCount === 4
                              ? 'bg-green-50 text-green-700'
                              : permCount >= 2
                              ? 'bg-blue-50 text-blue-700'
                              : permCount >= 1
                              ? 'bg-yellow-50 text-yellow-700'
                              : 'bg-gray-50 text-gray-700'
                          }
                        >
                          {permCount}/4
                        </Badge>
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedRole?.name} 권한 편집</DialogTitle>
            <DialogDescription>세부 권한을 설정하세요</DialogDescription>
          </DialogHeader>

          {selectedRole && (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>리소스</TableHead>
                    {actions.map((action) => (
                      <TableHead key={action.id} className="text-center">
                        {action.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">{resource.name}</TableCell>
                      {actions.map((action) => (
                        <TableCell key={action.id} className="text-center">
                          <Checkbox
                            checked={hasPermission(resource.id, action.id as keyof Permission)}
                            onCheckedChange={() =>
                              togglePermission(resource.id, action.id as keyof Permission)
                            }
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-900 mb-1">권한 설명</div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 생성: 새로운 데이터 추가</li>
                  <li>• 조회: 데이터 열람</li>
                  <li>• 수정: 기존 데이터 변경</li>
                  <li>• 삭제: 데이터 제거</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              취소
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
