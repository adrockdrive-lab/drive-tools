# 드라이빙존 미션 시스템 V2 - 데이터베이스 스키마

## 📋 목차
1. [ERD 다이어그램](#1-erd-다이어그램)
2. [사용자 관련 테이블](#2-사용자-관련-테이블)
3. [게이미피케이션 테이블](#3-게이미피케이션-테이블)
4. [미션 관련 테이블](#4-미션-관련-테이블)
5. [소셜 관련 테이블](#5-소셜-관련-테이블)
6. [페이백 관련 테이블](#6-페이백-관련-테이블)
7. [인덱스 전략](#7-인덱스-전략)
8. [마이그레이션 스크립트](#8-마이그레이션-스크립트)

---

## 1. ERD 다이어그램

```
┌─────────────┐
│    users    │──┐
└─────────────┘  │
       │         │
       ├─────────┼─────────────┐
       │         │             │
       ▼         ▼             ▼
┌─────────┐ ┌────────────┐ ┌──────────┐
│ xp_     │ │ user_      │ │ user_    │
│ history │ │ badges     │ │ levels   │
└─────────┘ └────────────┘ └──────────┘
       │
       ▼
┌──────────────────┐
│ mission_         │
│ participations   │
└──────────────────┘
       │
       ▼
┌──────────────┐
│ paybacks     │
└──────────────┘
```

---

## 2. 사용자 관련 테이블

### 2.1 users (사용자)

**설명**: 사용자 기본 정보 및 게이미피케이션 데이터

```sql
CREATE TABLE users (
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

  -- 인덱스
  CONSTRAINT users_phone_format CHECK (phone ~ '^\d{10,11}$')
);

-- 인덱스
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_store_id ON users(store_id);
CREATE INDEX idx_users_level ON users(level DESC);
CREATE INDEX idx_users_xp ON users(xp DESC);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- 업데이트 트리거
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2.2 user_social_accounts (소셜 계정 연동)

**설명**: 사용자의 소셜 로그인 계정 정보

```sql
CREATE TABLE user_social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL, -- google, kakao, naver
  provider_user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  profile_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(provider, provider_user_id),
  UNIQUE(user_id, provider)
);

CREATE INDEX idx_user_social_accounts_user_id ON user_social_accounts(user_id);
CREATE INDEX idx_user_social_accounts_provider ON user_social_accounts(provider, provider_user_id);
```

### 2.3 user_sessions (세션 관리)

**설명**: JWT 토큰 및 세션 관리

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token_hash VARCHAR(64) NOT NULL,
  refresh_token_hash VARCHAR(64) NOT NULL,
  device_info JSONB, -- {platform, os, browser, ip}
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ DEFAULT now(),
  is_revoked BOOLEAN DEFAULT false,

  UNIQUE(access_token_hash),
  UNIQUE(refresh_token_hash)
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_access_token_hash ON user_sessions(access_token_hash);
```

### 2.4 sms_verifications (SMS 인증)

**설명**: SMS 인증 코드 관리

```sql
CREATE TABLE sms_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sms_verifications_phone ON sms_verifications(phone);
CREATE INDEX idx_sms_verifications_expires_at ON sms_verifications(expires_at);

-- 만료된 인증 코드 자동 삭제 (1일 후)
CREATE INDEX idx_sms_verifications_cleanup ON sms_verifications(created_at)
  WHERE verified = false;
```

---

## 3. 게이미피케이션 테이블

### 3.1 levels (레벨 정의)

**설명**: 레벨별 요구 XP 및 보상 정의

```sql
CREATE TABLE levels (
  level INTEGER PRIMARY KEY CHECK (level >= 1 AND level <= 100),
  title VARCHAR(100) NOT NULL,
  required_xp INTEGER NOT NULL CHECK (required_xp >= 0),
  color VARCHAR(7), -- HEX color code
  icon_url TEXT,
  rewards JSONB, -- {coins, badges, perks}
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 샘플 데이터
INSERT INTO levels (level, title, required_xp, color, rewards) VALUES
  (1, '새내기 드라이버', 0, '#94a3b8', '{"coins": 0}'),
  (2, '초보 드라이버', 100, '#94a3b8', '{"coins": 20}'),
  (3, '견습 드라이버', 250, '#94a3b8', '{"coins": 30}'),
  (5, '안전 운전자 입문', 500, '#3b82f6', '{"coins": 50}'),
  (10, '초보 탈출', 1500, '#3b82f6', '{"coins": 100, "badges": ["level-10"]}'),
  (20, '도로 위의 신인', 4000, '#10b981', '{"coins": 200}'),
  (30, '안전 운전자', 8000, '#10b981', '{"coins": 300}'),
  (50, '베테랑 드라이버', 20000, '#f59e0b', '{"coins": 500, "badges": ["veteran"]}'),
  (100, '운전 마스터', 100000, '#8b5cf6', '{"coins": 1000, "badges": ["master"]}');
```

### 3.2 xp_history (경험치 내역)

**설명**: 사용자의 경험치 획득/차감 내역

```sql
CREATE TABLE xp_history (
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
```

### 3.3 badges (뱃지 정의)

**설명**: 모든 뱃지 정의

```sql
CREATE TABLE badges (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- mission, speed, social, attendance, hidden
  rarity VARCHAR(20) NOT NULL, -- bronze, silver, gold, platinum
  icon_url TEXT NOT NULL,
  acquisition_condition JSONB NOT NULL, -- {type, threshold, filters}
  is_active BOOLEAN DEFAULT true,
  is_hidden BOOLEAN DEFAULT false, -- 히든 뱃지
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_badges_category ON badges(category);
CREATE INDEX idx_badges_rarity ON badges(rarity);

-- 샘플 데이터
INSERT INTO badges (id, name, description, category, rarity, icon_url, acquisition_condition) VALUES
  ('welcome', '웰컴 뱃지', '드라이빙존에 오신 것을 환영합니다!', 'mission', 'bronze',
   '/badges/welcome.svg', '{"type": "AUTO", "event": "SIGNUP"}'),
  ('mission-10', '미션 초보 탈출', '미션 10개를 완료했습니다', 'mission', 'bronze',
   '/badges/mission-10.svg', '{"type": "COUNT", "event": "MISSION_COMPLETED", "threshold": 10}'),
  ('speed-14h', '스피드 마스터', '14시간 내 합격했습니다', 'speed', 'gold',
   '/badges/speed-14h.svg', '{"type": "CONDITION", "field": "learningHours", "operator": "<=", "value": 14}'),
  ('streak-7', '출석왕', '7일 연속 출석했습니다', 'attendance', 'silver',
   '/badges/streak-7.svg', '{"type": "STREAK", "threshold": 7}');
```

### 3.4 user_badges (사용자 뱃지)

**설명**: 사용자가 획득한 뱃지

```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id VARCHAR(50) NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  progress JSONB, -- 진행률 정보 (미획득 시)

  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id, earned_at DESC);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
```

### 3.5 rankings (랭킹)

**설명**: 사용자 랭킹 (캐시)

```sql
CREATE TABLE rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- overall, weekly, monthly, store
  rank INTEGER NOT NULL,
  score INTEGER NOT NULL,
  previous_rank INTEGER,
  store_id BIGINT REFERENCES stores(id),
  period_start DATE,
  period_end DATE,
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, type, period_start)
);

CREATE INDEX idx_rankings_type_rank ON rankings(type, rank);
CREATE INDEX idx_rankings_user_id ON rankings(user_id);
CREATE INDEX idx_rankings_store_id ON rankings(store_id) WHERE store_id IS NOT NULL;
```

### 3.6 coins_history (코인 내역)

**설명**: 코인 획득/사용 내역

```sql
CREATE TABLE coins_history (
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
```

---

## 4. 미션 관련 테이블

### 4.1 mission_definitions (미션 정의)

**설명**: 모든 미션의 템플릿 정의

```sql
CREATE TABLE mission_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL, -- daily, story, challenge, social
  category VARCHAR(50), -- quiz, checkin, learning, social
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
```

### 4.2 daily_mission_assignments (일일 미션 할당)

**설명**: 사용자별 일일 미션 할당

```sql
CREATE TABLE daily_mission_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES mission_definitions(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, expired
  completed_at TIMESTAMPTZ,
  rewards_claimed BOOLEAN DEFAULT false,

  UNIQUE(user_id, mission_id, date)
);

CREATE INDEX idx_daily_mission_assignments_user_date ON daily_mission_assignments(user_id, date DESC);
CREATE INDEX idx_daily_mission_assignments_status ON daily_mission_assignments(status);
```

### 4.3 mission_participations (미션 참여)

**설명**: 사용자의 미션 참여 및 진행 상황

```sql
CREATE TABLE mission_participations (
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

CREATE INDEX idx_mission_participations_user_id ON mission_participations(user_id);
CREATE INDEX idx_mission_participations_status ON mission_participations(status);
CREATE INDEX idx_mission_participations_pending ON mission_participations(status)
  WHERE status = 'pending_review';
```

### 4.4 mission_progress_events (미션 진행 이벤트)

**설명**: 미션 진행 과정의 이벤트 로그

```sql
CREATE TABLE mission_progress_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participation_id UUID NOT NULL REFERENCES mission_participations(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- checkin, quiz_completed, upload, etc.
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mission_progress_events_participation ON mission_progress_events(participation_id, created_at);
```

---

## 5. 소셜 관련 테이블

### 5.1 friendships (친구 관계)

**설명**: 사용자 간 친구 관계

```sql
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
  requested_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,

  CHECK (user_id != friend_id),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_friendships_user_id ON friendships(user_id, status);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);
```

### 5.2 activity_feed (활동 피드)

**설명**: 사용자 활동 피드

```sql
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- LEVEL_UP, BADGE_EARNED, MISSION_COMPLETED, etc.
  content JSONB NOT NULL,
  visibility VARCHAR(20) DEFAULT 'friends', -- public, friends, private
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activity_feed_user_id ON activity_feed(user_id, created_at DESC);
CREATE INDEX idx_activity_feed_created_at ON activity_feed(created_at DESC);
```

### 5.3 community_posts (커뮤니티 게시글)

**설명**: 커뮤니티 게시판 게시글

```sql
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, -- tips, reviews, questions, general
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  images TEXT[], -- 이미지 URL 배열
  tags TEXT[],

  -- 통계
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,

  -- 상태
  is_pinned BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_reported BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_community_posts_category ON community_posts(category, created_at DESC);
CREATE INDEX idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_community_posts_popular ON community_posts(likes_count DESC, created_at DESC);
```

### 5.4 community_comments (댓글)

**설명**: 게시글 댓글

```sql
CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_community_comments_post_id ON community_comments(post_id, created_at);
CREATE INDEX idx_community_comments_author_id ON community_comments(author_id);
```

### 5.5 referrals (추천)

**설명**: 친구 추천 내역

```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  referee_name VARCHAR(100),
  referee_phone VARCHAR(15),
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, expired
  bonus_xp INTEGER,
  bonus_coins INTEGER,
  bonus_claimed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referee_id ON referrals(referee_id) WHERE referee_id IS NOT NULL;
```

---

## 6. 페이백 관련 테이블

### 6.1 paybacks (페이백)

**설명**: 현금 페이백 내역

```sql
CREATE TABLE paybacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES mission_definitions(id) ON DELETE SET NULL,

  -- 금액
  amount INTEGER NOT NULL CHECK (amount > 0),

  -- 상태
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, paid

  -- 계좌 정보
  bank_name VARCHAR(50),
  account_number VARCHAR(50),
  account_holder VARCHAR(100),

  -- 처리
  requested_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES admin_users(id),
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  paid_at TIMESTAMPTZ,
  payment_transaction_id VARCHAR(100),

  -- 메타
  admin_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_paybacks_user_id ON paybacks(user_id, created_at DESC);
CREATE INDEX idx_paybacks_status ON paybacks(status);
CREATE INDEX idx_paybacks_pending ON paybacks(status) WHERE status = 'pending';
```

---

## 7. 인덱스 전략

### 7.1 복합 인덱스

```sql
-- 사용자 활동 조회 (자주 사용)
CREATE INDEX idx_users_active_lookup ON users(is_active, level DESC, xp DESC)
  WHERE is_active = true;

-- 미션 참여 현황
CREATE INDEX idx_participations_user_status ON mission_participations(user_id, status, created_at DESC);

-- 랭킹 조회
CREATE INDEX idx_rankings_type_period_rank ON rankings(type, period_start, rank);

-- 일일 미션 조회
CREATE INDEX idx_daily_assignments_user_date_status ON daily_mission_assignments(user_id, date DESC, status);
```

### 7.2 부분 인덱스 (Partial Index)

```sql
-- 활성 미션만
CREATE INDEX idx_mission_definitions_active_type ON mission_definitions(type, chapter_order)
  WHERE is_active = true;

-- 대기 중인 리뷰만
CREATE INDEX idx_participations_pending_review ON mission_participations(created_at DESC)
  WHERE status = 'pending_review';

-- 대기 중인 페이백만
CREATE INDEX idx_paybacks_pending_approval ON paybacks(created_at DESC)
  WHERE status = 'pending';
```

---

## 8. 마이그레이션 스크립트

### 8.1 초기 마이그레이션

```sql
-- 001_create_base_tables.sql
BEGIN;

-- users 테이블 생성
CREATE TABLE users (...);

-- levels 테이블 및 초기 데이터
CREATE TABLE levels (...);
INSERT INTO levels (...) VALUES (...);

-- badges 테이블 및 초기 데이터
CREATE TABLE badges (...);
INSERT INTO badges (...) VALUES (...);

COMMIT;
```

### 8.2 함수 생성

```sql
-- update_updated_at_column.sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- calculate_user_rank.sql
CREATE OR REPLACE FUNCTION calculate_user_rank(p_user_id UUID, p_type VARCHAR)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER;
  v_rank INTEGER;
BEGIN
  -- 사용자 점수 계산
  SELECT (level * 100 + xp) INTO v_score
  FROM users
  WHERE id = p_user_id;

  -- 랭킹 계산
  SELECT COUNT(*) + 1 INTO v_rank
  FROM users
  WHERE (level * 100 + xp) > v_score;

  RETURN v_rank;
END;
$$ LANGUAGE plpgsql;
```

### 8.3 트리거 생성

```sql
-- trigger_update_user_stats.sql
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- 미션 완료 시 카운트 증가
    IF NEW.status = 'completed' THEN
      UPDATE users
      SET total_missions_completed = total_missions_completed + 1
      WHERE id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mission_completed_stats
  AFTER INSERT OR UPDATE ON mission_participations
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();
```

### 8.4 Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE paybacks ENABLE ROW LEVEL SECURITY;

-- Users: 본인 데이터만 조회/수정 가능
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Mission Participations: 본인 참여 내역만
CREATE POLICY participations_select_own ON mission_participations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY participations_insert_own ON mission_participations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Paybacks: 본인 페이백만
CREATE POLICY paybacks_select_own ON paybacks
  FOR SELECT
  USING (auth.uid() = user_id);
```

---

**버전**: 2.0.0
**최종 업데이트**: 2025-01-10
**작성자**: Database Team
