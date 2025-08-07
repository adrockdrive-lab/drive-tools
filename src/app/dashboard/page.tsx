'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { GameDashboard } from '@/components/gamification/GameDashboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  const router = useRouter()
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    missions, 
    userMissions, 
    totalPayback,
    logout,
    initializeApp
  } = useAppStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/register')
      return
    }
    
    // 데이터 로딩
    const loadData = async () => {
      try {
        console.log('Dashboard: Loading data...')
        await initializeApp()
        console.log('Dashboard: Data loaded successfully')
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      }
    }
    
    loadData()
  }, [isAuthenticated, router, initializeApp])

  // 디버깅을 위한 로그
  console.log('Dashboard render:', { 
    isAuthenticated, 
    user: user?.name, 
    missionsCount: missions.length,
    missions: missions.map(m => ({ id: m.id, title: m.title, type: m.missionType }))
  })

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const getMissionStatus = (missionId: number) => {
    const userMission = userMissions.find(um => um.missionId === missionId)
    return userMission?.status || 'pending'
  }

  const getMissionButtonText = (missionId: number) => {
    const status = getMissionStatus(missionId)
    switch (status) {
      case 'pending': return '시작하기'
      case 'in_progress': return '진행 중'
      case 'completed': return '검토 중'
      case 'verified': return '완료됨'
      default: return '시작하기'
    }
  }

  const getMissionCardClass = (missionId: number) => {
    const status = getMissionStatus(missionId)
    const baseClass = 'hover:shadow-lg transition-all duration-200 cursor-pointer'
    
    switch (status) {
      case 'pending': return `${baseClass} border-gray-200`
      case 'in_progress': return `${baseClass} border-blue-300 bg-blue-50`
      case 'completed': return `${baseClass} border-yellow-300 bg-yellow-50`
      case 'verified': return `${baseClass} border-green-300 bg-green-50`
      default: return `${baseClass} border-gray-200`
    }
  }

  const handleMissionClick = (missionType: string, missionId: number) => {
    const status = getMissionStatus(missionId)
    if (status === 'verified') return // 완료된 미션은 클릭 불가
    
    // 미션 타입에 따라 다른 페이지로 이동
    router.push(`/missions/${missionType}`)
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">로그인 확인 중...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">게임 대시보드 로딩 중...</p>
        </div>
      </div>
    )
  }

  // Use the new GameDashboard component
  return <GameDashboard />
}