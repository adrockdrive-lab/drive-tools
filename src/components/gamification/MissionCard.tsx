'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type Mission } from '@/types'
import { useState } from 'react'
import { ProgressRing } from './ProgressRing'

interface MissionCardProps {
  mission: Mission
  onStart?: () => void
  onComplete?: () => void
}

export function MissionCard({ mission, onStart, onComplete }: MissionCardProps) {
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
      if (mission.status === 'pending' && onStart) {
        await onStart()
      } else if (mission.status === 'in_progress' && onComplete) {
        await onComplete()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getActionButton = () => {
    if (mission.status === 'completed') {
      return (
        <Button disabled className="w-full bg-green-500/20 text-green-400 border-green-500/30">
          ✅ 완료됨
        </Button>
      )
    }

    if (mission.status === 'pending') {
      return (
        <Button
          onClick={handleAction}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
        >
          {isLoading ? '시작 중...' : '미션 시작'}
        </Button>
      )
    }

    if (mission.status === 'in_progress') {
      return (
        <Button
          onClick={handleAction}
          disabled={isLoading}
          variant="outline"
          className="w-full border-border text-white hover:bg-secondary"
        >
          {isLoading ? '완료 중...' : '미션 완료'}
        </Button>
      )
    }

    return null
  }

  return (
    <Card className="gradient-card border-border hover:border-primary/50 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getMissionIcon(mission.missionType)}</span>
            <div>
              <CardTitle className="text-white text-base">
                {mission.title}
              </CardTitle>
              <p className="text-muted-foreground text-xs">
                {mission.missionType} 미션
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-xs ${getStatusColor(mission.status || 'pending')}`}
          >
            {getStatusText(mission.status || 'pending')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm line-clamp-2">
          {mission.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💰</span>
            <div>
              <div className="text-white font-bold">
                {mission.rewardAmount.toLocaleString()}원
              </div>
              <div className="text-muted-foreground text-xs">
                보상 금액
              </div>
            </div>
          </div>

          {mission.status === 'in_progress' && (
            <div className="flex items-center space-x-2">
              <ProgressRing progress={50} size="md" />
              <span className="text-muted-foreground text-xs">진행률</span>
            </div>
          )}
        </div>

        {getActionButton()}
      </CardContent>
    </Card>
  )
}
