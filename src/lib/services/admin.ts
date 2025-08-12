import { supabase } from '@/lib/supabase';
import type { Admin, MissionStatus, MissionType, PaybackStatus, ProofData, UserMissionData } from '@/types';
import bcrypt from 'bcryptjs';

export const adminService = {
  // 어드민 로그인 (데이터베이스 기반)
  async login(email: string, password: string): Promise<{ success: boolean; admin?: Admin; error?: string }> {
    try {
      console.log('로그인 시도:', email)

      // 1단계: 기본 관리자 정보만 조회
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
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
        role: 'admin', // 기본 역할
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
      // 세션에서 관리자 정보 제거
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_user')
      }
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

      return { success: true, hasAccess: data && data.length > 0 }
    } catch (error) {
      console.error('Check admin permissions error:', error)
      return { success: false, hasAccess: false, error: '권한 확인에 실패했습니다.' }
    }
  },

  // 전체 사용자 미션 데이터 조회 (관리자 권한에 따라 필터링)
  async getUserMissions(adminId: string, storeId?: number): Promise<{ success: boolean; data?: UserMissionData[]; error?: string }> {
    try {
      // 관리자 권한 확인
      const { success, hasAccess } = await this.checkAdminPermissions(adminId, storeId)
      if (!success || !hasAccess) {
        return { success: false, error: '접근 권한이 없습니다.' }
      }

      // 미션 참여 정보 조회
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
          mission_id,
          store_id,
          users!inner(
            name,
            phone
          ),
          missions!inner(
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

      if (missionsError) throw missionsError

      // 페이백 정보 별도 조회
      let paybackQuery = supabase
        .from('paybacks')
        .select('*')
        .order('created_at', { ascending: false })

      if (storeId) {
        paybackQuery = paybackQuery.eq('store_id', storeId)
      }

      const { data: paybacksData, error: paybacksError } = await paybackQuery

      if (paybacksError) throw paybacksError

      // 미션 참여 데이터와 페이백 데이터 매칭
      const userMissions: UserMissionData[] = missionsData.map((item: any) => {
        // 해당 미션 참여에 대한 페이백 찾기
        const payback = paybacksData?.find(p =>
          p.user_id === item.user_id && p.mission_id === item.mission_id
        )

        return {
          id: item.id,
          userName: item.users.name,
          userPhone: item.users.phone,
          missionTitle: item.missions.title,
          missionType: item.missions.mission_type as MissionType,
          status: item.status as MissionStatus,
          startedAt: item.started_at || item.created_at,
          completedAt: item.completed_at,
          rewardAmount: item.missions.reward_amount,
          proofData: item.proof_data as ProofData | null,
          paybackStatus: (payback?.status as PaybackStatus) || null,
          paybackAmount: payback?.amount || null,
          storeName: item.stores.name,
          createdAt: item.created_at
        }
      })

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
          missions!inner(reward_amount),
          stores!inner(id, name)
        `)
        .eq('id', participationId)
        .single()

      if (participationError) throw participationError

      // 관리자 권한 확인
      const { success, hasAccess } = await this.checkAdminPermissions(adminId, participation.store_id)
      if (!success || !hasAccess) {
        return { success: false, error: '해당 지점에 대한 권한이 없습니다.' }
      }

      // 페이백 생성 또는 업데이트
      const { error: paybackError } = await supabase
        .from('paybacks')
        .upsert({
          user_id: participation.user_id,
          mission_id: participation.mission_id,
          store_id: participation.store_id,
          amount: participation.missions.reward_amount,
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
          missions!inner(reward_amount),
          stores!inner(id, name)
        `)
        .eq('id', participationId)
        .single()

      if (participationError) throw participationError

      // 관리자 권한 확인
      const { success, hasAccess } = await this.checkAdminPermissions(adminId, participation.store_id)
      if (!success || !hasAccess) {
        return { success: false, error: '해당 지점에 대한 권한이 없습니다.' }
      }

      // 페이백 생성 (거부 상태)
      const { error: paybackError } = await supabase
        .from('paybacks')
        .upsert({
          user_id: participation.user_id,
          mission_id: participation.mission_id,
          store_id: participation.store_id,
          amount: participation.missions.reward_amount,
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

      // 관리자 권한 확인
      const { success, hasAccess } = await this.checkAdminPermissions(adminId, participation.store_id)
      if (!success || !hasAccess) {
        return { success: false, error: '해당 지점에 대한 권한이 없습니다.' }
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
      // 관리자 권한 확인
      const { success, hasAccess } = await this.checkAdminPermissions(adminId, storeId)
      if (!success || !hasAccess) {
        return { success: false, error: '접근 권한이 없습니다.' }
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
  }
}
