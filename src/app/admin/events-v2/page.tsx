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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Calendar,
  Edit,
  Eye,
  Gift,
  Image as ImageIcon,
  Plus,
  Trash2,
  Trophy
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface Event {
  id: string
  title: string
  description: string
  type: 'mission' | 'reward' | 'ranking' | 'special'
  startDate: string
  endDate: string
  isActive: boolean
  isVisible: boolean
  bannerUrl: string
  participants: number
}

export default function EventsV2Page() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: '크리스마스 특별 미션',
      description: '크리스마스 기념 보너스 미션!',
      type: 'mission',
      startDate: '2025-12-20',
      endDate: '2025-12-26',
      isActive: true,
      isVisible: true,
      bannerUrl: '',
      participants: 234,
    },
    {
      id: '2',
      title: '신규 회원 웰컴 보너스',
      description: '신규 가입 시 추가 보상!',
      type: 'reward',
      startDate: '2025-11-01',
      endDate: '2025-11-30',
      isActive: true,
      isVisible: true,
      bannerUrl: '',
      participants: 567,
    },
  ])

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<string>('mission')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleCreate = () => {
    if (!title.trim() || !description.trim()) {
      toast.error('제목과 설명을 입력해주세요.')
      return
    }

    if (!startDate || !endDate) {
      toast.error('시작일과 종료일을 선택해주세요.')
      return
    }

    const newEvent: Event = {
      id: Date.now().toString(),
      title,
      description,
      type: type as any,
      startDate,
      endDate,
      isActive: true,
      isVisible: true,
      bannerUrl: '',
      participants: 0,
    }

    setEvents([newEvent, ...events])
    toast.success('이벤트가 생성되었습니다.')
    setCreateDialogOpen(false)
    setTitle('')
    setDescription('')
    setStartDate('')
    setEndDate('')
  }

  const handleDelete = (id: string) => {
    if (!confirm('정말 이 이벤트를 삭제하시겠습니까?')) return

    setEvents(events.filter((e) => e.id !== id))
    toast.success('이벤트가 삭제되었습니다.')
  }

  const toggleActive = (id: string) => {
    setEvents(
      events.map((e) => (e.id === id ? { ...e, isActive: !e.isActive } : e))
    )
    toast.success('이벤트 상태가 변경되었습니다.')
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'mission':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">미션</Badge>
      case 'reward':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">보상</Badge>
      case 'ranking':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">랭킹</Badge>
      case 'special':
        return <Badge className="bg-green-50 text-green-700 border-green-200">특별</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  const getStatusBadge = (event: Event) => {
    const now = new Date()
    const start = new Date(event.startDate)
    const end = new Date(event.endDate)

    if (!event.isActive) {
      return <Badge className="bg-gray-50 text-gray-700 border-gray-200">비활성</Badge>
    }

    if (now < start) {
      return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">예정</Badge>
    }

    if (now > end) {
      return <Badge className="bg-red-50 text-red-700 border-red-200">종료</Badge>
    }

    return <Badge className="bg-green-50 text-green-700 border-green-200">진행 중</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">이벤트 관리</h1>
          <p className="text-gray-600 mt-2">특별 이벤트를 생성하고 관리하세요</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          이벤트 생성
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">전체 이벤트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{events.length}개</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">진행 중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {events.filter((e) => {
                const now = new Date()
                const start = new Date(e.startDate)
                const end = new Date(e.endDate)
                return e.isActive && now >= start && now <= end
              }).length}개
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">예정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {events.filter((e) => new Date() < new Date(e.startDate) && e.isActive).length}개
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 참여자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {events.reduce((sum, e) => sum + e.participants, 0)}명
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                    {getTypeBadge(event.type)}
                    {getStatusBadge(event)}
                  </div>
                  <p className="text-sm text-gray-600">{event.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">시작일</div>
                  <div className="flex items-center text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {event.startDate}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">종료일</div>
                  <div className="flex items-center text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {event.endDate}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Trophy className="h-4 w-4" />
                  <span>{event.participants}명 참여</span>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(event.id)}
                    className={event.isActive ? 'text-red-600' : 'text-green-600'}
                  >
                    {event.isActive ? '비활성화' : '활성화'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Gift className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">생성된 이벤트가 없습니다</p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                첫 이벤트 만들기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>이벤트 생성</DialogTitle>
            <DialogDescription>새로운 이벤트를 만들어보세요</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>이벤트 제목 *</Label>
              <Input
                placeholder="예: 크리스마스 특별 미션"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label>설명 *</Label>
              <Textarea
                placeholder="이벤트 설명을 입력하세요"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>

            <div>
              <Label>이벤트 유형</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mission">미션 이벤트</SelectItem>
                  <SelectItem value="reward">보상 이벤트</SelectItem>
                  <SelectItem value="ranking">랭킹 이벤트</SelectItem>
                  <SelectItem value="special">특별 이벤트</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>시작일 *</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>종료일 *</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label>배너 이미지</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">이미지를 업로드하세요</p>
                <Button size="sm" variant="outline" className="mt-2">
                  파일 선택
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
              생성하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
