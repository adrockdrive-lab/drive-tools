-- =====================================================
-- 드라이빙존 미션 시스템 V2 - 관리자 및 지점 스키마
-- =====================================================

BEGIN;

-- =====================================================
-- 1. STORES TABLE (지점)
-- =====================================================
CREATE TABLE IF NOT EXISTS stores (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  address TEXT,
  phone VARCHAR(15),
  manager_name VARCHAR(50),
  manager_phone VARCHAR(15),

  -- 설정
  is_active BOOLEAN DEFAULT true,
  max_capacity INTEGER,
  operating_hours JSONB, -- {monday: {open, close}, ...}

  -- 통계
  total_students INTEGER DEFAULT 0,
  active_students INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_stores_code ON stores(code);
CREATE INDEX idx_stores_active ON stores(is_active) WHERE is_active = true;

COMMENT ON TABLE stores IS '드라이빙존 학원 지점 정보';

-- =====================================================
-- 2. ADMIN_USERS TABLE (관리자)
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name VARCHAR(100) NOT NULL,

  -- 권한
  role VARCHAR(20) NOT NULL DEFAULT 'staff', -- super_admin, admin, staff
  permissions JSONB, -- {missions: {create, edit, delete}, users: {...}}

  -- 소속
  store_id BIGINT REFERENCES stores(id) ON DELETE SET NULL,

  -- 상태
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES admin_users(id)
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_store ON admin_users(store_id);
CREATE INDEX idx_admin_users_active ON admin_users(is_active) WHERE is_active = true;

COMMENT ON TABLE admin_users IS '관리자 계정';

-- updated_at 자동 업데이트 함수 (재사용)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- stores 테이블 updated_at 트리거
CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- admin_users 테이블 updated_at 트리거
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 초기 데이터 삽입
-- =====================================================

-- 기본 지점 데이터
INSERT INTO stores (name, code, address, phone, is_active) VALUES
  ('드라이빙존 강남점', 'GANGNAM', '서울시 강남구', '02-1234-5678', true),
  ('드라이빙존 홍대점', 'HONGDAE', '서울시 마포구', '02-2345-6789', true),
  ('드라이빙존 판교점', 'PANGYO', '경기도 성남시', '031-3456-7890', true);

COMMIT;

-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ 관리자 및 지점 스키마 생성 완료';
  RAISE NOTICE '   - stores 테이블 생성 (3개 지점 데이터)';
  RAISE NOTICE '   - admin_users 테이블 생성';
  RAISE NOTICE '   - 트리거 및 함수 생성';
END $$;
-- =====================================================
-- 드라이빙존 미션 시스템 V2 - 기본 스키마 생성
-- =====================================================

BEGIN;

-- =====================================================
-- 1. USERS TABLE (사용자)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  -- 기본 정보
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  nickname VARCHAR(20) UNIQUE,
  phone VARCHAR(15) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE,
  phone_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,

  -- 프로필
  profile_picture_url TEXT,
  bio TEXT,

  -- 게이미피케이션
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 100),
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  coins INTEGER DEFAULT 0 CHECK (coins >= 0),
  cash_balance INTEGER DEFAULT 0 CHECK (cash_balance >= 0),

  -- 출석
  consecutive_days INTEGER DEFAULT 0,
  last_attendance_date DATE,
  total_attendance_days INTEGER DEFAULT 0,

  -- 지점 정보
  store_id BIGINT REFERENCES stores(id) ON DELETE SET NULL,

  -- 추천 시스템
  referral_code VARCHAR(6) UNIQUE NOT NULL,
  referred_by UUID REFERENCES users(id) ON DELETE SET NULL,
  referral_bonus_claimed BOOLEAN DEFAULT false,

  -- 소셜
  friends_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,

  -- 통계
  total_missions_completed INTEGER DEFAULT 0,
  total_missions_started INTEGER DEFAULT 0,
  badges_count INTEGER DEFAULT 0,

  -- 설정
  notifications_enabled BOOLEAN DEFAULT true,
  marketing_agreed BOOLEAN DEFAULT false,

  -- 상태
  is_active BOOLEAN DEFAULT true,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  banned_until TIMESTAMPTZ,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,

  -- 제약조건
  CONSTRAINT users_phone_format CHECK (phone ~ '^\d{10,11}$')
);

-- 인덱스
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_store_id ON users(store_id) WHERE store_id IS NOT NULL;
CREATE INDEX idx_users_level ON users(level DESC);
CREATE INDEX idx_users_xp ON users(xp DESC);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_active ON users(is_active, level DESC, xp DESC) WHERE is_active = true;

COMMENT ON TABLE users IS '사용자 기본 정보 및 게이미피케이션 데이터';

-- =====================================================
-- 2. LEVELS TABLE (레벨 정의)
-- =====================================================
CREATE TABLE IF NOT EXISTS levels (
  level INTEGER PRIMARY KEY CHECK (level >= 1 AND level <= 100),
  title VARCHAR(100) NOT NULL,
  required_xp INTEGER NOT NULL CHECK (required_xp >= 0),
  color VARCHAR(7), -- HEX color code
  icon_url TEXT,
  rewards JSONB, -- {coins, badges, perks}
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE levels IS '레벨별 요구 XP 및 보상 정의';

-- 레벨 데이터 삽입
INSERT INTO levels (level, title, required_xp, color, rewards, description) VALUES
  (1, '새내기 드라이버', 0, '#94a3b8', '{"coins": 0}', '드라이빙존에 오신 것을 환영합니다!'),
  (2, '초보 드라이버', 100, '#94a3b8', '{"coins": 20}', '첫 걸음을 뗐습니다'),
  (3, '견습 드라이버', 250, '#94a3b8', '{"coins": 30}', '조금씩 익숙해지고 있어요'),
  (5, '안전 운전자 입문', 500, '#3b82f6', '{"coins": 50}', '안전 운전의 기초를 다졌습니다'),
  (10, '초보 탈출', 1500, '#3b82f6', '{"coins": 100, "badges": ["level-10"]}', '더 이상 초보가 아닙니다!'),
  (15, '중급 드라이버', 2500, '#3b82f6', '{"coins": 150}', '중급 실력을 갖췄습니다'),
  (20, '도로 위의 신인', 4000, '#10b981', '{"coins": 200}', '도로에서 자신감이 생겼습니다'),
  (30, '안전 운전자', 8000, '#10b981', '{"coins": 300}', '안전 운전의 달인'),
  (40, '숙련된 드라이버', 12000, '#f59e0b', '{"coins": 400}', '많은 경험을 쌓았습니다'),
  (50, '베테랑 드라이버', 20000, '#f59e0b', '{"coins": 500, "badges": ["veteran"]}', '베테랑의 경지에 올랐습니다'),
  (75, '마스터 드라이버', 50000, '#8b5cf6', '{"coins": 750, "badges": ["master"]}', '운전의 달인'),
  (100, '레전드 드라이버', 100000, '#8b5cf6', '{"coins": 1000, "badges": ["legend"]}', '전설이 되었습니다!');

-- =====================================================
-- 3. XP_HISTORY TABLE (경험치 내역)
-- =====================================================
CREATE TABLE IF NOT EXISTS xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- MISSION_COMPLETED, DAILY_MISSION, BONUS, etc.
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  source_type VARCHAR(50), -- mission, daily_mission, referral, etc.
  source_id UUID,
  metadata JSONB, -- {mission_name, bonuses: [{type, amount}]}
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_xp_history_user_id ON xp_history(user_id, created_at DESC);
CREATE INDEX idx_xp_history_created_at ON xp_history(created_at DESC);
CREATE INDEX idx_xp_history_type ON xp_history(type);

COMMENT ON TABLE xp_history IS '사용자의 경험치 획득/차감 내역';

-- =====================================================
-- 4. BADGES TABLE (뱃지 정의)
-- =====================================================
CREATE TABLE IF NOT EXISTS badges (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- mission, speed, social, attendance, hidden
  rarity VARCHAR(20) NOT NULL, -- bronze, silver, gold, platinum
  icon_url TEXT NOT NULL,
  acquisition_condition JSONB NOT NULL, -- {type, threshold, filters}
  is_active BOOLEAN DEFAULT true,
  is_hidden BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_badges_category ON badges(category);
CREATE INDEX idx_badges_rarity ON badges(rarity);
CREATE INDEX idx_badges_active ON badges(is_active) WHERE is_active = true;

COMMENT ON TABLE badges IS '모든 뱃지 정의';

-- 뱃지 데이터 삽입
INSERT INTO badges (id, name, description, category, rarity, icon_url, acquisition_condition, is_hidden) VALUES
  ('welcome', '웰컴 뱃지', '드라이빙존에 오신 것을 환영합니다!', 'mission', 'bronze', '/badges/welcome.svg', '{"type": "AUTO", "event": "SIGNUP"}', false),
  ('mission-10', '미션 초보 탈출', '미션 10개를 완료했습니다', 'mission', 'bronze', '/badges/mission-10.svg', '{"type": "COUNT", "event": "MISSION_COMPLETED", "threshold": 10}', false),
  ('mission-50', '미션 중독자', '미션 50개를 완료했습니다', 'mission', 'silver', '/badges/mission-50.svg', '{"type": "COUNT", "event": "MISSION_COMPLETED", "threshold": 50}', false),
  ('mission-100', '미션 마스터', '미션 100개를 완료했습니다', 'mission', 'gold', '/badges/mission-100.svg', '{"type": "COUNT", "event": "MISSION_COMPLETED", "threshold": 100}', false),
  ('speed-14h', '스피드 마스터', '14시간 내 합격했습니다', 'speed', 'gold', '/badges/speed-14h.svg', '{"type": "CONDITION", "field": "learningHours", "operator": "<=", "value": 14}', false),
  ('speed-12h', '번개 같은 합격', '12시간 내 합격했습니다', 'speed', 'platinum', '/badges/speed-12h.svg', '{"type": "CONDITION", "field": "learningHours", "operator": "<=", "value": 12}', false),
  ('streak-7', '출석왕', '7일 연속 출석했습니다', 'attendance', 'silver', '/badges/streak-7.svg', '{"type": "STREAK", "threshold": 7}', false),
  ('streak-30', '개근왕', '30일 연속 출석했습니다', 'attendance', 'gold', '/badges/streak-30.svg', '{"type": "STREAK", "threshold": 30}', false),
  ('streak-100', '철인', '100일 연속 출석했습니다', 'attendance', 'platinum', '/badges/streak-100.svg', '{"type": "STREAK", "threshold": 100}', false),
  ('social-share-1', 'SNS 데뷔', '첫 SNS 공유를 완료했습니다', 'social', 'bronze', '/badges/social-share-1.svg', '{"type": "COUNT", "event": "SNS_SHARED", "threshold": 1}', false),
  ('social-share-10', '소셜 스타', 'SNS 10회 공유했습니다', 'social', 'silver', '/badges/social-share-10.svg', '{"type": "COUNT", "event": "SNS_SHARED", "threshold": 10}', false),
  ('referral-1', '친구 초대왕', '친구 1명을 초대했습니다', 'social', 'bronze', '/badges/referral-1.svg', '{"type": "COUNT", "event": "FRIEND_INVITED", "threshold": 1}', false),
  ('referral-10', '인싸', '친구 10명을 초대했습니다', 'social', 'gold', '/badges/referral-10.svg', '{"type": "COUNT", "event": "FRIEND_INVITED", "threshold": 10}', false),
  ('night-owl', '올빼미', '자정 이후 미션을 완료했습니다', 'hidden', 'silver', '/badges/night-owl.svg', '{"type": "TIME", "start": "00:00", "end": "06:00"}', true),
  ('early-bird', '얼리버드', '오전 6시 이전 체크인했습니다', 'hidden', 'silver', '/badges/early-bird.svg', '{"type": "TIME", "start": "00:00", "end": "06:00"}', true),
  ('perfectionist', '완벽주의자', '모든 미션을 100% 완료했습니다', 'hidden', 'platinum', '/badges/perfectionist.svg', '{"type": "PERFECT_COMPLETION"}', true);

-- =====================================================
-- 5. USER_BADGES TABLE (사용자 뱃지)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id VARCHAR(50) NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  progress JSONB, -- 진행률 정보

  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id, earned_at DESC);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);

COMMENT ON TABLE user_badges IS '사용자가 획득한 뱃지';

-- =====================================================
-- 6. COINS_HISTORY TABLE (코인 내역)
-- =====================================================
CREATE TABLE IF NOT EXISTS coins_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- EARNED, SPENT, BONUS, REFUND
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  source_type VARCHAR(50),
  source_id UUID,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_coins_history_user_id ON coins_history(user_id, created_at DESC);
CREATE INDEX idx_coins_history_type ON coins_history(type);

COMMENT ON TABLE coins_history IS '코인 획득/사용 내역';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- users 테이블 updated_at 트리거
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 추천 코드 자동 생성 함수
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  code VARCHAR(6);
  exists BOOLEAN;
BEGIN
  LOOP
    -- 6자리 영숫자 코드 생성
    code := UPPER(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));

    -- 중복 체크
    SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = code) INTO exists;

    IF NOT exists THEN
      NEW.referral_code := code;
      EXIT;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- users 테이블 referral_code 자동 생성 트리거
CREATE TRIGGER generate_users_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW
  WHEN (NEW.referral_code IS NULL)
  EXECUTE FUNCTION generate_referral_code();

COMMIT;

-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ 기본 스키마 생성 완료';
  RAISE NOTICE '   - users 테이블 생성';
  RAISE NOTICE '   - levels 테이블 생성 (12개 레벨 데이터)';
  RAISE NOTICE '   - badges 테이블 생성 (16개 뱃지 데이터)';
  RAISE NOTICE '   - xp_history, user_badges, coins_history 테이블 생성';
  RAISE NOTICE '   - 트리거 및 함수 생성';
END $$;
-- =====================================================
-- 드라이빙존 미션 시스템 V2 - 미션 스키마
-- =====================================================

BEGIN;

-- =====================================================
-- 1. MISSION_DEFINITIONS TABLE (미션 정의)
-- =====================================================
CREATE TABLE IF NOT EXISTS mission_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL, -- daily, story, challenge, social
  category VARCHAR(50), -- quiz, checkin, learning, social, challenge
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,

  -- 스토리 미션
  chapter_id VARCHAR(20), -- chapter-1, chapter-2, etc.
  chapter_title VARCHAR(100),
  chapter_order INTEGER,
  mission_order INTEGER, -- 챕터 내 순서

  -- 난이도 및 보상
  difficulty VARCHAR(20), -- easy, medium, hard
  rewards JSONB NOT NULL, -- {xp, coins, cash, badges}

  -- 조건
  requirements JSONB, -- [{type, description, value}]
  proof_requirements JSONB, -- [{type, description, required}]
  unlock_conditions JSONB, -- {type, mission_id}

  -- 기간 제한
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  duration_hours INTEGER, -- 완료 제한 시간

  -- 상태
  is_active BOOLEAN DEFAULT true,
  is_global BOOLEAN DEFAULT true, -- 전체 지점
  store_id BIGINT REFERENCES stores(id),

  -- 메타
  icon_url TEXT,
  image_url TEXT,
  tags TEXT[],
  tips TEXT[],

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES admin_users(id)
);

CREATE INDEX idx_mission_definitions_type ON mission_definitions(type);
CREATE INDEX idx_mission_definitions_chapter ON mission_definitions(chapter_id, mission_order);
CREATE INDEX idx_mission_definitions_active ON mission_definitions(is_active) WHERE is_active = true;
CREATE INDEX idx_mission_definitions_store ON mission_definitions(store_id) WHERE store_id IS NOT NULL;

COMMENT ON TABLE mission_definitions IS '모든 미션의 템플릿 정의';

-- updated_at 트리거
CREATE TRIGGER update_mission_definitions_updated_at
  BEFORE UPDATE ON mission_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. DAILY_MISSION_ASSIGNMENTS TABLE (일일 미션 할당)
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_mission_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES mission_definitions(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, expired
  completed_at TIMESTAMPTZ,
  rewards_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, mission_id, date)
);

CREATE INDEX idx_daily_mission_assignments_user_date ON daily_mission_assignments(user_id, date DESC);
CREATE INDEX idx_daily_mission_assignments_status ON daily_mission_assignments(status);
CREATE INDEX idx_daily_mission_assignments_pending ON daily_mission_assignments(user_id, status)
  WHERE status = 'pending';

COMMENT ON TABLE daily_mission_assignments IS '사용자별 일일 미션 할당';

-- =====================================================
-- 3. MISSION_PARTICIPATIONS TABLE (미션 참여)
-- =====================================================
CREATE TABLE IF NOT EXISTS mission_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES mission_definitions(id) ON DELETE CASCADE,

  -- 상태
  status VARCHAR(20) DEFAULT 'not_started',
    -- not_started, in_progress, completed, pending_review, approved, rejected

  -- 진행
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,

  -- 증빙
  proof_data JSONB, -- 사용자가 제출한 증빙 데이터

  -- 진행률
  progress JSONB, -- {current, required, percentage, milestones}

  -- 보상
  rewards_xp INTEGER,
  rewards_coins INTEGER,
  rewards_cash INTEGER,
  rewards_claimed BOOLEAN DEFAULT false,

  -- 리뷰
  reviewed_by UUID REFERENCES admin_users(id),
  rejection_reason TEXT,
  admin_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, mission_id)
);

CREATE INDEX idx_mission_participations_user_id ON mission_participations(user_id, created_at DESC);
CREATE INDEX idx_mission_participations_mission_id ON mission_participations(mission_id);
CREATE INDEX idx_mission_participations_status ON mission_participations(status);
CREATE INDEX idx_mission_participations_pending ON mission_participations(status, created_at DESC)
  WHERE status = 'pending_review';
CREATE INDEX idx_mission_participations_user_status ON mission_participations(user_id, status);

COMMENT ON TABLE mission_participations IS '사용자의 미션 참여 및 진행 상황';

-- updated_at 트리거
CREATE TRIGGER update_mission_participations_updated_at
  BEFORE UPDATE ON mission_participations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. MISSION_PROGRESS_EVENTS TABLE (미션 진행 이벤트)
-- =====================================================
CREATE TABLE IF NOT EXISTS mission_progress_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participation_id UUID NOT NULL REFERENCES mission_participations(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- checkin, quiz_completed, upload, etc.
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mission_progress_events_participation ON mission_progress_events(participation_id, created_at);
CREATE INDEX idx_mission_progress_events_type ON mission_progress_events(event_type);

COMMENT ON TABLE mission_progress_events IS '미션 진행 과정의 이벤트 로그';

-- =====================================================
-- 초기 미션 데이터 삽입
-- =====================================================

-- 스토리 미션 - 챕터 1: 시작의 발걸음
INSERT INTO mission_definitions (type, category, chapter_id, chapter_title, chapter_order, mission_order, title, description, long_description, difficulty, rewards, requirements, icon_url, tags, tips) VALUES
(
  'story',
  'registration',
  'chapter-1',
  '시작의 발걸음',
  1,
  1,
  '수강 카드 등록',
  '나의 수강 정보를 등록하세요',
  '드라이빙존 미션 시스템에 오신 것을 환영합니다! 첫 번째 미션으로 수강 카드를 등록하고 여정을 시작하세요.',
  'easy',
  '{"xp": 200, "coins": 100}',
  '[{"type": "profile_complete", "description": "프로필 완성하기", "value": 1}]',
  '/missions/registration.svg',
  ARRAY['온보딩', '시작'],
  ARRAY['프로필 정보를 정확히 입력해주세요', '지점 선택을 잊지 마세요']
),
(
  'story',
  'social',
  'chapter-1',
  '시작의 발걸음',
  1,
  2,
  '프로필 완성하기',
  '닉네임과 아바타를 설정하세요',
  '나만의 프로필을 만들어보세요. 닉네임과 아바타를 설정하면 친구들이 나를 쉽게 찾을 수 있습니다.',
  'easy',
  '{"xp": 150, "coins": 80}',
  '[{"type": "nickname_set", "description": "닉네임 설정", "value": 1}, {"type": "avatar_set", "description": "아바타 설정", "value": 1}]',
  '/missions/profile.svg',
  ARRAY['프로필', '시작'],
  ARRAY['개성있는 닉네임을 지어보세요']
),
(
  'story',
  'social',
  'chapter-1',
  '시작의 발걸음',
  1,
  3,
  '첫 친구 추천하기',
  '친구 1명을 드라이빙존에 초대하세요',
  '함께하면 더 즐거운 드라이빙존! 친구를 초대하고 둘 다 보너스를 받으세요.',
  'medium',
  '{"xp": 500, "coins": 300}',
  '[{"type": "friend_invite", "description": "친구 초대", "value": 1}]',
  '/missions/referral.svg',
  ARRAY['추천', '소셜'],
  ARRAY['추천 링크를 카카오톡으로 공유하세요', '친구가 가입하면 양쪽 모두 보상을 받습니다']
);

-- 스토리 미션 - 챕터 2: 학습의 시작
INSERT INTO mission_definitions (type, category, chapter_id, chapter_title, chapter_order, mission_order, title, description, long_description, difficulty, rewards, requirements, unlock_conditions, icon_url, tags, tips) VALUES
(
  'story',
  'learning',
  'chapter-2',
  '학습의 시작',
  2,
  1,
  '교육 시간 10시간 달성',
  '학원에서 10시간 교육을 받으세요',
  '운전면허 취득을 위해서는 최소 10시간의 교육이 필요합니다. 학원에 출석하여 교육을 받고, 출석 체크를 통해 진행 상황을 기록하세요.',
  'medium',
  '{"xp": 800, "coins": 500}',
  '[{"type": "checkin_count", "description": "학원 체크인", "value": 10}]',
  '{"type": "chapter_completed", "chapter_id": "chapter-1"}',
  '/missions/learning.svg',
  ARRAY['학습', '출석'],
  ARRAY['학원 방문 시 매번 체크인하세요', '교육 시간은 자동으로 기록됩니다']
),
(
  'story',
  'challenge',
  'chapter-2',
  '학습의 시작',
  2,
  2,
  '학과 시험 합격 인증',
  '학과 시험 합격증을 업로드하세요',
  '학과 시험에 합격하고 인증하세요. 합격증 사진을 업로드하면 검증 후 보상을 드립니다.',
  'medium',
  '{"xp": 1000, "coins": 700, "cash": 5000}',
  '[{"type": "image_upload", "description": "합격증 사진", "value": 1}]',
  '{"type": "mission_completed", "mission_id": "previous"}',
  '/missions/test-pass.svg',
  ARRAY['시험', '인증'],
  ARRAY['합격증 사진은 선명하게 찍어주세요']
);

-- 일일 미션 템플릿
INSERT INTO mission_definitions (type, category, title, description, difficulty, rewards, icon_url, tags) VALUES
-- 퀴즈 미션
(
  'daily',
  'quiz',
  '교통법규 OX 퀴즈',
  '교통법규 퀴즈 5문제를 풀어보세요',
  'easy',
  '{"xp": 100, "coins": 50}',
  '/missions/quiz.svg',
  ARRAY['퀴즈', '일일']
),
(
  'daily',
  'quiz',
  '표지판 맞히기',
  '교통 표지판 의미를 맞혀보세요',
  'easy',
  '{"xp": 120, "coins": 60}',
  '/missions/sign.svg',
  ARRAY['퀴즈', '일일']
),

-- 체크인 미션
(
  'daily',
  'checkin',
  '아침 체크인',
  '오전 6-9시에 학원에 체크인하세요',
  'easy',
  '{"xp": 80, "coins": 40}',
  '/missions/morning-checkin.svg',
  ARRAY['체크인', '일일']
),
(
  'daily',
  'checkin',
  '저녁 체크인',
  '오후 6-9시에 학원에 체크인하세요',
  'easy',
  '{"xp": 80, "coins": 40}',
  '/missions/evening-checkin.svg',
  ARRAY['체크인', '일일']
),

-- 학습 미션
(
  'daily',
  'learning',
  '안전운전 영상 시청',
  '3분 안전운전 교육 영상을 시청하세요',
  'easy',
  '{"xp": 150, "coins": 80}',
  '/missions/video.svg',
  ARRAY['학습', '일일']
),
(
  'daily',
  'learning',
  '학습 노트 작성',
  '오늘 배운 내용을 한 줄로 요약하세요',
  'medium',
  '{"xp": 180, "coins": 100}',
  '/missions/note.svg',
  ARRAY['학습', '일일']
),

-- 소셜 미션
(
  'daily',
  'social',
  '친구에게 응원 보내기',
  '친구에게 응원 메시지를 보내세요',
  'easy',
  '{"xp": 100, "coins": 50}',
  '/missions/cheer.svg',
  ARRAY['소셜', '일일']
),
(
  'daily',
  'social',
  '게시글 좋아요 3개',
  '커뮤니티 게시글에 좋아요를 3개 눌러주세요',
  'easy',
  '{"xp": 80, "coins": 40}',
  '/missions/like.svg',
  ARRAY['소셜', '일일']
);

COMMIT;

-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ 미션 스키마 생성 완료';
  RAISE NOTICE '   - mission_definitions 테이블 생성';
  RAISE NOTICE '   - daily_mission_assignments 테이블 생성';
  RAISE NOTICE '   - mission_participations 테이블 생성';
  RAISE NOTICE '   - mission_progress_events 테이블 생성';
  RAISE NOTICE '   - 초기 미션 데이터 삽입 (스토리 5개, 일일 8개)';
END $$;
