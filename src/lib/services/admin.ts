import { supabase } from '@/lib/supabase';
import type { Admin, AdminRole, MissionStatus, MissionType, PaybackStatus, ProofData, UserData, UserMissionData } from '@/types';
import bcrypt from 'bcryptjs';

export const adminService = {
  // 어드민 로그인 (데이터베이스 기반)
  async login(email: string, password: string): Promise<{ success: boolean; admin?: Admin; error?: string }> {
    try {
      console.log('로그인 시도:', email)

      // 1단계: 기본 관리자 정보만 조회
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id, name, email, phone, password_hash, role, is_active, created_at, updated_at')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      console.log('1단계 - 기본 관리자 정보 조회 결과:', { adminData, adminError })

      if (adminError || !adminData) {
        console.log('관리자 정보 조회 실패:', adminError)
        return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' }
      }

      // 2단계: 비밀번호 확인
      if (!adminData.password_hash) {
        console.log('비밀번호 해시가 없음')
        return { success: false, error: '비밀번호가 설정되지 않았습니다.' }
      }

      console.log('2단계 - 비밀번호 검증 시작')
      const isPasswordValid = await bcrypt.compare(password, adminData.password_hash)
      console.log('비밀번호 검증 결과:', isPasswordValid)

      if (!isPasswordValid) {
        console.log('비밀번호가 일치하지 않음')
        return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' }
      }

      // 3단계: store assignments 조회
      console.log('3단계 - store assignments 조회 시작')
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('admin_store_assignments')
        .select('store_id, is_active')
        .eq('admin_user_id', adminData.id)
        .eq('is_active', true)

      console.log('store assignments 조회 결과:', { assignmentsData, assignmentsError })

      if (assignmentsError) {
        console.log('store assignments 조회 실패:', assignmentsError)
        return { success: false, error: '관리자 권한을 확인할 수 없습니다.' }
      }

      const activeAssignments = assignmentsData || []

      if (activeAssignments.length === 0) {
        console.log('활성화된 store assignment가 없음')
        return { success: false, error: '관리자 권한이 없습니다.' }
      }

      console.log('4단계 - 로그인 성공, 관리자 정보 생성 중')

      // 로그인 성공 시 세션에 관리자 정보 저장
      const admin: Admin = {
        id: adminData.id,
        name: adminData.name,
        email: adminData.email,
        phone: adminData.phone,
        storeIds: activeAssignments.map((asa: any) => asa.store_id),
        role: adminData.role as AdminRole, // 데이터베이스에서 가져온 역할
        isActive: adminData.is_active,
        createdAt: adminData.created_at,
        updatedAt: adminData.updated_at
      }

      console.log('생성된 관리자 정보:', admin)

      // 세션에 관리자 정보 저장 (localStorage 사용)
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_user', JSON.stringify(admin))
        console.log('localStorage에 관리자 정보 저장 완료')
      }

      return { success: true, admin }
    } catch (error) {
      console.error('Admin login error:', error)
      return { success: false, error: '로그인에 실패했습니다.' }
    }
  },

  // 로그아웃
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('로그아웃 시작')
      // 세션에서 관리자 정보 제거
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_user')
        console.log('localStorage에서 admin_user 삭제 완료')
      }
      console.log('로그아웃 완료')
      return { success: true }
    } catch (error) {
      console.error('Admin logout error:', error)
      return { success: false, error: '로그아웃에 실패했습니다.' }
    }
  },

  // 현재 로그인된 관리자 정보 가져오기
  getCurrentAdmin(): Admin | null {
    // 서버 사이드에서는 항상 null 반환 (hydration mismatch 방지)
    if (typeof window === 'undefined') return null

    try {
      const adminData = localStorage.getItem('admin_user')
      if (!adminData) return null

      const admin = JSON.parse(adminData)
      // 유효성 검사
      if (!admin || !admin.id || !admin.email) {
        localStorage.removeItem('admin_user')
        return null
      }

      return admin
    } catch (error) {
      console.error('Get current admin error:', error)
      // 오류 발생 시 localStorage 정리
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_user')
      }
      return null
    }
  },

  // 관리자 권한 확인
  async checkAdminPermissions(adminId: string, storeId?: number): Promise<{ success: boolean; hasAccess: boolean; error?: string }> {
    try {
      console.log('checkAdminPermissions called with adminId:', adminId, 'storeId:', storeId)

      // 먼저 관리자 정보를 가져와서 역할 확인
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', adminId)
        .single()

      if (adminError || !adminData) {
        console.log('관리자 정보 조회 실패:', adminError)
        return { success: false, hasAccess: false, error: '관리자 정보를 찾을 수 없습니다.' }
      }

      // 슈퍼관리자는 모든 권한
      if (adminData.role === 'super_admin') {
        console.log('슈퍼관리자 권한 확인됨')
        return { success: true, hasAccess: true }
      }

      let query = supabase
        .from('admin_store_assignments')
        .select('*')
        .eq('admin_user_id', adminId)
        .eq('is_active', true)

      if (storeId) {
        query = query.eq('store_id', storeId)
      }

      const { data, error } = await query

      if (error) throw error

      const hasAccess = data && data.length > 0
      console.log('Permission check result:', { hasAccess, assignmentCount: data?.length || 0 })

      return { success: true, hasAccess }
    } catch (error) {
      console.error('Check admin permissions error:', error)
      return { success: false, hasAccess: false, error: '권한 확인에 실패했습니다.' }
    }
  },

  // 전체 사용자 미션 데이터 조회 (관리자 권한에 따라 필터링)
  async getUserMissions(adminId: string, storeId?: number): Promise<{ success: boolean; data?: UserMissionData[]; error?: string }> {
    try {
      console.log('getUserMissions 시작:', { adminId, storeId })

      // 먼저 관리자 정보를 가져와서 역할 확인
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', adminId)
        .single()

      if (adminError || !adminData) {
        console.log('관리자 정보 조회 실패:', adminError)
        return { success: false, error: '관리자 정보를 찾을 수 없습니다.' }
      }

      console.log('관리자 역할 확인:', adminData.role)

      // 슈퍼관리자가 아닌 경우 권한 확인
      if (adminData.role !== 'super_admin') {
        const { success, hasAccess } = await this.checkAdminPermissions(adminId, storeId)
        if (!success || !hasAccess) {
          return { success: false, error: '접근 권한이 없습니다.' }
        }
      }

      console.log('미션 참여 정보 조회 시작')

      // 미션 참여 정보 조회 (새로운 구조)
      let query = supabase
        .from('mission_participations')
        .select(`
          id,
          status,
          proof_data,
          completed_at,
          started_at,
          created_at,
          user_id,
          mission_definition_id,
          store_id,
          users!inner(
            name,
            phone
          ),
          mission_definitions!inner(
            title,
            mission_type,
            reward_amount
          ),
          stores!inner(
            name
          )
        `)
        .order('created_at', { ascending: false })

      // 특정 지점 필터링
      if (storeId) {
        query = query.eq('store_id', storeId)
      }

      const { data: missionsData, error: missionsError } = await query

      if (missionsError) {
        console.error('미션 참여 조회 오류:', missionsError)
        throw missionsError
      }

      console.log('미션 참여 데이터 조회 완료:', missionsData?.length || 0)

      // 페이백 정보 별도 조회 (페이백이 없을 수 있으므로 에러 처리 완화)
      let paybacksData = []
      try {
        let paybackQuery = supabase
          .from('paybacks')
          .select('*')
          .order('created_at', { ascending: false })

        if (storeId) {
          paybackQuery = paybackQuery.eq('store_id', storeId)
        }

        const { data: paybacks, error: paybacksError } = await paybackQuery

        if (paybacksError) {
          console.warn('페이백 조회 오류 (무시됨):', paybacksError)
        } else {
          paybacksData = paybacks || []
        }
      } catch (paybackError) {
        console.warn('페이백 조회 중 오류 (무시됨):', paybackError)
      }

      console.log('페이백 데이터 조회 완료:', paybacksData.length)

      // 미션 참여 데이터와 페이백 데이터 매칭
      const userMissions: UserMissionData[] = (missionsData || []).map((item: any) => {
        // 해당 미션 참여에 대한 페이백 찾기
        const payback = paybacksData.find(p =>
          p.user_id === item.user_id && p.mission_definition_id === item.mission_definition_id
        )

        return {
          id: item.id,
          userName: item.users.name,
          userPhone: item.users.phone,
          missionTitle: item.mission_definitions.title,
          missionType: item.mission_definitions.mission_type as MissionType,
          status: item.status as MissionStatus,
          startedAt: item.started_at || item.created_at,
          completedAt: item.completed_at,
          rewardAmount: item.mission_definitions.reward_amount,
          proofData: item.proof_data as ProofData | null,
          paybackStatus: (payback?.status as PaybackStatus) || null,
          paybackAmount: payback?.amount || null,
          storeName: item.stores.name,
          createdAt: item.created_at
        }
      })

      console.log('데이터 매칭 완료:', userMissions.length)

      return { success: true, data: userMissions }
    } catch (error) {
      console.error('Get user missions error:', error)
      return { success: false, error: '사용자 미션 데이터를 불러오는데 실패했습니다.' }
    }
  },

  // 페이백 승인
  async approvePayback(participationId: string, adminId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 미션 참여 정보 조회
      const { data: participation, error: participationError } = await supabase
        .from('mission_participations')
        .select(`
          *,
          mission_definitions!inner(reward_amount),
          stores!inner(id, name)
        `)
        .eq('id', participationId)
        .single()

      if (participationError) throw participationError

      // 먼저 관리자 정보를 가져와서 역할 확인
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', adminId)
        .single()

      if (adminError || !adminData) {
        console.log('관리자 정보 조회 실패:', adminError)
        return { success: false, error: '관리자 정보를 찾을 수 없습니다.' }
      }

      // 슈퍼관리자가 아닌 경우 권한 확인
      if (adminData.role !== 'super_admin') {
        const { success, hasAccess } = await this.checkAdminPermissions(adminId, participation.store_id)
        if (!success || !hasAccess) {
          return { success: false, error: '해당 지점에 대한 권한이 없습니다.' }
        }
      }

      // 페이백 생성 또는 업데이트
      const { error: paybackError } = await supabase
        .from('paybacks')
        .upsert({
          user_id: participation.user_id,
          mission_definition_id: participation.mission_definition_id,
          store_id: participation.store_id,
          amount: participation.mission_definitions.reward_amount,
          status: 'paid',
          paid_at: new Date().toISOString()
        })

      if (paybackError) throw paybackError

      return { success: true }
    } catch (error) {
      console.error('Approve payback error:', error)
      return { success: false, error: '페이백 승인에 실패했습니다.' }
    }
  },

  // 페이백 거부
  async rejectPayback(participationId: string, reason: string, adminId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 미션 참여 정보 조회
      const { data: participation, error: participationError } = await supabase
        .from('mission_participations')
        .select(`
          *,
          mission_definitions!inner(reward_amount),
          stores!inner(id, name)
        `)
        .eq('id', participationId)
        .single()

      if (participationError) throw participationError

      // 먼저 관리자 정보를 가져와서 역할 확인
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', adminId)
        .single()

      if (adminError || !adminData) {
        console.log('관리자 정보 조회 실패:', adminError)
        return { success: false, error: '관리자 정보를 찾을 수 없습니다.' }
      }

      // 슈퍼관리자가 아닌 경우 권한 확인
      if (adminData.role !== 'super_admin') {
        const { success, hasAccess } = await this.checkAdminPermissions(adminId, participation.store_id)
        if (!success || !hasAccess) {
          return { success: false, error: '해당 지점에 대한 권한이 없습니다.' }
        }
      }

      // 페이백 생성 (거부 상태)
      const { error: paybackError } = await supabase
        .from('paybacks')
        .upsert({
          user_id: participation.user_id,
          mission_definition_id: participation.mission_definition_id,
          store_id: participation.store_id,
          amount: participation.mission_definitions.reward_amount,
          status: 'rejected',
          paid_at: null,
          rejection_reason: reason
        })

      if (paybackError) throw paybackError

      return { success: true }
    } catch (error) {
      console.error('Reject payback error:', error)
      return { success: false, error: '페이백 거부에 실패했습니다.' }
    }
  },

  // 미션 상태 변경
  async updateMissionStatus(participationId: string, status: MissionStatus, adminId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 미션 참여 정보 조회
      const { data: participation, error: participationError } = await supabase
        .from('mission_participations')
        .select('store_id')
        .eq('id', participationId)
        .single()

      if (participationError) throw participationError

      // 먼저 관리자 정보를 가져와서 역할 확인
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', adminId)
        .single()

      if (adminError || !adminData) {
        console.log('관리자 정보 조회 실패:', adminError)
        return { success: false, error: '관리자 정보를 찾을 수 없습니다.' }
      }

      // 슈퍼관리자가 아닌 경우 권한 확인
      if (adminData.role !== 'super_admin') {
        const { success, hasAccess } = await this.checkAdminPermissions(adminId, participation.store_id)
        if (!success || !hasAccess) {
          return { success: false, error: '해당 지점에 대한 권한이 없습니다.' }
        }
      }

      // 미션 상태 업데이트
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('mission_participations')
        .update(updateData)
        .eq('id', participationId)

      if (updateError) throw updateError

      return { success: true }
    } catch (error) {
      console.error('Update mission status error:', error)
      return { success: false, error: '미션 상태 변경에 실패했습니다.' }
    }
  },

  // 전체 통계 조회 (관리자 권한에 따라 필터링)
  async getStoreStats(adminId: string, storeId?: number): Promise<{
    success: boolean;
    stats?: {
      totalUsers: number
      totalMissions: number
      completedMissions: number
      totalPayback: number
      completionRate: number
    };
    error?: string
  }> {
    try {
      // 먼저 관리자 정보를 가져와서 역할 확인
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', adminId)
        .single()

      if (adminError || !adminData) {
        console.log('관리자 정보 조회 실패:', adminError)
        return { success: false, error: '관리자 정보를 찾을 수 없습니다.' }
      }

      // 슈퍼관리자가 아닌 경우 권한 확인
      if (adminData.role !== 'super_admin') {
        const { success, hasAccess } = await this.checkAdminPermissions(adminId, storeId)
        if (!success || !hasAccess) {
          return { success: false, error: '접근 권한이 없습니다.' }
        }
      }

      // 총 사용자 수
      let usersQuery = supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      if (storeId) {
        usersQuery = usersQuery.eq('store_id', storeId)
      }

      const { count: totalUsers } = await usersQuery

      // 총 미션 참여 수
      let missionsQuery = supabase
        .from('mission_participations')
        .select('*', { count: 'exact', head: true })

      if (storeId) {
        missionsQuery = missionsQuery.eq('store_id', storeId)
      }

      const { count: totalMissions } = await missionsQuery

      // 완료된 미션 수
      let completedMissionsQuery = supabase
        .from('mission_participations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

      if (storeId) {
        completedMissionsQuery = completedMissionsQuery.eq('store_id', storeId)
      }

      const { count: completedMissions } = await completedMissionsQuery

      // 총 페이백 금액
      let paybacksQuery = supabase
        .from('paybacks')
        .select('amount')
        .eq('status', 'paid')

      if (storeId) {
        paybacksQuery = paybacksQuery.eq('store_id', storeId)
      }

      const { data: paybacks } = await paybacksQuery

      const totalPayback = paybacks?.reduce((sum, p) => sum + p.amount, 0) || 0

      const stats = {
        totalUsers: totalUsers || 0,
        totalMissions: totalMissions || 0,
        completedMissions: completedMissions || 0,
        totalPayback,
        completionRate: totalMissions ? Math.round((completedMissions || 0) / totalMissions * 100) : 0
      }

      return { success: true, stats }
    } catch (error) {
      console.error('Get store stats error:', error)
      return { success: false, error: '통계 데이터를 불러오는데 실패했습니다.' }
    }
  },

  // 관리자가 관리할 수 있는 지점 목록 조회
  async getAdminStores(adminId: string): Promise<{ success: boolean; stores?: any[]; error?: string }> {
    try {
      // 먼저 관리자 정보를 가져와서 역할 확인
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', adminId)
        .single()

      if (adminError || !adminData) {
        console.log('관리자 정보 조회 실패:', adminError)
        return { success: false, error: '관리자 정보를 찾을 수 없습니다.' }
      }

      // 슈퍼관리자는 모든 지점에 접근 가능
      if (adminData.role === 'super_admin') {
        console.log('슈퍼관리자 - 모든 지점 조회')
        const { data: allStores, error: allStoresError } = await supabase
          .from('stores')
          .select('id, name, address, phone_number')
          .eq('is_active', true)
          .order('name')

        if (allStoresError) throw allStoresError

        return { success: true, stores: allStores }
      }

      // 일반 관리자는 할당된 지점만 조회
      const { data, error } = await supabase
        .from('admin_store_assignments')
        .select(`
          store_id,
          stores!inner(
            id,
            name,
            address,
            phone_number
          )
        `)
        .eq('admin_user_id', adminId)
        .eq('is_active', true)

      if (error) throw error

      const stores = data.map((item: any) => item.stores)

      return { success: true, stores }
    } catch (error) {
      console.error('Get admin stores error:', error)
      return { success: false, error: '지점 목록을 불러오는데 실패했습니다.' }
    }
  },

  // 모든 지점 목록 조회 (미션 정의용)
  async getAllStores(): Promise<{ success: boolean; stores?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, address, phone_number')
        .order('name')

      if (error) throw error

      return { success: true, stores: data }
    } catch (error) {
      console.error('Get all stores error:', error)
      return { success: false, error: '지점 목록을 불러오는데 실패했습니다.' }
    }
  },

  // 사용자 목록 조회 (관리자 권한에 따라 필터링)
  async getUsers(adminId: string, storeId?: number): Promise<{ success: boolean; data?: UserData[]; error?: string }> {
    try {
      // 먼저 관리자 정보를 가져와서 역할 확인
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', adminId)
        .single()

      if (adminError || !adminData) {
        console.log('관리자 정보 조회 실패:', adminError)
        return { success: false, error: '관리자 정보를 찾을 수 없습니다.' }
      }

      // 슈퍼관리자가 아닌 경우 권한 확인
      if (adminData.role !== 'super_admin') {
        const { success, hasAccess } = await this.checkAdminPermissions(adminId, storeId)
        if (!success || !hasAccess) {
          return { success: false, error: '접근 권한이 없습니다.' }
        }
      }

      // 관리자가 관리할 수 있는 지점의 사용자들만 조회
      let query = supabase
        .from('users')
        .select(`
          *,
          stores!inner(
            name
          )
        `)
        .order('created_at', { ascending: false })

      // 특정 지점 필터링
      if (storeId) {
        query = query.eq('store_id', storeId)
      }

      const { data: usersData, error: usersError } = await query

      if (usersError) throw usersError

      // 각 사용자의 미션 및 페이백 정보 조회
      const usersWithStats = await Promise.all(
        usersData.map(async (user) => {
          // 사용자의 미션 참여 수
          let missionsQuery = supabase
            .from('mission_participations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          if (storeId) {
            missionsQuery = missionsQuery.eq('store_id', storeId)
          }

          const { count: totalMissions } = await missionsQuery

          // 완료된 미션 수
          let completedMissionsQuery = supabase
            .from('mission_participations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'completed')

          if (storeId) {
            completedMissionsQuery = completedMissionsQuery.eq('store_id', storeId)
          }

          const { count: completedMissions } = await completedMissionsQuery

          // 총 페이백 금액
          let paybacksQuery = supabase
            .from('paybacks')
            .select('amount')
            .eq('user_id', user.id)
            .eq('status', 'paid')

          if (storeId) {
            paybacksQuery = paybacksQuery.eq('store_id', storeId)
          }

          const { data: paybacks } = await paybacksQuery

          const totalPayback = paybacks?.reduce((sum, p) => sum + p.amount, 0) || 0

          return {
            id: user.id,
            name: user.name,
            phone: user.phone,
            storeName: user.stores.name,
            totalMissions: totalMissions || 0,
            completedMissions: completedMissions || 0,
            totalPayback,
            createdAt: user.created_at
          }
        })
      )

      return { success: true, data: usersWithStats }
    } catch (error) {
      console.error('Get users error:', error)
      return { success: false, error: '사용자 데이터를 불러오는데 실패했습니다.' }
    }
  },

  // 미션 정의 목록 조회
  async getMissionDefinitions(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('mission_definitions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get mission definitions error:', error)
      return { success: false, error: '미션 정의를 불러오는데 실패했습니다.' }
    }
  },

  // 미션 정의 생성
  async createMissionDefinition(missionData: {
    title: string
    description?: string
    missionType: string
    rewardAmount: number
    requirements?: any
    proofRequirements?: any
    isGlobal?: boolean
    storeId?: number | null
    maxParticipants?: number
    startDate?: string
    endDate?: string
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('mission_definitions')
        .insert({
          title: missionData.title,
          description: missionData.description,
          mission_type: missionData.missionType,
          reward_amount: missionData.rewardAmount,
          requirements: missionData.requirements,
          proof_requirements: missionData.proofRequirements,
          is_global: missionData.isGlobal ?? true,
          store_id: missionData.storeId,
          max_participants: missionData.maxParticipants,
          start_date: missionData.startDate,
          end_date: missionData.endDate
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Create mission definition error:', error)
      return { success: false, error: '미션 정의 생성에 실패했습니다.' }
    }
  },

  // 미션 정의 수정
  async updateMissionDefinition(
    id: number,
    missionData: {
      title?: string
      description?: string
      missionType?: string
      rewardAmount?: number
      requirements?: any
      proofRequirements?: any
      isGlobal?: boolean
      storeId?: number | null
      maxParticipants?: number
      startDate?: string
      endDate?: string
      isActive?: boolean
    }
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('mission_definitions')
        .update({
          title: missionData.title,
          description: missionData.description,
          mission_type: missionData.missionType,
          reward_amount: missionData.rewardAmount,
          requirements: missionData.requirements,
          proof_requirements: missionData.proofRequirements,
          is_global: missionData.isGlobal,
          store_id: missionData.storeId,
          max_participants: missionData.maxParticipants,
          start_date: missionData.startDate,
          end_date: missionData.endDate,
          is_active: missionData.isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Update mission definition error:', error)
      return { success: false, error: '미션 정의 수정에 실패했습니다.' }
    }
  },

  // 미션 정의 삭제
  async deleteMissionDefinition(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('mission_definitions')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Delete mission definition error:', error)
      return { success: false, error: '미션 정의 삭제에 실패했습니다.' }
    }
  },

    // 지점별 미션 정의 조회 (전역 + 지점별)
  async getMissionDefinitionsByStore(adminId: string, storeId?: number): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      console.log('getMissionDefinitions called with adminId:', adminId, 'storeId:', storeId)

      const { success, hasAccess } = await this.checkAdminPermissions(adminId, storeId)
      console.log('Permission check result:', { success, hasAccess })

      if (!success || !hasAccess) {
        return { success: false, error: '접근 권한이 없습니다.' }
      }

      let query = supabase
        .from('mission_definitions')
        .select('*')
        .order('created_at', { ascending: false })

      // 전역 미션 또는 특정 지점 미션
      if (storeId) {
        query = query.or(`is_global.eq.true,store_id.eq.${storeId}`)
      } else {
        query = query.eq('is_global', true)
      }

      const { data, error } = await query
      console.log('Supabase query result:', { data: data?.length, error })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get mission definitions error:', error)
      return { success: false, error: '미션 정의를 불러오는데 실패했습니다.' }
    }
  },

  // 지점별 사용 가능한 미션 조회 (전역 + 지점별)
  async getAvailableMissions(adminId: string, storeId?: number): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      console.log('getAvailableMissions called with adminId:', adminId, 'storeId:', storeId)

      const { success, hasAccess } = await this.checkAdminPermissions(adminId, storeId)
      console.log('Permission check result:', { success, hasAccess })

      if (!success || !hasAccess) {
        return { success: false, error: '접근 권한이 없습니다.' }
      }

      // 미션 정의 조회 (전역 + 지점별)
      let query = supabase
        .from('mission_definitions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (storeId) {
        // 특정 지점의 경우: 전역 미션 + 해당 지점 미션
        query = query.or(`is_global.eq.true,store_id.eq.${storeId}`)
      } else {
        // 전체 조회의 경우: 전역 미션만
        query = query.eq('is_global', true)
      }

      const { data: missions, error } = await query
      if (error) throw error

      console.log('Available missions:', missions?.length || 0)

      return { success: true, data: missions }
    } catch (error) {
      console.error('Get available missions error:', error)
      return { success: false, error: '사용 가능한 미션을 불러오는데 실패했습니다.' }
    }
  },



  // 미션 제출물 관리 함수들
  async getMissionSubmissions(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('mission_participations')
        .select(`
          id,
          user_id,
          mission_definition_id,
          status,
          proof_data,
          created_at,
          completed_at,
          users!inner(name, phone),
          mission_definitions!inner(title, mission_type, reward_amount),
          stores!inner(name)
        `)
        .neq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedData = data.map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        userName: item.users?.name || '알 수 없음',
        userPhone: item.users?.phone || '알 수 없음',
        missionTitle: item.mission_definitions?.title || '알 수 없음',
        missionType: item.mission_definitions?.mission_type || 'unknown',
        status: item.status,
        proofData: item.proof_data,
        submittedAt: item.created_at,
        rewardAmount: item.mission_definitions?.reward_amount || 0,
        storeName: item.stores?.name || '알 수 없음'
      }))

      return { success: true, data: formattedData }
    } catch (error) {
      console.error('Get mission submissions error:', error)
      return { success: false, error: '제출물을 불러오는데 실패했습니다.' }
    }
  },

  async approveMissionSubmission(submissionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('mission_participations')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', submissionId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Approve mission submission error:', error)
      return { success: false, error: '승인에 실패했습니다.' }
    }
  },

  async rejectMissionSubmission(submissionId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('mission_participations')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          completed_at: new Date().toISOString()
        })
        .eq('id', submissionId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Reject mission submission error:', error)
      return { success: false, error: '거절에 실패했습니다.' }
    }
  }
}
