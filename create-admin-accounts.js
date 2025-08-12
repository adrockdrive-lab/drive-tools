require('dotenv').config({ path: '.env.local' })
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

async function createAdminAccounts() {
  try {
    console.log('🚀 지점별 관리자 계정 생성 시작...')

    // 1. 지점 데이터 생성 (upsert 방식)
    console.log('📍 지점 데이터 생성 중...')
    const { data: branches, error: branchesError } = await supabase
      .from('branches')
      .upsert([
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
        },
        {
          name: '마포지점',
          code: 'MP001',
          address: '서울시 마포구 홍대로 789',
          phone: '02-3456-7890',
          manager_name: '박지점장',
          is_active: true
        },
        {
          name: '송파지점',
          code: 'SP001',
          address: '서울시 송파구 올림픽로 321',
          phone: '02-4567-8901',
          manager_name: '최지점장',
          is_active: true
        },
        {
          name: '영등포지점',
          code: 'YD001',
          address: '서울시 영등포구 여의대로 654',
          phone: '02-5678-9012',
          manager_name: '정지점장',
          is_active: true
        }
      ], { onConflict: 'code' })
      .select()

    if (branchesError) throw branchesError
    console.log(`✅ ${branches.length}개 지점 생성 완료`)

    // 2. 매장 데이터 생성 (upsert 방식)
    console.log('🏪 매장 데이터 생성 중...')
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .upsert([
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
        },
        {
          name: '마포운전면허학원',
          is_direct: true,
          is_near_test_center: true,
          is_sunday_open: false,
          has_free_photo: true,
          road_address: '서울시 마포구 홍대로 789',
          address: '서울시 마포구 서교동 789-12',
          phone_number: '02-3456-7890',
          max_capacity: 90,
          machine_count_class1: 4,
          machine_count_class2: 3
        },
        {
          name: '송파운전면허학원',
          is_direct: true,
          is_near_test_center: true,
          is_sunday_open: false,
          has_free_photo: true,
          road_address: '서울시 송파구 올림픽로 321',
          address: '서울시 송파구 잠실동 321-54',
          phone_number: '02-4567-8901',
          max_capacity: 120,
          machine_count_class1: 6,
          machine_count_class2: 4
        },
        {
          name: '영등포운전면허학원',
          is_direct: true,
          is_near_test_center: true,
          is_sunday_open: false,
          has_free_photo: true,
          road_address: '서울시 영등포구 여의대로 654',
          address: '서울시 영등포구 여의도동 654-87',
          phone_number: '02-5678-9012',
          max_capacity: 110,
          machine_count_class1: 5,
          machine_count_class2: 3
        }
      ])
      .select()

    if (storesError) throw storesError
    console.log(`✅ ${stores.length}개 매장 생성 완료`)

    // 3. 관리자 계정 생성 (upsert 방식)
    console.log('👥 관리자 계정 생성 중...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .upsert([
        // 슈퍼 관리자
        {
          name: '슈퍼관리자',
          phone: '010-0000-0001',
          phone_verified: true,
          branch_id: branches[0].id,
          store_id: stores[0].id
        },
        // 강남 지점장
        {
          name: '강남지점장',
          phone: '010-0000-0002',
          phone_verified: true,
          branch_id: branches[0].id,
          store_id: stores[0].id
        },
        // 서초 지점장
        {
          name: '서초지점장',
          phone: '010-0000-0003',
          phone_verified: true,
          branch_id: branches[1].id,
          store_id: stores[1].id
        },
        // 마포 지점장
        {
          name: '마포지점장',
          phone: '010-0000-0004',
          phone_verified: true,
          branch_id: branches[2].id,
          store_id: stores[2].id
        },
        // 송파 지점장
        {
          name: '송파지점장',
          phone: '010-0000-0005',
          phone_verified: true,
          branch_id: branches[3].id,
          store_id: stores[3].id
        },
        // 영등포 지점장
        {
          name: '영등포지점장',
          phone: '010-0000-0006',
          phone_verified: true,
          branch_id: branches[4].id,
          store_id: stores[4].id
        }
      ], { onConflict: 'phone' })
      .select()

    if (usersError) throw usersError
    console.log(`✅ ${users.length}개 관리자 계정 생성 완료`)

    // 4. 역할 할당
    console.log('🔐 역할 할당 중...')
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')

    if (rolesError) throw rolesError

    const roleAssignments = [
      // 슈퍼 관리자
      { user_id: users[0].id, role_id: roles.find(r => r.name === 'super_admin').id },
      // 지점장들
      { user_id: users[1].id, role_id: roles.find(r => r.name === 'branch_manager').id },
      { user_id: users[2].id, role_id: roles.find(r => r.name === 'branch_manager').id },
      { user_id: users[3].id, role_id: roles.find(r => r.name === 'branch_manager').id },
      { user_id: users[4].id, role_id: roles.find(r => r.name === 'branch_manager').id },
      { user_id: users[5].id, role_id: roles.find(r => r.name === 'branch_manager').id }
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
      },
      // 마포 지점장 - 마포지점 권한
      {
        user_id: users[3].id,
        branch_id: branches[2].id,
        role_id: roles.find(r => r.name === 'branch_manager').id
      },
      // 송파 지점장 - 송파지점 권한
      {
        user_id: users[4].id,
        branch_id: branches[3].id,
        role_id: roles.find(r => r.name === 'branch_manager').id
      },
      // 영등포 지점장 - 영등포지점 권한
      {
        user_id: users[5].id,
        branch_id: branches[4].id,
        role_id: roles.find(r => r.name === 'branch_manager').id
      }
    ]

    const { error: branchPermError } = await supabase
      .from('user_branch_permissions')
      .upsert(branchPermissions, { onConflict: 'user_id,branch_id,role_id' })

    if (branchPermError) throw branchPermError
    console.log(`✅ ${branchPermissions.length}개 지점별 권한 할당 완료`)

    console.log('🎉 지점별 관리자 계정 생성 완료!')
    console.log('\n📋 생성된 데이터 요약:')
    console.log(`- 지점: ${branches.length}개`)
    console.log(`- 매장: ${stores.length}개`)
    console.log(`- 관리자 계정: ${users.length}개`)
    console.log(`- 역할 할당: ${roleAssignments.length}개`)
    console.log(`- 지점별 권한: ${branchPermissions.length}개`)

    console.log('\n👤 관리자 계정 정보:')
    console.log('┌─────────────────┬─────────────────┬─────────────────┐')
    console.log('│ 지점명          │ 관리자명        │ 전화번호        │')
    console.log('├─────────────────┼─────────────────┼─────────────────┤')
    console.log('│ 전체 시스템     │ 슈퍼관리자      │ 010-0000-0001   │')
    console.log('│ 강남지점        │ 강남지점장      │ 010-0000-0002   │')
    console.log('│ 서초지점        │ 서초지점장      │ 010-0000-0003   │')
    console.log('│ 마포지점        │ 마포지점장      │ 010-0000-0004   │')
    console.log('│ 송파지점        │ 송파지점장      │ 010-0000-0005   │')
    console.log('│ 영등포지점      │ 영등포지점장    │ 010-0000-0006   │')
    console.log('└─────────────────┴─────────────────┴─────────────────┘')

    console.log('\n💡 매장 매니저는 각 지점장이 역할 관리 페이지에서 생성할 수 있습니다.')

  } catch (error) {
    console.error('❌ 관리자 계정 생성 실패:', error)
    process.exit(1)
  }
}

createAdminAccounts()
