'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, initializeApp, isLoading } = useAppStore()

  useEffect(() => {
    const initialize = async () => {
      try {
        if (typeof window !== 'undefined') {
          const { testSupabaseConnection } = await import('@/lib/test-connection')
          const testResult = await testSupabaseConnection()

          if (!testResult.success) {
            console.error('Supabase connection failed:', testResult.error)
            return
          }

          await initializeApp()
        }
      } catch (error) {
        console.error('Failed to initialize app:', error)
      }
    }
    initialize()
  }, [initializeApp])

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/register')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">🚗</span>
              </div>
              <div>
                <h1 className="text-gray-900 font-bold text-xl">드라이빙존</h1>
                <p className="text-gray-600 text-sm">미션 페이백 시스템</p>
              </div>
            </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600"
            onClick={() => router.push('/test')}
          >
            🧪
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-4 mb-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            운전면허 합격을 축하합니다! 🎉
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            미션을 완료하고 최대 <span className="text-blue-600 font-bold">87,000원</span>까지 페이백을 받아보세요
          </p>
          <div className="flex flex-col space-y-3">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-600/90 hover:to-purple-600/90 text-black font-semibold py-4 rounded-2xl"
              onClick={handleGetStarted}
            >
              {isAuthenticated ? '대시보드로 이동' : '시작하기'}
            </Button>
            {!isAuthenticated && (
              <Button
                variant="outline"
                size="lg"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => router.push('/login')}
              >
                로그인
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mission Cards */}
      <div className="px-4 mb-8">
        <h3 className="text-gray-900 font-semibold text-lg mb-4">미션 목록</h3>
        <div className="space-y-4">
          <Card className="card-hover bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900 text-lg">🏆 재능충</CardTitle>
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  2만원
                </div>
              </div>
              <CardDescription className="text-gray-600">
                합격 등록하고 페이백 받기
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">합격 인증 시 페이백</span>
                <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => router.push('/missions/challenge')}>
                  자세히 보기 →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900 text-lg">📱 SNS 인증</CardTitle>
                <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  1만원
                </div>
              </div>
              <CardDescription className="text-gray-600">
                SNS에 링크 등록하고 페이백 받기
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">링크 등록 시 페이백</span>
                <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => router.push('/missions/sns')}>
                  자세히 보기 →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900 text-lg">📝 후기 쓰기</CardTitle>
                <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                  커피쿠폰 최대 3잔
                </div>
              </div>
              <CardDescription className="text-gray-600">
                3개 플랫폼 후기 작성
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">리뷰 달성 시 최대 3잔</span>
                <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => router.push('/missions/review')}>
                  자세히 보기 →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900 text-lg">👥 친구 추천</CardTitle>
                <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                  최대 15만원
                </div>
              </div>
              <CardDescription className="text-gray-600">
                지인 추천하고 페이백 받기 (1인당 5만원)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">추천 성공 시 페이백</span>
                <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => router.push('/missions/referral')}>
                  자세히 보기 →
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 mb-8">
        <h3 className="text-gray-900 font-semibold text-lg mb-4">특별한 혜택</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold">간편한 페이백</h4>
              <p className="text-gray-600 text-sm">미션 완료 시 자동으로 페이백 금액이 적립됩니다</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-2xl">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold">모바일 최적화</h4>
              <p className="text-gray-600 text-sm">스마트폰에서도 편리하게 미션을 수행할 수 있습니다</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-2xl">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔒</span>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold">안전한 시스템</h4>
              <p className="text-gray-600 text-sm">개인정보 보호와 보안이 철저히 관리됩니다</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-8 border-t border-gray-200">
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-2">
            © 2024 드라이빙존 미션 시스템
          </p>
          <p className="text-gray-500 text-xs">
            문의사항이 있으시면 고객센터로 연락주세요
          </p>
        </div>
      </div>
    </div>
  )
}
