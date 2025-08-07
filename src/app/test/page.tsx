'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { checkEnvironmentSetup, getEnvironmentInstructions } from '@/lib/env-check'
import { fullDatabaseCheck } from '@/lib/test-db'
import { useEffect, useState } from 'react'

export default function TestPage() {
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [envStatus, setEnvStatus] = useState<{
    isComplete: boolean;
    status: string;
    missing: string[];
    placeholder: string[];
  } | null>(null)

  useEffect(() => {
    const status = checkEnvironmentSetup()
    setEnvStatus(status)
  }, [])

  const runDatabaseTest = async () => {
    setIsLoading(true)
    setTestResult('Testing database connection...\n')

    try {
      // Console 출력을 캡처하기 위한 설정
      const originalLog = console.log
      const originalError = console.error
      let output = ''

      console.log = (...args) => {
        output += args.join(' ') + '\n'
        originalLog(...args)
      }

      console.error = (...args) => {
        output += 'ERROR: ' + args.join(' ') + '\n'
        originalError(...args)
      }

      await fullDatabaseCheck()

      // Console 원복
      console.log = originalLog
      console.error = originalError

      setTestResult(output)

    } catch (error) {
      setTestResult(`Error running database test: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl space-y-6">
      {/* Environment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 환경변수 설정 상태
            {envStatus?.isComplete && <span className="text-green-600 text-sm">✅ 완료</span>}
            {envStatus?.status === 'missing' && <span className="text-red-600 text-sm">❌ 누락</span>}
            {envStatus?.status === 'placeholder' && <span className="text-yellow-600 text-sm">⚠️ 미설정</span>}
          </CardTitle>
          <CardDescription>
            Supabase 연결을 위한 환경변수 설정 상태를 확인합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {envStatus && !envStatus.isComplete && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ 설정이 필요합니다</h4>
              {envStatus.missing.length > 0 && (
                <div className="mb-2">
                  <p className="text-yellow-800 text-sm font-medium mb-1">누락된 환경변수:</p>
                  <ul className="text-yellow-800 text-sm space-y-0.5 ml-4">
                    {envStatus.missing.map((env: string) => (
                      <li key={env}>• {env}</li>
                    ))}
                  </ul>
                </div>
              )}
              {envStatus.placeholder.length > 0 && (
                <div className="mb-2">
                  <p className="text-yellow-800 text-sm font-medium mb-1">플레이스홀더 값이 설정된 환경변수:</p>
                  <ul className="text-yellow-800 text-sm space-y-0.5 ml-4">
                    {envStatus.placeholder.map((env: string) => (
                      <li key={env}>• {env}</li>
                    ))}
                  </ul>
                </div>
              )}
              <details className="mt-3">
                <summary className="text-yellow-800 cursor-pointer hover:text-yellow-900">
                  📋 설정 방법 보기
                </summary>
                <pre className="text-xs bg-white p-3 rounded mt-2 whitespace-pre-wrap">
                  {getEnvironmentInstructions()}
                </pre>
              </details>
            </div>
          )}

          {envStatus?.isComplete && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">✅ 환경변수 설정 완료</h4>
              <p className="text-green-800 text-sm">
                모든 필수 환경변수가 올바르게 설정되었습니다. 데이터베이스 테스트를 진행할 수 있습니다.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Database Test */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Database Connection Test</CardTitle>
          <CardDescription>
            Supabase 데이터베이스 연결 및 테이블 설정을 테스트합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={runDatabaseTest}
            disabled={isLoading || !envStatus?.isComplete}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Run Database Test'}
          </Button>

          {!envStatus?.isComplete && (
            <p className="text-sm text-gray-500 text-center">
              환경변수를 먼저 설정해주세요
            </p>
          )}

          {testResult && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Test Results:</h3>
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {testResult}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📋 데이터베이스 설정 방법:</h3>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Open <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
              <li>Navigate to your project</li>
              <li>Go to SQL Editor</li>
              <li>Copy and paste the content from <code>database-setup.sql</code></li>
              <li>Execute the script</li>
              <li>Return here and click &quot;Run Database Test&quot;</li>
            </ol>
            <p className="text-xs text-blue-600 mt-2">
              자세한 설정 방법은 <code>SUPABASE_SETUP.md</code> 파일을 참고하세요.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 빠른 액세스</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => window.open('/', '_blank')}
            >
              🏠 홈페이지
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('/register', '_blank')}
            >
              👤 회원가입 테스트
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('/dashboard', '_blank')}
            >
              📊 대시보드 (로그인 필요)
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
            >
              🔗 Supabase 콘솔
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
