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
