# 데이터베이스 마이그레이션 실행 가이드

## 빠른 시작 (Supabase Dashboard 사용)

가장 쉽고 확실한 방법입니다:

1. **Supabase Dashboard 접속**
   - URL: https://supabase.com/dashboard
   - 프로젝트: `rhofpgbzunxgmcjcoxex`

2. **SQL Editor 열기**
   - 좌측 메뉴에서 `SQL Editor` 클릭
   - 또는 직접 링크: https://supabase.com/dashboard/project/rhofpgbzunxgmcjcoxex/sql

3. **마이그레이션 실행**
   ```bash
   # 1. 터미널에서 파일 내용 복사
   cat database/complete_migration.sql | pbcopy

   # 2. SQL Editor에 붙여넣기 (Cmd+V)
   # 3. RUN 버튼 클릭 또는 Cmd+Enter
   ```

4. **결과 확인**
   - 성공 메시지 확인
   - `Table Editor`에서 생성된 테이블 확인

## 생성되는 데이터베이스 구조

### 📋 테이블 (총 14개)

#### 관리자 & 지점
- ✅ `stores` - 학원 지점 정보 (3개 초기 데이터)
- ✅ `admin_users` - 관리자 계정

#### 사용자 & 게이미피케이션
- ✅ `users` - 사용자 기본 정보
- ✅ `levels` - 레벨 정의 (100레벨, 12개 초기 데이터)
- ✅ `badges` - 뱃지 정의 (16개 초기 데이터)
- ✅ `user_badges` - 사용자 획득 뱃지
- ✅ `xp_history` - 경험치 획득/차감 내역
- ✅ `coins_history` - 코인 획득/사용 내역

#### 미션 시스템
- ✅ `mission_definitions` - 미션 템플릿 (13개 초기 데이터)
  - 스토리 미션 5개 (챕터 1-2)
  - 일일 미션 템플릿 8개
- ✅ `daily_mission_assignments` - 일일 미션 할당
- ✅ `mission_participations` - 미션 참여/진행 상황
- ✅ `mission_progress_events` - 미션 진행 이벤트 로그

### 🔧 함수 & 트리거
- `update_updated_at_column()` - updated_at 자동 갱신
- `generate_referral_code()` - 추천 코드 자동 생성
- 각 테이블별 updated_at 트리거

### 📊 초기 데이터

#### 지점 (3개)
- 드라이빙존 강남점 (GANGNAM)
- 드라이빙존 홍대점 (HONGDAE)
- 드라이빙존 판교점 (PANGYO)

#### 레벨 (12개)
```
레벨 1: 새내기 드라이버 (0 XP)
레벨 2: 초보 드라이버 (100 XP)
레벨 3: 견습 드라이버 (250 XP)
...
레벨 100: 레전드 드라이버 (100,000 XP)
```

#### 뱃지 (16개)
- **미션**: welcome, mission-10, mission-50, mission-100
- **스피드**: speed-14h, speed-12h
- **출석**: streak-7, streak-30, streak-100
- **소셜**: social-share-1, social-share-10, referral-1, referral-10
- **히든**: night-owl, early-bird, perfectionist

#### 스토리 미션 (5개)

**챕터 1: 시작의 발걸음**
1. 수강 카드 등록 (200 XP, 100 코인)
2. 프로필 완성하기 (150 XP, 80 코인)
3. 첫 친구 추천하기 (500 XP, 300 코인)

**챕터 2: 학습의 시작**
1. 교육 시간 10시간 달성 (800 XP, 500 코인)
2. 학과 시험 합격 인증 (1,000 XP, 700 코인, 5,000 캐시)

#### 일일 미션 템플릿 (8개)
- 퀴즈: 교통법규 OX 퀴즈, 표지판 맞히기
- 체크인: 아침 체크인, 저녁 체크인
- 학습: 안전운전 영상 시청, 학습 노트 작성
- 소셜: 친구에게 응원 보내기, 게시글 좋아요 3개

## 확인 쿼리

마이그레이션 완료 후 SQL Editor에서 다음 쿼리를 실행하여 확인:

```sql
-- 1. 생성된 테이블 목록
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. 레벨 데이터 확인
SELECT level, title, required_xp FROM levels ORDER BY level;

-- 3. 뱃지 데이터 확인
SELECT id, name, category, rarity FROM badges ORDER BY category;

-- 4. 지점 데이터 확인
SELECT name, code FROM stores;

-- 5. 스토리 미션 확인
SELECT chapter_id, chapter_order, mission_order, title, difficulty
FROM mission_definitions
WHERE type = 'story'
ORDER BY chapter_order, mission_order;

-- 6. 일일 미션 템플릿 확인
SELECT category, title, difficulty
FROM mission_definitions
WHERE type = 'daily'
ORDER BY category;
```

## 다음 단계

마이그레이션 완료 후:

```bash
# 1. 테스트 사용자 및 미션 데이터 생성
npm run db:test-data

# 2. 관리자 계정 생성
npm run db:admin-accounts

# 3. 개발 서버 시작
npm run dev
```

## 문제 해결

### "relation already exists" 오류

기존 테이블이 있는 경우입니다. 선택:

**A. 기존 데이터 유지** (권장)
- 마이그레이션 스크립트가 `CREATE TABLE IF NOT EXISTS`를 사용하므로 자동으로 건너뜁니다
- 새로운 테이블만 생성됩니다

**B. 전체 초기화** (주의: 모든 데이터 삭제!)
```sql
-- SQL Editor에서 실행
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- 이후 마이그레이션 다시 실행
```

### 권한 오류

Supabase Dashboard를 사용하면 자동으로 올바른 권한으로 실행됩니다.

## 대체 방법

### Node.js 스크립트 사용

데이터베이스 비밀번호가 필요합니다:

```bash
# 실행
npm run db:migrate

# 비밀번호 입력 프롬프트가 나타남
# Supabase Dashboard > Settings > Database에서 확인
```

### 파일 경로
- 통합 마이그레이션: `database/complete_migration.sql`
- 개별 마이그레이션: `database/migrations/00*.sql`
- 상세 가이드: `database/README.md`

---

**참고**: 프로젝트 전체 명세는 `plans/driving-zone-mission-v2.md`를 참조하세요.
