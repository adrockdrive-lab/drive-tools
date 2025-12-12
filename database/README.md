# 데이터베이스 마이그레이션 가이드

## 📋 개요

이 디렉토리에는 드라이빙존 미션 시스템 V2의 데이터베이스 스키마 마이그레이션 파일이 포함되어 있습니다.

## 🗂 파일 구조

```
database/
├── migrations/
│   ├── 000_create_admin_schema.sql      # 관리자 및 지점 테이블
│   ├── 001_create_base_schema.sql       # 사용자 및 게이미피케이션 테이블
│   └── 002_create_mission_schema.sql    # 미션 시스템 테이블
├── complete_migration.sql               # 통합 마이그레이션 파일
├── migrate.js                           # PostgreSQL 직접 연결 스크립트
└── README.md                            # 이 파일
```

## 📊 생성되는 테이블

### 관리자 및 지점 (000_create_admin_schema.sql)
- `stores` - 학원 지점 정보
- `admin_users` - 관리자 계정

### 사용자 및 게이미피케이션 (001_create_base_schema.sql)
- `users` - 사용자 기본 정보
- `levels` - 레벨 정의 (100레벨)
- `badges` - 뱃지 정의 (16개 초기 뱃지)
- `user_badges` - 사용자 획득 뱃지
- `xp_history` - 경험치 내역
- `coins_history` - 코인 내역

### 미션 시스템 (002_create_mission_schema.sql)
- `mission_definitions` - 미션 템플릿
- `daily_mission_assignments` - 일일 미션 할당
- `mission_participations` - 미션 참여/진행
- `mission_progress_events` - 미션 진행 이벤트 로그

## 🚀 마이그레이션 실행 방법

### 방법 1: Supabase Dashboard (가장 쉬움 ⭐)

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 (rhofpgbzunxgmcjcoxex)
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. `database/complete_migration.sql` 파일 내용을 복사
5. SQL Editor에 붙여넣기
6. **RUN** 버튼 클릭

### 방법 2: Node.js 스크립트 사용

```bash
# 데이터베이스 비밀번호가 필요합니다
node database/migrate.js
```

비밀번호는 Supabase Dashboard > Settings > Database > Database password에서 확인할 수 있습니다.

### 방법 3: Supabase CLI

```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 연결
supabase link --project-ref rhofpgbzunxgmcjcoxex

# 마이그레이션 실행
supabase db push
```

## ✅ 마이그레이션 확인

마이그레이션이 성공적으로 완료되면 다음을 확인하세요:

1. **테이블 생성 확인**
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

2. **초기 데이터 확인**
   ```sql
   -- 레벨 데이터 (12개)
   SELECT level, title, required_xp FROM levels ORDER BY level;

   -- 뱃지 데이터 (16개)
   SELECT id, name, category, rarity FROM badges ORDER BY category, rarity;

   -- 지점 데이터 (3개)
   SELECT name, code FROM stores;

   -- 스토리 미션 (5개)
   SELECT chapter_id, mission_order, title FROM mission_definitions
   WHERE type = 'story' ORDER BY chapter_order, mission_order;

   -- 일일 미션 템플릿 (8개)
   SELECT category, title FROM mission_definitions
   WHERE type = 'daily' ORDER BY category;
   ```

## 📝 다음 단계

마이그레이션 완료 후:

1. **테스트 데이터 생성**
   ```bash
   npm run db:test-data
   ```

2. **관리자 계정 생성**
   ```bash
   npm run db:admin-accounts
   ```

3. **개발 서버 시작**
   ```bash
   npm run dev
   ```

## 🔧 문제 해결

### 오류: "relation already exists"

테이블이 이미 존재하는 경우입니다. 다음 중 하나를 선택하세요:

1. **기존 데이터 유지하며 새 테이블만 생성**
   - SQL의 `CREATE TABLE IF NOT EXISTS`가 이미 적용되어 있어 자동으로 처리됩니다.

2. **전체 초기화 (주의: 모든 데이터 삭제)**
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   GRANT ALL ON SCHEMA public TO postgres;
   GRANT ALL ON SCHEMA public TO public;
   ```

### 오류: "permission denied"

Service Role Key를 사용해야 합니다:
- `.env.local`의 `SUPABASE_SERVICE_ROLE_KEY` 확인
- Supabase Dashboard > Settings > API > service_role key 사용

## 📚 참고 자료

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- 프로젝트 명세: `plans/driving-zone-mission-v2.md`
- 데이터베이스 스키마: `plans/database-schema.md`
