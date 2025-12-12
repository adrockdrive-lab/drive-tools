'use client'

import PermissionGuard from '@/components/auth/PermissionGuard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { adminService } from '@/lib/services/admin'
import { DEFAULT_MISSION_FORMS, MissionDefinition, MissionDefinitionFormData, MissionType, Permission, Store } from '@/types'
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
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function MissionDefinitionsPage() {
  const [adminId, setAdminId] = useState<string>('')
  const [missionDefinitions, setMissionDefinitions] = useState<MissionDefinition[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMission, setEditingMission] = useState<MissionDefinition | null>(null)
  const [formData, setFormData] = useState<MissionDefinitionFormData>({
    title: '',
    description: '',
    missionType: 'challenge',
    rewardAmount: 0,
    isGlobal: true,
    storeId: null,
    maxParticipants: undefined,
    startDate: '',
    endDate: ''
  })

  // TanStack Table 상태
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  useEffect(() => {
    const admin = adminService.getCurrentAdmin()
    if (admin) {
      setAdminId(admin.id)
      loadMissionDefinitions()
    }
  }, [])

  useEffect(() => {
    if (adminId) {
      loadStores()
    }
  }, [adminId])

  const loadMissionDefinitions = async () => {
    try {
      setLoading(true)
      const result = await adminService.getMissionDefinitions()
      if (result.success && result.data) {
        setMissionDefinitions(result.data)
      } else {
        toast.error(result.error || '미션 정의를 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('Load mission definitions error:', error)
      toast.error('미션 정의를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const loadStores = async () => {
    try {
      const currentAdmin = adminService.getCurrentAdmin()
      if (!currentAdmin) return

      let result

      // 역할에 따라 지점 목록 결정
      if (currentAdmin.role === 'super_admin') {
        // 슈퍼 관리자는 모든 지점 접근 가능
        result = await adminService.getAllStores()
      } else {
        // 지점장, 매장 매니저는 할당된 지점만 접근 가능
        result = await adminService.getAdminStores(currentAdmin.id)
      }

      if (result.success && result.stores) {
        setStores(result.stores)
      }
    } catch (error) {
      console.error('Load stores error:', error)
      toast.error('지점 목록을 불러오는데 실패했습니다.')
    }
  }

  const handleCreateMission = async () => {
    try {
      const result = await adminService.createMissionDefinition(formData)
      if (result.success) {
        toast.success('미션이 생성되었습니다.')
        setIsCreateDialogOpen(false)
        setFormData({
          title: '',
          description: '',
          missionType: 'challenge',
          rewardAmount: 0,
          isGlobal: true,
          storeId: null,
          maxParticipants: undefined,
          startDate: '',
          endDate: ''
        })
        loadMissionDefinitions()
      } else {
        toast.error(result.error || '미션 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('Create mission error:', error)
      toast.error('미션 생성에 실패했습니다.')
    }
  }

  const handleUpdateMission = async () => {
    if (!editingMission) return

    try {
      const result = await adminService.updateMissionDefinition(editingMission.id, formData)
      if (result.success) {
        toast.success('미션이 수정되었습니다.')
        setIsEditDialogOpen(false)
        setEditingMission(null)
        setFormData({
          title: '',
          description: '',
          missionType: 'challenge',
          rewardAmount: 0,
          isGlobal: true,
          storeId: null,
          maxParticipants: undefined,
          startDate: '',
          endDate: ''
        })
        loadMissionDefinitions()
      } else {
        toast.error(result.error || '미션 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('Update mission error:', error)
      toast.error('미션 수정에 실패했습니다.')
    }
  }

  const handleEditMission = (mission: MissionDefinition) => {
    setEditingMission(mission)
    setFormData({
      title: mission.title,
      description: mission.description || '',
      missionType: mission.missionType,
      rewardAmount: mission.rewardAmount,
      isGlobal: mission.isGlobal || true,
      storeId: mission.storeId,
      maxParticipants: mission.maxParticipants,
      startDate: mission.startDate || '',
      endDate: mission.endDate || ''
    })
    setIsEditDialogOpen(true)
  }

  const handleMissionTypeChange = (missionType: MissionType) => {
    setFormData(prev => ({
      ...prev,
      missionType,
      rewardAmount: DEFAULT_MISSION_FORMS[missionType]?.maxRewardAmount || 0
    }))
  }

  const columns: ColumnDef<MissionDefinition>[] = [
    {
      accessorKey: 'title',
      header: '미션명',
      cell: ({ row }) => <div className="font-medium">{row.getValue('title')}</div>
    },
    {
      accessorKey: 'missionType',
      header: '타입',
      cell: ({ row }) => {
        const type = row.getValue('missionType') as string
        const typeNames: Record<string, string> = {
          challenge: '재능충',
          sns: 'SNS',
          review: '후기',
          referral: '추천',
          attendance: '출석',
          challenge_enhanced: '재능충+',
          sns_enhanced: 'SNS+',
          review_enhanced: '후기+',
          referral_enhanced: '추천+'
        }
        return <Badge variant="outline">{typeNames[type] || type}</Badge>
      }
    },
    {
      accessorKey: 'rewardAmount',
      header: '보상금',
      cell: ({ row }) => <div>{row.getValue('rewardAmount')}원</div>
    },
    {
      accessorKey: 'isGlobal',
      header: '범위',
      cell: ({ row }) => {
        const isGlobal = row.getValue('isGlobal') as boolean
        return <Badge variant={isGlobal ? 'default' : 'secondary'}>
          {isGlobal ? '전국' : '특정지점'}
        </Badge>
      }
    },
    {
      accessorKey: 'isActive',
      header: '상태',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean
        return <Badge variant={isActive ? 'default' : 'destructive'}>
          {isActive ? '활성' : '비활성'}
        </Badge>
      }
    },
    {
      id: 'actions',
      header: '작업',
      cell: ({ row }) => {
        const mission = row.original
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditMission(mission)}
            >
              수정
            </Button>
          </div>
        )
      }
    }
  ]

  const table = useReactTable({
    data: missionDefinitions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters
    }
  })

  if (loading) {
    return (
      <PermissionGuard requiredPermissions={['missions:view', 'missions:create'] as unknown as Permission[]}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </PermissionGuard>
    )
  }

  return (
    <PermissionGuard requiredPermissions={['missions:view', 'missions:create'] as unknown as Permission[]}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">미션 정의 관리</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            새 미션 생성
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>미션 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
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
          </CardContent>
        </Card>

        {/* 미션 생성 다이얼로그 */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 미션 생성</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">미션명</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="미션명을 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="미션 설명을 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="missionType">미션 타입</Label>
                <Select
                  value={formData.missionType}
                  onValueChange={(value: MissionType) => handleMissionTypeChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="challenge">재능충 (최대 2만원)</SelectItem>
                    <SelectItem value="sns">SNS 인증 (최대 1만원)</SelectItem>
                    <SelectItem value="review">후기 커피쿠폰 (최대 3잔)</SelectItem>
                    <SelectItem value="referral">친구추천 (최대 15만원)</SelectItem>
                    <SelectItem value="attendance">출석 (최대 5천원)</SelectItem>
                    <SelectItem value="challenge_enhanced">재능충+ (최대 2.5만원)</SelectItem>
                    <SelectItem value="sns_enhanced">SNS 인증+ (최대 1.5만원)</SelectItem>
                    <SelectItem value="review_enhanced">후기+ (최대 4만원)</SelectItem>
                    <SelectItem value="referral_enhanced">친구추천+ (최대 20만원)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="rewardAmount">보상금 (원)</Label>
                <Input
                  id="rewardAmount"
                  type="number"
                  value={formData.rewardAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, rewardAmount: parseInt(e.target.value) || 0 }))}
                  placeholder="보상금을 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="isGlobal">미션 범위</Label>
                <Select
                  value={formData.isGlobal ? 'global' : 'store'}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    isGlobal: value === 'global',
                    storeId: value === 'global' ? null : prev.storeId
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">전국 (모든 지점)</SelectItem>
                    <SelectItem value="store">특정 지점</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!formData.isGlobal && (
                <div>
                  <Label htmlFor="storeId">지점 선택</Label>
                  <Select
                    value={formData.storeId?.toString() || ''}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, storeId: parseInt(value) || null }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="지점을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id.toString()}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button onClick={handleCreateMission} className="flex-1">
                  생성하기
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 미션 수정 다이얼로그 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>미션 수정</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">미션명</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="미션명을 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="edit-description">설명</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="미션 설명을 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="edit-missionType">미션 타입</Label>
                <Select
                  value={formData.missionType}
                  onValueChange={(value: MissionType) => handleMissionTypeChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="challenge">재능충 (최대 2만원)</SelectItem>
                    <SelectItem value="sns">SNS 인증 (최대 1만원)</SelectItem>
                    <SelectItem value="review">후기 커피쿠폰 (최대 3잔)</SelectItem>
                    <SelectItem value="referral">친구추천 (최대 15만원)</SelectItem>
                    <SelectItem value="attendance">출석 (최대 5천원)</SelectItem>
                    <SelectItem value="challenge_enhanced">재능충+ (최대 2.5만원)</SelectItem>
                    <SelectItem value="sns_enhanced">SNS 인증+ (최대 1.5만원)</SelectItem>
                    <SelectItem value="review_enhanced">후기+ (최대 4만원)</SelectItem>
                    <SelectItem value="referral_enhanced">친구추천+ (최대 20만원)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-rewardAmount">보상금 (원)</Label>
                <Input
                  id="edit-rewardAmount"
                  type="number"
                  value={formData.rewardAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, rewardAmount: parseInt(e.target.value) || 0 }))}
                  placeholder="보상금을 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="edit-isGlobal">미션 범위</Label>
                <Select
                  value={formData.isGlobal ? 'global' : 'store'}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    isGlobal: value === 'global',
                    storeId: value === 'global' ? null : prev.storeId
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">전국 (모든 지점)</SelectItem>
                    <SelectItem value="store">특정 지점</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!formData.isGlobal && (
                <div>
                  <Label htmlFor="edit-storeId">지점 선택</Label>
                  <Select
                    value={formData.storeId?.toString() || ''}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, storeId: parseInt(value) || null }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="지점을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id.toString()}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button onClick={handleUpdateMission} className="flex-1">
                  수정하기
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  )
}
