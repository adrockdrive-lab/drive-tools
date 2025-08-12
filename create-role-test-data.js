const { createClient } = require('@supabase/supabase-js')

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다.')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '설정됨' : '설정되지 않음')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '설정됨' : '설정되지 않음')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createRoleTestData() {
  try {
    console.log('🚀 권한 시스템 테스트 데이터 생성 시작...')

    // 1. 지점 데이터 생성
    console.log('📍 지점 데이터 생성 중...')
    const { data: branches, error: branchesError } = await supabase
      .from('branches')
      .insert([
        {
          name: '강남지점',
          code: 'GN001',
          address: '서울시 강남구 테헤란로 123',
          phone: '02-1234-5678',
          manager_name: '김지점장',
          is_active: true
        },
        {
          name: '서초지점',
          code: 'SC001',
          address: '서울시 서초구 서초대로 456',
          phone: '02-2345-6789',
          manager_name: '이지점장',
          is_active: true
        }
      ])
      .select()

    if (branchesError) throw branchesError
    console.log(`✅ ${branches.length}개 지점 생성 완료`)

    // 2. 매장 데이터 생성
    console.log('🏪 매장 데이터 생성 중...')
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .insert([
        {
          name: '강남운전면허학원',
          is_direct: true,
          is_near_test_center: true,
          is_sunday_open: false,
          has_free_photo: true,
          road_address: '서울시 강남구 테헤란로 123',
          address: '서울시 강남구 역삼동 123-45',
          phone_number: '02-1234-5678',
          max_capacity: 100,
          machine_count_class1: 5,
          machine_count_class2: 3
        },
        {
          name: '서초운전면허학원',
          is_direct: true,
          is_near_test_center: true,
          is_sunday_open: false,
          has_free_photo: true,
          road_address: '서울시 서초구 서초대로 456',
          address: '서울시 서초구 서초동 456-78',
          phone_number: '02-2345-6789',
          max_capacity: 80,
          machine_count_class1: 4,
          machine_count_class2: 2
        }
      ])
      .select()

    if (storesError) throw storesError
    console.log(`✅ ${stores.length}개 매장 생성 완료`)

    // 3. 테스트 사용자 생성
    console.log('👥 테스트 사용자 생성 중...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert([
        {
          name: '슈퍼관리자',
          phone: '010-0000-0001',
          phone_verified: true,
          branch_id: branches[0].id,
          store_id: stores[0].id
        },
        {
          name: '강남지점장',
          phone: '010-0000-0002',
          phone_verified: true,
          branch_id: branches[0].id,
          store_id: stores[0].id
        },
        {
          name: '서초지점장',
          phone: '010-0000-0003',
          phone_verified: true,
          branch_id: branches[1].id,
          store_id: stores[1].id
        },
        {
          name: '강남매장매니저',
          phone: '010-0000-0004',
          phone_verified: true,
          branch_id: branches[0].id,
          store_id: stores[0].id
        },
        {
          name: '일반고객1',
          phone: '010-0000-0005',
          phone_verified: true,
          branch_id: branches[0].id,
          store_id: stores[0].id
        },
        {
          name: '일반고객2',
          phone: '010-0000-0006',
          phone_verified: true,
          branch_id: branches[1].id,
          store_id: stores[1].id
        }
      ])
      .select()

    if (usersError) throw usersError
    console.log(`✅ ${users.length}개 사용자 생성 완료`)

    // 4. 역할 할당
    console.log('🔐 역할 할당 중...')
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')

    if (rolesError) throw rolesError

    const roleAssignments = [
      // 슈퍼 관리자
      { user_id: users[0].id, role_id: roles.find(r => r.name === 'super_admin').id },
      // 강남 지점장
      { user_id: users[1].id, role_id: roles.find(r => r.name === 'branch_manager').id },
      // 서초 지점장
      { user_id: users[2].id, role_id: roles.find(r => r.name === 'branch_manager').id },
      // 강남 매장 매니저
      { user_id: users[3].id, role_id: roles.find(r => r.name === 'store_manager').id },
      // 일반 고객들
      { user_id: users[4].id, role_id: roles.find(r => r.name === 'customer').id },
      { user_id: users[5].id, role_id: roles.find(r => r.name === 'customer').id }
    ]

    const { error: assignmentError } = await supabase
      .from('user_role_assignments')
      .upsert(roleAssignments, { onConflict: 'user_id,role_id' })

    if (assignmentError) throw assignmentError
    console.log(`✅ ${roleAssignments.length}개 역할 할당 완료`)

    // 5. 지점별 권한 할당
    console.log('🏢 지점별 권한 할당 중...')
    const branchPermissions = [
      // 강남 지점장 - 강남지점 권한
      {
        user_id: users[1].id,
        branch_id: branches[0].id,
        role_id: roles.find(r => r.name === 'branch_manager').id
      },
      // 서초 지점장 - 서초지점 권한
      {
        user_id: users[2].id,
        branch_id: branches[1].id,
        role_id: roles.find(r => r.name === 'branch_manager').id
      }
    ]

    const { error: branchPermError } = await supabase
      .from('user_branch_permissions')
      .upsert(branchPermissions, { onConflict: 'user_id,branch_id,role_id' })

    if (branchPermError) throw branchPermError
    console.log(`✅ ${branchPermissions.length}개 지점별 권한 할당 완료`)

    // 6. 매장별 권한 할당
    console.log('🏪 매장별 권한 할당 중...')
    const storePermissions = [
      // 강남 매장 매니저 - 강남매장 권한
      {
        user_id: users[3].id,
        store_id: stores[0].id,
        role_id: roles.find(r => r.name === 'store_manager').id
      }
    ]

    const { error: storePermError } = await supabase
      .from('user_store_permissions')
      .upsert(storePermissions, { onConflict: 'user_id,store_id,role_id' })

    if (storePermError) throw storePermError
    console.log(`✅ ${storePermissions.length}개 매장별 권한 할당 완료`)

    console.log('🎉 권한 시스템 테스트 데이터 생성 완료!')
    console.log('\n📋 생성된 데이터 요약:')
    console.log(`- 지점: ${branches.length}개`)
    console.log(`- 매장: ${stores.length}개`)
    console.log(`- 사용자: ${users.length}개`)
    console.log(`- 역할 할당: ${roleAssignments.length}개`)
    console.log(`- 지점별 권한: ${branchPermissions.length}개`)
    console.log(`- 매장별 권한: ${storePermissions.length}개`)

    console.log('\n👤 테스트 계정 정보:')
    console.log('슈퍼 관리자: 010-0000-0001')
    console.log('강남 지점장: 010-0000-0002')
    console.log('서초 지점장: 010-0000-0003')
    console.log('강남 매장 매니저: 010-0000-0004')
    console.log('일반 고객1: 010-0000-0005')
    console.log('일반 고객2: 010-0000-0006')

  } catch (error) {
    console.error('❌ 테스트 데이터 생성 실패:', error)
    process.exit(1)
  }
}

createRoleTestData()
