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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">🚗</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">드라이빙존</h1>
              <p className="text-muted-foreground text-sm">미션 페이백 시스템</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => router.push('/test')}
          >
            🧪
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-4 mb-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            운전면허 합격을 축하합니다! 🎉
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            미션을 완료하고 최대 <span className="text-primary font-bold">87,000원</span>까지 페이백을 받아보세요
          </p>
          <div className="flex flex-col space-y-3">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold py-4 rounded-2xl"
              onClick={handleGetStarted}
            >
              {isAuthenticated ? '대시보드로 이동' : '시작하기'}
            </Button>
            {!isAuthenticated && (
              <Button
                variant="outline"
                size="lg"
                className="w-full border-border text-white hover:bg-secondary"
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
        <h3 className="text-white font-semibold text-lg mb-4">미션 목록</h3>
        <div className="space-y-4">
          <Card className="card-hover gradient-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">🏆 재능충 챌린지</CardTitle>
                <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                  20,000원
                </div>
              </div>
              <CardDescription className="text-muted-foreground">
                교육시간 14시간 이내 합격!
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">합격 인증 시 페이백</span>
                <Button size="sm" variant="ghost" className="text-primary">
                  자세히 보기 →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover gradient-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">📱 SNS 인증</CardTitle>
                <div className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                  10,000원
                </div>
              </div>
              <CardDescription className="text-muted-foreground">
                합격 자랑하고 페이백 받자!
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">SNS 업로드 시 페이백</span>
                <Button size="sm" variant="ghost" className="text-primary">
                  자세히 보기 →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover gradient-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">📝 후기 쓰기</CardTitle>
                <div className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
                  커피쿠폰
                </div>
              </div>
              <CardDescription className="text-muted-foreground">
                3개 플랫폼 후기 작성
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">+ 월 20만원 장학금 추첨</span>
                <Button size="sm" variant="ghost" className="text-primary">
                  자세히 보기 →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover gradient-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">👥 친구 추천</CardTitle>
                <div className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs font-medium">
                  50,000원
                </div>
              </div>
              <CardDescription className="text-muted-foreground">
                친구 3명 추천하면
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">추천 성공 시 페이백</span>
                <Button size="sm" variant="ghost" className="text-primary">
                  자세히 보기 →
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 mb-8">
        <h3 className="text-white font-semibold text-lg mb-4">특별한 혜택</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center space-x-4 p-4 bg-secondary/50 rounded-2xl">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <h4 className="text-white font-semibold">간편한 페이백</h4>
              <p className="text-muted-foreground text-sm">미션 완료 시 자동으로 페이백 금액이 적립됩니다</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-secondary/50 rounded-2xl">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <div>
              <h4 className="text-white font-semibold">모바일 최적화</h4>
              <p className="text-muted-foreground text-sm">스마트폰에서도 편리하게 미션을 수행할 수 있습니다</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-secondary/50 rounded-2xl">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔒</span>
            </div>
            <div>
              <h4 className="text-white font-semibold">안전한 시스템</h4>
              <p className="text-muted-foreground text-sm">개인정보 보호와 보안이 철저히 관리됩니다</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-8 border-t border-border">
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-2">
            © 2024 드라이빙존 미션 시스템
          </p>
          <p className="text-muted-foreground text-xs">
            문의사항이 있으시면 고객센터로 연락주세요
          </p>
        </div>
      </div>
    </div>
  )
}
