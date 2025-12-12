// ===============================================
// 타입 정의 - 드라이빙존 미션 시스템
// ===============================================

export interface Store {
  id: number
  name: string
  isDirect: boolean
  isNearTestCenter: boolean
  isSundayOpen: boolean
  hasFreePhoto: boolean
  roadAddress: string
  address: string
  summaryAddress: string
  latitude: number
  longitude: number
  phoneNumber: string
  maxCapacity: number
  machineCountClass1: number
  machineCountClass2: number
  openingDate: string
  hasWifi: boolean
  hasRestrooms: boolean
  hasParking: boolean
  paymentInfo: string
  metaKeywords: string
  recommendedTestCenter1?: string
  recommendedTestCenter2?: string
  recommendedTestCenter3?: string
  operatingHoursNote?: string
  createdAt: string
  updatedAt: string
}

export interface Admin {
  id: string
  name: string
  email: string
  phone: string
  storeIds: number[]
  role: AdminRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserMissionData {
  id: string
  userName: string
  userPhone: string
  missionTitle: string
  missionType: MissionType
  status: MissionStatus
  startedAt: string | null
  completedAt: string | null
  rewardAmount: number
  proofData: ProofData | null
  paybackStatus: PaybackStatus | null
  paybackAmount: number | null
  storeName: string
  createdAt: string
}

export interface User {
  id: string
  name: string
  phone: string
  phoneVerified: boolean
  referralCode?: string
  storeId?: number
  createdAt: string
  updatedAt: string
  // 게이미피케이션 속성들
  level?: number
  experiencePoints?: number
  currentStreak?: number
}

export interface Mission {
  id: number
  title: string
  description: string | null
  rewardAmount: number
  missionType: MissionType
  isActive: boolean
  storeId?: number
  createdAt: string
  status?: MissionStatus
}

export interface UserMission {
  id: string
  userId: string
  missionId: number
  status: MissionStatus
  proofData: ProofData | null
  completedAt: string | null
  storeId?: number
  createdAt: string
}

export interface Payback {
  id: string
  userId: string
  missionId: number
  amount: number
  status: PaybackStatus
  paidAt: string | null
  storeId?: number
  createdAt: string
}

export interface Referral {
  id: string
  referrerId: string
  refereeName: string
  refereePhone: string
  isVerified: boolean
  rewardPaid: boolean
  storeId?: number
  createdAt: string
}

// ===============================================
// 열거형 타입들
// ===============================================

export type MissionType = 'challenge' | 'sns' | 'review' | 'referral' | 'attendance' | 'challenge_enhanced' | 'sns_enhanced' | 'review_enhanced' | 'referral_enhanced'

export type MissionStatus = 'pending' | 'in_progress' | 'completed' | 'verified'

export type PaybackStatus = 'pending' | 'paid' | 'cancelled' | 'rejected'

// ===============================================
// 미션별 증명 데이터 타입들
// ===============================================

export type ProofData =
  | ChallengeProofData
  | SNSProofData
  | ReviewProofData
  | ReferralProofData
  | AttendanceProofData

export interface ChallengeProofData {
  type: 'challenge'
  studyHours: number
  certificateImageUrl: string
  submittedAt: string
}

export interface SNSProofData {
  type: 'sns'
  snsUrl: string
  platform: 'instagram' | 'facebook' | 'twitter' | 'tiktok' | 'other'
  submittedAt: string
}

export interface ReviewProofData {
  type: 'review'
  reviews: {
    platform: 'smartplace' | 'drivelicense' | 'driveway'
    url: string
    completedAt: string
  }[]
  submittedAt: string
}

export interface ReferralProofData {
  type: 'referral'
  referrals: {
    name: string
    phone: string
    registeredAt: string | null
    verified: boolean
  }[]
  submittedAt: string
}

export interface AttendanceProofData {
  type: 'attendance'
  date: string
  consecutiveDays: number
  totalDays: number
  reward: number
  submittedAt: string
}

// ===============================================
// API 응답 타입들
// ===============================================

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface UserRegistrationData {
  name: string
  phone: string
  verificationCode: string
  referralCode?: string
}

export interface SMSVerificationData {
  phone: string
  code: string
  expiresAt: string
}

// ===============================================
// 폼 데이터 타입들
// ===============================================

export interface RegistrationFormData {
  name: string
  phone: string
}

export interface PhoneVerificationFormData {
  phone: string
  verificationCode: string
}

export interface ChallengeSubmissionFormData {
  studyHours: number
  certificateFile: File
}

export interface SNSSubmissionFormData {
  snsUrl: string
}

export interface ReviewSubmissionFormData {
  smartplaceUrl?: string
  drivelicenseUrl?: string
  drivewayUrl?: string
}

export interface ReferralSubmissionFormData {
  referrals: {
    name: string
    phone: string
  }[]
}

// ===============================================
// 상태 관리 타입들
// ===============================================

export interface AppState {
  // 사용자 상태
  user: User | null
  isAuthenticated: boolean

  // 지점 상태
  stores: Store[]
  currentStore: Store | null

  // 미션 상태
  missions: Mission[]
  userMissions: UserMission[]

  // 페이백 상태
  paybacks: Payback[]
  totalPayback: number

  // 추천 상태
  referrals: Referral[]

  // UI 상태
  isLoading: boolean
  error: string | null
}

export interface AppActions {
  // 사용자 액션
  setUser: (user: User | null) => void
  login: (phone: string) => Promise<void>
  logout: () => void

  // 지점 액션
  setStores: (stores: Store[]) => void
  setCurrentStore: (store: Store | null) => void
  loadStores: () => Promise<void>

  // 미션 액션
  setMissions: (missions: Mission[]) => void
  setUserMissions: (userMissions: UserMission[]) => void
  updateUserMission: (userMission: UserMission) => void

  // 페이백 액션
  setPaybacks: (paybacks: Payback[]) => void
  calculateTotalPayback: () => void

  // 추천 액션
  setReferrals: (referrals: Referral[]) => void
  addReferral: (referral: Omit<Referral, 'id' | 'createdAt'>) => void

  // UI 액션
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

// ===============================================
// 유틸리티 타입들
// ===============================================

export type DatabaseUser = {
  id: string
  name: string
  phone: string
  phone_verified: boolean
  created_at: string
  updated_at: string
}

export type DatabaseMission = {
  id: number
  title: string
  description: string | null
  reward_amount: number
  mission_type: string
  is_active: boolean
  created_at: string
}

export type DatabaseUserMission = {
  id: string
  user_id: string
  mission_id: number
  status: string
  proof_data: Record<string, unknown> | null
  completed_at: string | null
  created_at: string
}

// 사용자 역할 관련 타입
export interface UserRole {
  id: string
  name: string
  display_name: string
  description?: string
  created_at: string
  updated_at: string
}



export interface UserRoleAssignment {
  id: string
  user_id: string
  role_id: string
  assigned_by?: string
  assigned_at: string
  expires_at?: string
  is_active: boolean
}

export interface UserBranchPermission {
  id: string
  user_id: string
  branch_id: string
  role_id: string
  assigned_by?: string
  assigned_at: string
  expires_at?: string
  is_active: boolean
}

export interface UserStorePermission {
  id: string
  user_id: string
  store_id: number
  role_id: string
  assigned_by?: string
  assigned_at: string
  expires_at?: string
  is_active: boolean
}

export type RoleName = 'super_admin' | 'branch_manager' | 'store_manager' | 'customer'

export interface UserWithRoles extends User {
  roles: UserRole[]
  permissions: Permission[]
}

// 관리자 페이지용 사용자 데이터 타입
export interface UserData {
  id: string
  name: string
  phone: string
  storeName: string
  totalMissions: number
  completedMissions: number
  totalPayback: number
  createdAt: string
}

// 관리자 사용자 관련 타입
export interface AdminUser {
  id: string
  name: string
  phone: string
  email?: string
  password_hash?: string
  phone_verified: boolean
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
}

export interface AdminBranchAssignment {
  id: string
  admin_user_id: string
  branch_id: string
  assigned_by?: string
  assigned_at: string
  expires_at?: string
  is_active: boolean
}

export interface AdminStoreAssignment {
  id: string
  admin_user_id: string
  store_id: number
  assigned_by?: string
  assigned_at: string
  expires_at?: string
  is_active: boolean
}

export interface AdminUserWithAssignments extends AdminUser {
  branch_assignments: AdminBranchAssignment[]
  store_assignments: AdminStoreAssignment[]
  roles: UserRole[]
  permissions: Permission[]
}

// ===============================================
// 미션 정의 및 인스턴스 타입들
// ===============================================

export interface MissionDefinition {
  id: number
  title: string
  description?: string
  missionType: MissionType
  rewardAmount: number
  requirements?: Record<string, any>
  proofRequirements?: Record<string, any>
  // 동적 폼 설정 추가
  formConfig: MissionFormConfig
  isActive: boolean
  isGlobal: boolean
  storeId?: number | null // 지점별 미션을 위한 storeId
  maxParticipants?: number
  startDate?: string
  endDate?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface MissionInstance {
  id: number | string
  missionDefinitionId: number
  storeId: number | null
  title: string
  description?: string
  rewardAmount: number
  isActive: boolean
  isGlobal?: boolean
  createdAt: string
  updatedAt: string
  // 관계 데이터
  missionDefinition?: MissionDefinition
  store?: Store
}

export interface MissionDefinitionFormData {
  title: string
  description?: string
  missionType: MissionType
  rewardAmount: number
  requirements?: Record<string, any>
  proofRequirements?: Record<string, any>
  isGlobal: boolean
  storeId?: number | null
  maxParticipants?: number
  startDate?: string
  endDate?: string
}

export interface MissionInstanceFormData {
  missionDefinitionId: number
  storeId: number
  title: string
  description?: string
  rewardAmount: number
}

// ===============================================
// 동적 폼 설정 타입들
// ===============================================

export interface MissionFormConfig {
  fields: FormField[]
  validationRules?: ValidationRule[]
  maxRewardAmount?: number
  requiresManualVerification?: boolean
  autoApprove?: boolean
}

export interface FormField {
  id: string
  label: string
  type: 'text' | 'number' | 'email' | 'phone' | 'url' | 'file' | 'select' | 'multiselect' | 'textarea' | 'date' | 'checkbox'
  required: boolean
  placeholder?: string
  options?: FormFieldOption[]
  validation?: FieldValidation
  maxLength?: number
  minLength?: number
  maxValue?: number
  minValue?: number
  accept?: string // 파일 업로드용 (예: "image/*,.pdf")
  multiple?: boolean // 파일 여러개 업로드 가능
  helpText?: string
}

export interface FormFieldOption {
  value: string
  label: string
}

export interface FieldValidation {
  pattern?: string // 정규식
  customRule?: string // 커스텀 검증 규칙
}

export interface ValidationRule {
  fieldId: string
  rule: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  value?: any
  message: string
}

// 미션별 기본 폼 설정
export const DEFAULT_MISSION_FORMS: Record<MissionType, MissionFormConfig> = {
  referral: {
    fields: [
      {
        id: 'referrals',
        label: '추천인 정보',
        type: 'multiselect',
        required: true,
        helpText: '추천인들의 이름과 전화번호를 입력해주세요 (최대 3명)',
        validation: {
          customRule: 'maxReferrals:3'
        }
      },
      {
        id: 'referralName',
        label: '추천인 이름',
        type: 'text',
        required: true,
        placeholder: '추천인 이름을 입력하세요'
      },
      {
        id: 'referralPhone',
        label: '추천인 전화번호',
        type: 'phone',
        required: true,
        placeholder: '010-0000-0000'
      }
    ],
    maxRewardAmount: 150000,
    requiresManualVerification: true,
    autoApprove: false
  },
  challenge: {
    fields: [
      {
        id: 'certificateFile',
        label: '합격증 사진',
        type: 'file',
        required: true,
        accept: 'image/*,.pdf',
        helpText: '운전면허 필기시험 합격증을 촬영하여 업로드해주세요'
      },
      {
        id: 'studyHours',
        label: '공부 시간 (시간)',
        type: 'number',
        required: true,
        minValue: 1,
        maxValue: 1000,
        placeholder: '공부한 시간을 입력하세요'
      }
    ],
    maxRewardAmount: 20000,
    requiresManualVerification: true,
    autoApprove: false
  },
  sns: {
    fields: [
      {
        id: 'snsUrl',
        label: 'SNS 게시물 링크',
        type: 'url',
        required: true,
        placeholder: 'https://www.instagram.com/p/...',
        helpText: '드라이빙존 관련 SNS 게시물 링크를 입력해주세요'
      },
      {
        id: 'platform',
        label: 'SNS 플랫폼',
        type: 'select',
        required: true,
        options: [
          { value: 'instagram', label: 'Instagram' },
          { value: 'facebook', label: 'Facebook' },
          { value: 'twitter', label: 'Twitter' },
          { value: 'tiktok', label: 'TikTok' },
          { value: 'other', label: '기타' }
        ]
      }
    ],
    maxRewardAmount: 10000,
    requiresManualVerification: true,
    autoApprove: false
  },
  review: {
    fields: [
      {
        id: 'smartplaceUrl',
        label: '스마트플레이스 리뷰 링크',
        type: 'url',
        required: false,
        placeholder: 'https://smartplace.naver.com/...',
        helpText: '네이버 스마트플레이스 리뷰 링크 (선택사항)'
      },
      {
        id: 'drivelicenseUrl',
        label: '운전면허플러스 리뷰 링크',
        type: 'url',
        required: false,
        placeholder: 'https://...',
        helpText: '운전면허플러스 앱 리뷰 링크 (선택사항)'
      },
      {
        id: 'drivewayUrl',
        label: '도로로 리뷰 링크',
        type: 'url',
        required: false,
        placeholder: 'https://...',
        helpText: '도로로 앱 리뷰 링크 (선택사항)'
      }
    ],
    maxRewardAmount: 30000, // 커피 3잔 = 3만원
    requiresManualVerification: true,
    autoApprove: false
  },
  attendance: {
    fields: [
      {
        id: 'attendanceDate',
        label: '출석 날짜',
        type: 'date',
        required: true,
        helpText: '출석한 날짜를 선택해주세요'
      }
    ],
    maxRewardAmount: 5000,
    requiresManualVerification: false,
    autoApprove: true
  },
  challenge_enhanced: {
    fields: [
      {
        id: 'certificateFile',
        label: '합격증 사진',
        type: 'file',
        required: true,
        accept: 'image/*,.pdf',
        helpText: '운전면허 필기시험 합격증을 촬영하여 업로드해주세요'
      },
      {
        id: 'studyHours',
        label: '공부 시간 (시간)',
        type: 'number',
        required: true,
        minValue: 1,
        maxValue: 1000,
        placeholder: '공부한 시간을 입력하세요'
      },
      {
        id: 'studyLog',
        label: '공부 일지',
        type: 'textarea',
        required: false,
        placeholder: '공부 과정과 느낀 점을 작성해주세요',
        maxLength: 1000
      }
    ],
    maxRewardAmount: 25000,
    requiresManualVerification: true,
    autoApprove: false
  },
  sns_enhanced: {
    fields: [
      {
        id: 'snsUrl',
        label: 'SNS 게시물 링크',
        type: 'url',
        required: true,
        placeholder: 'https://www.instagram.com/p/...',
        helpText: '드라이빙존 관련 SNS 게시물 링크를 입력해주세요'
      },
      {
        id: 'platform',
        label: 'SNS 플랫폼',
        type: 'select',
        required: true,
        options: [
          { value: 'instagram', label: 'Instagram' },
          { value: 'facebook', label: 'Facebook' },
          { value: 'twitter', label: 'Twitter' },
          { value: 'tiktok', label: 'TikTok' },
          { value: 'other', label: '기타' }
        ]
      },
      {
        id: 'hashtags',
        label: '사용한 해시태그',
        type: 'textarea',
        required: false,
        placeholder: '#드라이빙존 #운전면허 #합격',
        helpText: '게시물에 사용한 해시태그를 입력해주세요'
      }
    ],
    maxRewardAmount: 15000,
    requiresManualVerification: true,
    autoApprove: false
  },
  review_enhanced: {
    fields: [
      {
        id: 'smartplaceUrl',
        label: '스마트플레이스 리뷰 링크',
        type: 'url',
        required: false,
        placeholder: 'https://smartplace.naver.com/...',
        helpText: '네이버 스마트플레이스 리뷰 링크 (선택사항)'
      },
      {
        id: 'drivelicenseUrl',
        label: '운전면허플러스 리뷰 링크',
        type: 'url',
        required: false,
        placeholder: 'https://...',
        helpText: '운전면허플러스 앱 리뷰 링크 (선택사항)'
      },
      {
        id: 'drivewayUrl',
        label: '도로로 리뷰 링크',
        type: 'url',
        required: false,
        placeholder: 'https://...',
        helpText: '도로로 앱 리뷰 링크 (선택사항)'
      },
      {
        id: 'reviewContent',
        label: '리뷰 내용 미리보기',
        type: 'textarea',
        required: false,
        placeholder: '작성한 리뷰 내용을 간단히 요약해주세요',
        maxLength: 500
      }
    ],
    maxRewardAmount: 40000,
    requiresManualVerification: true,
    autoApprove: false
  },
  referral_enhanced: {
    fields: [
      {
        id: 'referrals',
        label: '추천인 정보',
        type: 'multiselect',
        required: true,
        helpText: '추천인들의 이름과 전화번호를 입력해주세요 (최대 5명)',
        validation: {
          customRule: 'maxReferrals:5'
        }
      },
      {
        id: 'referralName',
        label: '추천인 이름',
        type: 'text',
        required: true,
        placeholder: '추천인 이름을 입력하세요'
      },
      {
        id: 'referralPhone',
        label: '추천인 전화번호',
        type: 'phone',
        required: true,
        placeholder: '010-0000-0000'
      },
      {
        id: 'relationship',
        label: '추천인과의 관계',
        type: 'select',
        required: false,
        options: [
          { value: 'friend', label: '친구' },
          { value: 'family', label: '가족' },
          { value: 'colleague', label: '동료' },
          { value: 'other', label: '기타' }
        ]
      }
    ],
    maxRewardAmount: 200000, // 5명 × 4만원
    requiresManualVerification: true,
    autoApprove: false
  }
}

// ===============================================
// 쿠폰 및 할인 시스템 타입들
// ===============================================

export interface Coupon {
  id: string
  code: string
  title: string
  description?: string
  type: CouponType
  discountType: DiscountType
  discountValue: number // 할인 금액 또는 퍼센트
  minimumAmount?: number // 최소 구매 금액
  maxDiscountAmount?: number // 최대 할인 금액 (퍼센트 할인시)
  isActive: boolean
  validFrom: string
  validUntil: string
  usageLimit?: number // 전체 사용 제한
  usageCount: number // 현재 사용 횟수
  userUsageLimit?: number // 사용자당 사용 제한
  storeId?: number // 지점별 쿠폰
  isGlobal: boolean
  createdAt: string
  updatedAt: string
  qrCode?: string // QR 코드 데이터
}

export interface UserCoupon {
  id: string
  userId: string
  couponId: string
  status: CouponStatus
  usedAt: string | null
  obtainedAt: string
  expiresAt: string
  coupon?: Coupon
}

export type CouponType = 
  | 'coffee' // 커피 쿠폰
  | 'discount' // 할인 쿠폰
  | 'gift' // 기프트 쿠폰
  | 'event' // 이벤트 쿠폰

export type DiscountType = 
  | 'fixed' // 고정 금액
  | 'percentage' // 퍼센트

export type CouponStatus = 
  | 'unused' // 미사용
  | 'used' // 사용됨
  | 'expired' // 만료됨

// 게이미피케이션 시스템 타입들
export interface UserLevel {
  id: string
  userId: string
  level: number
  experiencePoints: number
  totalExperience: number
  createdAt: string
  updatedAt: string
}

export interface Badge {
  id: string
  name: string
  title: string
  description: string
  iconUrl?: string
  rarity: BadgeRarity
  condition: BadgeCondition
  isActive: boolean
  createdAt: string
}

export interface UserBadge {
  id: string
  userId: string
  badgeId: string
  earnedAt: string
  badge?: Badge
}

export interface Streak {
  id: string
  userId: string
  type: StreakType
  currentCount: number
  maxCount: number
  lastActivityAt: string
  bonusMultiplier: number
  createdAt: string
  updatedAt: string
}

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary'

export type StreakType = 'daily_login' | 'mission_completion' | 'referral'

export interface BadgeCondition {
  type: 'mission_complete' | 'mission_count' | 'referral_count' | 'payback_amount' | 'streak'
  value: number
  missionType?: MissionType
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time'
}

// 알림 시스템 타입들
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  createdAt: string
  scheduledFor?: string // 예약 알림
}

export type NotificationType = 
  | 'mission_available' // 새로운 미션 알림
  | 'mission_reminder' // 미션 리마인더
  | 'payback_approved' // 페이백 승인
  | 'coupon_received' // 쿠폰 획득
  | 'level_up' // 레벨업
  | 'badge_earned' // 뱃지 획득
  | 'referral_success' // 추천 성공
  | 'streak_bonus' // 연속 참여 보너스
  | 'event_announcement' // 이벤트 공지

// ===============================================
// 권한 시스템 타입들
// ===============================================

export type Permission =
  | 'dashboard:view'
  | 'users:view'
  | 'users:edit'
  | 'users:delete'
  | 'roles:view'
  | 'roles:edit'
  | 'missions:view'
  | 'missions:create'
  | 'missions:edit'
  | 'missions:delete'
  | 'missions:approve'
  | 'submissions:view'
  | 'submissions:approve'
  | 'submissions:reject'
  | 'paybacks:view'
  | 'paybacks:approve'
  | 'paybacks:reject'
  | 'settings:view'
  | 'settings:edit'

export type AdminRole = 'super_admin' | 'branch_manager' | 'store_manager'

export interface RolePermissions {
  role: AdminRole
  permissions: Permission[]
  scope: 'all' | 'assigned_stores' | 'none'
}

export interface PermissionCheck {
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  canAccessStore: (storeId: number) => boolean
  getAccessibleStores: () => number[]
}
