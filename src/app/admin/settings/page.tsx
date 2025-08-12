'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building, Save, Shield, User } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface AdminSettings {
  name: string
  email: string
  storeName: string
  role: string
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
  autoApprove: boolean
  maxPaybackAmount: number
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>({
    name: '관리자',
    email: 'admin@example.com',
    storeName: '강남지점',
    role: 'admin',
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    autoApprove: false,
    maxPaybackAmount: 50000
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('설정이 저장되었습니다.')
    } catch (error) {
      toast.error('설정 저장에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationChange = (type: keyof AdminSettings['notifications']) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">설정</h1>
        <p className="text-muted-foreground">관리자 계정 및 시스템 설정</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card className="gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-black flex items-center gap-2">
              <User className="h-5 w-5" />
              프로필 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-black">이름</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                className="bg-secondary/50 border-border text-black"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-black">이메일</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                className="bg-secondary/50 border-border text-black"
              />
            </div>
            <div>
              <Label htmlFor="storeName" className="text-black">담당 지점</Label>
              <Input
                id="storeName"
                value={settings.storeName}
                disabled
                className="bg-secondary/30 border-border text-muted-foreground"
              />
            </div>
            <div>
              <Label htmlFor="role" className="text-black">권한</Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{settings.role === 'admin' ? '관리자' : '슈퍼 관리자'}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Store Settings */}
        <Card className="gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-black flex items-center gap-2">
              <Building className="h-5 w-5" />
              지점 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="maxPaybackAmount" className="text-black">최대 페이백 금액</Label>
              <Input
                id="maxPaybackAmount"
                type="number"
                value={settings.maxPaybackAmount}
                onChange={(e) => setSettings(prev => ({ ...prev, maxPaybackAmount: parseInt(e.target.value) || 0 }))}
                className="bg-secondary/50 border-border text-black"
              />
              <p className="text-xs text-muted-foreground mt-1">
                한 번에 승인할 수 있는 최대 페이백 금액을 설정합니다.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoApprove"
                checked={settings.autoApprove}
                onChange={(e) => setSettings(prev => ({ ...prev, autoApprove: e.target.checked }))}
                className="rounded border-border bg-secondary"
              />
              <Label htmlFor="autoApprove" className="text-black">자동 승인 활성화</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              자동 승인이 활성화되면 특정 조건의 미션은 자동으로 승인됩니다.
            </p>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-black flex items-center gap-2">
              <Shield className="h-5 w-5" />
              알림 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emailNotif"
                  checked={settings.notifications.email}
                  onChange={() => handleNotificationChange('email')}
                  className="rounded border-border bg-secondary"
                />
                <Label htmlFor="emailNotif" className="text-black">이메일 알림</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="smsNotif"
                  checked={settings.notifications.sms}
                  onChange={() => handleNotificationChange('sms')}
                  className="rounded border-border bg-secondary"
                />
                <Label htmlFor="smsNotif" className="text-black">SMS 알림</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pushNotif"
                  checked={settings.notifications.push}
                  onChange={() => handleNotificationChange('push')}
                  className="rounded border-border bg-secondary"
                />
                <Label htmlFor="pushNotif" className="text-black">푸시 알림</Label>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              새로운 미션 완료, 페이백 요청 등에 대한 알림을 받을 방법을 선택하세요.
            </p>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-black">시스템 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">시스템 버전</span>
                <span className="text-black">v1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">마지막 업데이트</span>
                <span className="text-black">2025-01-15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">데이터베이스</span>
                <span className="text-black">Supabase</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">서버 상태</span>
                <Badge variant="default">정상</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90"
        >
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? '저장 중...' : '설정 저장'}
        </Button>
      </div>
    </div>
  )
}
