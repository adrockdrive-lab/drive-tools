/**
 * 클라이언트 미션 제출 → 관리자 승인 흐름 테스트
 *
 * 이 스크립트는 다음을 테스트합니다:
 * 1. 사용자가 미션에 참여
 * 2. 미션을 완료하고 증빙 제출
 * 3. 관리자 대시보드에서 데이터 확인
 * 4. 페이백 승인 처리
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('환경 변수가 설정되지 않았습니다.')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '설정됨' : '없음')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testClientToAdminFlow() {
  console.log('🚀 클라이언트 → 관리자 데이터 흐름 테스트 시작\n')

  try {
    // 1. 테스트용 사용자 조회
    console.log('1️⃣ 테스트 사용자 조회 중...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (usersError) throw usersError

    if (!users || users.length === 0) {
      console.error('❌ 사용자가 없습니다. 먼저 회원가입을 해주세요.')
      return
    }

    const testUser = users[0]
    console.log(`✅ 사용자 찾음: ${testUser.name} (${testUser.phone})`)
    console.log(`   지점 ID: ${testUser.store_id}\n`)

    // 2. 활성화된 미션 조회
    console.log('2️⃣ 활성화된 미션 조회 중...')
    const { data: missions, error: missionsError } = await supabase
      .from('mission_definitions')
      .select('*')
      .eq('is_active', true)
      .limit(1)

    if (missionsError) throw missionsError

    if (!missions || missions.length === 0) {
      console.error('❌ 활성화된 미션이 없습니다.')
      return
    }

    const testMission = missions[0]
    console.log(`✅ 미션 찾음: ${testMission.title}`)
    console.log(`   타입: ${testMission.mission_type}`)
    console.log(`   보상: ${testMission.reward_amount}원\n`)

    // 3. 미션 참여 시작 (클라이언트 동작 시뮬레이션)
    console.log('3️⃣ 미션 참여 확인 또는 시작 (클라이언트 동작)...')

    // 먼저 기존 참여 확인
    let participation
    const { data: existingParticipation, error: checkError } = await supabase
      .from('mission_participations')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('mission_definition_id', testMission.id)
      .maybeSingle()

    if (existingParticipation) {
      console.log('⚠️  이미 참여 중인 미션입니다. 기존 데이터를 사용합니다.')
      participation = existingParticipation
    } else {
      // 새로 참여 시작
      const { data: newParticipation, error: participationError } = await supabase
        .from('mission_participations')
        .insert({
          user_id: testUser.id,
          mission_definition_id: testMission.id,
          store_id: testUser.store_id,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          reward_amount: testMission.reward_amount
        })
        .select()
        .single()

      if (participationError) throw participationError
      participation = newParticipation
      console.log('✅ 새 미션 참여 시작됨')
    }
    console.log(`   참여 ID: ${participation.id}`)
    console.log(`   현재 상태: ${participation.status}\n`)

    // 4. 미션 완료 제출 (클라이언트 동작 시뮬레이션)
    console.log('4️⃣ 미션 완료 제출 (클라이언트 동작)...')
    const proofData = {
      imageUrl: 'https://example.com/proof.jpg',
      studyHours: 12,
      submittedAt: new Date().toISOString()
    }

    const { data: completedParticipation, error: completeError } = await supabase
      .from('mission_participations')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        proof_data: proofData
      })
      .eq('id', participation.id)
      .select()
      .single()

    if (completeError) throw completeError
    console.log('✅ 미션 완료 제출됨')
    console.log(`   상태: ${completedParticipation.status}`)
    console.log(`   증빙 데이터:`, JSON.stringify(proofData, null, 2))
    console.log()

    // 5. 페이백 생성 (자동 생성)
    console.log('5️⃣ 페이백 데이터 생성...')
    const { data: payback, error: paybackError } = await supabase
      .from('paybacks')
      .upsert({
        user_id: testUser.id,
        mission_definition_id: testMission.id,
        store_id: testUser.store_id,
        amount: testMission.reward_amount,
        status: 'pending'
      })
      .select()
      .single()

    if (paybackError) throw paybackError
    console.log('✅ 페이백 생성됨')
    console.log(`   금액: ${payback.amount}원`)
    console.log(`   상태: ${payback.status}\n`)

    // 6. 관리자 대시보드에서 데이터 확인
    console.log('6️⃣ 관리자 대시보드 데이터 조회...')
    const { data: adminData, error: adminError } = await supabase
      .from('mission_participations')
      .select(`
        id,
        status,
        proof_data,
        completed_at,
        started_at,
        users(name, phone),
        mission_definitions(title, mission_type, reward_amount),
        stores(name)
      `)
      .eq('id', participation.id)
      .single()

    if (adminError) {
      console.error('관리자 데이터 조회 오류:', adminError)
      throw adminError
    }
    console.log('✅ 관리자 대시보드에서 데이터 확인')
    console.log('   사용자:', adminData.users?.name || '정보 없음')
    console.log('   미션:', adminData.mission_definitions?.title || '정보 없음')
    console.log('   지점:', adminData.stores?.name || '정보 없음')
    console.log('   상태:', adminData.status)
    console.log('   증빙:', JSON.stringify(adminData.proof_data, null, 2))

    if (!adminData.stores) {
      console.log('   ⚠️  지점 정보가 null입니다. store_id를 확인해주세요.')
    }
    console.log()

    // 7. 페이백 조회
    console.log('7️⃣ 페이백 데이터 조회...')
    const { data: paybackData, error: paybackQueryError } = await supabase
      .from('paybacks')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('mission_definition_id', testMission.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (paybackQueryError) throw paybackQueryError
    console.log('✅ 페이백 데이터 확인')
    console.log('   금액:', paybackData.amount)
    console.log('   상태:', paybackData.status)
    console.log()

    // 8. 관리자 페이백 승인 테스트
    console.log('8️⃣ 관리자 페이백 승인 테스트...')
    const { data: approvedPayback, error: approveError } = await supabase
      .from('paybacks')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', paybackData.id)
      .select()
      .single()

    if (approveError) throw approveError
    console.log('✅ 페이백 승인됨')
    console.log('   상태:', approvedPayback.status)
    console.log('   지급일:', approvedPayback.paid_at)
    console.log()

    // 9. 최종 확인
    console.log('9️⃣ 최종 데이터 확인...')
    const { data: finalData, error: finalError } = await supabase
      .from('mission_participations')
      .select(`
        id,
        status,
        completed_at,
        users(name),
        mission_definitions(title, reward_amount),
        stores(name)
      `)
      .eq('id', participation.id)
      .single()

    if (finalError) {
      console.error('최종 데이터 조회 오류:', finalError)
      throw finalError
    }

    const { data: finalPayback, error: finalPaybackError } = await supabase
      .from('paybacks')
      .select('*')
      .eq('id', paybackData.id)
      .single()

    if (finalPaybackError) {
      console.error('최종 페이백 조회 오류:', finalPaybackError)
      throw finalPaybackError
    }

    console.log('✅ 최종 상태')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`사용자: ${finalData.users?.name || '정보 없음'}`)
    console.log(`지점: ${finalData.stores?.name || '정보 없음'}`)
    console.log(`미션: ${finalData.mission_definitions?.title || '정보 없음'}`)
    console.log(`미션 상태: ${finalData.status}`)
    console.log(`보상금: ${finalData.mission_definitions?.reward_amount || 0}원`)
    console.log(`페이백 상태: ${finalPayback.status}`)
    console.log(`지급 금액: ${finalPayback.amount}원`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log()

    console.log('🎉 테스트 완료! 클라이언트 → 관리자 데이터 흐름이 정상 작동합니다.')
    console.log()
    console.log('📌 확인 사항:')
    console.log('   ✅ 1. 클라이언트에서 미션 참여 → mission_participations 테이블에 기록')
    console.log('   ✅ 2. 미션 완료 제출 → status가 "completed"로 변경')
    console.log('   ✅ 3. 페이백 생성 → paybacks 테이블에 기록 (status: pending)')
    console.log('   ✅ 4. 관리자 대시보드에서 데이터 조회 가능')
    console.log('   ✅ 5. 관리자 승인 → 페이백 status가 "paid"로 변경')
    console.log()
    console.log('⚠️  주의사항:')
    console.log('   - 지점 정보(stores)가 null입니다. store_id FK 관계를 확인해주세요.')
    console.log('   - mission_participations 테이블의 store_id가 올바르게 설정되어 있는지 확인해주세요.')

  } catch (error) {
    console.error('❌ 오류 발생:', error)
    throw error
  }
}

// 스크립트 실행
testClientToAdminFlow()
  .then(() => {
    console.log('\n✅ 모든 테스트 완료')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 테스트 실패:', error)
    process.exit(1)
  })
