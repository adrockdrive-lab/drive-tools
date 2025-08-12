'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { adminService } from '@/lib/services/admin'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // 이미 로그인된 경우 대시보드로 리다이렉트
    const currentAdmin = adminService.getCurrentAdmin()
    if (currentAdmin) {
      router.push('/admin/dashboard')
    }
  }, [router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast.error('이메일과 비밀번호를 입력해주세요.')
      return
    }

    setIsLoading(true)
    try {
      const result = await adminService.login(formData.email, formData.password)

      if (result.success && result.admin) {
        toast.success('로그인되었습니다.')
        router.push('/admin/dashboard')
      } else {
        toast.error(result.error || '로그인에 실패했습니다.')
      }
    } catch (error) {
      toast.error('로그인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 서버 사이드 렌더링 중에는 로딩 상태 표시
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-gray-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="mb-4">
            <div className="text-4xl mb-2">👨‍💼</div>
            <CardTitle className="text-2xl font-bold text-gray-900">관리자 로그인</CardTitle>
            <p className="text-gray-600 mt-2">
              지점별 사용자 관리 시스템
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-900">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="bg-gray-50 border-gray-300 text-gray-900"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-900">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="bg-gray-50 border-gray-300 text-gray-900"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>

            {/* 임시 테스트 버튼 */}
            <Button
              type="button"
              onClick={async () => {
                console.log('테스트 로그인 시도')
                const result = await adminService.login('admin@drivingzone.com', 'admin123!')
                console.log('테스트 로그인 결과:', result)
                if (result.success) {
                  toast.success('테스트 로그인 성공!')
                  router.push('/admin/dashboard')
                } else {
                  toast.error(result.error || '테스트 로그인 실패')
                }
              }}
              className="w-full mt-2 bg-gray-500 hover:bg-gray-600"
            >
              테스트 로그인
            </Button>

            {/* 데이터베이스 연결 테스트 버튼 */}
            <Button
              type="button"
              onClick={async () => {
                console.log('데이터베이스 연결 테스트')
                try {
                  const { data, error } = await supabase
                    .from('admin_users')
                    .select('count')
                    .eq('email', 'admin@drivingzone.com')
                    .single()

                  console.log('DB 연결 테스트 결과:', { data, error })
                  if (error) {
                    toast.error('DB 연결 실패: ' + error.message)
                  } else {
                    toast.success('DB 연결 성공!')
                  }
                } catch (err) {
                  console.error('DB 연결 테스트 오류:', err)
                  toast.error('DB 연결 테스트 오류')
                }
              }}
              className="w-full mt-2 bg-blue-500 hover:bg-blue-600"
            >
              DB 연결 테스트
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
