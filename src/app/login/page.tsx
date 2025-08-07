'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { ArrowRight, Coins, Phone, Target, Trophy, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, login } = useAppStore()
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const validatePhone = () => {
    if (!phone.trim()) {
      toast.error('휴대폰 번호를 입력해주세요.')
      return false
    }

    // 휴대폰 번호 형식 검증
    const cleanPhone = phone.replace(/[^\d]/g, '')
    if (cleanPhone.length !== 11 || !cleanPhone.startsWith('010')) {
      toast.error('올바른 휴대폰 번호를 입력해주세요.')
      return false
    }

    return true
  }

  const handleLogin = async () => {
    if (!validatePhone()) return

    setIsLoading(true)
    try {
      const formattedPhone = phone.replace(/[^\d]/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '010-$2-$3')
      await login(formattedPhone)

      toast.success('로그인 성공!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      if (error instanceof Error && error.message.includes('User not found')) {
        toast.error('가입되지 않은 전화번호입니다. 회원가입을 먼저 진행해주세요.')
      } else {
        toast.error('로그인에 실패했습니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">대시보드로 이동 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      {/* 배경 데코레이션 */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* 로고 및 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="inline-block w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-4xl mb-4"
          >
            🚗
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            드라이빙존 로그인
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            미션을 완료하고 페이백을 받아보세요!
          </p>
        </motion.div>

        {/* 로그인 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center space-x-2">
                <User className="w-5 h-5" />
                <span>로그인</span>
              </CardTitle>
              <CardDescription>
                등록된 휴대폰 번호로 로그인해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="phone" className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>휴대폰 번호</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="010-0000-0000"
                  className="h-12 text-lg bg-white/50 dark:bg-gray-800/50 mt-2"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '')
                    const formatted = value.replace(/(\d{3})(\d{4})(\d{4})/, '010-$2-$3')
                    setPhone(formatted)
                  }}
                  onKeyPress={handleKeyPress}
                  maxLength={13}
                  disabled={isLoading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  회원가입 시 등록한 휴대폰 번호를 입력해주세요
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>로그인 중...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>로그인</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </motion.div>

              {/* 회원가입 링크 */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    아직 계정이 없으시나요?
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link href="/register">
                      <Button
                        variant="outline"
                        className="w-full h-12 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-700 dark:hover:bg-blue-900/20 transition-all duration-300"
                        disabled={isLoading}
                      >
                        <div className="flex items-center space-x-2">
                          <User className="w-5 h-5" />
                          <span>회원가입 하기</span>
                        </div>
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </div>

              {/* 홈으로 돌아가기 */}
              <div className="text-center pt-2">
                <Link
                  href="/"
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  홈으로 돌아가기
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 추가 정보 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8"
        >
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-lg p-6 border border-white/20 dark:border-gray-800/20">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                🎯 미션 완료하고 페이백 받기!
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">4가지 미션</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">다양한 미션</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                  <Coins className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">87,000원</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">최대 페이백</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">즉시 지급</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">빠른 페이백</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
