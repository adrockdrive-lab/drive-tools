'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HoverScale, SlideIn, CountUp } from '@/components/animations/MicroInteractions'
import { StaggerContainer, StaggerItem } from '@/components/animations/PageTransition'
import { MobileContainer, ResponsiveGrid, useResponsive } from '@/components/layout/ResponsiveLayout'
import { gamificationService } from '@/lib/services/gamification'
import { useAppStore } from '@/lib/store'
import type { UserLevel } from '@/types'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { LevelBadge } from './LevelSystem'
import { MissionCard } from './MissionCard'
import { ProgressRing } from './ProgressRing'

export default function GameDashboard() {
  const { user, missions, userMissions, totalPayback, referrals, isLoading } = useAppStore()
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null)
  const { isMobile, isTablet } = useResponsive()
  const [stats, setStats] = useState({
    completedMissions: 0,
    totalMissions: 0,
    completionRate: 0
  })

  // 통계 계산
  useEffect(() => {
    if (userMissions && missions) {
      const completed = userMissions.filter(m => m.status === 'completed').length
      const total = missions.length
      setStats({
        completedMissions: completed,
        totalMissions: total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      })
    }
  }, [userMissions, missions])

  // 사용자 레벨 로드
  useEffect(() => {
    if (user?.id) {
      loadUserLevel()
    }
  }, [user?.id])

  const loadUserLevel = async () => {
    if (!user?.id) return
    
    try {
      const result = await gamificationService.getUserLevel(user.id)
      if (result.success && result.userLevel) {
        setUserLevel(result.userLevel)
      }
    } catch (error) {
      console.error('레벨 로드 오류:', error)
    }
  }

  // 사용자 정보 확인
  useEffect(() => {
    if (!user) {
      toast.error('사용자 정보를 불러올 수 없습니다.')
    }
  }, [user])



  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-secondary rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <MobileContainer className="space-y-6">
        {/* 환영 메시지 */}
        <SlideIn direction="down" className={`
          flex flex-col space-y-4 
          ${isMobile ? 'text-center' : 'lg:flex-row lg:items-center lg:justify-between lg:space-y-0'}
        `}>
          <div className={`${isMobile ? 'space-y-2' : 'flex items-center space-x-4'}`}>
            <div>
              <h1 className={`font-bold text-black ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                안녕하세요, {user?.name}님! 👋
              </h1>
              <p className="text-muted-foreground text-sm">
                드라이빙존에서 미션을 완료하고 보상을 받아보세요
              </p>
            </div>
          </div>
          
          {userLevel && (
            <SlideIn direction="left" delay={0.2} className={`
              flex items-center justify-center space-x-3 
              ${isMobile ? 'bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-xl' : ''}
            `}>
              <HoverScale scale={1.1}>
                <LevelBadge level={userLevel.level} size={isMobile ? "sm" : "md"} />
              </HoverScale>
              <div className="text-center">
                <div className="text-sm font-medium text-black">레벨 {userLevel.level}</div>
                <div className="text-xs text-muted-foreground">
                  <CountUp to={userLevel.experiencePoints} suffix="/100 XP" />
                </div>
              </div>
            </SlideIn>
          )}
        </SlideIn>

        {/* 통계 카드 */}
        <StaggerContainer 
          delay={0.3}
          staggerDelay={0.15}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <StaggerItem>
            <HoverScale>
              <Card className="gradient-card border-border h-full">
                <CardHeader className={`${isMobile ? 'pb-3' : 'pb-2'}`}>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    총 페이백
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`font-bold text-black ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                    <CountUp to={totalPayback || 0} suffix="원" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    지금까지 받은 총 보상
                  </p>
                </CardContent>
              </Card>
            </HoverScale>
          </StaggerItem>

          <StaggerItem>
            <HoverScale>
              <Card className="gradient-card border-border h-full">
                <CardHeader className={`${isMobile ? 'pb-3' : 'pb-2'}`}>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    미션 완료율
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`flex items-center ${isMobile ? 'justify-center' : 'space-x-2'}`}>
                    <ProgressRing
                      progress={stats.completionRate}
                      size={isMobile ? "md" : "lg"}
                    />
                    <div className={isMobile ? 'ml-3' : ''}>
                      <div className={`font-bold text-black ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                        <CountUp to={stats.completionRate} suffix="%" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <CountUp to={stats.completedMissions} />/<CountUp to={stats.totalMissions} /> 완료
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </HoverScale>
          </StaggerItem>

          <StaggerItem>
            <HoverScale>
              <Card className="gradient-card border-border h-full">
                <CardHeader className={`${isMobile ? 'pb-3' : 'pb-2'}`}>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    추천 보너스
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`font-bold text-black ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                    <CountUp to={referrals.length > 0 ? referrals.length * 50000 : 0} suffix="원" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    친구 추천으로 받은 보상
                  </p>
                </CardContent>
              </Card>
            </HoverScale>
          </StaggerItem>
        </StaggerContainer>

        {/* 미션 그리드 */}
        <SlideIn direction="up" delay={0.6} className="space-y-4">
          <div className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-2' : ''}`}>
            <h2 className={`font-bold text-black ${isMobile ? 'text-lg text-center' : 'text-xl'}`}>
              진행 중인 미션
            </h2>
            <Badge variant="secondary" className="text-xs">
              <CountUp to={userMissions.filter(m => m.status === 'in_progress').length} suffix="개 진행 중" />
            </Badge>
          </div>

          <StaggerContainer 
            delay={0.8}
            staggerDelay={0.2}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {missions.map((mission, index) => {
              const userMission = userMissions.find(um => um.missionId === mission.id)
              const missionWithStatus = {
                ...mission,
                status: userMission?.status || 'pending'
              }

              return (
                <StaggerItem key={mission.id} index={index}>
                  <HoverScale scale={1.02}>
                    <MissionCard
                      mission={missionWithStatus}
                    />
                  </HoverScale>
                </StaggerItem>
              )
            })}
          </StaggerContainer>

          {missions.length === 0 && (
            <SlideIn direction="up" delay={0.8}>
              <Card className="gradient-card border-border">
                <CardContent className={`text-center ${isMobile ? 'py-6' : 'py-8'}`}>
                  <div className={`mb-4 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>🎯</div>
                  <h3 className={`font-semibold text-black mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                    진행 가능한 미션이 없습니다
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    새로운 미션이 곧 추가될 예정입니다.
                  </p>
                </CardContent>
              </Card>
            </SlideIn>
          )}
        </SlideIn>

        {/* CTA 섹션 */}
        <SlideIn direction="up" delay={0.9}>
          <HoverScale scale={1.01}>
            <Card className="gradient-card border-border">
              <CardContent className={`text-center ${isMobile ? 'py-6' : 'py-8'}`}>
                <div className={`mb-4 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>🚀</div>
                <h3 className={`font-bold text-black mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                  더 많은 보상을 받아보세요!
                </h3>
                <p className={`text-muted-foreground mb-4 ${isMobile ? 'text-sm' : ''}`}>
                  미션을 완료하고 페이백을 받아보세요. 친구를 추천하면 추가 보상도 받을 수 있습니다.
                </p>
                <div className={`flex gap-3 justify-center ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'}`}>
                  <HoverScale scale={1.05}>
                    <Button
                      size={isMobile ? "lg" : "default"}
                      className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                      onClick={() => window.location.href = '/missions/challenge'}
                    >
                      챌린지 미션
                    </Button>
                  </HoverScale>
                  <HoverScale scale={1.05}>
                    <Button
                      size={isMobile ? "lg" : "default"}
                      variant="outline"
                      className="border-border text-black hover:bg-secondary"
                      onClick={() => window.location.href = '/missions/referral'}
                    >
                      친구 추천
                    </Button>
                  </HoverScale>
                </div>
              </CardContent>
            </Card>
          </HoverScale>
        </SlideIn>
    </MobileContainer>
  )
}
