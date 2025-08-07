// 환경변수 설정 상태 확인

export function checkEnvironmentSetup() {
  const requiredEnvs = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
  }

  const missing = []
  const placeholder = []
  
  for (const [key, value] of Object.entries(requiredEnvs)) {
    if (!value) {
      missing.push(key)
    } else if (value.includes('your_') || value.includes('your-')) {
      placeholder.push(key)
    }
  }

  return {
    isComplete: missing.length === 0 && placeholder.length === 0,
    missing,
    placeholder,
    status: missing.length === 0 && placeholder.length === 0 ? 'ready' : 
            missing.length > 0 ? 'missing' : 'placeholder'
  }
}

export function getEnvironmentInstructions() {
  return `
🔧 환경변수 설정이 필요합니다!

1. Supabase 프로젝트를 생성하세요: https://supabase.com/dashboard

2. .env.local 파일의 다음 값들을 실제 값으로 교체하세요:

   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

3. 데이터베이스 스키마를 적용하세요:
   - Supabase SQL Editor에서 database-setup.sql 실행

4. 개발 서버를 재시작하세요:
   npm run dev

자세한 설정 방법은 SUPABASE_SETUP.md 파일을 참고하세요.
  `.trim()
}