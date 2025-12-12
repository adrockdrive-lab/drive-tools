'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { analyticsService, type BranchStatistics, type BranchAnalytics, type MonthlyStats } from '@/lib/services/analytics'
import { adminService } from '@/lib/services/admin'
import { TrendingUp, TrendingDown, Users, Target, DollarSign, Calendar, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'

interface AdvancedAnalyticsProps {
  adminId: string
}

export function AdvancedAnalytics({ adminId }: AdvancedAnalyticsProps) {
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [stores, setStores] = useState<any[]>([])
  const [statistics, setStatistics] = useState<BranchStatistics | null>(null)
  const [analytics, setAnalytics] = useState<BranchAnalytics | null>(null)
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([])
  const [missionStats, setMissionStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadStores()
  }, [adminId])

  useEffect(() => {
    if (selectedStoreId) {
      loadAnalyticsData()
    }
  }, [selectedStoreId])

  const loadStores = async () => {
    try {
      const currentAdmin = adminService.getCurrentAdmin()
      if (!currentAdmin) return

      let storesResult
      if (currentAdmin.role === 'super_admin') {
        storesResult = await adminService.getAllStores()
      } else {
        storesResult = await adminService.getAdminStores(currentAdmin.id)
      }

      if (storesResult.success && storesResult.stores) {
        setStores(storesResult.stores)
        if (storesResult.stores.length > 0) {
          setSelectedStoreId(storesResult.stores[0].id)
        }
      }
    } catch (error) {
      console.error('지점 목록 로드 오류:', error)
    }
  }

  const loadAnalyticsData = async () => {
    if (!selectedStoreId) return

    setLoading(true)
    try {
      const [statsResult, analyticsResult, monthlyResult, missionResult] = await Promise.all([
        analyticsService.getBranchStatistics(selectedStoreId),
        analyticsService.getBranchAnalytics(selectedStoreId),
        analyticsService.getBranchMonthlyStats(selectedStoreId, 6),
        analyticsService.getBranchMissionStats(selectedStoreId)
      ])

      if (statsResult.success && statsResult.data) {
        setStatistics(statsResult.data)
      }

      if (analyticsResult.success && analyticsResult.data) {
        setAnalytics(analyticsResult.data)
      }

      if (monthlyResult.success && monthlyResult.data) {
        setMonthlyStats(monthlyResult.data)
      }

      if (missionResult.success && missionResult.data) {
        setMissionStats(missionResult.data)
      }
    } catch (error) {
      console.error('분석 데이터 로드 오류:', error)
      toast.error('분석 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const formatTrendValue = (value: number) => {
    const isPositive = value >= 0
    return {
      value: Math.abs(value).toFixed(1),
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      bgColor: isPositive ? 'bg-green-50' : 'bg-red-50'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 지점 선택 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">고급 분석</h2>
        <div className="flex items-center gap-4">
          <Select
            value={selectedStoreId?.toString() || ''}
            onValueChange={(value) => setSelectedStoreId(parseInt(value))}
          >
            <SelectTrigger className="w-48">
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
          <Button
            variant="outline"
            onClick={loadAnalyticsData}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            새로고침
          </Button>
        </div>
      </div>

      {/* 기본 통계 카드 */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalUsers.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">미션 완료율</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.completionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {statistics.completedMissions}/{statistics.totalMissions} 완료
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 페이백</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalPayback.toLocaleString()}원</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 미션 가치</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.totalMissions > 0 
                  ? Math.round(statistics.totalPayback / statistics.totalMissions).toLocaleString()
                  : '0'
                }원
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 트렌드 분석 */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">사용자 증가율</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold">
                  {analytics.userGrowth >= 0 ? '+' : ''}{analytics.userGrowth.toFixed(1)}%
                </div>
                {(() => {
                  const trend = formatTrendValue(analytics.userGrowth)
                  const Icon = trend.icon
                  return (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${trend.bgColor}`}>
                      <Icon className={`h-3 w-3 ${trend.color}`} />
                      <span className={`text-xs font-medium ${trend.color}`}>
                        {trend.value}%
                      </span>
                    </div>
                  )
                })()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">지난 달 대비</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">미션 완료 트렌드</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold">
                  {analytics.missionCompletionTrend >= 0 ? '+' : ''}{analytics.missionCompletionTrend.toFixed(1)}%
                </div>
                {(() => {
                  const trend = formatTrendValue(analytics.missionCompletionTrend)
                  const Icon = trend.icon
                  return (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${trend.bgColor}`}>
                      <Icon className={`h-3 w-3 ${trend.color}`} />
                      <span className={`text-xs font-medium ${trend.color}`}>
                        {trend.value}%
                      </span>
                    </div>
                  )
                })()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">지난 달 대비</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">페이백 트렌드</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold">
                  {analytics.paybackTrend >= 0 ? '+' : ''}{analytics.paybackTrend.toFixed(1)}%
                </div>
                {(() => {
                  const trend = formatTrendValue(analytics.paybackTrend)
                  const Icon = trend.icon
                  return (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${trend.bgColor}`}>
                      <Icon className={`h-3 w-3 ${trend.color}`} />
                      <span className={`text-xs font-medium ${trend.color}`}>
                        {trend.value}%
                      </span>
                    </div>
                  )
                })()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">지난 달 대비</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 인기 미션 */}
      {analytics && analytics.topMissions && analytics.topMissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>인기 미션 유형</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topMissions.map((mission, index) => (
                <div key={mission.missionType} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium">{mission.missionType}</div>
                      <div className="text-sm text-gray-500">{mission.completionCount}회 완료</div>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {((mission.completionCount / analytics.topMissions.reduce((sum, m) => sum + m.completionCount, 0)) * 100).toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 월간 통계 */}
      {monthlyStats && monthlyStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              월간 통계 (최근 6개월)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyStats.map((stat) => (
                <div key={stat.month} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div>
                    <div className="text-sm text-gray-500">기간</div>
                    <div className="font-semibold">{stat.month}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">사용자</div>
                    <div className="font-semibold">{stat.userCount}명</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">미션</div>
                    <div className="font-semibold">{stat.missionCount}개</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">페이백</div>
                    <div className="font-semibold">{stat.paybackAmount.toLocaleString()}원</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}