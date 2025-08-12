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

async function createAdminUsers() {
  try {
    console.log('🚀 관리자 계정 생성 시작...')

    // 1. 기존 지점 데이터 조회
    console.log('📍 기존 지점 데이터 조회 중...')
    const { data: branches, error: branchesError } = await supabase
      .from('branches')
      .select('*')
      .order('name')

    if (branchesError) throw branchesError
    console.log(`✅ ${branches.length}개 지점 조회 완료`)

    // 2. 실제 스토어 데이터 조회
    console.log('🏪 실제 스토어 데이터 조회 중...')
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .order('id')

    if (storesError) throw storesError
    console.log(`✅ ${stores.length}개 스토어 조회 완료`)

    // 3. 관리자 계정 생성
    console.log('👥 관리자 계정 생성 중...')
    const { data: adminUsers, error: adminUsersError } = await supabase
      .from('admin_users')
      .upsert([
        // 슈퍼 관리자
        {
          name: '슈퍼관리자',
          phone: '010-0000-0001',
          email: 'admin@drivingzone.com',
          phone_verified: true,
          is_active: true
        },
        // 강남 지점장
        {
          name: '강남지점장',
          phone: '010-0000-0002',
          email: 'gangnam@drivingzone.com',
          phone_verified: true,
          is_active: true
        },
        // 서초 지점장
        {
          name: '서초지점장',
          phone: '010-0000-0003',
          email: 'seocho@drivingzone.com',
          phone_verified: true,
          is_active: true
        },
        // 마포 지점장
        {
          name: '마포지점장',
          phone: '010-0000-0004',
          email: 'mapo@drivingzone.com',
          phone_verified: true,
          is_active: true
        },
        // 송파 지점장
        {
          name: '송파지점장',
          phone: '010-0000-0005',
          email: 'songpa@drivingzone.com',
          phone_verified: true,
          is_active: true
        },
        // 영등포 지점장
        {
          name: '영등포지점장',
          phone: '010-0000-0006',
          email: 'yeongdeungpo@drivingzone.com',
          phone_verified: true,
          is_active: true
        }
      ], { onConflict: 'phone' })
      .select()

    if (adminUsersError) throw adminUsersError
    console.log(`✅ ${adminUsers.length}개 관리자 계정 생성 완료`)

    // 4. 역할 할당
    console.log('🔐 역할 할당 중...')
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')

    if (rolesError) throw rolesError

    const roleAssignments = [
      // 슈퍼 관리자
      { user_id: adminUsers[0].id, role_id: roles.find(r => r.name === 'super_admin').id },
      // 지점장들
      { user_id: adminUsers[1].id, role_id: roles.find(r => r.name === 'branch_manager').id },
      { user_id: adminUsers[2].id, role_id: roles.find(r => r.name === 'branch_manager').id },
      { user_id: adminUsers[3].id, role_id: roles.find(r => r.name === 'branch_manager').id },
      { user_id: adminUsers[4].id, role_id: roles.find(r => r.name === 'branch_manager').id },
      { user_id: adminUsers[5].id, role_id: roles.find(r => r.name === 'branch_manager').id }
    ]

    const { error: assignmentError } = await supabase
      .from('admin_role_assignments')
      .upsert(roleAssignments.map(ra => ({
        admin_user_id: ra.user_id,
        role_id: ra.role_id
      })), { onConflict: 'admin_user_id,role_id' })

    if (assignmentError) throw assignmentError
    console.log(`✅ ${roleAssignments.length}개 역할 할당 완료`)

    // 5. 지점별 권한 할당
    console.log('🏢 지점별 권한 할당 중...')
    const branchPermissions = [
      // 강남 지점장 - 강남지점 권한
      {
        user_id: adminUsers[1].id,
        branch_id: branches.find(b => b.name === '강남지점')?.id,
        role_id: roles.find(r => r.name === 'branch_manager').id
      },
      // 서초 지점장 - 서초지점 권한
      {
        user_id: adminUsers[2].id,
        branch_id: branches.find(b => b.name === '서초지점')?.id,
        role_id: roles.find(r => r.name === 'branch_manager').id
      },
      // 마포 지점장 - 마포지점 권한
      {
        user_id: adminUsers[3].id,
        branch_id: branches.find(b => b.name === '마포지점')?.id,
        role_id: roles.find(r => r.name === 'branch_manager').id
      },
      // 송파 지점장 - 송파지점 권한
      {
        user_id: adminUsers[4].id,
        branch_id: branches.find(b => b.name === '송파지점')?.id,
        role_id: roles.find(r => r.name === 'branch_manager').id
      },
      // 영등포 지점장 - 영등포지점 권한
      {
        user_id: adminUsers[5].id,
        branch_id: branches.find(b => b.name === '영등포지점')?.id,
        role_id: roles.find(r => r.name === 'branch_manager').id
      }
    ].filter(bp => bp.branch_id) // branch_id가 있는 것만 필터링

    const { error: branchPermError } = await supabase
      .from('admin_branch_permissions')
      .upsert(branchPermissions.map(bp => ({
        admin_user_id: bp.user_id,
        branch_id: bp.branch_id,
        role_id: bp.role_id
      })), { onConflict: 'admin_user_id,branch_id,role_id' })

    if (branchPermError) throw branchPermError
    console.log(`✅ ${branchPermissions.length}개 지점별 권한 할당 완료`)

    // 6. 관리자-지점 매핑
    console.log('🔗 관리자-지점 매핑 중...')
    const adminBranchAssignments = [
      // 강남 지점장 - 강남지점
      {
        admin_user_id: adminUsers[1].id,
        branch_id: branches.find(b => b.name === '강남지점')?.id
      },
      // 서초 지점장 - 서초지점
      {
        admin_user_id: adminUsers[2].id,
        branch_id: branches.find(b => b.name === '서초지점')?.id
      },
      // 마포 지점장 - 마포지점
      {
        admin_user_id: adminUsers[3].id,
        branch_id: branches.find(b => b.name === '마포지점')?.id
      },
      // 송파 지점장 - 송파지점
      {
        admin_user_id: adminUsers[4].id,
        branch_id: branches.find(b => b.name === '송파지점')?.id
      },
      // 영등포 지점장 - 영등포지점
      {
        admin_user_id: adminUsers[5].id,
        branch_id: branches.find(b => b.name === '영등포지점')?.id
      }
    ].filter(aba => aba.branch_id) // branch_id가 있는 것만 필터링

    const { error: adminBranchError } = await supabase
      .from('admin_branch_assignments')
      .upsert(adminBranchAssignments, { onConflict: 'admin_user_id,branch_id' })

    if (adminBranchError) throw adminBranchError
    console.log(`✅ ${adminBranchAssignments.length}개 관리자-지점 매핑 완료`)

    // 7. 관리자-매장 매핑 (실제 스토어 ID 사용)
    console.log('🏪 관리자-매장 매핑 중...')
    const adminStoreAssignments = [
      // 강남 지점장 - 강남운전면허학원 (ID: 1)
      {
        admin_user_id: adminUsers[1].id,
        store_id: 1
      },
      // 서초 지점장 - 서초운전면허학원 (ID: 2)
      {
        admin_user_id: adminUsers[2].id,
        store_id: 2
      },
      // 마포 지점장 - 마포운전면허학원 (ID: 3)
      {
        admin_user_id: adminUsers[3].id,
        store_id: 3
      },
      // 송파 지점장 - 송파운전면허학원 (ID: 4)
      {
        admin_user_id: adminUsers[4].id,
        store_id: 4
      },
      // 영등포 지점장 - 영등포운전면허학원 (ID: 5)
      {
        admin_user_id: adminUsers[5].id,
        store_id: 5
      }
    ]

    const { error: adminStoreError } = await supabase
      .from('admin_store_assignments')
      .upsert(adminStoreAssignments, { onConflict: 'admin_user_id,store_id' })

    if (adminStoreError) throw adminStoreError
    console.log(`✅ ${adminStoreAssignments.length}개 관리자-매장 매핑 완료`)

    console.log('🎉 관리자 계정 생성 완료!')
    console.log('\n📋 생성된 데이터 요약:')
    console.log(`- 관리자 계정: ${adminUsers.length}개`)
    console.log(`- 역할 할당: ${roleAssignments.length}개`)
    console.log(`- 지점별 권한: ${branchPermissions.length}개`)
    console.log(`- 관리자-지점 매핑: ${adminBranchAssignments.length}개`)
    console.log(`- 관리자-매장 매핑: ${adminStoreAssignments.length}개`)

    console.log('\n👤 관리자 계정 정보:')
    console.log('┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐')
    console.log('│ 지점명          │ 관리자명        │ 전화번호        │ 이메일          │')
    console.log('├─────────────────┼─────────────────┼─────────────────┼─────────────────┤')
    console.log('│ 전체 시스템     │ 슈퍼관리자      │ 010-0000-0001   │ admin@drivingzone.com │')
    console.log('│ 강남지점        │ 강남지점장      │ 010-0000-0002   │ gangnam@drivingzone.com │')
    console.log('│ 서초지점        │ 서초지점장      │ 010-0000-0003   │ seocho@drivingzone.com │')
    console.log('│ 마포지점        │ 마포지점장      │ 010-0000-0004   │ mapo@drivingzone.com │')
    console.log('│ 송파지점        │ 송파지점장      │ 010-0000-0005   │ songpa@drivingzone.com │')
    console.log('│ 영등포지점      │ 영등포지점장    │ 010-0000-0006   │ yeongdeungpo@drivingzone.com │')
    console.log('└─────────────────┴─────────────────┴─────────────────┴─────────────────┘')

    console.log('\n🏪 매장 매핑 정보:')
    console.log('┌─────────────────┬─────────────────┬─────────────────┐')
    console.log('│ 관리자명        │ 매장명          │ 스토어 ID       │')
    console.log('├─────────────────┼─────────────────┼─────────────────┤')
    console.log('│ 강남지점장      │ 강남운전면허학원 │ 1               │')
    console.log('│ 서초지점장      │ 서초운전면허학원 │ 2               │')
    console.log('│ 마포지점장      │ 마포운전면허학원 │ 3               │')
    console.log('│ 송파지점장      │ 송파운전면허학원 │ 4               │')
    console.log('│ 영등포지점장    │ 영등포운전면허학원 │ 5               │')
    console.log('└─────────────────┴─────────────────┴─────────────────┘')

    console.log('\n💡 매장 매니저는 각 지점장이 역할 관리 페이지에서 생성할 수 있습니다.')

  } catch (error) {
    console.error('❌ 관리자 계정 생성 실패:', error)
    process.exit(1)
  }
}

createAdminUsers()
