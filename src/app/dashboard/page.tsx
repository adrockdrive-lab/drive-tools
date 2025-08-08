'use client'

import { GameDashboard } from '@/components/gamification/GameDashboard'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const {
    isAuthenticated,
    isLoading,
    initializeApp
  } = useAppStore()

  // 클라이언트 사이드에서만 실행되도록 보장
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

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
  }, [isMounted, isAuthenticated, router, initializeApp])

  // 서버 사이드에서는 빈 화면 반환
  if (!isMounted) {
    return null
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로그인 확인 중...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">게임 대시보드 로딩 중...</p>
        </div>
      </div>
    )
  }

  // Use the new GameDashboard component
  return <GameDashboard />
}
