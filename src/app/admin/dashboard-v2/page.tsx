'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { adminService } from '@/lib/services/admin'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircle2,
  Clock,
  CreditCard,
  TrendingUp,
  UserPlus,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface DashboardStats {
  todayUsers: number
  todayUsersChange: number
  missionCompletionRate: number
  missionCompletionRateChange: number
  pendingPaybacks: number
  pendingPaybacksChange: number
  activeUsers: number
  activeUsersChange: number
}

interface RecentActivity {
  id: string
  type: 'signup' | 'mission_complete' | 'payback_request'
  userName: string
  description: string
  timestamp: string
  avatar?: string
}

export default function DashboardV2Page() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    todayUsers: 0,
    todayUsersChange: 0,
    missionCompletionRate: 0,
    missionCompletionRateChange: 0,
    pendingPaybacks: 0,
    pendingPaybacksChange: 0,
    activeUsers: 0,
    activeUsersChange: 0,
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [adminId, setAdminId] = useState<string>('')

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    try {
      const currentAdmin = adminService.getCurrentAdmin()
      if (!currentAdmin) {
        router.push('/admin/login')
        return
      }

      setAdminId(currentAdmin.id)
      loadDashboardData(currentAdmin.id)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/admin/login')
    }
  }

  const loadDashboardData = async (adminId: string) => {
    setIsLoading(true)
    try {
      // TODO: 실제 API 호출로 대체
      // const statsResult = await adminService.getDashboardStats(adminId)

      // 임시 데이터
      setStats({
        todayUsers: 12,
        todayUsersChange: 15,
        missionCompletionRate: 68,
        missionCompletionRateChange: 5,
        pendingPaybacks: 23,
        pendingPaybacksChange: -8,
        activeUsers: 1234,
        activeUsersChange: 12,
      })

      setRecentActivities([
        {
          id: '1',
          type: 'signup',
          userName: '홍길동',
          description: '새로 가입했습니다',
          timestamp: '5분 전',
        },
        {
          id: '2',
          type: 'mission_complete',
          userName: '김철수',
          description: 'SNS 인증 미션을 완료했습니다',
          timestamp: '10분 전',
        },
        {
          id: '3',
          type: 'payback_request',
          userName: '이영희',
          description: '페이백을 신청했습니다 (5,000원)',
          timestamp: '15분 전',
        },
        {
          id: '4',
          type: 'mission_complete',
          userName: '박민수',
          description: '출석 체크 미션을 완료했습니다',
          timestamp: '20분 전',
        },
        {
          id: '5',
          type: 'signup',
          userName: '최수진',
          description: '새로 가입했습니다',
          timestamp: '25분 전',
        },
      ])
    } catch (error) {
      toast.error('대시보드 데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'signup':
        return <UserPlus className="h-4 w-4 text-green-600" />
      case 'mission_complete':
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />
      case 'payback_request':
        return <CreditCard className="h-4 w-4 text-purple-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'signup':
        return <Badge className="bg-green-50 text-green-700 border-green-200">신규 가입</Badge>
      case 'mission_complete':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">미션 완료</Badge>
      case 'payback_request':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">페이백 신청</Badge>
      default:
        return <Badge>활동</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <div className="text-lg text-gray-600">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">실시간 대시보드</h1>
        <p className="text-gray-600 mt-2">드라이빙존 미션 시스템 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 금일 가입자 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">금일 가입자</CardTitle>
              <UserPlus className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.todayUsers}</div>
            <div className="flex items-center mt-2">
              {stats.todayUsersChange >= 0 ? (
                <>
                  <ArrowUpIcon className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    {stats.todayUsersChange}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownIcon className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-sm font-medium text-red-600">
                    {Math.abs(stats.todayUsersChange)}%
                  </span>
                </>
              )}
              <span className="text-sm text-gray-500 ml-2">전일 대비</span>
            </div>
          </CardContent>
        </Card>

        {/* 미션 완료율 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">미션 완료율</CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.missionCompletionRate}%</div>
            <div className="flex items-center mt-2">
              {stats.missionCompletionRateChange >= 0 ? (
                <>
                  <ArrowUpIcon className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    {stats.missionCompletionRateChange}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownIcon className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-sm font-medium text-red-600">
                    {Math.abs(stats.missionCompletionRateChange)}%
                  </span>
                </>
              )}
              <span className="text-sm text-gray-500 ml-2">전일 대비</span>
            </div>
          </CardContent>
        </Card>

        {/* 페이백 대기 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">페이백 대기</CardTitle>
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.pendingPaybacks}건</div>
            <div className="mt-2">
              <Button
                size="sm"
                variant="outline"
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
                onClick={() => router.push('/admin/paybacks')}
              >
                처리하기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 활성 사용자 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">활성 사용자</CardTitle>
              <Users className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.activeUsers.toLocaleString()}명
            </div>
            <div className="flex items-center mt-2">
              {stats.activeUsersChange >= 0 ? (
                <>
                  <ArrowUpIcon className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    {stats.activeUsersChange}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownIcon className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-sm font-medium text-red-600">
                    {Math.abs(stats.activeUsersChange)}%
                  </span>
                </>
              )}
              <span className="text-sm text-gray-500 ml-2">전일 대비</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>실시간 활동</CardTitle>
          <CardDescription>최근 사용자 활동 내역</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{activity.userName}</span>
                      {getActivityBadge(activity.type)}
                    </div>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{activity.timestamp}</div>
              </div>
            ))}
          </div>

          {recentActivities.length === 0 && (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">최근 활동이 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/missions/submissions')}>
          <CardHeader>
            <CardTitle className="text-lg">미션 제출물 검토</CardTitle>
            <CardDescription>대기 중인 제출물을 검토하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              검토하기
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/missions/create')}>
          <CardHeader>
            <CardTitle className="text-lg">새 미션 만들기</CardTitle>
            <CardDescription>새로운 미션을 생성하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              생성하기
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/analytics')}>
          <CardHeader>
            <CardTitle className="text-lg">통계 및 분석</CardTitle>
            <CardDescription>상세 통계를 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              보기
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
