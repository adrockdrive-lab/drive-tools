'use client'

import { useAppStore } from '@/lib/store'
import { useEffect, useState } from 'react'

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  const { initializeApp, isLoading, error, clearError } = useAppStore()
  const [initialized, setInitialized] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing app...')
        await initializeApp()
        console.log('App initialized successfully')
        setInitialized(true)
      } catch (error) {
        console.error('App initialization failed:', error)
        // 3번까지 재시도
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
          }, 2000)
        }
      }
    }

    if (!initialized) {
      initialize()
    }
  }, [initializeApp, initialized, retryCount])

  // 에러 상태
  if (error && retryCount >= 3) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-4">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">앱 초기화 실패</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              clearError()
              setRetryCount(0)
              setInitialized(false)
            }}
            className="px-4 py-2 bg-blue-600 text-black rounded-md hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  // 로딩 상태
  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">앱 초기화 중...</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-400 mt-2">재시도 {retryCount}/3</p>
          )}
        </div>
      </div>
    )
  }

  return <>{children}</>
}
