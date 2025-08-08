'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/lib/services/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    verificationCode: '',
    branchCode: '',
    referralCode: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // URL에서 지점 및 추천 정보 추출
  useEffect(() => {
    const params = authService.extractUrlParams()
    setFormData(prev => ({
      ...prev,
      branchCode: params.branchCode || '',
      referralCode: params.referralCode || ''
    }))
  }, [])

  // 카운트다운 타이머
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const sendVerificationCode = async () => {
    if (!formData.phone) {
      toast.error('휴대폰 번호를 입력해주세요.')
      return
    }

    setIsLoading(true)
    const result = await authService.sendVerificationCode(formData.phone)
    setIsLoading(false)

    if (result.success) {
      toast.success('인증 코드가 전송되었습니다.')
      setCountdown(180) // 3분 카운트다운
    } else {
      toast.error(result.error || '인증 코드 전송에 실패했습니다.')
    }
  }

  const verifyCode = async () => {
    if (!formData.verificationCode) {
      toast.error('인증 코드를 입력해주세요.')
      return
    }

    setIsLoading(true)
    const result = await authService.verifyCode(formData.phone, formData.verificationCode)
    setIsLoading(false)

    if (result.success) {
      toast.success('인증이 완료되었습니다.')
      setStep(3)
    } else {
      toast.error(result.error || '인증에 실패했습니다.')
    }
  }

  const register = async () => {
    if (!formData.name) {
      toast.error('이름을 입력해주세요.')
      return
    }

    setIsLoading(true)
    const result = await authService.register(formData)
    setIsLoading(false)

    if (result.success) {
      toast.success('회원가입이 완료되었습니다!')
      router.push('/dashboard')
    } else {
      toast.error(result.error || '회원가입에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Status Bar */}
      <div className="h-6 bg-background"></div>

      <Card className="w-full max-w-md gradient-card border-border">
        <CardHeader className="text-center">
          <div className="mb-4">
            <div className="text-4xl mb-2">🚗</div>
            <CardTitle className="text-2xl font-bold text-white">회원가입</CardTitle>
            <p className="text-muted-foreground mt-2">
              {formData.branchCode ? `지점: ${formData.branchCode}` : '드라이빙존에 오신 것을 환영합니다!'}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-secondary'}`}></div>
              <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-secondary'}`}></div>
              <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-secondary'}`}></div>
            </div>
          </div>

          {/* Step 1: 기본 정보 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white">이름</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="홍길동"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-secondary/50 border-border text-white"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-white">휴대폰 번호</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="010-0000-0000"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-secondary/50 border-border text-white"
                />
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.phone}
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                다음
              </Button>
            </div>
          )}

          {/* Step 2: SMS 인증 */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="verificationCode" className="text-white">인증 코드</Label>
                <div className="flex space-x-2">
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="6자리 코드"
                    value={formData.verificationCode}
                    onChange={(e) => handleInputChange('verificationCode', e.target.value)}
                    className="flex-1 bg-secondary/50 border-border text-white"
                  />
                  <Button
                    onClick={sendVerificationCode}
                    disabled={isLoading || countdown > 0}
                    variant="outline"
                    className="border-border text-white hover:bg-secondary"
                  >
                    {countdown > 0 ? `${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}` : '인증번호'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.phone}로 인증 코드가 전송됩니다.
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 border-border text-white hover:bg-secondary"
                >
                  이전
                </Button>
                <Button
                  onClick={verifyCode}
                  disabled={!formData.verificationCode || isLoading}
                  className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  {isLoading ? '확인 중...' : '인증 확인'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: 회원가입 완료 */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-lg font-bold text-white mb-2">인증 완료!</h3>
                <p className="text-muted-foreground">
                  아래 정보로 회원가입을 진행합니다.
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">이름:</span>
                  <span className="text-white">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">휴대폰:</span>
                  <span className="text-white">{formData.phone}</span>
                </div>
                {formData.branchCode && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">지점:</span>
                    <span className="text-white">{formData.branchCode}</span>
                  </div>
                )}
                {formData.referralCode && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">추천인:</span>
                    <span className="text-white">{formData.referralCode}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 border-border text-white hover:bg-secondary"
                >
                  수정
                </Button>
                <Button
                  onClick={register}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  {isLoading ? '가입 중...' : '회원가입'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
