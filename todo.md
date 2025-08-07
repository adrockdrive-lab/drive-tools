# 드라이빙존 미션 시스템 개발 TODO

## 🚀 Phase 1: 프로젝트 초기 설정

### 1.1 프로젝트 세팅
- [ ] **TODO-001**: Next.js 프로젝트 생성 (`npx create-next-app@latest`)
  - TypeScript, TailwindCSS, ESLint, App Router 설정
  - 예상 시간: 30분

- [ ] **TODO-002**: 기본 패키지 설치
  ```bash
  npm install @supabase/supabase-js zustand react-hook-form @hookform/resolvers zod
  npm install @radix-ui/react-toast @radix-ui/react-dialog lucide-react
  npm install -D @types/node
  ```
  - 예상 시간: 15분

- [ ] **TODO-003**: shadcn/ui 설정 및 기본 컴포넌트 설치
  ```bash
  npx shadcn-ui@latest init
  npx shadcn-ui@latest add button input form card toast
  ```
  - 예상 시간: 20분

### 1.2 폴더 구조 생성
- [ ] **TODO-004**: 디렉토리 구조 생성
  ```
  src/
  ├── app/
  ├── components/
  │   ├── ui/          # shadcn components
  │   ├── forms/       # form components
  │   ├── mission/     # mission-specific components
  │   └── layout/      # layout components
  ├── lib/
  │   ├── supabase.ts  # supabase client
  │   ├── store.ts     # zustand store
  │   └── utils.ts     # utility functions
  ├── hooks/           # custom hooks
  ├── types/           # TypeScript types
  └── constants/       # constants and enums
  ```
  - 예상 시간: 10분

### 1.3 환경 변수 설정
- [ ] **TODO-005**: `.env.local` 파일 생성
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  ```
  - 예상 시간: 5분

## 🗄️ Phase 2: Supabase 데이터베이스 설계

### 2.1 테이블 생성
- [ ] **TODO-006**: users 테이블 생성
  ```sql
  create table users (
    id uuid default gen_random_uuid() primary key,
    name varchar(50) not null,
    phone varchar(15) unique not null,
    phone_verified boolean default false,
    created_at timestamp default now(),
    updated_at timestamp default now()
  );
  ```
  - 예상 시간: 15분

- [ ] **TODO-007**: missions 테이블 생성 (기본 미션 정보)
  ```sql
  create table missions (
    id serial primary key,
    title varchar(100) not null,
    description text,
    reward_amount integer default 0,
    mission_type varchar(20) not null, -- 'challenge', 'sns', 'review', 'referral'
    is_active boolean default true,
    created_at timestamp default now()
  );
  ```
  - 예상 시간: 10분

- [ ] **TODO-008**: user_missions 테이블 생성 (사용자별 미션 진행상태)
  ```sql
  create table user_missions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references users(id) on delete cascade,
    mission_id integer references missions(id),
    status varchar(20) default 'pending', -- 'pending', 'in_progress', 'completed', 'verified'
    proof_data jsonb, -- 인증 데이터 (교육시간, 링크, 이미지 URL 등)
    completed_at timestamp,
    created_at timestamp default now(),
    unique(user_id, mission_id)
  );
  ```
  - 예상 시간: 15분

- [ ] **TODO-009**: paybacks 테이블 생성 (페이백 내역)
  ```sql
  create table paybacks (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references users(id),
    mission_id integer references missions(id),
    amount integer not null,
    status varchar(20) default 'pending', -- 'pending', 'paid', 'cancelled'
    paid_at timestamp,
    created_at timestamp default now()
  );
  ```
  - 예상 시간: 10분

- [ ] **TODO-010**: referrals 테이블 생성 (친구 추천)
  ```sql
  create table referrals (
    id uuid default gen_random_uuid() primary key,
    referrer_id uuid references users(id),
    referee_name varchar(50) not null,
    referee_phone varchar(15) not null,
    is_verified boolean default false,
    reward_paid boolean default false,
    created_at timestamp default now()
  );
  ```
  - 예상 시간: 10분

### 2.2 Storage 설정
- [ ] **TODO-011**: 이미지 업로드를 위한 Storage 버킷 생성
  - 버킷명: `mission-proofs`
  - Public 접근 허용, 파일 크기 제한 10MB
  - 예상 시간: 10분

### 2.3 RLS (Row Level Security) 설정
- [ ] **TODO-012**: 각 테이블별 RLS 정책 설정
  ```sql
  -- users 테이블 RLS
  alter table users enable row level security;
  create policy "Users can view own profile" on users for select using (auth.uid() = id);
  create policy "Users can update own profile" on users for update using (auth.uid() = id);
  ```
  - 예상 시간: 30분

## 🔧 Phase 3: 기본 설정 및 유틸리티

### 3.1 Supabase 클라이언트 설정
- [ ] **TODO-013**: `lib/supabase.ts` 파일 생성
  ```typescript
  import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
  import { Database } from '@/types/database.types'

  export const supabase = createClientComponentClient<Database>()
  ```
  - 예상 시간: 10분

### 3.2 TypeScript 타입 정의
- [ ] **TODO-014**: `types/database.types.ts` 생성 (Supabase CLI로 자동 생성)
  ```bash
  npx supabase gen types typescript --project-id your_project_id > types/database.types.ts
  ```
  - 예상 시간: 15분

- [ ] **TODO-015**: `types/index.ts` 비즈니스 로직 타입 정의
  ```typescript
  export interface User {
    id: string
    name: string
    phone: string
    phoneVerified: boolean
  }

  export interface Mission {
    id: number
    title: string
    description: string
    rewardAmount: number
    missionType: MissionType
  }

  export type MissionType = 'challenge' | 'sns' | 'review' | 'referral'
  export type MissionStatus = 'pending' | 'in_progress' | 'completed' | 'verified'
  ```
  - 예상 시간: 20분

### 3.3 Zustand 스토어 설정
- [ ] **TODO-016**: `lib/store.ts` 사용자 및 미션 상태 관리
  ```typescript
  import { create } from 'zustand'
  import { User, Mission, UserMission } from '@/types'

  interface AppStore {
    // User state
    user: User | null
    setUser: (user: User | null) => void
    
    // Mission state
    missions: Mission[]
    userMissions: UserMission[]
    setMissions: (missions: Mission[]) => void
    setUserMissions: (userMissions: UserMission[]) => void
  }
  ```
  - 예상 시간: 25분

## 📱 Phase 4: 사용자 등록 시스템

### 4.1 SMS 인증 서비스 연동
- [ ] **TODO-017**: SMS 서비스 프로바이더 선택 및 API 키 설정
  - Aligo SMS 또는 NCP SENS 추천
  - API 키를 환경 변수에 추가
  - 예상 시간: 30분

- [ ] **TODO-018**: `lib/sms.ts` SMS 발송 함수 작성
  ```typescript
  export async function sendVerificationCode(phone: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    // SMS API 호출 로직
    return code
  }
  ```
  - 예상 시간: 45분

### 4.2 폰 인증 컴포넌트
- [ ] **TODO-019**: `components/forms/PhoneVerification.tsx` 컴포넌트 생성
  ```typescript
  interface PhoneVerificationProps {
    onVerified: (phone: string) => void
  }
  
  export function PhoneVerification({ onVerified }: PhoneVerificationProps) {
    // 휴대폰 번호 입력 → 인증번호 발송 → 인증번호 확인 → 완료
  }
  ```
  - 휴대폰 번호 형식 검증 (react-hook-form + zod)
  - 인증번호 발송 버튼
  - 인증번호 입력 필드
  - 타이머 카운트다운 (3분)
  - 예상 시간: 2시간

### 4.3 사용자 등록 페이지
- [ ] **TODO-020**: `app/register/page.tsx` 등록 페이지 생성
  ```typescript
  export default function RegisterPage() {
    // 1. 이름 입력
    // 2. 휴대폰 인증
    // 3. 등록 완료
    // 4. 대시보드로 리다이렉트
  }
  ```
  - 단계별 진행 표시 (Step Indicator)
  - 이름 입력 폼 validation
  - PhoneVerification 컴포넌트 통합
  - Supabase에 사용자 생성 API 호출
  - 예상 시간: 1.5시간

### 4.4 로그인 체크 및 라우팅
- [ ] **TODO-021**: `hooks/useAuth.ts` 인증 상태 관리 훅
  ```typescript
  export function useAuth() {
    const { user, setUser } = useAppStore()
    
    const login = async (phone: string) => {
      // 휴대폰 번호로 사용자 조회 및 로그인 처리
    }
    
    const logout = () => {
      setUser(null)
    }
    
    return { user, login, logout, isAuthenticated: !!user }
  }
  ```
  - 예상 시간: 45분

## 🎯 Phase 5: 미션 대시보드

### 5.1 메인 레이아웃
- [ ] **TODO-022**: `components/layout/Header.tsx` 헤더 컴포넌트
  - 로고 및 사용자 정보 표시
  - 총 페이백 금액 표시
  - 예상 시간: 30분

- [ ] **TODO-023**: `app/dashboard/layout.tsx` 대시보드 레이아웃
  - Header 컴포넌트 포함
  - 반응형 레이아웃 설정
  - 예상 시간: 20분

### 5.2 미션 카드 컴포넌트
- [ ] **TODO-024**: `components/mission/MissionCard.tsx` 기본 미션 카드
  ```typescript
  interface MissionCardProps {
    mission: Mission
    userMission?: UserMission
    onStart: () => void
    onViewDetails: () => void
  }
  ```
  - 미션 제목, 설명, 보상 금액 표시
  - 진행 상태에 따른 UI 변화
  - 시작하기/상세보기/완료됨 등 상태별 버튼
  - 예상 시간: 1시간

### 5.3 메인 대시보드 페이지
- [ ] **TODO-025**: `app/dashboard/page.tsx` 메인 대시보드
  ```typescript
  export default function DashboardPage() {
    const { missions, userMissions } = useAppStore()
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {missions.map(mission => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </div>
    )
  }
  ```
  - 4개 미션 카드 그리드 레이아웃
  - 미션별 진행 상태 표시
  - 총 페이백 금액 요약 섹션
  - 예상 시간: 45분

## 🏆 Phase 6: 미션 1 - 재능충 챌린지

### 6.1 미션 1 상세 페이지
- [ ] **TODO-026**: `app/missions/challenge/page.tsx` 페이지 생성
  - 미션 설명 및 보상 내용 표시
  - 교육시간 입력 폼
  - 합격 인증서 업로드 영역
  - 제출 버튼 및 진행 상태
  - 예상 시간: 1시간

### 6.2 교육시간 입력 컴포넌트
- [ ] **TODO-027**: `components/mission/StudyTimeInput.tsx` 컴포넌트
  ```typescript
  interface StudyTimeInputProps {
    onSubmit: (hours: number) => void
    maxHours: number // 14시간
  }
  ```
  - 시간 입력 필드 (number input)
  - 14시간 이내 validation
  - 현재 입력된 시간 표시
  - 예상 시간: 45분

### 6.3 파일 업로드 컴포넌트
- [ ] **TODO-028**: `components/mission/FileUpload.tsx` 범용 파일 업로드
  ```typescript
  interface FileUploadProps {
    accept: string
    maxSize: number // bytes
    onUpload: (file: File) => Promise<string> // returns URL
    placeholder: string
  }
  ```
  - 드래그 앤 드롭 지원
  - 파일 미리보기
  - 업로드 진행률 표시
  - 파일 형식/크기 validation
  - Supabase Storage 업로드 연동
  - 예상 시간: 2시간

### 6.4 미션 제출 로직
- [ ] **TODO-029**: `lib/missions.ts` 미션 관련 API 함수들
  ```typescript
  export async function submitChallengeMission(
    userId: string, 
    studyHours: number, 
    proofImageUrl: string
  ): Promise<void> {
    // user_missions 테이블에 데이터 저장
    // paybacks 테이블에 페이백 정보 저장
  }
  ```
  - 예상 시간: 1시간

## 🔗 Phase 7: 미션 2 - SNS 인증 미션

### 7.1 미션 2 상세 페이지
- [ ] **TODO-030**: `app/missions/sns/page.tsx` 페이지 생성
  - SNS 인증 미션 설명
  - SNS 링크 입력 폼
  - 링크 유효성 검증 상태 표시
  - 예상 시간: 45분

### 7.2 SNS 링크 검증
- [ ] **TODO-031**: `lib/validators.ts` URL 검증 함수
  ```typescript
  export function validateSNSUrl(url: string): boolean {
    // Instagram, Facebook, Twitter 등 SNS URL 형식 검증
    const snsPattern = /^https?:\/\/(www\.)?(instagram|facebook|twitter|tiktok)\.com\/.+/
    return snsPattern.test(url)
  }
  ```
  - 예상 시간: 30분

### 7.3 SNS 링크 제출 컴포넌트
- [ ] **TODO-032**: `components/mission/SNSLinkSubmit.tsx` 컴포넌트
  ```typescript
  interface SNSLinkSubmitProps {
    onSubmit: (url: string) => void
  }
  ```
  - URL 입력 필드
  - 실시간 URL 검증
  - 미리보기 기능 (선택사항)
  - 예상 시간: 1시간

## 📝 Phase 8: 미션 3 - 후기 쓰기 미션

### 8.1 미션 3 상세 페이지
- [ ] **TODO-033**: `app/missions/review/page.tsx` 페이지 생성
  - 3개 플랫폼별 후기 작성 섹션
  - 각 플랫폼별 링크 입력 필드
  - 완료 상태별 체크박스 UI
  - 예상 시간: 1시간

### 8.2 플랫폼별 후기 입력 컴포넌트
- [ ] **TODO-034**: `components/mission/ReviewPlatformInput.tsx` 컴포넌트
  ```typescript
  interface ReviewPlatformInputProps {
    platform: 'smartplace' | 'drivelicense' | 'driveway'
    platformName: string
    onSubmit: (url: string) => void
    isCompleted: boolean
  }
  ```
  - 플랫폼별 아이콘 및 이름 표시
  - 후기 링크 입력 필드
  - 완료 상태 표시
  - 예상 시간: 1.5시간

## 👥 Phase 9: 미션 4 - 친구 추천 미션

### 9.1 미션 4 상세 페이지
- [ ] **TODO-035**: `app/missions/referral/page.tsx` 페이지 생성
  - 추천 현황 표시 (2/3명)
  - 추천인 등록 폼
  - 추천 링크 생성 및 복사 기능
  - 예상 시간: 1시간

### 9.2 추천인 등록 컴포넌트
- [ ] **TODO-036**: `components/mission/ReferralForm.tsx` 컴포넌트
  ```typescript
  interface ReferralFormProps {
    onSubmit: (name: string, phone: string) => void
    currentCount: number
    maxCount: number // 3
  }
  ```
  - 이름, 연락처 입력 필드
  - 중복 추천 검증
  - 최대 3명 제한 처리
  - 예상 시간: 1시간

### 9.3 추천 링크 시스템
- [ ] **TODO-037**: 추천 링크 생성 및 처리
  ```typescript
  // /register?ref=user_id 형태의 링크 생성
  export function generateReferralLink(userId: string): string {
    return `${window.location.origin}/register?ref=${userId}`
  }
  ```
  - 고유 추천 링크 생성
  - 클립보드 복사 기능
  - 추천 통계 추적
  - 예상 시간: 1시간

## 💰 Phase 10: 페이백 및 보상 시스템

### 10.1 페이백 계산 로직
- [ ] **TODO-038**: `lib/payback.ts` 페이백 계산 함수
  ```typescript
  export async function calculatePayback(userId: string): Promise<number> {
    // 완료된 미션별 페이백 금액 계산
    // 친구 추천 보상 계산
    // 총 페이백 금액 반환
  }
  ```
  - 예상 시간: 1시간

### 10.2 페이백 내역 조회 페이지
- [ ] **TODO-039**: `app/payback/page.tsx` 페이백 내역 페이지
  - 미션별 페이백 내역 테이블
  - 총 페이백 금액 표시
  - 지급 상태별 필터링
  - 예상 시간: 1.5시간

### 10.3 쿠폰 시스템 (기본)
- [ ] **TODO-040**: 커피 쿠폰 발급 로직
  ```typescript
  export async function issueCoffeeCoupon(userId: string): Promise<string> {
    // 쿠폰 코드 생성 및 저장
    // 사용자에게 쿠폰 발급 알림
  }
  ```
  - 예상 시간: 1시간

## 📊 Phase 11: 관리자 기능 (기본)

### 11.1 관리자 로그인
- [ ] **TODO-041**: `app/admin/login/page.tsx` 관리자 로그인 페이지
  - 간단한 패스워드 인증
  - 관리자 세션 관리
  - 예상 시간: 45분

### 11.2 미션 인증 검수 페이지
- [ ] **TODO-042**: `app/admin/verification/page.tsx` 인증 검수
  - 제출된 인증 자료 목록
  - 승인/거부 처리
  - 사유 입력 기능
  - 예상 시간: 2시간

## 🎨 Phase 12: UI/UX 개선

### 12.1 반응형 디자인 최적화
- [ ] **TODO-043**: 모든 페이지 모바일 반응형 점검
  - 미션 카드 모바일 레이아웃
  - 폼 컴포넌트 터치 친화적 크기
  - 네비게이션 메뉴 모바일 최적화
  - 예상 시간: 3시간

### 12.2 로딩 상태 및 에러 처리
- [ ] **TODO-044**: 로딩 스피너 및 스켈레톤 UI
  - 데이터 로딩 상태 표시
  - 이미지 업로드 진행률
  - API 호출 에러 토스트 알림
  - 예상 시간: 2시간

### 12.3 애니메이션 및 트랜지션
- [ ] **TODO-045**: 부드러운 페이지 전환 효과
  - 미션 완료 축하 애니메이션
  - 페이지 전환 애니메이션
  - 버튼 클릭 피드백
  - 예상 시간: 2시간

## 🧪 Phase 13: 테스트 및 QA

### 13.1 기능 테스트
- [ ] **TODO-046**: 사용자 등록 플로우 테스트
- [ ] **TODO-047**: 미션 완료 플로우 테스트 (4개 미션 각각)
- [ ] **TODO-048**: 페이백 계산 로직 테스트
- [ ] **TODO-049**: 파일 업로드 기능 테스트
- [ ] **TODO-050**: 모바일 디바이스 테스트
- 예상 시간: 각 1시간, 총 5시간

### 13.2 성능 최적화
- [ ] **TODO-051**: 이미지 최적화 및 lazy loading
- [ ] **TODO-052**: 번들 사이즈 최적화
- [ ] **TODO-053**: API 응답 시간 최적화
- 예상 시간: 3시간

## 🚀 Phase 14: 배포 및 운영

### 14.1 프로덕션 배포
- [ ] **TODO-054**: Vercel 배포 설정
- [ ] **TODO-055**: 환경 변수 프로덕션 설정
- [ ] **TODO-056**: 도메인 연결
- 예상 시간: 2시간

### 14.2 모니터링 설정
- [ ] **TODO-057**: Google Analytics 설치
- [ ] **TODO-058**: Sentry 에러 모니터링 설정
- [ ] **TODO-059**: Supabase 사용량 모니터링
- 예상 시간: 2시간

---

## 📋 개발 우선순위

### 🔴 최우선 (MVP - 2주 목표)
- TODO-001 ~ TODO-021 (프로젝트 설정 + 사용자 등록)
- TODO-022 ~ TODO-025 (기본 대시보드)
- TODO-026 ~ TODO-029 (미션 1)

### 🟡 우선 (3주차)
- TODO-030 ~ TODO-037 (미션 2, 3, 4)
- TODO-038 ~ TODO-040 (페이백 시스템)

### 🟢 일반 (4주차)
- TODO-041 ~ TODO-042 (기본 관리자 기능)
- TODO-043 ~ TODO-045 (UI/UX 개선)

### 🔵 추후 (5주차+)
- TODO-046 ~ TODO-059 (테스트, 최적화, 배포)

---

## ⏱️ 예상 총 개발 시간

- **프로젝트 설정**: 2.5시간
- **데이터베이스 설계**: 2시간
- **사용자 등록 시스템**: 6시간
- **미션 시스템**: 12시간
- **페이백 시스템**: 3.5시간
- **관리자 기능**: 2.75시간
- **UI/UX 개선**: 7시간
- **테스트 및 배포**: 10시간

**총 예상 시간**: 45.75시간 (약 6주, 주당 8시간 기준)

## 🛠️ 개발 팁

1. **Supabase RLS**: 보안을 위해 반드시 RLS 정책 설정
2. **에러 처리**: try-catch 블록과 사용자 친화적 에러 메시지
3. **타입 안전성**: TypeScript 타입 정의 철저히
4. **성능**: 이미지 압축, lazy loading, 코드 스플리팅 고려
5. **SEO**: Next.js 메타데이터 API 활용
6. **접근성**: ARIA 레이블, 키보드 네비게이션 고려