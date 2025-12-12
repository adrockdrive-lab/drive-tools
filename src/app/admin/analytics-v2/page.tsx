'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Users as UsersIcon
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

export default function AnalyticsV2Page() {
  const router = useRouter()
  const [dateRange, setDateRange] = useState('7')
  const [isLoading, setIsLoading] = useState(false)

  const signupData = [
    { date: '11/04', count: 12 },
    { date: '11/05', count: 18 },
    { date: '11/06', count: 15 },
    { date: '11/07', count: 22 },
    { date: '11/08', count: 28 },
    { date: '11/09', count: 25 },
    { date: '11/10', count: 32 },
  ]

  const missionCompletionData = [
    { name: 'SNS 인증', value: 145, rate: 72 },
    { name: '출석 체크', value: 203, rate: 89 },
    { name: '퀴즈', value: 167, rate: 65 },
    { name: '챌린지', value: 89, rate: 45 },
    { name: '추천', value: 56, rate: 38 },
  ]

  const missionTypeData = [
    { name: 'SNS 인증', value: 145 },
    { name: '출석 체크', value: 203 },
    { name: '퀴즈', value: 167 },
    { name: '챌린지', value: 89 },
    { name: '친구 추천', value: 56 },
  ]

  const storeComparisonData = [
    { store: '강남점', users: 234, missions: 1245, payback: 2500000 },
    { store: '홍대점', users: 189, missions: 987, payback: 1890000 },
    { store: '판교점', users: 156, missions: 823, payback: 1560000 },
  ]

  const timeSeriesData = [
    { hour: '00:00', count: 5 },
    { hour: '03:00', count: 3 },
    { hour: '06:00', count: 12 },
    { hour: '09:00', count: 45 },
    { hour: '12:00', count: 67 },
    { hour: '15:00', count: 52 },
    { hour: '18:00', count: 78 },
    { hour: '21:00', count: 56 },
  ]

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    try {
      const currentAdmin = JSON.parse(localStorage.getItem('admin') || '{}')
      if (!currentAdmin.id) {
        router.push('/admin/login')
        return
      }
    } catch (error) {
      router.push('/admin/login')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">통계 및 분석</h1>
          <p className="text-gray-600 mt-2">데이터 기반 인사이트를 확인하세요</p>
        </div>

        <div className="flex items-center space-x-2">
          <Label>기간</Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">최근 7일</SelectItem>
              <SelectItem value="30">최근 30일</SelectItem>
              <SelectItem value="90">최근 90일</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 가입자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">1,234</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">+12%</span>
              <span className="text-sm text-gray-500 ml-2">vs 지난주</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">미션 완료율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">68%</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">+5%</span>
              <span className="text-sm text-gray-500 ml-2">vs 지난주</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 페이백</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">5,950,000원</div>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-sm font-medium text-red-600">-3%</span>
              <span className="text-sm text-gray-500 ml-2">vs 지난주</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">활성 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">892</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">+8%</span>
              <span className="text-sm text-gray-500 ml-2">vs 지난주</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">전체 통계</TabsTrigger>
          <TabsTrigger value="missions">미션 분석</TabsTrigger>
          <TabsTrigger value="stores">지점 비교</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>가입자 추이</CardTitle>
              <CardDescription>일별 신규 가입자 수</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={signupData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="가입자 수"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>시간대별 활동</CardTitle>
              <CardDescription>시간대별 미션 참여율</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8b5cf6" name="참여 수" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>미션 타입별 분포</CardTitle>
                <CardDescription>미션 타입별 완료 건수</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={missionTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {missionTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>미션별 완료율</CardTitle>
                <CardDescription>미션 타입별 완료율 비교</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={missionCompletionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rate" fill="#10b981" name="완료율 (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>미션별 성과</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {missionCompletionData.map((mission, index) => (
                  <div key={mission.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <div className="font-medium text-gray-900">{mission.name}</div>
                        <div className="text-sm text-gray-500">{mission.value}건 완료</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{mission.rate}%</div>
                      <div className="text-sm text-gray-500">완료율</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>지점별 비교</CardTitle>
              <CardDescription>지점별 주요 지표 비교</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={storeComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="store" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#3b82f6" name="사용자 수" />
                  <Bar dataKey="missions" fill="#8b5cf6" name="미션 완료" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {storeComparisonData.map((store, index) => (
              <Card key={store.store}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{store.store}</span>
                    <Badge className={
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      'bg-orange-600'
                    }>
                      {index === 0 ? '1위' : index === 1 ? '2위' : '3위'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <UsersIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">사용자</span>
                    </div>
                    <div className="font-bold text-gray-900">{store.users}명</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">미션 완료</span>
                    </div>
                    <div className="font-bold text-gray-900">{store.missions}건</div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-sm text-gray-600">총 페이백</span>
                    <div className="font-bold text-purple-600">
                      {(store.payback / 10000).toFixed(0)}만원
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
