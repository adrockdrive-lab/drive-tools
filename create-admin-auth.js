const { createClient } = require('@supabase/supabase-js')

// Supabase 클라이언트 설정 (service role key 사용)
const supabaseUrl = 'https://rhofpgbzunxgmcjcoxex.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJob2ZwZ2J6dW54Z21jamNveGV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDQ5NzQ1OCwiZXhwIjoyMDUwMDczNDU4fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 관리자 계정 정보
const adminAccounts = [
  {
    id: '5b873110-267e-4d6f-84df-5c1bc419076f',
    email: 'admin@drivingzone.com',
    password: 'admin123!',
    name: '슈퍼관리자'
  },
  {
    id: '60aeac8f-46ae-4d50-9162-ddabef3761cd',
    email: 'gangnam@drivingzone.com',
    password: 'admin123!',
    name: '강남지점장'
  },
  {
    id: 'e28ad0ca-c327-4fce-980a-2fce1e6dbd26',
    email: 'seocho@drivingzone.com',
    password: 'admin123!',
    name: '서초지점장'
  },
  {
    id: 'e4ed54ef-2c5d-4011-bd7f-5e8646620844',
    email: 'mapo@drivingzone.com',
    password: 'admin123!',
    name: '마포지점장'
  },
  {
    id: '580aa49c-a0fe-40fe-8a1f-30693679183c',
    email: 'songpa@drivingzone.com',
    password: 'admin123!',
    name: '송파지점장'
  },
  {
    id: '9368603d-ce8b-4d87-bf40-dc1e1c557588',
    email: 'yeongdeungpo@drivingzone.com',
    password: 'admin123!',
    name: '영등포지점장'
  },
  {
    id: 'a34ec449-5214-4d7c-a221-8aac43f8daeb',
    email: 'busan@drivingzone.com',
    password: 'admin123!',
    name: '부산지역관리자'
  },
  {
    id: 'df114f9b-bc7d-4ca7-906e-6103acb54168',
    email: 'daegu@drivingzone.com',
    password: 'admin123!',
    name: '대구지역관리자'
  },
  {
    id: 'bf3ab8f6-bad6-4021-b88f-34cccad6214e',
    email: 'incheon@drivingzone.com',
    password: 'admin123!',
    name: '인천지역관리자'
  },
  {
    id: 'f0f3d26b-f040-4e6a-bdf9-78897ca2bb3a',
    email: 'gyeonggi@drivingzone.com',
    password: 'admin123!',
    name: '경기지역관리자'
  },
  {
    id: '5c318bc7-c632-4788-8bb3-4ec824686298',
    email: 'chungcheong@drivingzone.com',
    password: 'admin123!',
    name: '충청지역관리자'
  },
  {
    id: '9a9f9f3a-3792-4e19-bfb0-e8639424a5ec',
    email: 'jeolla@drivingzone.com',
    password: 'admin123!',
    name: '전라지역관리자'
  },
  {
    id: 'f4301ffc-815b-4aa2-a877-988fd2c51d95',
    email: 'gyeongsang@drivingzone.com',
    password: 'admin123!',
    name: '경상지역관리자'
  },
  {
    id: 'f6b8a812-7bc0-411a-ad25-6fcb8e57ade3',
    email: 'gangwon@drivingzone.com',
    password: 'admin123!',
    name: '강원지역관리자'
  },
  {
    id: '2fb9cf19-a872-4baa-806f-52a4c10cf9f6',
    email: 'jeju@drivingzone.com',
    password: 'admin123!',
    name: '제주지역관리자'
  }
]

async function createAdminAuthAccounts() {
  console.log('관리자 계정을 Supabase Auth에 생성 중...')

  for (const account of adminAccounts) {
    try {
      console.log(`${account.name} (${account.email}) 계정 생성 중...`)

      // Supabase Auth에 사용자 생성
      const { data, error } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          name: account.name,
          role: 'admin'
        }
      })

      if (error) {
        console.error(`❌ ${account.name} 계정 생성 실패:`, error.message)
      } else {
        console.log(`✅ ${account.name} 계정 생성 성공:`, data.user.id)
      }

      // 잠시 대기 (API 제한 방지)
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.error(`❌ ${account.name} 계정 생성 중 오류:`, error.message)
    }
  }

  console.log('관리자 계정 생성 완료!')
  console.log('\n📋 로그인 정보:')
  console.log('이메일: admin@drivingzone.com')
  console.log('비밀번호: admin123!')
  console.log('\n다른 관리자 계정들도 동일한 비밀번호를 사용합니다.')
}

// 스크립트 실행
createAdminAuthAccounts().catch(console.error)
