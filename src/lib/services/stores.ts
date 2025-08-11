import { supabase } from '@/lib/supabase';
import type { Store } from '@/types';

export const storeService = {
  // 모든 지점 조회
  async getAllStores(): Promise<{ success: boolean; stores?: Store[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('id')

      if (error) throw error

      const stores: Store[] = (data || []).map(s => ({
        id: s.id,
        name: s.name,
        isDirect: s.is_direct,
        isNearTestCenter: s.is_near_test_center,
        isSundayOpen: s.is_sunday_open,
        hasFreePhoto: s.has_free_photo,
        roadAddress: s.road_address,
        address: s.address,
        summaryAddress: s.summary_address,
        latitude: s.latitude,
        longitude: s.longitude,
        phoneNumber: s.phone_number,
        maxCapacity: s.max_capacity,
        machineCountClass1: s.machine_count_class1,
        machineCountClass2: s.machine_count_class2,
        openingDate: s.opening_date,
        hasWifi: s.has_wifi,
        hasRestrooms: s.has_restrooms,
        hasParking: s.has_parking,
        paymentInfo: s.payment_info,
        metaKeywords: s.meta_keywords,
        recommendedTestCenter1: s.recommended_test_center_1,
        recommendedTestCenter2: s.recommended_test_center_2,
        recommendedTestCenter3: s.recommended_test_center_3,
        operatingHoursNote: s.operating_hours_note,
        createdAt: s.created_at,
        updatedAt: s.updated_at
      }))

      return { success: true, stores }
    } catch (error) {
      console.error('지점 조회 오류:', error)
      return { success: false, error: '지점 정보를 불러오는데 실패했습니다.' }
    }
  },

  // 특정 지점 조회
  async getStore(storeId: number): Promise<{ success: boolean; store?: Store; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single()

      if (error) throw error

      const store: Store = {
        id: data.id,
        name: data.name,
        isDirect: data.is_direct,
        isNearTestCenter: data.is_near_test_center,
        isSundayOpen: data.is_sunday_open,
        hasFreePhoto: data.has_free_photo,
        roadAddress: data.road_address,
        address: data.address,
        summaryAddress: data.summary_address,
        latitude: data.latitude,
        longitude: data.longitude,
        phoneNumber: data.phone_number,
        maxCapacity: data.max_capacity,
        machineCountClass1: data.machine_count_class1,
        machineCountClass2: data.machine_count_class2,
        openingDate: data.opening_date,
        hasWifi: data.has_wifi,
        hasRestrooms: data.has_restrooms,
        hasParking: data.has_parking,
        paymentInfo: data.payment_info,
        metaKeywords: data.meta_keywords,
        recommendedTestCenter1: data.recommended_test_center_1,
        recommendedTestCenter2: data.recommended_test_center_2,
        recommendedTestCenter3: data.recommended_test_center_3,
        operatingHoursNote: data.operating_hours_note,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { success: true, store }
    } catch (error) {
      console.error('지점 조회 오류:', error)
      return { success: false, error: '지점 정보를 불러오는데 실패했습니다.' }
    }
  },

  // 사용자의 지점 설정
  async setUserStore(userId: string, storeId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ store_id: storeId })
        .eq('id', userId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('사용자 지점 설정 오류:', error)
      return { success: false, error: '지점 설정에 실패했습니다.' }
    }
  }
}
