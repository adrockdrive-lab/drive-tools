'use client'

import { GameDashboard } from '@/components/gamification/GameDashboard'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const router = useRouter()
  const {
    isAuthenticated,
    isLoading,
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

  if (!isAuthenticated) {
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
