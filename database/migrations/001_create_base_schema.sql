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
