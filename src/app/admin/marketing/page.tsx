'use client'

import PermissionGuard from '@/components/auth/PermissionGuard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { adminService } from '@/lib/services/admin'
import { marketingService } from '@/lib/services/marketing'
import type { Permission } from '@/types'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function MarketingPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rewardAmount: 0,
    startDate: '',
    endDate: '',
    storeId: null as number | null,
    isGlobal: true,
    maxParticipants: undefined as number | undefined
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // 템플릿 로드
      const eventTemplates = marketingService.getEventTemplates()
      setTemplates(eventTemplates)

      // 지점 목록 로드
      const currentAdmin = adminService.getCurrentAdmin()
      if (currentAdmin) {
        const storesResult = await adminService.getAdminStores(currentAdmin.id)
        if (storesResult.success && storesResult.stores) {
          setStores(storesResult.stores)
        }
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error)
      toast.error('데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async () => {
    if (!selectedTemplate) return

    try {
      const result = await marketingService.createEventMission(selectedTemplate.id, {
        title: formData.title || selectedTemplate.name,
        description: formData.description || selectedTemplate.description,
        rewardAmount: formData.rewardAmount || selectedTemplate.rewardAmount,
        startDate: formData.startDate,
        endDate: formData.endDate,
        storeId: formData.isGlobal ? null : formData.storeId,
        isGlobal: formData.isGlobal,
        maxParticipants: formData.maxParticipants
      })

      if (result.success) {
        toast.success('마케팅 이벤트가 생성되었습니다!')
        setIsCreateDialogOpen(false)
        resetForm()
      } else {
        toast.error(result.error || '이벤트 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('이벤트 생성 오류:', error)
      toast.error('이벤트 생성에 실패했습니다.')
    }
  }

  const handleCreateSeasonalEvent = async () => {
    try {
      const result = await marketingService.createSeasonalEvents()
      if (result.success) {
        toast.success('계절별 이벤트가 생성되었습니다!')
      } else {
        toast.error(result.error || '계절별 이벤트 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('계절별 이벤트 생성 오류:', error)
      toast.error('계절별 이벤트 생성에 실패했습니다.')
    }
  }

  const handleCreateWeekendEvent = async () => {
    try {
      const result = await marketingService.createWeekendEvents()
      if (result.success) {
        toast.success('주말 이벤트가 생성되었습니다!')
      } else {
        toast.error(result.error || '주말 이벤트 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('주말 이벤트 생성 오류:', error)
      toast.error('주말 이벤트 생성에 실패했습니다.')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      rewardAmount: 0,
      startDate: '',
      endDate: '',
      storeId: null,
      isGlobal: true,
      maxParticipants: undefined
    })
    setSelectedTemplate(null)
  }

  const openCreateDialog = (template: any) => {
    setSelectedTemplate(template)
    setFormData({
      title: template.name,
      description: template.description,
      rewardAmount: template.rewardAmount,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + template.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      storeId: null,
      isGlobal: true,
      maxParticipants: undefined
    })
    setIsCreateDialogOpen(true)
  }

  if (loading) {
    return (
      <PermissionGuard requiredPermissions={['missions:view', 'missions:create'] as Permission[]}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </PermissionGuard>
    )
  }

  return (
    <PermissionGuard requiredPermissions={['missions:view', 'missions:create'] as Permission[]}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">마케팅 이벤트 관리</h1>
          <div className="flex space-x-2">
            <Button onClick={handleCreateSeasonalEvent} variant="outline">
              🌸 계절 이벤트 생성
            </Button>
            <Button onClick={handleCreateWeekendEvent} variant="outline">
              📱 주말 이벤트 생성
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>빠른 자동화 도구</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleCreateSeasonalEvent}>
                <CardContent className="text-center py-6">
                  <div className="text-4xl mb-2">🌸</div>
                  <h3 className="font-semibold">계절별 자동 이벤트</h3>
                  <p className="text-sm text-muted-foreground">현재 계절에 맞는 이벤트 자동 생성</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleCreateWeekendEvent}>
                <CardContent className="text-center py-6">
                  <div className="text-4xl mb-2">📅</div>
                  <h3 className="font-semibold">주말 특별 이벤트</h3>
                  <p className="text-sm text-muted-foreground">매주 금요일 자동 생성되는 주말 이벤트</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="text-center py-6">
                  <div className="text-4xl mb-2">🎯</div>
                  <h3 className="font-semibold">맞춤 이벤트 분석</h3>
                  <p className="text-sm text-muted-foreground">사용자 데이터 기반 최적 이벤트 추천</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>마케팅 이벤트 템플릿</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="outline">
                        {template.duration}일
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {template.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>미션 타입:</span>
                        <Badge variant="secondary">{template.missionType}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>기본 보상:</span>
                        <span className="font-semibold">{template.rewardAmount.toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>입력 필드:</span>
                        <span>{template.formFields.length}개</span>
                      </div>
                      {template.couponReward && (
                        <div className="flex justify-between text-sm">
                          <span>추가 쿠폰:</span>
                          <Badge variant="outline">{template.couponReward.type}</Badge>
                        </div>
                      )}
                    </div>

                    <Button 
                      onClick={() => openCreateDialog(template)}
                      className="w-full"
                    >
                      이벤트 생성하기
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 이벤트 생성 다이얼로그 */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedTemplate ? selectedTemplate.name : '이벤트'} 생성
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <Label htmlFor="title">이벤트 제목</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="이벤트 제목을 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="description">이벤트 설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="이벤트 설명을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rewardAmount">보상금액 (원)</Label>
                  <Input
                    id="rewardAmount"
                    type="number"
                    value={formData.rewardAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, rewardAmount: parseInt(e.target.value) || 0 }))}
                    placeholder="보상금액"
                  />
                </div>

                <div>
                  <Label htmlFor="maxParticipants">최대 참가자 (선택)</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={formData.maxParticipants || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      maxParticipants: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="제한 없음"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">시작일</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">종료일</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="scope">적용 범위</Label>
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
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      storeId: parseInt(value) || null 
                    }))}
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
                <Button onClick={handleCreateEvent} className="flex-1">
                  이벤트 생성하기
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    resetForm()
                  }}
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