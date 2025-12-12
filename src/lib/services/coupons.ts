import { supabase } from '@/lib/supabase'
import type { Coupon, UserCoupon, CouponType, DiscountType } from '@/types'

export const couponService = {
  // 사용자 쿠폰 목록 조회
  async getUserCoupons(userId: string): Promise<{ success: boolean; coupons?: UserCoupon[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_coupons')
        .select(`
          *,
          coupons!inner(*)
        `)
        .eq('user_id', userId)
        .order('obtained_at', { ascending: false })

      if (error) throw error

      const userCoupons: UserCoupon[] = (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        couponId: item.coupon_id,
        status: item.status,
        usedAt: item.used_at,
        obtainedAt: item.obtained_at,
        expiresAt: item.expires_at,
        coupon: {
          id: item.coupons.id,
          code: item.coupons.code,
          title: item.coupons.title,
          description: item.coupons.description,
          type: item.coupons.type,
          discountType: item.coupons.discount_type,
          discountValue: item.coupons.discount_value,
          minimumAmount: item.coupons.minimum_amount,
          maxDiscountAmount: item.coupons.max_discount_amount,
          isActive: item.coupons.is_active,
          validFrom: item.coupons.valid_from,
          validUntil: item.coupons.valid_until,
          usageLimit: item.coupons.usage_limit,
          usageCount: item.coupons.usage_count,
          userUsageLimit: item.coupons.user_usage_limit,
          storeId: item.coupons.store_id,
          isGlobal: item.coupons.is_global,
          createdAt: item.coupons.created_at,
          updatedAt: item.coupons.updated_at,
          qrCode: item.coupons.qr_code
        }
      }))

      return { success: true, coupons: userCoupons }
    } catch (error) {
      console.error('사용자 쿠폰 조회 오류:', error)
      return { success: false, error: '쿠폰을 불러오는데 실패했습니다.' }
    }
  },

  // 쿠폰 발급 (미션 완료 보상 등)
  async issueCoupon(
    userId: string, 
    couponId: string,
    expirationDays: number = 30
  ): Promise<{ success: boolean; userCoupon?: UserCoupon; error?: string }> {
    try {
      // 쿠폰 정보 확인
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', couponId)
        .eq('is_active', true)
        .single()

      if (couponError || !coupon) {
        return { success: false, error: '유효하지 않은 쿠폰입니다.' }
      }

      // 사용자별 발급 제한 확인
      if (coupon.user_usage_limit) {
        const { count } = await supabase
          .from('user_coupons')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('coupon_id', couponId)

        if (count && count >= coupon.user_usage_limit) {
          return { success: false, error: '이미 최대 발급 가능한 수량을 받으셨습니다.' }
        }
      }

      // 전체 발급 제한 확인
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        return { success: false, error: '쿠폰 발급이 마감되었습니다.' }
      }

      // 만료일 계산
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expirationDays)

      // 사용자에게 쿠폰 발급
      const { data: userCoupon, error: issueError } = await supabase
        .from('user_coupons')
        .insert({
          user_id: userId,
          coupon_id: couponId,
          status: 'unused',
          obtained_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single()

      if (issueError) throw issueError

      // 쿠폰 사용 횟수 증가
      await supabase
        .from('coupons')
        .update({ 
          usage_count: coupon.usage_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', couponId)

      return { 
        success: true, 
        userCoupon: {
          id: userCoupon.id,
          userId: userCoupon.user_id,
          couponId: userCoupon.coupon_id,
          status: userCoupon.status,
          usedAt: userCoupon.used_at,
          obtainedAt: userCoupon.obtained_at,
          expiresAt: userCoupon.expires_at
        }
      }
    } catch (error) {
      console.error('쿠폰 발급 오류:', error)
      return { success: false, error: '쿠폰 발급에 실패했습니다.' }
    }
  },

  // 쿠폰 사용
  async useCoupon(userCouponId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 사용자 쿠폰 정보 확인
      const { data: userCoupon, error: fetchError } = await supabase
        .from('user_coupons')
        .select(`
          *,
          coupons!inner(*)
        `)
        .eq('id', userCouponId)
        .single()

      if (fetchError || !userCoupon) {
        return { success: false, error: '쿠폰을 찾을 수 없습니다.' }
      }

      // 사용 가능 상태 확인
      if (userCoupon.status !== 'unused') {
        return { success: false, error: '이미 사용되었거나 만료된 쿠폰입니다.' }
      }

      // 만료일 확인
      if (new Date() > new Date(userCoupon.expires_at)) {
        // 만료된 쿠폰 상태 업데이트
        await supabase
          .from('user_coupons')
          .update({ status: 'expired' })
          .eq('id', userCouponId)
        
        return { success: false, error: '만료된 쿠폰입니다.' }
      }

      // 쿠폰 사용 처리
      const { error: useError } = await supabase
        .from('user_coupons')
        .update({
          status: 'used',
          used_at: new Date().toISOString()
        })
        .eq('id', userCouponId)

      if (useError) throw useError

      return { success: true }
    } catch (error) {
      console.error('쿠폰 사용 오류:', error)
      return { success: false, error: '쿠폰 사용에 실패했습니다.' }
    }
  },

  // 관리자: 쿠폰 생성
  async createCoupon(couponData: {
    code: string
    title: string
    description?: string
    type: CouponType
    discountType: DiscountType
    discountValue: number
    minimumAmount?: number
    maxDiscountAmount?: number
    validFrom: string
    validUntil: string
    usageLimit?: number
    userUsageLimit?: number
    isGlobal: boolean
    storeId?: number
  }): Promise<{ success: boolean; coupon?: Coupon; error?: string }> {
    try {
      // QR 코드 생성 (간단한 텍스트 기반)
      const qrCode = `COUPON-${couponData.code}-${Date.now()}`

      const { data, error } = await supabase
        .from('coupons')
        .insert({
          code: couponData.code,
          title: couponData.title,
          description: couponData.description,
          type: couponData.type,
          discount_type: couponData.discountType,
          discount_value: couponData.discountValue,
          minimum_amount: couponData.minimumAmount,
          max_discount_amount: couponData.maxDiscountAmount,
          valid_from: couponData.validFrom,
          valid_until: couponData.validUntil,
          usage_limit: couponData.usageLimit,
          usage_count: 0,
          user_usage_limit: couponData.userUsageLimit,
          is_global: couponData.isGlobal,
          store_id: couponData.storeId,
          is_active: true,
          qr_code: qrCode
        })
        .select()
        .single()

      if (error) throw error

      const coupon: Coupon = {
        id: data.id,
        code: data.code,
        title: data.title,
        description: data.description,
        type: data.type,
        discountType: data.discount_type,
        discountValue: data.discount_value,
        minimumAmount: data.minimum_amount,
        maxDiscountAmount: data.max_discount_amount,
        isActive: data.is_active,
        validFrom: data.valid_from,
        validUntil: data.valid_until,
        usageLimit: data.usage_limit,
        usageCount: data.usage_count,
        userUsageLimit: data.user_usage_limit,
        storeId: data.store_id,
        isGlobal: data.is_global,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        qrCode: data.qr_code
      }

      return { success: true, coupon }
    } catch (error) {
      console.error('쿠폰 생성 오류:', error)
      return { success: false, error: '쿠폰 생성에 실패했습니다.' }
    }
  },

  // 미션 완료 시 자동으로 커피 쿠폰 발급 (후기 미션용)
  async issueCoffeeCouponForReview(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 기본 커피 쿠폰 찾기 또는 생성
      const { data: coffeeCoupon, error: findError } = await supabase
        .from('coupons')
        .select('*')
        .eq('type', 'coffee')
        .eq('is_active', true)
        .eq('is_global', true)
        .single()

      let finalCoffeeCoupon = coffeeCoupon
      
      // 기본 커피 쿠폰이 없으면 생성
      if (findError && findError.code === 'PGRST116') {
        const createResult = await this.createCoupon({
          code: 'COFFEE-REVIEW',
          title: '☕ 커피 쿠폰',
          description: '후기 쓰기 미션 완료 보상으로 받은 커피 쿠폰입니다.',
          type: 'coffee',
          discountType: 'fixed',
          discountValue: 4500, // 커피 1잔 가격
          validFrom: new Date().toISOString(),
          validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90일 유효
          isGlobal: true,
          userUsageLimit: 3 // 사용자당 최대 3개
        })

        if (!createResult.success || !createResult.coupon) {
          return { success: false, error: '커피 쿠폰 생성에 실패했습니다.' }
        }

        finalCoffeeCoupon = createResult.coupon
      } else if (findError) {
        throw findError
      }

      if (!finalCoffeeCoupon) {
        return { success: false, error: '커피 쿠폰을 찾을 수 없습니다.' }
      }

      // 사용자에게 커피 쿠폰 발급 (30일 유효)
      const issueResult = await this.issueCoupon(userId, finalCoffeeCoupon.id, 30)
      return issueResult
    } catch (error) {
      console.error('커피 쿠폰 발급 오류:', error)
      return { success: false, error: '커피 쿠폰 발급에 실패했습니다.' }
    }
  },

  // 만료된 쿠폰 정리 (배치 작업)
  async cleanupExpiredCoupons(): Promise<{ success: boolean; cleanedCount?: number; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_coupons')
        .update({ status: 'expired' })
        .lt('expires_at', new Date().toISOString())
        .eq('status', 'unused')
        .select('id')

      if (error) throw error

      return { success: true, cleanedCount: data?.length || 0 }
    } catch (error) {
      console.error('만료 쿠폰 정리 오류:', error)
      return { success: false, error: '만료 쿠폰 정리에 실패했습니다.' }
    }
  }
}