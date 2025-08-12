'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { ArrowRight, Coins, Phone, Target, Trophy, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated } = useAppStore()
  const [phone, setPhone] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

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

  const handleSendCode = async () => {
    if (!validatePhone()) return

    setIsLoading(true)
    try {
      const { authService } = await import('@/lib/services/auth')
      const result = await authService.sendVerificationCode(phone)

      if (result.success) {
        setCodeSent(true)
        toast.success('인증 코드가 전송되었습니다.')
      } else {
        toast.error(result.error || '인증 코드 전송에 실패했습니다.')
      }
    } catch (error) {
      console.error('Send code error:', error)
      toast.error('인증 코드 전송에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!validatePhone()) return
    if (!verificationCode.trim()) {
      toast.error('인증 코드를 입력해주세요.')
      return
    }

    setIsLoading(true)
    try {
      const { authService } = await import('@/lib/services/auth')
      const result = await authService.login({
        phone,
        verificationCode
      })

      if (result.success && result.user) {
        console.log('Auth service login successful:', result.user)

        // Store의 login 함수 사용
        const { login } = useAppStore.getState()
        console.log('Calling store login function...')
        await login(phone)

        console.log('Store login completed. Current state:', {
          user: useAppStore.getState().user,
          isAuthenticated: useAppStore.getState().isAuthenticated
        })

        toast.success('로그인 성공!')
        router.push('/dashboard')
      } else {
        toast.error(result.error || '로그인에 실패했습니다.')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('로그인에 실패했습니다.')
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">대시보드로 이동 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Status Bar */}
      <div className="h-6 bg-gray-50 absolute top-0 left-0 right-0"></div>

      <div className="w-full max-w-md">
        {/* 로고 및 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="inline-block w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-black text-3xl mb-4"
          >
            🚗
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            드라이빙존 로그인
          </h1>
          <p className="text-gray-600">
            미션을 완료하고 페이백을 받아보세요!
          </p>
        </motion.div>

        {/* 로그인 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="gradient-card border-border">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center space-x-2 text-gray-900">
                <UserIcon className="w-5 h-5" />
                <span>로그인</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                등록된 휴대폰 번호로 로그인해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                              <Label htmlFor="phone" className="flex items-center space-x-2 text-gray-900">
                <Phone className="w-4 h-4" />
                <span>휴대폰 번호</span>
              </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="010-0000-0000"
                                      className="h-12 text-lg bg-gray-100 border-gray-300 text-gray-900 mt-2"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '')
                    const formatted = value.replace(/(\d{3})(\d{4})(\d{4})/, '010-$2-$3')
                    setPhone(formatted)
                  }}
                  onKeyPress={handleKeyPress}
                  maxLength={13}
                  disabled={isLoading || codeSent}
                />
                            <p className="text-sm text-gray-600 mt-1">
              회원가입 시 등록한 휴대폰 번호를 입력해주세요
            </p>
              </div>

              {!codeSent ? (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleSendCode}
                    disabled={isLoading}
                    className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-600/90 hover:to-blue-700/90 transition-all duration-300"
                    size="lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>인증 코드 전송 중...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>인증 코드 받기</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </motion.div>
              ) : (
                <div>
                  <Label htmlFor="code" className="flex items-center space-x-2 text-black">
                    <span>인증 코드</span>
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="6자리 인증 코드"
                    className="h-12 text-lg bg-gray-100 border-gray-300 text-gray-900 mt-2"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^\d]/g, ''))}
                    onKeyPress={handleKeyPress}
                    maxLength={6}
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    SMS로 전송된 6자리 인증 코드를 입력해주세요
                  </p>
                </div>
              )}

              {codeSent && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleLogin}
                    disabled={isLoading || !verificationCode.trim()}
                    className="w-full h-12 text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300"
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
              )}

              {/* 회원가입 링크 */}
              <div className="pt-4 border-t border-border">
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    아직 계정이 없으시나요?
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link href="/register">
                      <Button
                        variant="outline"
                        className="w-full h-12 border-2 border-border hover:border-primary hover:bg-primary/10 text-black transition-all duration-300"
                        disabled={isLoading}
                      >
                        <div className="flex items-center space-x-2">
                          <UserIcon className="w-5 h-5" />
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
                  className="text-sm text-muted-foreground hover:text-black transition-colors"
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
          className="mt-6"
        >
          <div className="gradient-card rounded-2xl p-4 border border-border">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-black mb-2">
                🎯 미션 완료하고 페이백 받기!
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Target className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">4가지 미션</p>
                  <p className="text-xs text-muted-foreground">다양한 미션</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Coins className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">87,000원</p>
                  <p className="text-xs text-muted-foreground">최대 페이백</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">즉시 지급</p>
                  <p className="text-xs text-muted-foreground">빠른 페이백</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
