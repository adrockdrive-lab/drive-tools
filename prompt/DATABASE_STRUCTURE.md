# Supabase 데이터베이스 구조 분석

## 프로젝트 정보
- **프로젝트명**: drive-tool
- **프로젝트 ID**: rhofpgbzunxgmcjcoxex
- **지역**: ap-northeast-2 (서울)
- **상태**: ACTIVE_HEALTHY
- **PostgreSQL 버전**: 17.4.1.069

## 📊 전체 테이블 목록

### 1. 사용자 관리 테이블
- `users` - 일반 사용자 정보
- `admin_users` - 관리자 사용자 정보
- `sms_verifications` - SMS 인증 코드

### 2. 매장 관리 테이블
- `stores` - 매장 정보
- `store_operating_hours` - 매장 운영 시간
- `store_photos` - 매장 사진
- `instructors` - 강사 정보

### 3. 미션 시스템 테이블
- `mission_definitions` - 미션 정의
- `mission_participations` - 미션 참여 기록
- `paybacks` - 보상 지급 기록

### 4. 권한 관리 테이블
- `user_roles` - 사용자 역할 정의
- `permissions` - 권한 정의
- `role_permissions` - 역할-권한 연결
- `user_role_assignments` - 사용자-역할 할당
- `user_store_permissions` - 사용자-매장 권한
- `admin_role_assignments` - 관리자-역할 할당
- `admin_store_assignments` - 관리자-매장 할당
- `admin_store_permissions` - 관리자-매장 권한

---

## 🔗 테이블 관계도

### 핵심 엔티티 관계
```
stores (매장)
├── store_operating_hours (운영시간)
├── store_photos (매장사진)
├── instructors (강사)
├── users (사용자)
├── mission_definitions (미션정의)
├── mission_participations (미션참여)
├── paybacks (보상)
├── user_store_permissions (사용자매장권한)
├── admin_store_assignments (관리자매장할당)
└── admin_store_permissions (관리자매장권한)

users (사용자)
├── user_role_assignments (역할할당)
├── user_store_permissions (매장권한)
├── mission_participations (미션참여)
├── paybacks (보상)
└── users (추천인)

admin_users (관리자)
├── admin_role_assignments (역할할당)
├── admin_store_assignments (매장할당)
├── admin_store_permissions (매장권한)
└── mission_definitions (미션생성)

user_roles (역할)
├── role_permissions (권한)
├── user_role_assignments (사용자할당)
├── user_store_permissions (매장권한)
├── admin_role_assignments (관리자할당)
└── admin_store_permissions (관리자매장권한)

permissions (권한)
└── role_permissions (역할권한)

mission_definitions (미션정의)
├── mission_participations (참여)
└── paybacks (보상)
```

---

## 📋 상세 테이블 구조

### 1. stores (매장)
**Primary Key**: `id` (bigint, auto-increment)
**크기**: 120 kB, 44개 행

| 컬럼명 | 타입 | 설명 | 제약조건 |
|--------|------|------|----------|
| id | bigint | 매장 ID | PK, auto-increment |
| name | text | 매장명 | NOT NULL |
| is_direct | boolean | 직영점 여부 | DEFAULT false |
| is_near_test_center | boolean | 시험장 근처 여부 | DEFAULT false |
| is_sunday_open | boolean | 일요일 운영 여부 | DEFAULT false |
| has_free_photo | boolean | 무료 사진 제공 여부 | DEFAULT false |
| road_address | text | 도로명주소 | |
| address | text | 지번주소 | |
| summary_address | text | 요약주소 | |
| latitude | numeric | 위도 | |
| longitude | numeric | 경도 | |
| phone_number | text | 전화번호 | |
| max_capacity | integer | 최대 수용 인원 | |
| machine_count_class1 | integer | 1종 기계 수 | |
| machine_count_class2 | integer | 2종 기계 수 | |
| opening_date | date | 개업일 | |
| has_wifi | boolean | WiFi 제공 여부 | DEFAULT false |
| has_restrooms | boolean | 화장실 여부 | DEFAULT false |
| has_parking | boolean | 주차장 여부 | DEFAULT false |
| payment_info | text | 결제 정보 | |
| meta_keywords | text | 메타 키워드 | |
| recommended_test_center_1~3 | text | 추천 시험장 | |
| operating_hours_note | text | 운영시간 메모 | |
| created_at | timestamptz | 생성일시 | DEFAULT now() |
| updated_at | timestamptz | 수정일시 | DEFAULT now() |

**관련 테이블**:
- `store_operating_hours` (1:N)
- `store_photos` (1:N)
- `instructors` (1:N)
- `users` (1:N)
- `mission_definitions` (1:N)
- `mission_participations` (1:N)
- `paybacks` (1:N)

### 2. users (사용자)
**Primary Key**: `id` (uuid)
**크기**: 152 kB, 4개 행

| 컬럼명 | 타입 | 설명 | 제약조건 |
|--------|------|------|----------|
| id | uuid | 사용자 ID | PK, gen_random_uuid() |
| name | varchar | 이름 | NOT NULL |
| phone | varchar | 전화번호 | NOT NULL, UNIQUE |
| phone_verified | boolean | 전화번호 인증 여부 | DEFAULT false |
| created_at | timestamptz | 생성일시 | DEFAULT now() |
| updated_at | timestamptz | 수정일시 | DEFAULT now() |
| referral_code | varchar | 추천 코드 | UNIQUE |
| referred_by | uuid | 추천인 ID | FK → users.id |
| referral_bonus | integer | 추천 보너스 | DEFAULT 0 |
| consecutive_days | integer | 연속 출석일 | DEFAULT 0 |
| last_attendance_date | date | 마지막 출석일 | |
| branch_id | uuid | 지점 ID | |
| store_id | bigint | 매장 ID | FK → stores.id |

**관련 테이블**:
- `users` (self-referencing, 추천인)
- `stores` (N:1)
- `mission_participations` (1:N)
- `paybacks` (1:N)
- `user_role_assignments` (1:N)
- `user_store_permissions` (1:N)

### 3. admin_users (관리자)
**Primary Key**: `id` (uuid)
**크기**: 128 kB, 15개 행

| 컬럼명 | 타입 | 설명 | 제약조건 |
|--------|------|------|----------|
| id | uuid | 관리자 ID | PK, gen_random_uuid() |
| name | varchar | 이름 | NOT NULL |
| phone | varchar | 전화번호 | NOT NULL, UNIQUE |
| email | varchar | 이메일 | |
| password_hash | varchar | 비밀번호 해시 | |
| phone_verified | boolean | 전화번호 인증 여부 | DEFAULT false |
| is_active | boolean | 활성화 여부 | DEFAULT true |
| last_login_at | timestamptz | 마지막 로그인 | |
| created_at | timestamptz | 생성일시 | DEFAULT now() |
| updated_at | timestamptz | 수정일시 | DEFAULT now() |
| role | varchar | 역할 | DEFAULT 'branch_manager' |

**관련 테이블**:
- `admin_role_assignments` (1:N)
- `admin_store_assignments` (1:N)
- `admin_store_permissions` (1:N)
- `mission_definitions` (1:N, 생성자)

### 4. mission_definitions (미션 정의)
**Primary Key**: `id` (integer, auto-increment)
**크기**: 64 kB, 6개 행

| 컬럼명 | 타입 | 설명 | 제약조건 |
|--------|------|------|----------|
| id | integer | 미션 ID | PK, auto-increment |
| title | varchar | 미션 제목 | NOT NULL |
| description | text | 미션 설명 | |
| mission_type | varchar | 미션 타입 | NOT NULL, CHECK |
| reward_amount | integer | 보상 금액 | DEFAULT 0 |
| requirements | jsonb | 요구사항 | |
| proof_requirements | jsonb | 증명 요구사항 | |
| is_active | boolean | 활성화 여부 | DEFAULT true |
| max_participants | integer | 최대 참여자 수 | |
| start_date | timestamptz | 시작일 | |
| end_date | timestamptz | 종료일 | |
| created_by | uuid | 생성자 | FK → admin_users.id |
| created_at | timestamptz | 생성일시 | DEFAULT now() |
| updated_at | timestamptz | 수정일시 | DEFAULT now() |
| is_global | boolean | 전역 미션 여부 | DEFAULT true |
| store_id | bigint | 매장 ID | FK → stores.id |

**미션 타입 제약조건**:
- challenge, sns, review, referral, attendance
- challenge_enhanced, sns_enhanced, review_enhanced, referral_enhanced

**관련 테이블**:
- `admin_users` (N:1, 생성자)
- `stores` (N:1)
- `mission_participations` (1:N)
- `paybacks` (1:N)

### 5. mission_participations (미션 참여)
**Primary Key**: `id` (uuid)
**크기**: 48 kB, 5개 행

| 컬럼명 | 타입 | 설명 | 제약조건 |
|--------|------|------|----------|
| id | uuid | 참여 ID | PK, gen_random_uuid() |
| user_id | uuid | 사용자 ID | FK → users.id |
| mission_definition_id | integer | 미션 정의 ID | FK → mission_definitions.id |
| status | varchar | 상태 | DEFAULT 'pending', CHECK |
| started_at | timestamptz | 시작일시 | |
| completed_at | timestamptz | 완료일시 | |
| proof_data | jsonb | 증명 데이터 | |
| reward_amount | integer | 보상 금액 | DEFAULT 0 |
| created_at | timestamptz | 생성일시 | DEFAULT now() |
| updated_at | timestamptz | 수정일시 | DEFAULT now() |
| store_id | bigint | 매장 ID | FK → stores.id |

**상태 제약조건**:
- pending, in_progress, completed, verified

**관련 테이블**:
- `users` (N:1)
- `mission_definitions` (N:1)
- `stores` (N:1)

### 6. paybacks (보상)
**Primary Key**: `id` (uuid)
**크기**: 16 kB, 0개 행

| 컬럼명 | 타입 | 설명 | 제약조건 |
|--------|------|------|----------|
| id | uuid | 보상 ID | PK, gen_random_uuid() |
| user_id | uuid | 사용자 ID | FK → users.id |
| mission_definition_id | integer | 미션 정의 ID | FK → mission_definitions.id |
| amount | integer | 금액 | NOT NULL |
| status | varchar | 상태 | DEFAULT 'pending' |
| paid_at | timestamptz | 지급일시 | |
| created_at | timestamptz | 생성일시 | DEFAULT now() |
| store_id | bigint | 매장 ID | FK → stores.id |
| rejection_reason | text | 거부 사유 | |

**관련 테이블**:
- `users` (N:1)
- `mission_definitions` (N:1)
- `stores` (N:1)

### 7. user_roles (사용자 역할)
**Primary Key**: `id` (uuid)
**크기**: 48 kB, 4개 행

| 컬럼명 | 타입 | 설명 | 제약조건 |
|--------|------|------|----------|
| id | uuid | 역할 ID | PK, gen_random_uuid() |
| name | varchar | 역할명 | NOT NULL, UNIQUE |
| display_name | varchar | 표시명 | NOT NULL |
| description | text | 설명 | |
| created_at | timestamptz | 생성일시 | DEFAULT now() |
| updated_at | timestamptz | 수정일시 | DEFAULT now() |

**관련 테이블**:
- `role_permissions` (1:N)
- `user_role_assignments` (1:N)
- `user_store_permissions` (1:N)
- `admin_role_assignments` (1:N)
- `admin_store_permissions` (1:N)

### 8. permissions (권한)
**Primary Key**: `id` (uuid)
**크기**: 48 kB, 30개 행

| 컬럼명 | 타입 | 설명 | 제약조건 |
|--------|------|------|----------|
| id | uuid | 권한 ID | PK, gen_random_uuid() |
| name | varchar | 권한명 | NOT NULL, UNIQUE |
| display_name | varchar | 표시명 | NOT NULL |
| description | text | 설명 | |
| resource | varchar | 리소스 | NOT NULL |
| action | varchar | 액션 | NOT NULL |
| created_at | timestamptz | 생성일시 | DEFAULT now() |
| updated_at | timestamptz | 수정일시 | DEFAULT now() |

**관련 테이블**:
- `role_permissions` (1:N)

---

## 🔐 보안 정책 (RLS)

### RLS 활성화된 테이블
✅ **RLS 활성화**:
- `users` - 일반 사용자 정보
- `admin_users` - 관리자 사용자 정보
- `stores` - 매장 정보
- `store_operating_hours` - 매장 운영시간
- `store_photos` - 매장 사진
- `instructors` - 강사 정보
- `mission_definitions` - 미션 정의
- `sms_verifications` - SMS 인증
- `user_roles` - 사용자 역할
- `permissions` - 권한
- `role_permissions` - 역할-권한 연결
- `admin_store_assignments` - 관리자-매장 할당

❌ **RLS 비활성화** (보안 위험):
- `mission_participations` - 미션 참여
- `paybacks` - 보상 지급
- `user_role_assignments` - 사용자-역할 할당
- `user_store_permissions` - 사용자-매장 권한
- `admin_store_permissions` - 관리자-매장 권한
- `admin_role_assignments` - 관리자-역할 할당

### 보안 권고사항
1. **RLS 활성화 필요**: 위 6개 테이블에 RLS 정책 추가 필요
2. **함수 보안**: 5개 함수의 search_path 설정 필요
   - `update_mission_participations_updated_at`
   - `check_user_permission`
   - `get_user_roles`
   - `get_user_permissions`

---

## 🔗 외래키 관계 상세

### 1. stores (매장) 중심 관계
```sql
-- stores → store_operating_hours
stores.id → store_operating_hours.store_id

-- stores → store_photos
stores.id → store_photos.store_id

-- stores → instructors
stores.id → instructors.store_id

-- stores → users
stores.id → users.store_id

-- stores → mission_definitions
stores.id → mission_definitions.store_id

-- stores → mission_participations
stores.id → mission_participations.store_id

-- stores → paybacks
stores.id → paybacks.store_id

-- stores → user_store_permissions
stores.id → user_store_permissions.store_id

-- stores → admin_store_assignments
stores.id → admin_store_assignments.store_id

-- stores → admin_store_permissions
stores.id → admin_store_permissions.store_id
```

### 2. users (사용자) 중심 관계
```sql
-- users → users (self-referencing, 추천인)
users.id → users.referred_by

-- users → stores
users.id → users.store_id

-- users → mission_participations
users.id → mission_participations.user_id

-- users → paybacks
users.id → paybacks.user_id

-- users → user_role_assignments
users.id → user_role_assignments.user_id

-- users → user_store_permissions
users.id → user_store_permissions.user_id

-- users → user_role_assignments (assigned_by)
users.id → user_role_assignments.assigned_by

-- users → user_store_permissions (assigned_by)
users.id → user_store_permissions.assigned_by
```

### 3. admin_users (관리자) 중심 관계
```sql
-- admin_users → mission_definitions (생성자)
admin_users.id → mission_definitions.created_by

-- admin_users → admin_store_assignments
admin_users.id → admin_store_assignments.admin_user_id

-- admin_users → admin_store_assignments (assigned_by)
admin_users.id → admin_store_assignments.assigned_by

-- admin_users → admin_role_assignments
admin_users.id → admin_role_assignments.admin_user_id

-- admin_users → admin_role_assignments (assigned_by)
admin_users.id → admin_role_assignments.assigned_by

-- admin_users → admin_store_permissions
admin_users.id → admin_store_permissions.admin_user_id

-- admin_users → admin_store_permissions (assigned_by)
admin_users.id → admin_store_permissions.assigned_by
```

### 4. user_roles (역할) 중심 관계
```sql
-- user_roles → role_permissions
user_roles.id → role_permissions.role_id

-- user_roles → user_role_assignments
user_roles.id → user_role_assignments.role_id

-- user_roles → user_store_permissions
user_roles.id → user_store_permissions.role_id

-- user_roles → admin_role_assignments
user_roles.id → admin_role_assignments.role_id

-- user_roles → admin_store_permissions
user_roles.id → admin_store_permissions.role_id
```

### 5. permissions (권한) 중심 관계
```sql
-- permissions → role_permissions
permissions.id → role_permissions.permission_id
```

### 6. mission_definitions (미션 정의) 중심 관계
```sql
-- mission_definitions → admin_users (생성자)
mission_definitions.created_by → admin_users.id

-- mission_definitions → stores
mission_definitions.store_id → stores.id

-- mission_definitions → mission_participations
mission_definitions.id → mission_participations.mission_definition_id

-- mission_definitions → paybacks
mission_definitions.id → paybacks.mission_definition_id
```

---

## 📈 데이터 현황

### 테이블별 데이터 수
- `stores`: 44개 매장
- `users`: 4명 사용자
- `admin_users`: 15명 관리자
- `instructors`: 76명 강사
- `store_photos`: 81개 사진
- `store_operating_hours`: 296개 운영시간
- `mission_definitions`: 6개 미션 정의
- `mission_participations`: 5개 참여 기록
- `paybacks`: 0개 보상 기록
- `user_roles`: 4개 역할
- `permissions`: 30개 권한
- `role_permissions`: 58개 역할-권한 연결
- `admin_store_assignments`: 38개 관리자-매장 할당
- `admin_role_assignments`: 15개 관리자-역할 할당

---

## 🚨 보안 이슈 및 권고사항

### 1. RLS 정책 추가 필요
다음 테이블들에 RLS 정책을 추가해야 합니다:
- `mission_participations`
- `paybacks`
- `user_role_assignments`
- `user_store_permissions`
- `admin_store_permissions`
- `admin_role_assignments`

### 2. 함수 보안 강화
다음 함수들의 search_path를 설정해야 합니다:
- `update_mission_participations_updated_at`
- `check_user_permission`
- `get_user_roles`
- `get_user_permissions`

### 3. 인덱스 최적화
외래키 컬럼들에 인덱스가 추가되어 있어 성능상 문제는 없습니다.

---

## 📝 마이그레이션 히스토리

총 89개의 마이그레이션이 적용되어 있으며, 주요 단계는:
1. 기본 테이블 생성 (2025-08-07)
2. RLS 정책 설정 (2025-08-08)
3. 매장 데이터 추가 (2025-08-11)
4. 권한 시스템 구축 (2025-08-12)
5. 미션 시스템 개선 (2025-08-12~13)

---

*마지막 업데이트: 2025-01-13*
