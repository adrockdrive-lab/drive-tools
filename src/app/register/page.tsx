'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const { isAuthenticated, setUser } = useAppStore()
  const [step, setStep] = useState(1) // 1: 정보입력, 2: 휴대폰인증, 3: 완료
  const [isLoading, setIsLoading] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    referralCode: ''
  })
  
  // Phone verification
  const [verificationCode, setVerificationCode] = useState('')
  const [sentCode, setSentCode] = useState('')
  const [countdown, setCountdown] = useState(0)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
    
    // URL에서 레퍼럴 코드 확인
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const referralFromUrl = urlParams.get('referral') || urlParams.get('ref')
      if (referralFromUrl) {
        setFormData(prev => ({ ...prev, referralCode: referralFromUrl }))
      }
    }
  }, [isAuthenticated, router])

  // Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [countdown])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      toast.error('이름을 입력해주세요.')
      return false
    }
    if (!formData.phone.trim()) {
      toast.error('휴대폰 번호를 입력해주세요.')
      return false
    }
    // 휴대폰 번호 형식 검증
    const phoneRegex = /^010-?\d{4}-?\d{4}$/
    if (!phoneRegex.test(formData.phone.replace(/[^\d]/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '010$2$3'))) {
      toast.error('올바른 휴대폰 번호를 입력해주세요.')
      return false
    }
    return true
  }

  const sendVerificationCode = async () => {
    if (!validateStep1()) return

    setIsLoading(true)
    try {
      // SMS 인증 서비스 사용
      const { sendSMSVerification } = await import('@/lib/services/auth')
      const { code, error } = await sendSMSVerification(formData.phone)
      
      if (error || !code) {
        throw new Error(error || 'SMS 발송에 실패했습니다.')
      }
      
      setSentCode(code) // 개발 환경에서만 사용
      setCountdown(180) // 3분
      setStep(2)
      
      // 개발용 토스트 (실제로는 SMS로 발송)
      toast.success(`인증번호가 발송되었습니다. (테스트: ${code})`)
    } catch (error) {
      console.error('SMS send error:', error)
      toast.error('인증번호 발송에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error('인증번호를 입력해주세요.')
      return
    }
    
    setIsLoading(true)
    try {
      // SMS 인증 확인 서비스 사용
      const { verifySMSCode } = await import('@/lib/services/auth')
      const { verified, error } = await verifySMSCode(formData.phone, verificationCode)
      
      if (!verified || error) {
        throw new Error(error || '인증번호가 일치하지 않습니다.')
      }
      
      setStep(3)
      toast.success('휴대폰 인증이 완료되었습니다!')
    } catch (error) {
      console.error('SMS verify error:', error)
      toast.error(error instanceof Error ? error.message : '인증에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const completeRegistration = async () => {
    setIsLoading(true)
    try {
      // 회원가입 서비스 사용
      const { registerUser } = await import('@/lib/services/auth')
      const { verifyReferral } = await import('@/lib/services/referrals')
      
      const { user, error } = await registerUser({
        name: formData.name,
        phone: formData.phone,
        verificationCode: verificationCode,
        referralCode: formData.referralCode || undefined
      })
      
      if (error || !user) {
        throw new Error(error || '회원가입에 실패했습니다.')
      }
      
      // 추천인 확인 (새로 가입한 사용자가 다른 사람이 추천한 경우)
      await verifyReferral(formData.phone)
      
      // 사용자 정보를 스토어에 저장하고 앱 초기화
      setUser(user)
      const { initializeApp } = useAppStore.getState()
      await initializeApp()
      
      toast.success('회원가입이 완료되었습니다!')
      
      // 대시보드로 이동
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
      
    } catch (error) {
      console.error('Registration failed:', error)
      toast.error(`회원가입에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const resendCode = async () => {
    if (countdown > 0) return
    await sendVerificationCode()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            🚗 드라이빙존 회원가입
          </CardTitle>
          <CardDescription>
            미션 페이백 혜택을 받기 위해 가입해주세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <div className={`h-1 w-8 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <div className={`h-1 w-8 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              3
            </div>
          </div>

          {/* Step 1: Information Input */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="실명을 입력해주세요"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">휴대폰 번호</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="010-0000-0000"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '')
                    const formatted = value.replace(/(\d{3})(\d{4})(\d{4})/, '010-$2-$3')
                    handleInputChange('phone', formatted)
                  }}
                />
              </div>
              
              <div>
                <Label htmlFor="referralCode">추천인 코드 (선택)</Label>
                <Input
                  id="referralCode"
                  type="text"
                  placeholder="친구의 추천 코드를 입력하세요"
                  value={formData.referralCode}
                  onChange={(e) => handleInputChange('referralCode', e.target.value.toUpperCase())}
                />
                {formData.referralCode && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ 추천 코드가 입력되었습니다. 추가 혜택을 받으실 수 있습니다!
                  </p>
                )}
              </div>
              <Button 
                onClick={sendVerificationCode}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? '발송 중...' : '인증번호 발송'}
              </Button>
            </div>
          )}

          {/* Step 2: Phone Verification */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">{formData.phone}</span>로<br />
                  인증번호를 발송했습니다.
                </p>
              </div>
              <div>
                <Label htmlFor="code">인증번호</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="6자리 인증번호 입력"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  {countdown > 0 ? `남은 시간: ${formatTime(countdown)}` : '시간 만료'}
                </span>
                <button
                  onClick={resendCode}
                  disabled={countdown > 0}
                  className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  재발송
                </button>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  이전
                </Button>
                <Button 
                  onClick={verifyCode}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? '확인 중...' : '인증 확인'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Completion */}
          {step === 3 && (
            <div className="space-y-4 text-center">
              <div className="text-6xl">🎉</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">인증 완료!</h3>
                <p className="text-gray-600 text-sm mb-4">
                  이제 드라이빙존 미션에 참여하실 수 있습니다.
                </p>
              </div>
              <Button 
                onClick={completeRegistration}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? '가입 중...' : '미션 시작하기'}
              </Button>
            </div>
          )}

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              이미 계정이 있으신가요?
            </p>
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
            >
              로그인하기
            </button>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              홈으로 돌아가기
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}