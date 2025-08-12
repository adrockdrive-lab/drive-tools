'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface MissionDetail {
  id: string
  title: string
  description: string
  missionType: string
  rewardAmount: number
  isActive: boolean
  createdAt: string
  totalParticipants: number
  completedParticipants: number
  totalPayback: number
}

interface Participant {
  id: string
  userName: string
  userPhone: string
  status: string
  startedAt: string
  completedAt: string | null
  proofData: any
  paybackStatus: string | null
  paybackAmount: number | null
}

export default function MissionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [mission, setMission] = useState<MissionDetail | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMissionData()
  }, [params.id])

  const loadMissionData = async () => {
    setIsLoading(true)
    try {
      // 미션 기본 정보 조회
      const { data: missionData, error: missionError } = await supabase
        .from('missions')
        .select('*')
        .eq('id', params.id)
        .single()

      if (missionError) throw missionError

      // 미션 참여자 정보 조회
      const { data: participantsData, error: participantsError } = await supabase
        .from('mission_participations')
        .select(`
          id,
          status,
          started_at,
          completed_at,
          proof_data,
          created_at,
          user_id,
          users!inner(
            name,
            phone
          )
        `)
        .eq('mission_id', params.id)
        .order('created_at', { ascending: false })

      if (participantsError) throw participantsError

      // 페이백 정보 별도 조회
      const { data: paybacksData, error: paybacksError } = await supabase
        .from('paybacks')
        .select('*')
        .eq('mission_id', params.id)
        .order('created_at', { ascending: false })

      if (paybacksError) throw paybacksError

      // 통계 계산
      const totalParticipants = participantsData.length
      const completedParticipants = participantsData.filter(p => p.status === 'completed').length
      const totalPayback = participantsData
        .filter(p => p.paybacks?.[0]?.status === 'paid')
        .reduce((sum, p) => sum + (p.paybacks?.[0]?.amount || 0), 0)

      setMission({
        id: missionData.id,
        title: missionData.title,
        description: missionData.description,
        missionType: missionData.mission_type,
        rewardAmount: missionData.reward_amount,
        isActive: missionData.is_active,
        createdAt: missionData.created_at,
        totalParticipants,
        completedParticipants,
        totalPayback
      })

      setParticipants(participantsData.map(p => {
        // 해당 참여자에 대한 페이백 찾기
        const payback = paybacksData?.find(pb =>
          pb.user_id === p.user_id && pb.mission_id === params.id
        )

        return {
          id: p.id,
          userName: p.users.name,
          userPhone: p.users.phone,
          status: p.status,
          startedAt: p.started_at || p.created_at,
          completedAt: p.completed_at,
          proofData: p.proof_data,
          paybackStatus: payback?.status || null,
          paybackAmount: payback?.amount || null
        }
      }))

    } catch (error) {
      console.error('Load mission data error:', error)
      toast.error('미션 데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprovePayback = async (participationId: string) => {
    try {
      const result = await adminService.approvePayback(participationId)
      if (result.success) {
        toast.success('페이백이 승인되었습니다.')
        loadMissionData()
      } else {
        toast.error(result.error || '페이백 승인에 실패했습니다.')
      }
    } catch (error) {
      toast.error('페이백 승인 중 오류가 발생했습니다.')
    }
  }

  const handleRejectPayback = async (participationId: string) => {
    const reason = prompt('거부 사유를 입력하세요:')
    if (!reason) return

    try {
      const result = await adminService.rejectPayback(participationId, reason)
      if (result.success) {
        toast.success('페이백이 거부되었습니다.')
        loadMissionData()
      } else {
        toast.error(result.error || '페이백 거부에 실패했습니다.')
      }
    } catch (error) {
      toast.error('페이백 거부 중 오류가 발생했습니다.')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">대기중</Badge>
      case 'in_progress':
        return <Badge variant="outline">진행중</Badge>
      case 'completed':
        return <Badge variant="default">완료</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaybackStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">대기중</Badge>
      case 'paid':
        return <Badge variant="default">지급완료</Badge>
      case 'rejected':
        return <Badge variant="destructive">거부</Badge>
      default:
        return <Badge variant="secondary">-</Badge>
    }
  }

  const getMissionTypeBadge = (type: string) => {
    const typeNames: Record<string, string> = {
      challenge: '재능충',
      sns: 'SNS',
      review: '후기',
      referral: '추천'
    }
    return <Badge variant="outline">{typeNames[type] || type}</Badge>
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '-'

      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return '-'
    }
  }

  const renderProofData = (proofData: any, missionType: string) => {
    if (!proofData) return <span className="text-muted-foreground">-</span>

    switch (missionType) {
      case 'challenge':
        return (
          <div>
            <div className="text-sm">도장 사진: {proofData.certificateImageUrl ? '업로드됨' : '없음'}</div>
          </div>
        )
      case 'sns':
        return (
          <div>
            <div className="text-sm">SNS 링크: {proofData.snsUrl || '없음'}</div>
          </div>
        )
      case 'referral':
        return (
          <div>
            <div className="text-sm">추천인: {proofData.referrals?.length || 0}명</div>
            {proofData.referrals?.map((ref: any, index: number) => (
              <div key={index} className="text-xs text-muted-foreground">
                {ref.name} ({ref.phone}) - {ref.store}
              </div>
            ))}
          </div>
        )
      case 'review':
        return (
          <div>
            <div className="text-sm">후기: {proofData.reviews?.length || 0}개</div>
            {proofData.reviews?.map((review: any, index: number) => (
              <div key={index} className="text-xs text-muted-foreground">
                {review.platform}: {review.url ? '등록됨' : '없음'}
              </div>
            ))}
          </div>
        )
      default:
        return <span className="text-muted-foreground">-</span>
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="text-2xl">로딩 중...</div>
      </div>
    )
  }

  if (!mission) {
    return (
      <div className="text-center py-20">
        <div className="text-2xl">미션을 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => router.push('/admin/missions')}
          variant="outline"
          className="border-border text-black hover:bg-secondary"
        >
          ← 미션 목록으로
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-black">미션 상세정보</h1>
          <p className="text-muted-foreground">미션 정보 및 참여자 현황</p>
        </div>
      </div>

      {/* Mission Info */}
      <Card className="gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-black">{mission.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-black mb-2">미션 정보</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-muted-foreground">타입:</span>
                  <span className="ml-2">{getMissionTypeBadge(mission.missionType)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">보상:</span>
                  <span className="ml-2 text-black font-semibold">{mission.rewardAmount.toLocaleString()}원</span>
                </div>
                <div>
                  <span className="text-muted-foreground">상태:</span>
                  <span className="ml-2">{mission.isActive ? '활성' : '비활성'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">생성일:</span>
                  <span className="ml-2 text-black">{formatDate(mission.createdAt)}</span>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium text-black mb-2">설명</h4>
                <p className="text-muted-foreground">{mission.description}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-black mb-2">참여 통계</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-muted-foreground">총 참여자:</span>
                  <span className="ml-2 text-black">{mission.totalParticipants}명</span>
                </div>
                <div>
                  <span className="text-muted-foreground">완료자:</span>
                  <span className="ml-2 text-black">{mission.completedParticipants}명</span>
                </div>
                <div>
                  <span className="text-muted-foreground">완료율:</span>
                  <span className="ml-2 text-black">
                    {mission.totalParticipants > 0 ? Math.round(mission.completedParticipants / mission.totalParticipants * 100) : 0}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">총 페이백:</span>
                  <span className="ml-2 text-black font-semibold">{mission.totalPayback.toLocaleString()}원</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants */}
      <Card className="gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-black">참여자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-muted-foreground mb-2">참여자가 없습니다.</p>
              <p className="text-sm text-muted-foreground">아직 이 미션에 참여한 사용자가 없습니다.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-black">사용자</TableHead>
                  <TableHead className="text-black">상태</TableHead>
                  <TableHead className="text-black">시작일</TableHead>
                  <TableHead className="text-black">완료일</TableHead>
                  <TableHead className="text-black">증명 데이터</TableHead>
                  <TableHead className="text-black">페이백</TableHead>
                  <TableHead className="text-black">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell className="text-black">
                      <div>
                        <div className="font-medium">{participant.userName}</div>
                        <div className="text-sm text-muted-foreground">{participant.userPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(participant.status)}</TableCell>
                    <TableCell className="text-black">{formatDate(participant.startedAt)}</TableCell>
                    <TableCell className="text-black">{formatDate(participant.completedAt)}</TableCell>
                    <TableCell className="text-black">
                      {renderProofData(participant.proofData, mission.missionType)}
                    </TableCell>
                    <TableCell>{getPaybackStatusBadge(participant.paybackStatus)}</TableCell>
                    <TableCell>
                      {participant.status === 'completed' && !participant.paybackStatus && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprovePayback(participant.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectPayback(participant.id)}
                          >
                            거부
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
