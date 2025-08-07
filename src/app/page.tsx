'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, initializeApp, isLoading } = useAppStore()

  useEffect(() => {
    const initialize = async () => {
      try {
        // 먼저 Supabase 연결 테스트
        const { testSupabaseConnection } = await import('@/lib/test-connection')
        const testResult = await testSupabaseConnection()
        
        if (!testResult.success) {
          console.error('Supabase connection failed:', testResult.error)
          return
        }
        
        await initializeApp()
      } catch (error) {
        console.error('Failed to initialize app:', error)
      }
    }
    initialize()
  }, [])

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/register')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            🚗 드라이빙존
            <br />
            <span className="text-blue-600">미션 페이백 시스템</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            운전면허 합격을 축하합니다! 미션을 완료하고 페이백을 받아보세요.
            <br />
            최대 <span className="font-bold text-blue-600">8만 7천원</span>까지 혜택을 받을 수 있습니다!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="px-8 py-3 text-lg"
              onClick={handleGetStarted}
            >
              {isAuthenticated ? '대시보드로 이동' : '회원가입'}
            </Button>
            {!isAuthenticated && (
              <Button 
                variant="outline"
                size="lg" 
                className="px-8 py-3 text-lg"
                onClick={() => router.push('/login')}
              >
                로그인
              </Button>
            )}
            <Button 
              variant="ghost"
              size="lg" 
              className="px-8 py-3 text-lg text-gray-600"
              onClick={() => router.push('/test')}
            >
              🧪 연결 테스트
            </Button>
          </div>
        </div>

        {/* Mission Cards Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">🏆 재능충 챌린지</CardTitle>
              <CardDescription>교육시간 14시간 이내 합격!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">20,000원</div>
              <p className="text-sm text-gray-500">합격 인증 시 페이백</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">📱 SNS 인증</CardTitle>
              <CardDescription>합격 자랑하고 페이백 받자!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">10,000원</div>
              <p className="text-sm text-gray-500">SNS 업로드 시 페이백</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">📝 후기 쓰기</CardTitle>
              <CardDescription>3개 플랫폼 후기 작성</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-2">커피쿠폰</div>
              <p className="text-sm text-gray-500">+ 월 20만원 장학금 추첨</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">👥 친구 추천</CardTitle>
              <CardDescription>친구 3명 추천하면</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2">50,000원</div>
              <p className="text-sm text-gray-500">추천 성공 시 페이백</p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">간편한 페이백</h3>
            <p className="text-gray-600">미션 완료 시 자동으로 페이백 금액이 적립됩니다.</p>
          </div>
          <div>
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">모바일 최적화</h3>
            <p className="text-gray-600">스마트폰에서도 편리하게 미션을 수행할 수 있습니다.</p>
          </div>
          <div>
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">안전한 시스템</h3>
            <p className="text-gray-600">개인정보 보호와 보안이 철저히 관리됩니다.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4">© 2024 드라이빙존 미션 시스템. All rights reserved.</p>
          <p className="text-gray-400 text-sm">
            문의사항이 있으시면 고객센터로 연락주세요.
          </p>
        </div>
      </footer>
    </div>
  )
}
