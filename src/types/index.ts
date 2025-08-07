// ===============================================
// 타입 정의 - 드라이빙존 미션 시스템
// ===============================================

export interface User {
  id: string
  name: string
  phone: string
  phoneVerified: boolean
  referralCode?: string
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
  createdAt: string
}

export interface UserMission {
  id: string
  userId: string
  missionId: number
  status: MissionStatus
  proofData: ProofData | null
  completedAt: string | null
  createdAt: string
}

export interface Payback {
  id: string
  userId: string
  missionId: number
  amount: number
  status: PaybackStatus
  paidAt: string | null
  createdAt: string
}

export interface Referral {
  id: string
  referrerId: string
  refereeName: string
  refereePhone: string
  isVerified: boolean
  rewardPaid: boolean
  createdAt: string
}

// ===============================================
// 열거형 타입들
// ===============================================

export type MissionType = 'challenge' | 'sns' | 'review' | 'referral'

export type MissionStatus = 'pending' | 'in_progress' | 'completed' | 'verified'

export type PaybackStatus = 'pending' | 'paid' | 'cancelled'

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