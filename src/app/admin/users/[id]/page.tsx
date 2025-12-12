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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface UserDetail {
  id: string
  name: string
  phone: string
  createdAt: string
  totalMissions: number
  completedMissions: number
  totalPayback: number
}

interface UserMission {
  id: string
  missionTitle: string
  missionType: string
  status: string
  rewardAmount: number
  completedAt: string | null
  proofData: any
}

interface UserPayback {
  id: string
  missionTitle: string
  amount: number
  status: string
  paidAt: string | null
  createdAt: string
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [missions, setMissions] = useState<UserMission[]>([])
  const [paybacks, setPaybacks] = useState<UserPayback[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      await loadUserData(resolvedParams.id)
    }
    loadData()
  }, [params])

  const loadUserData = async (userId: string) => {
    setIsLoading(true)
    try {
      // 사용자 기본 정보 조회
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      // 사용자의 미션 참여 정보 조회
      const { data: missionsData, error: missionsError } = await supabase
        .from('mission_participations')
        .select(`
          id,
          status,
          completed_at,
          proof_data,
          started_at,
          created_at,
          mission_definition_id,
          mission_definitions!inner(
            title,
            mission_type,
            reward_amount
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (missionsError) throw missionsError

      // 사용자의 페이백 정보 조회
      const { data: paybacksData, error: paybacksError } = await supabase
        .from('paybacks')
        .select(`
          id,
          amount,
          status,
          paid_at,
          created_at,
          mission_definition_id,
          mission_definitions!inner(
            title
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (paybacksError) throw paybacksError

      // 통계 계산
      const totalMissions = missionsData.length
      const completedMissions = missionsData.filter(m => m.status === 'completed').length
      const totalPayback = paybacksData
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0)

      setUser({
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        createdAt: userData.created_at,
        totalMissions,
        completedMissions,
        totalPayback
      })

      setMissions(missionsData.map(m => ({
        id: m.id,
        missionTitle: m.mission_definitions[0]?.title || 'Unknown',
        missionType: m.mission_definitions[0]?.mission_type || 'Unknown',
        status: m.status,
        rewardAmount: m.mission_definitions[0]?.reward_amount || 0,
        completedAt: m.completed_at,
        proofData: m.proof_data,
        startedAt: m.started_at || m.created_at
      })))

      setPaybacks(paybacksData.map(p => ({
        id: p.id,
        missionTitle: p.mission_definitions[0]?.title || 'Unknown',
        amount: p.amount,
        status: p.status,
        paidAt: p.paid_at,
        createdAt: p.created_at
      })))

    } catch (error) {
      console.error('Load user data error:', error)
      toast.error('사용자 데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
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

  const getPaybackStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">대기중</Badge>
      case 'paid':
        return <Badge variant="default">지급완료</Badge>
      case 'rejected':
        return <Badge variant="destructive">거부</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
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

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="text-2xl">로딩 중...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <div className="text-2xl">사용자를 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => router.push('/admin/users')}
          variant="outline"
          className="border-border text-black hover:bg-secondary"
        >
          ← 사용자 목록으로
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-black">사용자 상세정보</h1>
          <p className="text-muted-foreground">사용자 정보 및 활동 내역</p>
        </div>
      </div>

      {/* User Info */}
      <Card className="gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-black">기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-black mb-2">개인정보</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-muted-foreground">이름:</span>
                  <span className="ml-2 text-black">{user.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">전화번호:</span>
                  <span className="ml-2 text-black">{user.phone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">가입일:</span>
                  <span className="ml-2 text-black">{formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-black mb-2">활동 통계</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-muted-foreground">총 미션:</span>
                  <span className="ml-2 text-black">{user.totalMissions}개</span>
                </div>
                <div>
                  <span className="text-muted-foreground">완료 미션:</span>
                  <span className="ml-2 text-black">{user.completedMissions}개</span>
                </div>
                <div>
                  <span className="text-muted-foreground">완료율:</span>
                  <span className="ml-2 text-black">
                    {user.totalMissions > 0 ? Math.round(user.completedMissions / user.totalMissions * 100) : 0}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">총 페이백:</span>
                  <span className="ml-2 text-black font-semibold">{user.totalPayback.toLocaleString()}원</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="missions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="missions">미션 내역</TabsTrigger>
          <TabsTrigger value="paybacks">페이백 내역</TabsTrigger>
        </TabsList>

        <TabsContent value="missions">
          <Card className="gradient-card border-border">
            <CardHeader>
              <CardTitle className="text-black">미션 참여 내역</CardTitle>
            </CardHeader>
            <CardContent>
              {missions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="text-muted-foreground mb-2">참여한 미션이 없습니다.</p>
                  <p className="text-sm text-muted-foreground">사용자가 아직 미션에 참여하지 않았습니다.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-black">미션</TableHead>
                      <TableHead className="text-black">타입</TableHead>
                      <TableHead className="text-black">상태</TableHead>
                      <TableHead className="text-black">보상</TableHead>
                      <TableHead className="text-black">완료일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {missions.map((mission) => (
                      <TableRow key={mission.id}>
                        <TableCell className="text-black">
                          <div className="font-medium">{mission.missionTitle}</div>
                        </TableCell>
                        <TableCell>{getMissionTypeBadge(mission.missionType)}</TableCell>
                        <TableCell>{getStatusBadge(mission.status)}</TableCell>
                        <TableCell className="text-black">
                          {mission.rewardAmount.toLocaleString()}원
                        </TableCell>
                        <TableCell className="text-black">
                          {formatDate(mission.completedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paybacks">
          <Card className="gradient-card border-border">
            <CardHeader>
              <CardTitle className="text-black">페이백 내역</CardTitle>
            </CardHeader>
            <CardContent>
              {paybacks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">💰</div>
                  <p className="text-muted-foreground mb-2">페이백 내역이 없습니다.</p>
                  <p className="text-sm text-muted-foreground">아직 지급된 페이백이 없습니다.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-black">미션</TableHead>
                      <TableHead className="text-black">금액</TableHead>
                      <TableHead className="text-black">상태</TableHead>
                      <TableHead className="text-black">지급일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paybacks.map((payback) => (
                      <TableRow key={payback.id}>
                        <TableCell className="text-black">
                          <div className="font-medium">{payback.missionTitle}</div>
                        </TableCell>
                        <TableCell className="text-black">
                          {payback.amount.toLocaleString()}원
                        </TableCell>
                        <TableCell>{getPaybackStatusBadge(payback.status)}</TableCell>
                        <TableCell className="text-black">
                          {formatDate(payback.paidAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
