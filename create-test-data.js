const { createClient } = require('@supabase/supabase-js')

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestData() {
  try {
    console.log('테스트 데이터 생성 시작...')

    // 1. 테스트 사용자 생성
    console.log('1. 테스트 사용자 생성...')
    const testUsers = [
      { name: '김철수', phone: '010-1234-5678' },
      { name: '이영희', phone: '010-2345-6789' },
      { name: '박민수', phone: '010-3456-7890' },
      { name: '정수진', phone: '010-4567-8901' },
      { name: '최동현', phone: '010-5678-9012' }
    ]

    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert(testUsers)
      .select()

    if (usersError) {
      console.error('사용자 생성 오류:', usersError)
      return
    }

    console.log(`${users.length}명의 사용자가 생성되었습니다.`)

    // 2. 미션 데이터 확인
    console.log('2. 미션 데이터 확인...')
    const { data: missions, error: missionsError } = await supabase
      .from('missions')
      .select('*')

    if (missionsError) {
      console.error('미션 조회 오류:', missionsError)
      return
    }

    console.log(`${missions.length}개의 미션이 있습니다.`)

    // 3. 테스트 미션 참여 데이터 생성
    console.log('3. 테스트 미션 참여 데이터 생성...')
    const testUserMissions = []

    users.forEach((user, userIndex) => {
      missions.forEach((mission, missionIndex) => {
        // 각 사용자가 1-3개의 미션에 참여
        if (missionIndex < 3) {
          const status = missionIndex === 0 ? 'completed' :
                        missionIndex === 1 ? 'in_progress' : 'pending'

          const proofData = status === 'completed' ? {
            type: mission.mission_type,
            submittedAt: new Date().toISOString(),
            ...(mission.mission_type === 'challenge' && {
              certificateImageUrl: 'https://example.com/certificate.jpg'
            }),
            ...(mission.mission_type === 'sns' && {
              snsUrl: 'https://instagram.com/p/example'
            }),
            ...(mission.mission_type === 'referral' && {
              referrals: [
                { name: '친구1', phone: '010-1111-1111', store: '강남지점' },
                { name: '친구2', phone: '010-2222-2222', store: '강남지점' }
              ]
            }),
            ...(mission.mission_type === 'review' && {
              reviews: [
                { platform: '드라이빙존', url: 'https://example.com/review1' },
                { platform: '도로로', url: 'https://example.com/review2' },
                { platform: '운전면허플러스', url: 'https://example.com/review3' }
              ]
            })
          } : null

          testUserMissions.push({
            user_id: user.id,
            mission_id: mission.id,
            status,
            proof_data: proofData,
            completed_at: status === 'completed' ? new Date().toISOString() : null,
            created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // 최근 7일 내
          })
        }
      })
    })

    const { data: userMissions, error: userMissionsError } = await supabase
      .from('user_missions')
      .insert(testUserMissions)
      .select()

    if (userMissionsError) {
      console.error('미션 참여 데이터 생성 오류:', userMissionsError)
      return
    }

    console.log(`${userMissions.length}개의 미션 참여 데이터가 생성되었습니다.`)

    // 4. 완료된 미션에 대한 페이백 데이터 생성
    console.log('4. 페이백 데이터 생성...')
    const completedMissions = userMissions.filter(um => um.status === 'completed')
    const testPaybacks = []

    completedMissions.forEach((mission, index) => {
      // 70%는 승인, 30%는 대기 중
      const status = index % 3 === 0 ? 'pending' : 'paid'

      testPaybacks.push({
        user_id: mission.user_id,
        mission_id: mission.mission_id,
        amount: missions.find(m => m.id === mission.mission_id)?.reward_amount || 0,
        status,
        paid_at: status === 'paid' ? new Date().toISOString() : null,
        created_at: new Date().toISOString()
      })
    })

    const { data: paybacks, error: paybacksError } = await supabase
      .from('paybacks')
      .insert(testPaybacks)
      .select()

    if (paybacksError) {
      console.error('페이백 데이터 생성 오류:', paybacksError)
      return
    }

    console.log(`${paybacks.length}개의 페이백 데이터가 생성되었습니다.`)

    console.log('✅ 테스트 데이터 생성 완료!')
    console.log(`- 사용자: ${users.length}명`)
    console.log(`- 미션: ${missions.length}개`)
    console.log(`- 미션 참여: ${userMissions.length}개`)
    console.log(`- 페이백: ${paybacks.length}개`)

  } catch (error) {
    console.error('테스트 데이터 생성 중 오류:', error)
  }
}

// 스크립트 실행
createTestData()
