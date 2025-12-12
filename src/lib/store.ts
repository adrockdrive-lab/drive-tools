import type {
  AppActions,
  AppState,
  Mission,
  Payback,
  PaybackStatus,
  ProofData,
  Referral,
  User,
  UserMission
} from '@/types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import { supabase } from './supabase'

type AppStore = AppState & AppActions & {
  loadMissions: () => Promise<void>
  loadUserMissions: () => Promise<void>
  loadPaybacks: () => Promise<void>
  loadReferrals: () => Promise<void>
  clearError: () => void
  initializeApp: () => Promise<void>
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ===============================================
      // Initial State
      // ===============================================
      user: null,
      isAuthenticated: false,
      stores: [],
      currentStore: null,
      missions: [],
      userMissions: [],
      paybacks: [],
      totalPayback: 0,
      referrals: [],
      isLoading: false,
      error: null,

      // ===============================================
      // User Actions
      // ===============================================
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user
        })
      },

      // ===============================================
      // Store Actions
      // ===============================================
      setStores: (stores) => {
        set({ stores })
      },

      setCurrentStore: (store) => {
        set({ currentStore: store })
      },

      loadStores: async () => {
        try {
          const { storeService } = await import('@/lib/services/stores')
          const result = await storeService.getAllStores()

          if (result.success && result.stores) {
            set({ stores: result.stores })
          }
        } catch (error) {
          console.error('Stores load error:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to load stores' })
        }
      },

      login: async (phone) => {
        set({ isLoading: true, error: null })

        try {
          // 휴대폰 번호 정규화
          const normalizedPhone = phone.replace(/[^\d]/g, '')
          console.log('Store login:', { original: phone, normalized: normalizedPhone })

          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('phone', normalizedPhone)
            .single()

          if (error) {
            console.error('User lookup error:', error)
            throw new Error('User not found')
          }

          console.log('User found:', data)

          // Convert database format to app format
          const user: User = {
            id: data.id,
            name: data.name,
            phone: data.phone,
            phoneVerified: data.phone_verified,
            storeId: data.store_id,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          }

          set({
            user,
            isAuthenticated: true,
            isLoading: false
          })

          console.log('User state set:', user)
          console.log('Local storage check:', {
            stored: localStorage.getItem('driving-zone-storage'),
            parsed: JSON.parse(localStorage.getItem('driving-zone-storage') || '{}')
          })

          // Load user's mission data
          await get().loadUserMissions()
          await get().loadPaybacks()
          await get().loadReferrals()

        } catch (error) {
          console.error('Login error:', error)
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false
          })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          userMissions: [],
          paybacks: [],
          referrals: [],
          totalPayback: 0
        })
      },

      // ===============================================
      // Mission Actions
      // ===============================================
      setMissions: (missions) => {
        set({ missions })
      },

      setUserMissions: (userMissions) => {
        set({ userMissions })
      },

      updateUserMission: (updatedUserMission) => {
        set((state) => ({
          userMissions: state.userMissions.map(um =>
            um.id === updatedUserMission.id ? updatedUserMission : um
          )
        }))
      },

      // Load missions from database (지점별 필터링 포함)
      loadMissions: async () => {
        const { user, currentStore } = get()
        
        try {
          let query = supabase
            .from('mission_definitions')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })

          // 전역 미션과 사용자 지점 미션만 표시
          if (user?.storeId || currentStore?.id) {
            const storeId = user?.storeId || currentStore?.id
            query = query.or(`is_global.eq.true,store_id.eq.${storeId}`)
          } else {
            // 지점 정보가 없으면 전역 미션만
            query = query.eq('is_global', true)
          }

          const { data, error } = await query

          if (error) throw error

          const missions: Mission[] = (data || []).map(m => ({
            id: m.id,
            title: m.title,
            description: m.description,
            rewardAmount: m.reward_amount,
            missionType: m.mission_type as Mission['missionType'],
            isActive: m.is_active,
            storeId: m.store_id,
            createdAt: m.created_at
          }))

          // 개인화된 미션 정렬 (참여하지 않은 미션 우선)
          if (user) {
            const { userMissions } = get()
            const completedMissionIds = userMissions
              .filter(um => um.status === 'completed')
              .map(um => um.missionId)
            
            missions.sort((a, b) => {
              const aCompleted = completedMissionIds.includes(a.id)
              const bCompleted = completedMissionIds.includes(b.id)
              
              if (aCompleted && !bCompleted) return 1
              if (!aCompleted && bCompleted) return -1
              
              // 보상금액 높은 순으로 정렬
              return b.rewardAmount - a.rewardAmount
            })
          }

          set({ missions })
        } catch (error) {
          console.error('미션 로드 실패:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to load missions'
          })
        }
      },

      // Load user missions from database
      loadUserMissions: async () => {
        const { user } = get()
        if (!user) return

        try {
          const { missionService } = await import('@/lib/services/missions')
          const result = await missionService.getUserMissionParticipations(user.id)

          if (result.success && result.participations) {
            const userMissions: UserMission[] = result.participations.map(p => ({
              id: p.id,
              userId: p.userId,
              missionId: p.missionId,
              status: p.status,
              proofData: p.proofData as ProofData | null,
              completedAt: p.completedAt,
              createdAt: p.createdAt
            }))

            set({ userMissions })
          } else {
            set({ userMissions: [] })
          }
        } catch (error) {
          console.error('User missions load error:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to load user missions' })
        }
      },

      // ===============================================
      // Payback Actions
      // ===============================================
      setPaybacks: (paybacks) => {
        set({ paybacks })
        get().calculateTotalPayback()
      },

      calculateTotalPayback: () => {
        const { paybacks } = get()
        const total = paybacks
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + p.amount, 0)

        set({ totalPayback: total })
      },

      // Load paybacks from database
      loadPaybacks: async () => {
        const { user } = get()
        if (!user) return

        try {
          const { data, error } = await supabase
            .from('paybacks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (error) throw error

          const paybacks: Payback[] = data.map(p => ({
            id: p.id,
            userId: p.user_id,
            missionId: p.mission_definition_id,
            amount: p.amount,
            status: p.status as PaybackStatus,
            storeId: p.store_id,
            paidAt: p.paid_at,
            createdAt: p.created_at
          }))

          set({ paybacks })
          get().calculateTotalPayback()
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load paybacks' })
        }
      },

      // ===============================================
      // Referral Actions
      // ===============================================
      setReferrals: (referrals) => {
        set({ referrals })
      },

      addReferral: async (referralData) => {
        const { user } = get()
        if (!user) return

        try {
          const { data, error } = await supabase
            .from('referrals')
            .insert({
              referrer_id: user.id,
              referee_name: referralData.refereeName,
              referee_phone: referralData.refereePhone,
              is_verified: referralData.isVerified,
              reward_paid: referralData.rewardPaid,
              store_id: user.storeId
            })
            .select()
            .single()

          if (error) throw error

          const newReferral: Referral = {
            id: data.id,
            referrerId: data.referrer_id,
            refereeName: data.referee_name,
            refereePhone: data.referee_phone,
            isVerified: data.is_verified,
            rewardPaid: data.reward_paid,
            storeId: data.store_id,
            createdAt: data.created_at
          }

          set((state) => ({
            referrals: [...state.referrals, newReferral]
          }))
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add referral' })
        }
      },

      // Load referrals from database
      loadReferrals: async () => {
        const { user } = get()
        if (!user) return

        try {
          const { data, error } = await supabase
            .from('referrals')
            .select('*')
            .eq('referrer_id', user.id)
            .order('created_at', { ascending: false })

          if (error) throw error

          const referrals: Referral[] = data.map(r => ({
            id: r.id,
            referrerId: r.referrer_id,
            refereeName: r.referee_name,
            refereePhone: r.referee_phone,
            isVerified: r.is_verified,
            rewardPaid: r.reward_paid,
            storeId: r.store_id,
            createdAt: r.created_at
          }))

          set({ referrals })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load referrals' })
        }
      },

      // ===============================================
      // UI Actions
      // ===============================================
      setLoading: (isLoading) => {
        set({ isLoading })
      },

      setError: (error) => {
        set({ error })
      },

      // Clear error
      clearError: () => {
        set({ error: null })
      },

      // ===============================================
      // Initialize App
      // ===============================================
      initializeApp: async () => {
        const { isLoading } = get()
        if (isLoading) return // 이미 초기화 중이면 중복 실행 방지

        set({ isLoading: true, error: null })

        try {
          console.log('=== App Initialization Start ===')
          console.log('Current store state:', {
            user: get().user,
            isAuthenticated: get().isAuthenticated,
            isLoading: get().isLoading
          })

          // Load stores first
          console.log('Loading stores...')
          await get().loadStores()
          console.log('Stores loaded successfully')

          console.log('Loading missions...')
          // Load missions (public data)
          await get().loadMissions()
          console.log('Missions loaded successfully')

          // If user is logged in, load their data
          const { user } = get()
          console.log('Checking user state:', user)

          if (user) {
            console.log('Loading user data for user:', user.id)
            await Promise.all([
              get().loadUserMissions(),
              get().loadPaybacks(),
              get().loadReferrals()
            ])
            console.log('User data loaded successfully')
          } else {
            console.log('No user found in store state')
          }

          console.log('App initialization completed')
        } catch (error) {
          console.error('App initialization error:', error)
          const errorMessage = error instanceof Error ? error.message : 'Failed to initialize app'
          set({ error: errorMessage })
          throw error // 에러를 다시 throw해서 AppInitializer에서 처리할 수 있도록
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'driving-zone-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist user auth state, not all data
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Custom hooks for easier access
export const useUser = () => useAppStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  login: state.login,
  logout: state.logout,
  setUser: state.setUser
}))

export const useMissions = () => useAppStore((state) => ({
  missions: state.missions,
  userMissions: state.userMissions,
  loadMissions: state.loadMissions,
  loadUserMissions: state.loadUserMissions,
  updateUserMission: state.updateUserMission
}))

export const usePaybacks = () => useAppStore((state) => ({
  paybacks: state.paybacks,
  totalPayback: state.totalPayback,
  loadPaybacks: state.loadPaybacks,
  calculateTotalPayback: state.calculateTotalPayback
}))

export const useReferrals = () => useAppStore((state) => ({
  referrals: state.referrals,
  loadReferrals: state.loadReferrals,
  addReferral: state.addReferral
}))

export const useStores = () => useAppStore(useShallow((state) => ({
  stores: state.stores,
  currentStore: state.currentStore,
  loadStores: state.loadStores,
  setCurrentStore: state.setCurrentStore
})))

export const useUI = () => useAppStore((state) => ({
  isLoading: state.isLoading,
  error: state.error,
  setLoading: state.setLoading,
  setError: state.setError,
  clearError: state.clearError
}))

// Alias for V2 pages
export const useStore = useAppStore
