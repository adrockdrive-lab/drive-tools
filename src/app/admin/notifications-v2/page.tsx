'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, Calendar, Clock, Send, Target, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface ScheduledNotification {
  id: string
  title: string
  message: string
  targetType: string
  scheduledAt: string
  status: 'pending' | 'sent' | 'failed'
}

export default function NotificationsV2Page() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [targetType, setTargetType] = useState('all')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [scheduled, setScheduled] = useState<ScheduledNotification[]>([
    {
      id: '1',
      title: '신규 미션 오픈',
      message: '새로운 챌린지 미션이 추가되었습니다!',
      targetType: 'all',
      scheduledAt: '2025-11-11 09:00',
      status: 'pending',
    },
    {
      id: '2',
      title: '페이백 입금 완료',
      message: '페이백이 입금되었습니다.',
      targetType: 'custom',
      scheduledAt: '2025-11-10 14:00',
      status: 'sent',
    },
  ])

  const handleSendNow = () => {
    if (!title.trim() || !message.trim()) {
      toast.error('제목과 메시지를 입력해주세요.')
      return
    }

    toast.success('알림이 발송되었습니다.')
    setTitle('')
    setMessage('')
  }

  const handleSchedule = () => {
    if (!title.trim() || !message.trim()) {
      toast.error('제목과 메시지를 입력해주세요.')
      return
    }

    if (!scheduledDate || !scheduledTime) {
      toast.error('발송 일시를 선택해주세요.')
      return
    }

    const newNotification: ScheduledNotification = {
      id: Date.now().toString(),
      title,
      message,
      targetType,
      scheduledAt: `${scheduledDate} ${scheduledTime}`,
      status: 'pending',
    }

    setScheduled([newNotification, ...scheduled])
    toast.success('알림이 예약되었습니다.')
    setTitle('')
    setMessage('')
    setScheduledDate('')
    setScheduledTime('')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">대기 중</Badge>
      case 'sent':
        return <Badge className="bg-green-50 text-green-700 border-green-200">발송 완료</Badge>
      case 'failed':
        return <Badge className="bg-red-50 text-red-700 border-red-200">실패</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTargetBadge = (type: string) => {
    switch (type) {
      case 'all':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">전체 사용자</Badge>
      case 'store':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">특정 지점</Badge>
      case 'level':
        return <Badge className="bg-green-50 text-green-700 border-green-200">특정 레벨</Badge>
      case 'custom':
        return <Badge className="bg-orange-50 text-orange-700 border-orange-200">사용자 지정</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">알림 관리</h1>
        <p className="text-gray-600 mt-2">사용자에게 푸시 알림을 발송하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">오늘 발송</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">12건</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">예약 대기</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">5건</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 발송</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">1,234건</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">평균 오픈율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">68%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList>
          <TabsTrigger value="send">알림 발송</TabsTrigger>
          <TabsTrigger value="scheduled">예약 알림</TabsTrigger>
          <TabsTrigger value="history">발송 내역</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>알림 작성</CardTitle>
                  <CardDescription>발송할 알림 내용을 입력하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>제목 *</Label>
                    <Input
                      placeholder="알림 제목을 입력하세요"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>메시지 *</Label>
                    <Textarea
                      placeholder="알림 메시지를 입력하세요"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="mt-2"
                    />
                    <div className="mt-2 text-sm text-gray-500">
                      {message.length} / 200자
                    </div>
                  </div>

                  <div>
                    <Label>대상 선택</Label>
                    <Select value={targetType} onValueChange={setTargetType}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체 사용자</SelectItem>
                        <SelectItem value="store">특정 지점</SelectItem>
                        <SelectItem value="level">특정 레벨 범위</SelectItem>
                        <SelectItem value="custom">사용자 지정</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {targetType === 'store' && (
                    <div>
                      <Label>지점 선택</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gangnam">강남점</SelectItem>
                          <SelectItem value="hongdae">홍대점</SelectItem>
                          <SelectItem value="pangyo">판교점</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {targetType === 'level' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>최소 레벨</Label>
                        <Input type="number" placeholder="1" className="mt-2" />
                      </div>
                      <div>
                        <Label>최대 레벨</Label>
                        <Input type="number" placeholder="100" className="mt-2" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>예약 발송</CardTitle>
                  <CardDescription>발송 시간을 예약할 수 있습니다</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>발송 날짜</Label>
                      <Input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>발송 시간</Label>
                      <Input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={handleSendNow} className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <Send className="h-4 w-4 mr-2" />
                      즉시 발송
                    </Button>
                    <Button onClick={handleSchedule} variant="outline" className="flex-1">
                      <Clock className="h-4 w-4 mr-2" />
                      예약 발송
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>미리보기</CardTitle>
                  <CardDescription>사용자에게 표시될 모습</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bell className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 mb-1">
                          {title || '알림 제목'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {message || '알림 메시지가 여기에 표시됩니다'}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">방금 전</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-900 mb-1">예상 도달</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {targetType === 'all' ? '1,234' : '0'}명
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>발송 팁</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <Target className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
                    <p>명확하고 간결한 제목을 사용하세요</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Users className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
                    <p>타겟을 명확히 설정하세요</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
                    <p>오전 10시, 오후 7시가 오픈율이 높습니다</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>예약된 알림 ({scheduled.filter(s => s.status === 'pending').length}건)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduled.filter(s => s.status === 'pending').map((notif) => (
                  <div
                    key={notif.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{notif.title}</div>
                      <div className="text-sm text-gray-600 mb-2">{notif.message}</div>
                      <div className="flex items-center space-x-2">
                        {getTargetBadge(notif.targetType)}
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {notif.scheduledAt}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">수정</Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        취소
                      </Button>
                    </div>
                  </div>
                ))}

                {scheduled.filter(s => s.status === 'pending').length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>예약된 알림이 없습니다</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>발송 내역</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduled.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="font-medium text-gray-900">{notif.title}</div>
                        {getStatusBadge(notif.status)}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{notif.message}</div>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        {getTargetBadge(notif.targetType)}
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {notif.scheduledAt}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
