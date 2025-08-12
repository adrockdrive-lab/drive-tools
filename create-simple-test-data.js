const { createClient } = require('@supabase/supabase-js')

// Supabase 클라이언트 설정 (환경변수 대신 직접 설정)
const supabaseUrl = 'https://your-project.supabase.co' // 실제 URL로 변경 필요
const supabaseKey = 'your-anon-key' // 실제 키로 변경 필요

if (supabaseUrl === 'https://your-project.supabase.co') {
  console.log('⚠️  Supabase URL과 키를 설정해주세요.')
  console.log('create-simple-test-data.js 파일에서 supabaseUrl과 supabaseKey를 실제 값으로 변경하세요.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createSimpleTestData() {
  try {
    console.log('간단한 테스트 데이터 생성 시작...')

    // 1. 미션 데이터 확인
    console.log('1. 미션 데이터 확인...')
    const { data: missions, error: missionsError } = await supabase
      .from('missions')
      .select('*')

    if (missionsError) {
      console.error('미션 조회 오류:', missionsError)
      return
    }

    console.log(`${missions.length}개의 미션이 있습니다.`)

    // 2. 사용자 데이터 확인
    console.log('2. 사용자 데이터 확인...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')

    if (usersError) {
      console.error('사용자 조회 오류:', usersError)
      return
    }

    console.log(`${users.length}명의 사용자가 있습니다.`)

    // 3. 미션 참여 데이터 확인
    console.log('3. 미션 참여 데이터 확인...')
    const { data: userMissions, error: userMissionsError } = await supabase
      .from('user_missions')
      .select('*')

    if (userMissionsError) {
      console.error('미션 참여 데이터 조회 오류:', userMissionsError)
      return
    }

    console.log(`${userMissions.length}개의 미션 참여 데이터가 있습니다.`)

    // 4. 페이백 데이터 확인
    console.log('4. 페이백 데이터 확인...')
    const { data: paybacks, error: paybacksError } = await supabase
      .from('paybacks')
      .select('*')

    if (paybacksError) {
      console.error('페이백 데이터 조회 오류:', paybacksError)
      return
    }

    console.log(`${paybacks.length}개의 페이백 데이터가 있습니다.`)

    console.log('✅ 데이터 확인 완료!')
    console.log(`- 사용자: ${users.length}명`)
    console.log(`- 미션: ${missions.length}개`)
    console.log(`- 미션 참여: ${userMissions.length}개`)
    console.log(`- 페이백: ${paybacks.length}개`)

    if (users.length === 0) {
      console.log('\n📝 사용자가 없습니다. 테스트 데이터를 생성하려면:')
      console.log('1. Supabase 콘솔에서 직접 데이터를 추가하거나')
      console.log('2. 환경변수를 설정하고 npm run db:test-data를 실행하세요.')
    }

  } catch (error) {
    console.error('데이터 확인 중 오류:', error)
  }
}

// 스크립트 실행
createSimpleTestData()
