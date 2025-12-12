'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HoverScale, SlideIn, TapEffect, Bounce } from '@/components/animations/MicroInteractions'
import { Spinner } from '@/components/animations/LoadingAnimations'
import { type Mission } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ProgressRing } from './ProgressRing'

interface MissionCardProps {
  mission: Mission
}

export function MissionCard({ mission }: MissionCardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '완료'
      case 'in_progress':
        return '진행 중'
      case 'pending':
        return '대기'
      default:
        return '알 수 없음'
    }
  }

  const getMissionIcon = (missionType: string) => {
    switch (missionType) {
      case 'challenge':
        return '🎯'
      case 'sns':
        return '📱'
      case 'review':
        return '⭐'
      case 'referral':
        return '👥'
      case 'attendance':
        return '📅'
      default:
        return '📋'
    }
  }

  const handleAction = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      if (mission.status === 'pending') {
        // 미션 시작 - 해당 미션의 상세 페이지로 이동
        const missionPath = getMissionPath(mission.missionType)
        router.push(missionPath)
      } else if (mission.status === 'in_progress') {
        // 진행 중인 미션은 상세 페이지로 이동하여 완료 처리
        const missionPath = getMissionPath(mission.missionType)
        router.push(missionPath)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getMissionPath = (missionType: string): string => {
    switch (missionType) {
      case 'challenge':
        return '/missions/challenge'
      case 'sns':
        return '/missions/sns'
      case 'review':
        return '/missions/review'
      case 'referral':
        return '/missions/referral'
      case 'attendance':
        return '/missions/attendance'
      default:
        return '/missions/challenge'
    }
  }

  const getActionButton = () => {
    if (mission.status === 'completed') {
      return (
        <Bounce trigger={mission.status === 'completed'}>
          <Button disabled className="w-full bg-gray-500 text-white font-bold border-green-500/30">
            ✅ 완료됨
          </Button>
        </Bounce>
      )
    }

    if (mission.status === 'pending') {
      return (
        <HoverScale scale={1.02}>
          <TapEffect>
            <Button
              onClick={(e) => {
                e.stopPropagation()
                handleAction()
              }}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Spinner size="sm" color="white" />
                  <span>시작 중...</span>
                </div>
              ) : (
                '미션 시작'
              )}
            </Button>
          </TapEffect>
        </HoverScale>
      )
    }

    if (mission.status === 'in_progress') {
      return (
        <HoverScale scale={1.02}>
          <TapEffect>
            <Button
              onClick={(e) => {
                e.stopPropagation()
                handleAction()
              }}
              disabled={isLoading}
              variant="outline"
              className="w-full border-border text-black hover:bg-secondary"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Spinner size="sm" color="currentColor" />
                  <span>완료 중...</span>
                </div>
              ) : (
                '미션 완료'
              )}
            </Button>
          </TapEffect>
        </HoverScale>
      )
    }

    return null
  }

  return (
    <SlideIn direction="up" delay={0} threshold={0.1}>
      <HoverScale scale={1.03} disabled={isLoading}>
        <TapEffect
          onTap={() => {
            if (mission.status === 'pending' || mission.status === 'in_progress') {
              const missionPath = getMissionPath(mission.missionType)
              router.push(missionPath)
            }
          }}
        >
          <Card className="gradient-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <HoverScale scale={1.2}>
                    <span className="text-2xl transition-transform duration-200">
                      {getMissionIcon(mission.missionType)}
                    </span>
                  </HoverScale>
                  <div>
                    <CardTitle className="text-black text-base">
                      {mission.title}
                    </CardTitle>
                    <p className="text-muted-foreground text-xs">
                      {mission.missionType} 미션
                    </p>
                  </div>
                </div>
                <SlideIn direction="left" delay={0.1}>
                  <Badge
                    variant="outline"
                    className={`text-xs transition-all duration-200 ${getStatusColor(mission.status || 'pending')}`}
                  >
                    {getStatusText(mission.status || 'pending')}
                  </Badge>
                </SlideIn>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <SlideIn direction="up" delay={0.2}>
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {mission.description}
                </p>
              </SlideIn>

              <SlideIn direction="up" delay={0.3}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HoverScale scale={1.1}>
                      <span className="text-2xl">💰</span>
                    </HoverScale>
                    <div>
                      <div className="text-black font-bold">
                        {mission.rewardAmount ? mission.rewardAmount.toLocaleString() : '0'}원
                      </div>
                      <div className="text-muted-foreground text-xs">
                        보상 금액
                      </div>
                    </div>
                  </div>

                  {mission.status === 'in_progress' && (
                    <SlideIn direction="right" delay={0.4}>
                      <div className="flex items-center space-x-2">
                        <ProgressRing progress={50} size="md" />
                        <span className="text-muted-foreground text-xs">진행률</span>
                      </div>
                    </SlideIn>
                  )}
                </div>
              </SlideIn>

              <SlideIn direction="up" delay={0.4}>
                {getActionButton()}
              </SlideIn>
            </CardContent>
          </Card>
        </TapEffect>
      </HoverScale>
    </SlideIn>
  )
}
