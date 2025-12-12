'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminService } from '@/lib/services/admin'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

type MissionTypeStats = {
  type: string
  count: number
  totalReward: number
}

type DailyProgress = {
  date: string
  completed: number
  reward: number
}

type TopPerformer = {
  name: string
  completed: number
  totalReward: number
  phone: string
}

export default function MissionAnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [stores, setStores] = useState<{ id: number; name: string }[]>([])
  const [adminId, setAdminId] = useState<string>('')
  
  // Analytics data
  const [missionStats, setMissionStats] = useState({
    totalMissions: 0,
    activeMissions: 0,
    completedMissions: 0,
    pendingMissions: 0
  })
  
  const [missionTypeStats, setMissionTypeStats] = useState<MissionTypeStats[]>([])
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([])
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([])

  const initializeAdmin = useCallback(async () => {
    try {
      const currentAdmin = adminService.getCurrentAdmin()
      if (!currentAdmin) {
        router.push('/admin/login')
        return
      }

      setAdminId(currentAdmin.id)

      // 역할에 따라 지점 목록 조회
      let storesResult
      if (currentAdmin.role === 'super_admin') {
        storesResult = await adminService.getAllStores()
      } else {
        storesResult = await adminService.getAdminStores(currentAdmin.id)
      }

      if (storesResult.success && storesResult.stores) {
        setStores(storesResult.stores)
      }

      await loadAnalyticsData(currentAdmin.id)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/admin/login')
    }
  }, [router])

  const loadAnalyticsData = useCallback(async (adminId: string) => {
    setLoading(true)
    try {
      // Load mission data for analytics
      const missionsResult = await adminService.getUserMissions(adminId, selectedStoreId || undefined)
      
      if (missionsResult.success && missionsResult.data) {
        const missions = missionsResult.data
        
        // Calculate basic stats
        setMissionStats({
          totalMissions: missions.length,
          activeMissions: missions.filter(m => m.status === 'in_progress').length,
          completedMissions: missions.filter(m => m.status === 'completed').length,
          pendingMissions: missions.filter(m => m.status === 'pending').length
        })

        // Mission type distribution
        const typeStats = missions.reduce((acc: Record<string, MissionTypeStats>, mission) => {
          const type = mission.missionType
          if (!acc[type]) {
            acc[type] = { type, count: 0, totalReward: 0 }
          }
          acc[type].count++
          acc[type].totalReward += mission.rewardAmount || 0
          return acc
        }, {})

        setMissionTypeStats(Object.values(typeStats))

        // Daily progress (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - i)
          return date.toISOString().split('T')[0]
        }).reverse()

        const dailyData = last7Days.map(date => {
          const dayMissions = missions.filter(m => 
            m.completedAt && m.completedAt.startsWith(date)
          )
          return {
            date: date.split('-')[2] + '/' + date.split('-')[1],
            completed: dayMissions.length,
            reward: dayMissions.reduce((sum, m) => sum + (m.rewardAmount || 0), 0)
          }
        })

        setDailyProgress(dailyData)

        // Top performers
        const userStats = missions.reduce((acc: Record<string, TopPerformer>, mission) => {
          const userId = mission.userName
          if (!acc[userId]) {
            acc[userId] = {
              name: mission.userName,
              completed: 0,
              totalReward: 0,
              phone: mission.userPhone
            }
          }
          if (mission.status === 'completed') {
            acc[userId].completed++
            acc[userId].totalReward += mission.rewardAmount || 0
          }
          return acc
        }, {})

        const sortedUsers = Object.values(userStats)
          .sort((a, b) => b.completed - a.completed)
          .slice(0, 10)

        setTopPerformers(sortedUsers)
      } else {
        toast.error(missionsResult.error || '미션 데이터를 불러오는데 실패했습니다.')
        // 기본 빈 데이터로 설정
        setMissionStats({
          totalMissions: 0,
          activeMissions: 0,
          completedMissions: 0,
          pendingMissions: 0
        })
        setMissionTypeStats([])
        setDailyProgress([])
        setTopPerformers([])
      }
    } catch (error) {
      console.error('Analytics data loading error:', error)
      toast.error('분석 데이터를 불러오는데 실패했습니다.')
      // 기본 빈 데이터로 설정
      setMissionStats({
        totalMissions: 0,
        activeMissions: 0,
        completedMissions: 0,
        pendingMissions: 0
      })
      setMissionTypeStats([])
      setDailyProgress([])
      setTopPerformers([])
    } finally {
      setLoading(false)
    }
  }, [selectedStoreId])

  useEffect(() => {
    initializeAdmin()
  }, [initializeAdmin])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  const getMissionTypeName = (type: string) => {
    const typeNames: Record<string, string> = {
      challenge: '재능충',
      sns: 'SNS',
      review: '리뷰',
      attendance: '출석',
      referral: '추천'
    }
    return typeNames[type] || type
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="text-2xl">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">미션 분석</h1>
          <p className="text-gray-600">미션 수행 현황 및 통계 분석</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedStoreId?.toString() || ''} onValueChange={(value) => {
            const storeId = value ? parseInt(value) : null
            setSelectedStoreId(storeId)
            if (adminId) {
              loadAnalyticsData(adminId)
            }
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="지점 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 지점</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id.toString()}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => adminId && loadAnalyticsData(adminId)} variant="outline">
            새로고침
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 미션</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missionStats.totalMissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">진행중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{missionStats.activeMissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">완료</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{missionStats.completedMissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">대기중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{missionStats.pendingMissions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mission Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>미션 타입별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={missionTypeStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percent }) => `${getMissionTypeName(type)} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {missionTypeStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, '개수']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Progress */}
        <Card>
          <CardHeader>
            <CardTitle>일일 완료 현황 (최근 7일)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="completed" stroke="#8884d8" name="완료수" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mission Type Rewards */}
        <Card>
          <CardHeader>
            <CardTitle>미션 타입별 보상 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={missionTypeStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" tickFormatter={getMissionTypeName} />
                <YAxis />
                <Tooltip formatter={(value, name) => [value?.toLocaleString() + '원', '총 보상']} />
                <Bar dataKey="totalReward" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>상위 참여자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{user.completed}개 완료</div>
                    <div className="text-sm text-gray-500">{user.totalReward.toLocaleString()}원</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>일일 보상 지급 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [value?.toLocaleString() + '원', '보상금액']} />
              <Bar dataKey="reward" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}