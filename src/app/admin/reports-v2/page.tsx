'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Eye,
  Flag,
  MessageSquare,
  Shield,
  Trash2,
  UserX,
  X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface Report {
  id: string
  reporterName: string
  reportedName: string
  reportType: 'spam' | 'abuse' | 'inappropriate' | 'fraud' | 'other'
  description: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  createdAt: string
  evidence: string[]
}

export default function ReportsV2Page() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      reporterName: '홍길동',
      reportedName: '김철수',
      reportType: 'spam',
      description: '스팸성 메시지를 반복적으로 전송합니다',
      status: 'pending',
      createdAt: '2025-11-10 10:00',
      evidence: [],
    },
    {
      id: '2',
      reporterName: '이영희',
      reportedName: '박민수',
      reportType: 'inappropriate',
      description: '부적절한 내용의 게시글을 작성했습니다',
      status: 'pending',
      createdAt: '2025-11-10 09:30',
      evidence: [],
    },
    {
      id: '3',
      reporterName: '최수진',
      reportedName: '정대호',
      reportType: 'fraud',
      description: '미션 증빙을 조작한 것으로 의심됩니다',
      status: 'reviewed',
      createdAt: '2025-11-09 15:00',
      evidence: [],
    },
  ])

  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'resolve' | 'dismiss' | 'ban'>('resolve')
  const [actionNote, setActionNote] = useState('')

  const openDetailDialog = (report: Report) => {
    setSelectedReport(report)
    setDetailDialogOpen(true)
  }

  const openActionDialog = (report: Report, action: 'resolve' | 'dismiss' | 'ban') => {
    setSelectedReport(report)
    setActionType(action)
    setDetailDialogOpen(false)
    setActionDialogOpen(true)
  }

  const handleAction = () => {
    if (!selectedReport) return

    let newStatus: Report['status'] = 'resolved'
    let message = ''

    switch (actionType) {
      case 'resolve':
        newStatus = 'resolved'
        message = '신고가 처리되었습니다.'
        break
      case 'dismiss':
        newStatus = 'dismissed'
        message = '신고가 기각되었습니다.'
        break
      case 'ban':
        newStatus = 'resolved'
        message = '사용자가 정지되었습니다.'
        break
    }

    setReports(reports.map((r) => (r.id === selectedReport.id ? { ...r, status: newStatus } : r)))
    toast.success(message)
    setActionDialogOpen(false)
    setActionNote('')
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'spam':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">스팸</Badge>
      case 'abuse':
        return <Badge className="bg-red-50 text-red-700 border-red-200">욕설/폭언</Badge>
      case 'inappropriate':
        return <Badge className="bg-orange-50 text-orange-700 border-orange-200">부적절한 내용</Badge>
      case 'fraud':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">사기/조작</Badge>
      case 'other':
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">기타</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">대기 중</Badge>
      case 'reviewed':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">검토 중</Badge>
      case 'resolved':
        return <Badge className="bg-green-50 text-green-700 border-green-200">해결 완료</Badge>
      case 'dismissed':
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">기각됨</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const pendingReports = reports.filter((r) => r.status === 'pending')
  const reviewedReports = reports.filter((r) => r.status === 'reviewed')
  const resolvedReports = reports.filter((r) => r.status === 'resolved')
  const dismissedReports = reports.filter((r) => r.status === 'dismissed')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">신고 관리</h1>
        <p className="text-gray-600 mt-2">사용자 신고를 검토하고 처리하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">대기 중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingReports.length}건</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">검토 중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{reviewedReports.length}건</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">해결 완료</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolvedReports.length}건</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">기각</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{dismissedReports.length}건</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">대기 중 ({pendingReports.length})</TabsTrigger>
          <TabsTrigger value="reviewed">검토 중 ({reviewedReports.length})</TabsTrigger>
          <TabsTrigger value="resolved">처리 완료 ({resolvedReports.length + dismissedReports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>대기 중인 신고</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>신고자</TableHead>
                    <TableHead>피신고자</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>내용</TableHead>
                    <TableHead>일시</TableHead>
                    <TableHead>액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.reporterName}</TableCell>
                      <TableCell className="font-medium">{report.reportedName}</TableCell>
                      <TableCell>{getTypeBadge(report.reportType)}</TableCell>
                      <TableCell className="max-w-xs truncate">{report.description}</TableCell>
                      <TableCell className="text-sm text-gray-600">{report.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => openDetailDialog(report)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => openActionDialog(report, 'resolve')}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => openActionDialog(report, 'ban')}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pendingReports.length === 0 && (
                <div className="text-center py-12">
                  <Flag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">대기 중인 신고가 없습니다</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviewed">
          <Card>
            <CardHeader>
              <CardTitle>검토 중인 신고</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>신고자</TableHead>
                    <TableHead>피신고자</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>내용</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.reporterName}</TableCell>
                      <TableCell className="font-medium">{report.reportedName}</TableCell>
                      <TableCell>{getTypeBadge(report.reportType)}</TableCell>
                      <TableCell className="max-w-xs truncate">{report.description}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => openDetailDialog(report)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolved">
          <Card>
            <CardHeader>
              <CardTitle>처리 완료된 신고</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>신고자</TableHead>
                    <TableHead>피신고자</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>일시</TableHead>
                    <TableHead>액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...resolvedReports, ...dismissedReports].map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.reporterName}</TableCell>
                      <TableCell className="font-medium">{report.reportedName}</TableCell>
                      <TableCell>{getTypeBadge(report.reportType)}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600">{report.createdAt}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => openDetailDialog(report)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>신고 상세 정보</DialogTitle>
            <DialogDescription>신고 내용을 확인하세요</DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">신고자</Label>
                  <div className="mt-1 font-medium text-gray-900">{selectedReport.reporterName}</div>
                </div>
                <div>
                  <Label className="text-gray-600">피신고자</Label>
                  <div className="mt-1 font-medium text-gray-900">{selectedReport.reportedName}</div>
                </div>
                <div>
                  <Label className="text-gray-600">신고 유형</Label>
                  <div className="mt-1">{getTypeBadge(selectedReport.reportType)}</div>
                </div>
                <div>
                  <Label className="text-gray-600">상태</Label>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>
              </div>

              <div>
                <Label className="text-gray-600">신고 내용</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">
                  {selectedReport.description}
                </div>
              </div>

              <div>
                <Label className="text-gray-600">신고 일시</Label>
                <div className="mt-1 text-gray-900">{selectedReport.createdAt}</div>
              </div>

              {selectedReport.status === 'pending' && (
                <div className="flex space-x-2 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => openActionDialog(selectedReport, 'resolve')}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    해결 완료
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => openActionDialog(selectedReport, 'dismiss')}
                  >
                    <X className="h-4 w-4 mr-2" />
                    기각
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600"
                    onClick={() => openActionDialog(selectedReport, 'ban')}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    사용자 정지
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'resolve' && '해결 완료'}
              {actionType === 'dismiss' && '신고 기각'}
              {actionType === 'ban' && '사용자 정지'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'resolve' && '신고를 해결 완료 처리합니다'}
              {actionType === 'dismiss' && '신고를 기각합니다'}
              {actionType === 'ban' && '피신고자를 정지합니다'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>처리 메모</Label>
              <Textarea
                placeholder="처리 내용을 입력하세요"
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>

            {actionType === 'ban' && (
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-900">
                    <p className="font-medium mb-1">경고</p>
                    <p>사용자가 즉시 정지되며, 모든 활동이 제한됩니다.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleAction}
              className={
                actionType === 'ban'
                  ? 'bg-red-600 hover:bg-red-700'
                  : actionType === 'resolve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : ''
              }
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
