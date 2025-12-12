# Supabase 클라이언트 사용법 가이드

## 📋 목차
1. [기본 설정](#기본-설정)
2. [CRUD 작업](#crud-작업)
3. [조인과 관계 쿼리](#조인과-관계-쿼리)
4. [에러 처리](#에러-처리)
5. [실제 사용 예시](#실제-사용-예시)
6. [자주 발생하는 에러와 해결법](#자주-발생하는-에러와-해결법)

---

## 기본 설정

### 1. Supabase 클라이언트 초기화
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 2. 타입 정의 (선택사항이지만 권장)
```typescript
// types/database.ts
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          phone: string
          phone_verified: boolean
          created_at: string
          updated_at: string
          referral_code: string
          referred_by: string | null
          referral_bonus: number
          consecutive_days: number
          last_attendance_date: string | null
          branch_id: string | null
          store_id: number | null
        }
        Insert: {
          id?: string
          name: string
          phone: string
          phone_verified?: boolean
          created_at?: string
          updated_at?: string
          referral_code?: string
          referred_by?: string | null
          referral_bonus?: number
          consecutive_days?: number
          last_attendance_date?: string | null
          branch_id?: string | null
          store_id?: number | null
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          phone_verified?: boolean
          created_at?: string
          updated_at?: string
          referral_code?: string
          referred_by?: string | null
          referral_bonus?: number
          consecutive_days?: number
          last_attendance_date?: string | null
          branch_id?: string | null
          store_id?: number | null
        }
      }
      // 다른 테이블들도 비슷하게 정의...
    }
  }
}

// 타입이 적용된 클라이언트
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

---

## CRUD 작업

### 1. CREATE (생성)

#### 단일 레코드 생성
```typescript
// 사용자 생성
const { data, error } = await supabase
  .from('users')
  .insert({
    name: '홍길동',
    phone: '010-1234-5678',
    store_id: 1
  })
  .select() // 생성된 데이터 반환

if (error) {
  console.error('사용자 생성 실패:', error)
  return
}

console.log('생성된 사용자:', data[0])
```

#### 여러 레코드 생성
```typescript
// 여러 사용자 생성
const { data, error } = await supabase
  .from('users')
  .insert([
    { name: '김철수', phone: '010-1111-1111', store_id: 1 },
    { name: '이영희', phone: '010-2222-2222', store_id: 1 }
  ])
  .select()

if (error) {
  console.error('사용자들 생성 실패:', error)
  return
}

console.log('생성된 사용자들:', data)
```

### 2. READ (조회)

#### 전체 데이터 조회
```typescript
// 모든 사용자 조회
const { data, error } = await supabase
  .from('users')
  .select('*')

if (error) {
  console.error('사용자 조회 실패:', error)
  return
}

console.log('모든 사용자:', data)
```

#### 조건부 조회
```typescript
// 특정 매장의 사용자들 조회
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('store_id', 1)
  .gte('consecutive_days', 5) // 연속 출석일 5일 이상

if (error) {
  console.error('사용자 조회 실패:', error)
  return
}

console.log('조건에 맞는 사용자들:', data)
```

#### 특정 컬럼만 조회
```typescript
// 이름과 전화번호만 조회
const { data, error } = await supabase
  .from('users')
  .select('name, phone')
  .eq('store_id', 1)

if (error) {
  console.error('사용자 조회 실패:', error)
  return
}

console.log('사용자 정보:', data)
```

#### 단일 레코드 조회
```typescript
// 특정 사용자 조회
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', 'user-uuid-here')
  .single() // 단일 레코드만 반환

if (error) {
  console.error('사용자 조회 실패:', error)
  return
}

console.log('사용자 정보:', data)
```

#### 정렬과 제한
```typescript
// 최근 가입한 사용자 10명 조회
const { data, error } = await supabase
  .from('users')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10)

if (error) {
  console.error('사용자 조회 실패:', error)
  return
}

console.log('최근 가입자들:', data)
```

### 3. UPDATE (수정)

#### 단일 레코드 수정
```typescript
// 사용자 정보 수정
const { data, error } = await supabase
  .from('users')
  .update({
    name: '홍길동(수정)',
    consecutive_days: 10
  })
  .eq('id', 'user-uuid-here')
  .select()

if (error) {
  console.error('사용자 수정 실패:', error)
  return
}

console.log('수정된 사용자:', data[0])
```

#### 조건부 수정
```typescript
// 특정 매장의 모든 사용자 연속 출석일 증가
const { data, error } = await supabase
  .from('users')
  .update({
    consecutive_days: supabase.sql`consecutive_days + 1`
  })
  .eq('store_id', 1)
  .select()

if (error) {
  console.error('사용자 수정 실패:', error)
  return
}

console.log('수정된 사용자들:', data)
```

### 4. DELETE (삭제)

#### 단일 레코드 삭제
```typescript
// 특정 사용자 삭제
const { error } = await supabase
  .from('users')
  .delete()
  .eq('id', 'user-uuid-here')

if (error) {
  console.error('사용자 삭제 실패:', error)
  return
}

console.log('사용자 삭제 완료')
```

#### 조건부 삭제
```typescript
// 비활성화된 사용자들 삭제 (예시)
const { error } = await supabase
  .from('users')
  .delete()
  .lt('consecutive_days', 1) // 연속 출석일 1일 미만

if (error) {
  console.error('사용자 삭제 실패:', error)
  return
}

console.log('비활성 사용자 삭제 완료')
```

---

## 조인과 관계 쿼리

### 1. 기본 조인

#### 단일 테이블 조인
```typescript
// 사용자와 매장 정보 함께 조회
const { data, error } = await supabase
  .from('users')
  .select(`
    *,
    stores (
      id,
      name,
      road_address,
      phone_number
    )
  `)
  .eq('store_id', 1)

if (error) {
  console.error('사용자 조회 실패:', error)
  return
}

console.log('사용자와 매장 정보:', data)
```

#### 여러 테이블 조인
```typescript
// 사용자, 매장, 미션 참여 정보 함께 조회
const { data, error } = await supabase
  .from('users')
  .select(`
    *,
    stores (
      id,
      name,
      road_address
    ),
    mission_participations (
      id,
      status,
      started_at,
      completed_at,
      mission_definitions (
        id,
        title,
        description,
        reward_amount
      )
    )
  `)
  .eq('id', 'user-uuid-here')

if (error) {
  console.error('사용자 정보 조회 실패:', error)
  return
}

console.log('사용자 전체 정보:', data)
```

### 2. 중첩 조인

#### 복잡한 관계 조회
```typescript
// 미션 참여와 관련된 모든 정보 조회
const { data, error } = await supabase
  .from('mission_participations')
  .select(`
    *,
    users (
      id,
      name,
      phone,
      stores (
        id,
        name,
        road_address
      )
    ),
    mission_definitions (
      id,
      title,
      description,
      mission_type,
      reward_amount,
      admin_users (
        id,
        name,
        role
      )
    ),
    stores (
      id,
      name,
      road_address
    )
  `)
  .eq('status', 'completed')

if (error) {
  console.error('미션 참여 정보 조회 실패:', error)
  return
}

console.log('완료된 미션 참여 정보:', data)
```

### 3. 조건부 조인

#### 조인된 테이블에 조건 적용
```typescript
// 특정 매장의 사용자들과 그들의 미션 참여 정보
const { data, error } = await supabase
  .from('users')
  .select(`
    *,
    mission_participations!inner (
      id,
      status,
      reward_amount,
      mission_definitions (
        title,
        mission_type
      )
    )
  `)
  .eq('store_id', 1)
  .eq('mission_participations.status', 'completed')

if (error) {
  console.error('사용자 미션 정보 조회 실패:', error)
  return
}

console.log('미션 완료한 사용자들:', data)
```

---

## 에러 처리

### 1. 기본 에러 처리
```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', 'invalid-uuid')
  .single()

if (error) {
  // 에러 타입별 처리
  switch (error.code) {
    case 'PGRST116': // 데이터 없음
      console.log('사용자를 찾을 수 없습니다.')
      break
    case 'PGRST301': // 권한 없음
      console.log('접근 권한이 없습니다.')
      break
    default:
      console.error('알 수 없는 에러:', error.message)
  }
  return
}

console.log('사용자 정보:', data)
```

### 2. 커스텀 에러 처리 함수
```typescript
// lib/supabase-utils.ts
export const handleSupabaseError = (error: any, context: string) => {
  if (!error) return null

  const errorMap: Record<string, string> = {
    'PGRST116': '데이터를 찾을 수 없습니다.',
    'PGRST301': '접근 권한이 없습니다.',
    'PGRST302': '중복된 데이터입니다.',
    '23505': '중복된 값입니다.',
    '23503': '관련된 데이터가 있어 삭제할 수 없습니다.'
  }

  const message = errorMap[error.code] || error.message
  console.error(`${context} 에러:`, message)

  return {
    code: error.code,
    message,
    details: error.details,
    hint: error.hint
  }
}

// 사용 예시
const { data, error } = await supabase
  .from('users')
  .select('*')
  .single()

const errorInfo = handleSupabaseError(error, '사용자 조회')
if (errorInfo) {
  // 에러 처리 로직
  return
}
```

### 3. 타입 안전한 에러 처리
```typescript
// types/supabase.ts
export type SupabaseResult<T> = {
  data: T | null
  error: {
    code: string
    message: string
    details?: string
    hint?: string
  } | null
}

export const safeQuery = async <T>(
  query: Promise<SupabaseResult<T>>,
  context: string
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const { data, error } = await query

    if (error) {
      console.error(`${context} 에러:`, error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error(`${context} 예외:`, err)
    return { data: null, error: '알 수 없는 에러가 발생했습니다.' }
  }
}

// 사용 예시
const { data, error } = await safeQuery(
  supabase.from('users').select('*').single(),
  '사용자 조회'
)

if (error) {
  // 에러 처리
  return
}

// data 사용
```

---

## 실제 사용 예시

### 1. 사용자 대시보드 데이터 조회
```typescript
// 사용자의 전체 정보 조회 (매장, 미션 참여, 보상 등)
export const getUserDashboard = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      stores (
        id,
        name,
        road_address,
        phone_number
      ),
      mission_participations (
        id,
        status,
        started_at,
        completed_at,
        reward_amount,
        mission_definitions (
          id,
          title,
          description,
          mission_type
        )
      ),
      paybacks (
        id,
        amount,
        status,
        paid_at
      )
    `)
    .eq('id', userId)
    .single()

  if (error) {
    console.error('대시보드 데이터 조회 실패:', error)
    return null
  }

  return data
}
```

### 2. 미션 목록 조회
```typescript
// 활성화된 미션 목록 조회
export const getActiveMissions = async (storeId?: number) => {
  let query = supabase
    .from('mission_definitions')
    .select(`
      *,
      stores (
        id,
        name
      ),
      admin_users (
        id,
        name,
        role
      )
    `)
    .eq('is_active', true)
    .gte('end_date', new Date().toISOString())

  if (storeId) {
    query = query.eq('store_id', storeId)
  }

  const { data, error } = await query

  if (error) {
    console.error('미션 목록 조회 실패:', error)
    return []
  }

  return data
}
```

### 3. 미션 참여 처리
```typescript
// 미션 참여 시작
export const startMission = async (
  userId: string,
  missionId: number,
  storeId: number
) => {
  const { data, error } = await supabase
    .from('mission_participations')
    .insert({
      user_id: userId,
      mission_definition_id: missionId,
      store_id: storeId,
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('미션 참여 시작 실패:', error)
    return null
  }

  return data
}

// 미션 완료
export const completeMission = async (
  participationId: string,
  proofData: any
) => {
  const { data, error } = await supabase
    .from('mission_participations')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      proof_data: proofData
    })
    .eq('id', participationId)
    .select()
    .single()

  if (error) {
    console.error('미션 완료 처리 실패:', error)
    return null
  }

  return data
}
```

### 4. 보상 지급 처리
```typescript
// 보상 지급
export const processPayback = async (
  userId: string,
  missionId: number,
  amount: number,
  storeId: number
) => {
  const { data, error } = await supabase
    .from('paybacks')
    .insert({
      user_id: userId,
      mission_definition_id: missionId,
      amount,
      store_id: storeId,
      status: 'pending',
      paid_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('보상 지급 실패:', error)
    return null
  }

  return data
}
```

---

## 자주 발생하는 에러와 해결법

### 1. `single()` 에러
**에러**: `PGRST116: 결과가 없습니다.`

**원인**: `single()`을 사용했는데 결과가 없거나 여러 개인 경우

**해결법**:
```typescript
// ❌ 잘못된 사용
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', 'non-existent-id')
  .single() // 에러 발생

// ✅ 올바른 사용
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', 'non-existent-id')

if (error) {
  console.error('조회 실패:', error)
  return
}

if (data.length === 0) {
  console.log('사용자를 찾을 수 없습니다.')
  return
}

const user = data[0] // 첫 번째 결과 사용
```

### 2. 조인 에러
**에러**: `관계를 찾을 수 없습니다.`

**원인**: 잘못된 테이블명이나 관계명 사용

**해결법**:
```typescript
// ❌ 잘못된 조인
const { data, error } = await supabase
  .from('users')
  .select(`
    *,
    store ( // 잘못된 테이블명
      id,
      name
    )
  `)

// ✅ 올바른 조인
const { data, error } = await supabase
  .from('users')
  .select(`
    *,
    stores ( // 올바른 테이블명
      id,
      name
    )
  `)
```

### 3. 권한 에러
**에러**: `PGRST301: 권한이 없습니다.`

**원인**: RLS 정책에 의해 접근이 차단됨

**해결법**:
```typescript
// 1. 사용자 인증 확인
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  console.log('로그인이 필요합니다.')
  return
}

// 2. 적절한 권한으로 쿼리
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', user.id) // 자신의 데이터만 조회
```

### 4. 타입 에러
**에러**: `TypeScript 타입 에러`

**원인**: 잘못된 타입 정의

**해결법**:
```typescript
// 1. 타입 정의 확인
interface User {
  id: string
  name: string
  phone: string
  // ... 다른 필드들
}

// 2. 타입 안전한 쿼리
const { data, error } = await supabase
  .from('users')
  .select('id, name, phone') // 실제 존재하는 컬럼만 선택
  .returns<User[]>()
```

### 5. 중복 데이터 에러
**에러**: `23505: 중복된 값입니다.`

**원인**: UNIQUE 제약조건 위반

**해결법**:
```typescript
// 1. 중복 확인 후 삽입
const { data: existing } = await supabase
  .from('users')
  .select('id')
  .eq('phone', '010-1234-5678')
  .single()

if (existing) {
  console.log('이미 존재하는 전화번호입니다.')
  return
}

// 2. upsert 사용 (있으면 업데이트, 없으면 삽입)
const { data, error } = await supabase
  .from('users')
  .upsert({
    phone: '010-1234-5678',
    name: '홍길동',
    // ... 다른 필드들
  })
  .select()
```

---

## 🎯 모범 사례

### 1. 쿼리 최적화
```typescript
// ❌ 비효율적인 쿼리
const { data, error } = await supabase
  .from('users')
  .select('*') // 모든 컬럼 조회

// ✅ 효율적인 쿼리
const { data, error } = await supabase
  .from('users')
  .select('id, name, phone, store_id') // 필요한 컬럼만 조회
```

### 2. 에러 처리 통합
```typescript
// lib/supabase-helpers.ts
export const createSupabaseHelper = () => {
  const query = async <T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    context: string
  ) => {
    try {
      const { data, error } = await queryFn()

      if (error) {
        console.error(`${context} 에러:`, error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      console.error(`${context} 예외:`, err)
      return { data: null, error: '알 수 없는 에러가 발생했습니다.' }
    }
  }

  return { query }
}

// 사용 예시
const { query } = createSupabaseHelper()

const { data, error } = await query(
  () => supabase.from('users').select('*'),
  '사용자 조회'
)
```

### 3. 타입 안전성 확보
```typescript
// types/api.ts
export type ApiResponse<T> = {
  data: T | null
  error: string | null
  success: boolean
}

export const createApiResponse = <T>(
  data: T | null,
  error: string | null
): ApiResponse<T> => ({
  data,
  error,
  success: !error
})

// 사용 예시
export const getUser = async (id: string): Promise<ApiResponse<User>> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return createApiResponse(null, error.message)
  }

  return createApiResponse(data, null)
}
```

---

## 📚 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase JavaScript 클라이언트](https://supabase.com/docs/reference/javascript)
- [PostgreSQL 쿼리 가이드](https://www.postgresql.org/docs/current/queries.html)

---

*마지막 업데이트: 2025-01-13*
