'use client'

import { useState, useEffect } from 'react'
import { Plus, Send, Users, TrendingUp, Gift, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { marketingService, type MarketingCampaign, type Coupon } from '@/lib/services/marketing'
import { toast } from 'sonner'

export function MarketingDashboard() {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [campaignsResult, couponsResult] = await Promise.all([
        marketingService.getCampaigns(),
        marketingService.getCoupons()
      ])

      if (campaignsResult.success && campaignsResult.campaigns) {
        setCampaigns(campaignsResult.campaigns)
      }

      if (couponsResult.success && couponsResult.coupons) {
        setCoupons(couponsResult.coupons)
      }
    } catch (error) {
      toast.error('데이터 로드에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case 'promotion': return <Gift className="h-4 w-4" />
      case 'announcement': return <Send className="h-4 w-4" />
      case 'event': return <Calendar className="h-4 w-4" />
      case 'mission': return <TrendingUp className="h-4 w-4" />
      default: return <Send className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 캠페인</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 캠페인</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter(c => c.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 쿠폰</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 쿠폰</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coupons.filter(c => c.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 탭 컨텐츠 */}
      <Tabs defaultValue="campaigns" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="campaigns">마케팅 캠페인</TabsTrigger>
            <TabsTrigger value="coupons">쿠폰 관리</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              새 캠페인
            </Button>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              새 쿠폰
            </Button>
          </div>
        </div>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>마케팅 캠페인 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  데이터를 불러오는 중...
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  등록된 캠페인이 없습니다.
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getCampaignTypeIcon(campaign.campaignType)}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                            {campaign.description && (
                              <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-500">
                                시작: {new Date(campaign.startDate).toLocaleDateString()}
                              </span>
                              {campaign.endDate && (
                                <span className="text-xs text-gray-500">
                                  종료: {new Date(campaign.endDate).toLocaleDateString()}
                                </span>
                              )}
                              <div className="flex gap-1">
                                {campaign.channels.map((channel) => (
                                  <Badge key={channel} variant="secondary" className="text-xs">
                                    {channel}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {campaign.campaignType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>쿠폰 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  데이터를 불러오는 중...
                </div>
              ) : coupons.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  등록된 쿠폰이 없습니다.
                </div>
              ) : (
                <div className="space-y-4">
                  {coupons.map((coupon) => (
                    <div key={coupon.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium text-gray-900">{coupon.name}</h3>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                              {coupon.code}
                            </code>
                          </div>
                          {coupon.description && (
                            <p className="text-sm text-gray-600 mt-1">{coupon.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-700">
                              할인: {coupon.discountType === 'percentage' 
                                ? `${coupon.discountValue}%` 
                                : `${coupon.discountValue}원`}
                            </span>
                            <span className="text-xs text-gray-500">
                              사용: {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                            </span>
                            <span className="text-xs text-gray-500">
                              기간: {new Date(coupon.validFrom).toLocaleDateString()} ~ {new Date(coupon.validUntil).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge className={coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {coupon.isActive ? '활성' : '비활성'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}