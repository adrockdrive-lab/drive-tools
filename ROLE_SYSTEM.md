# 🏢 사용자 역할 및 권한 시스템

## 📋 개요

운전면허 미션 시스템의 사용자 역할 및 권한 관리 시스템입니다. 계층적 권한 구조를 통해 각 사용자의 접근 권한을 세밀하게 제어합니다.

## 🎯 역할 구조

### 1. 슈퍼 관리자 (Super Admin)
- **권한**: 전체 시스템에 대한 모든 권한
- **기능**:
  - 지점 관리자 계정 생성/삭제
  - 지점별 미션 관리
  - 페이백 시스템 관리
  - 모든 사용자 및 데이터 조회/수정
  - 시스템 설정 관리

### 2. 지점장 (Branch Manager)
- **권한**: 특정 지점에 대한 관리 권한
- **기능**:
  - 지점 매니저 계정 생성/삭제
  - 지점별 미션 관리
  - 지점별 페이백 시스템 관리
  - 해당 지점 사용자 관리

### 3. 매장 매니저 (Store Manager)
- **권한**: 특정 매장에 대한 제한된 관리 권한
- **기능**:
  - 매장별 미션 승인/반려
  - 매장별 페이백 승인/거부
  - 해당 매장 사용자 조회

### 4. 고객 (Customer)
- **권한**: 미션 참여 및 페이백 신청
- **기능**:
  - 미션 참여
  - 페이백 신청
  - 개인 정보 관리

## 🗄️ 데이터베이스 구조

### 핵심 테이블

#### 1. `user_roles` - 역할 정의
```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY,
    name VARCHAR(50) UNIQUE,           -- 'super_admin', 'branch_manager', etc.
    display_name VARCHAR(100),         -- '슈퍼 관리자', '지점장', etc.
    description TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### 2. `permissions` - 권한 정의
```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY,
    name VARCHAR(100) UNIQUE,          -- 'users.create', 'missions.approve', etc.
    display_name VARCHAR(200),         -- '사용자 생성', '미션 승인', etc.
    description TEXT,
    resource VARCHAR(100),             -- 'users', 'missions', 'paybacks', etc.
    action VARCHAR(50),                -- 'create', 'read', 'update', 'delete', 'approve', 'reject'
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### 3. `role_permissions` - 역할-권한 매핑
```sql
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY,
    role_id UUID REFERENCES user_roles(id),
    permission_id UUID REFERENCES permissions(id),
    created_at TIMESTAMP,
    UNIQUE(role_id, permission_id)
);
```

#### 4. `user_role_assignments` - 사용자-역할 할당
```sql
CREATE TABLE user_role_assignments (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    role_id UUID REFERENCES user_roles(id),
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, role_id)
);
```

#### 5. `user_branch_permissions` - 지점별 권한
```sql
CREATE TABLE user_branch_permissions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    branch_id UUID REFERENCES branches(id),
    role_id UUID REFERENCES user_roles(id),
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, branch_id, role_id)
);
```

#### 6. `user_store_permissions` - 매장별 권한
```sql
CREATE TABLE user_store_permissions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    store_id BIGINT REFERENCES stores(id),
    role_id UUID REFERENCES user_roles(id),
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, store_id, role_id)
);
```

## 🔐 권한 체계

### 기본 권한 목록

#### 사용자 관리
- `users.create` - 사용자 생성
- `users.read` - 사용자 조회
- `users.update` - 사용자 수정
- `users.delete` - 사용자 삭제

#### 지점 관리
- `branches.create` - 지점 생성
- `branches.read` - 지점 조회
- `branches.update` - 지점 수정
- `branches.delete` - 지점 삭제

#### 매장 관리
- `stores.create` - 매장 생성
- `stores.read` - 매장 조회
- `stores.update` - 매장 수정
- `stores.delete` - 매장 삭제

#### 미션 관리
- `missions.create` - 미션 생성
- `missions.read` - 미션 조회
- `missions.update` - 미션 수정
- `missions.delete` - 미션 삭제
- `missions.approve` - 미션 승인
- `missions.reject` - 미션 반려

#### 페이백 관리
- `paybacks.create` - 페이백 생성
- `paybacks.read` - 페이백 조회
- `paybacks.update` - 페이백 수정
- `paybacks.delete` - 페이백 삭제
- `paybacks.approve` - 페이백 승인
- `paybacks.reject` - 페이백 거부

#### 역할 관리
- `roles.create` - 역할 생성
- `roles.read` - 역할 조회
- `roles.update` - 역할 수정
- `roles.delete` - 역할 삭제
- `roles.assign` - 역할 할당

#### 통계 조회
- `statistics.read` - 통계 조회

### 역할별 권한 매핑

#### 슈퍼 관리자
- 모든 권한 보유

#### 지점장
- `users.read`, `users.update`
- `branches.read`, `branches.update`
- `stores.read`, `stores.update`
- `missions.read`, `missions.update`, `missions.approve`, `missions.reject`
- `paybacks.read`, `paybacks.update`, `paybacks.approve`, `paybacks.reject`
- `statistics.read`

#### 매장 매니저
- `users.read`
- `stores.read`
- `missions.read`, `missions.approve`, `missions.reject`
- `paybacks.read`, `paybacks.approve`, `paybacks.reject`

#### 고객
- `users.read`, `users.update`
- `missions.read`
- `paybacks.create`, `paybacks.read`

## 🛠️ 구현된 기능

### 1. 권한 확인 함수
```typescript
// 기본 권한 확인
const hasPermission = await checkPermission('missions.approve')

// 리소스별 권한 확인
const canManageBranch = await checkPermission('branches.read', branchId, 'branch')
const canManageStore = await checkPermission('stores.read', storeId, 'store')
```

### 2. 역할 확인 함수
```typescript
// 슈퍼 관리자 확인
const isAdmin = await isSuperAdmin()

// 지점장 확인
const isBranchManager = await isBranchManager(branchId)

// 매장 매니저 확인
const isStoreManager = await isStoreManager(storeId)
```

### 3. 권한 가드 컴포넌트
```typescript
<PermissionGuard
  permission="missions.approve"
  resourceId={missionId}
  resourceType="branch"
  fallback={<div>권한이 없습니다.</div>}
>
  <MissionApprovalForm />
</PermissionGuard>
```

### 4. 역할 관리 페이지
- 사용자별 역할 할당/변경
- 역할별 사용자 필터링
- 실시간 권한 확인

## 🔒 Row Level Security (RLS)

### 사용자 테이블
- 사용자는 자신의 데이터만 조회 가능
- 슈퍼 관리자는 모든 사용자 데이터 조회 가능
- 지점장은 해당 지점 사용자만 조회 가능

### 미션 참여 테이블
- 사용자는 자신의 미션 참여만 조회 가능
- 관리자는 모든 미션 참여 조회 가능

### 페이백 테이블
- 사용자는 자신의 페이백만 조회 가능
- 관리자는 모든 페이백 조회 가능

## 📊 테스트 데이터

### 생성된 테스트 계정
1. **슈퍼 관리자**: 010-0000-0001
2. **강남 지점장**: 010-0000-0002
3. **서초 지점장**: 010-0000-0003
4. **강남 매장 매니저**: 010-0000-0004
5. **일반 고객1**: 010-0000-0005
6. **일반 고객2**: 010-0000-0006

### 테스트 데이터 생성
```bash
npm run db:role-test-data
```

## 🚀 사용 방법

### 1. 권한 확인
```typescript
import { checkPermission } from '@/lib/services/auth'

// 컴포넌트에서 권한 확인
const canApproveMissions = await checkPermission('missions.approve')
```

### 2. 역할 확인
```typescript
import { isSuperAdmin, isBranchManager } from '@/lib/services/auth'

// 슈퍼 관리자 확인
if (await isSuperAdmin()) {
  // 슈퍼 관리자 전용 기능
}

// 지점장 확인
if (await isBranchManager(branchId)) {
  // 지점장 전용 기능
}
```

### 3. 권한 가드 사용
```typescript
import PermissionGuard from '@/components/auth/PermissionGuard'

<PermissionGuard permission="missions.approve">
  <MissionApprovalButton />
</PermissionGuard>
```

### 4. 역할 관리
- `/admin/roles` 페이지에서 사용자 역할 관리
- 실시간 역할 변경 및 권한 확인

## 🔄 확장 가능성

### 1. 새로운 역할 추가
1. `user_roles` 테이블에 역할 추가
2. `permissions` 테이블에 필요한 권한 추가
3. `role_permissions` 테이블에 역할-권한 매핑
4. TypeScript 타입 업데이트

### 2. 새로운 권한 추가
1. `permissions` 테이블에 권한 추가
2. 필요한 역할에 권한 할당
3. 권한 확인 로직 구현

### 3. 리소스별 권한 확장
- 현재: 지점, 매장별 권한
- 확장 가능: 시간별, 지역별, 기능별 세분화

## 📝 주의사항

1. **권한 확인**: 모든 관리자 기능에서 권한 확인 필수
2. **RLS 정책**: 데이터베이스 레벨에서 추가 보안
3. **세션 관리**: 사용자 인증 상태 확인
4. **에러 처리**: 권한 없음 시 적절한 에러 메시지 표시
5. **성능**: 권한 확인 함수의 캐싱 고려

## 🔧 유지보수

### 정기 점검 사항
1. 권한 매트릭스 검토
2. 사용자 역할 현황 확인
3. RLS 정책 유효성 검증
4. 권한 확인 함수 성능 모니터링

### 백업 및 복구
1. 역할 및 권한 데이터 정기 백업
2. 권한 설정 변경 이력 관리
3. 긴급 권한 복구 절차 수립
