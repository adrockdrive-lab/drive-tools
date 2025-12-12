-- ============================================
-- 드라이빙존 미션 시스템 V2 - 확장 스키마
-- ============================================

-- 기존 테이블 확장

-- 1. users 테이블에 게이미피케이션 필드 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cash_balance INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consecutive_days INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_check_in TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"notifications": true, "sound": true, "theme": "light"}';

-- 2. 레벨 테이블
CREATE TABLE IF NOT EXISTS levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level INTEGER UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  required_xp INTEGER NOT NULL,
  coin_reward INTEGER DEFAULT 0,
  special_badge_id UUID,
  unlock_features JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 경험치 히스토리
CREATE TABLE IF NOT EXISTS xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'mission', 'bonus', 'daily_streak', etc
  source_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 레벨 히스토리
CREATE TABLE IF NOT EXISTS level_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  from_level INTEGER NOT NULL,
  to_level INTEGER NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 뱃지 시스템
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'mission_master', 'speed_runner', 'social_star', 'attendance', 'hidden'
  icon_url TEXT,
  rarity VARCHAR(20) DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  condition_type VARCHAR(50) NOT NULL, -- 'count', 'streak', 'time_based', 'combination'
  condition_data JSONB NOT NULL,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 사용자 뱃지 (획득한 뱃지)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 7. 랭킹 스냅샷 (캐싱용)
CREATE TABLE IF NOT EXISTS rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ranking_type VARCHAR(50) NOT NULL, -- 'overall', 'weekly', 'store', 'speed', 'social'
  score INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  previous_rank INTEGER,
  period VARCHAR(50), -- '2025-W01', '2025-01', etc
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ranking_type, period)
);

-- 8. 일일 미션 템플릿
CREATE TABLE IF NOT EXISTS daily_mission_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'quiz', 'checkin', 'learning', 'social'
  difficulty VARCHAR(20) DEFAULT 'easy', -- 'easy', 'medium', 'hard'
  xp_reward INTEGER DEFAULT 50,
  coin_reward INTEGER DEFAULT 10,
  completion_criteria JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  weight INTEGER DEFAULT 1, -- 랜덤 선택 시 가중치
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 일일 미션 할당
CREATE TABLE IF NOT EXISTS daily_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES daily_mission_templates(id),
  assigned_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'skipped'
  completed_at TIMESTAMP WITH TIME ZONE,
  progress JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, template_id, assigned_date)
);

-- 10. 스토리 챕터
CREATE TABLE IF NOT EXISTS story_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_number INTEGER UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  unlock_condition JSONB, -- null이면 처음부터 오픈, 아니면 이전 챕터 완료 조건
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. 스토리 미션 (기존 missions 테이블 확장)
ALTER TABLE missions ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES story_chapters(id);
ALTER TABLE missions ADD COLUMN IF NOT EXISTS mission_order INTEGER DEFAULT 0;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS unlock_condition JSONB;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 0;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS coin_reward INTEGER DEFAULT 0;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS is_story_mission BOOLEAN DEFAULT false;

-- 12. 친구 관계
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'blocked'
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- 13. 활동 피드
CREATE TABLE IF NOT EXISTS activity_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'level_up', 'badge_unlocked', 'mission_completed', 'friend_added'
  activity_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. 피드 좋아요
CREATE TABLE IF NOT EXISTS activity_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activity_feeds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

-- 15. 피드 댓글
CREATE TABLE IF NOT EXISTS activity_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activity_feeds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. 그룹 챌린지
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES users(id),
  store_id UUID REFERENCES stores(id),
  max_members INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. 그룹 멤버
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- 18. 커뮤니티 게시판
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, -- 'tips', 'review', 'question', 'free'
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  images JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_best BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. 게시물 좋아요
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 20. 게시물 댓글
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES post_comments(id), -- 대댓글
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 21. 신고 (기존 reports 확장)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_id UUID REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL, -- 'spam', 'abuse', 'inappropriate', 'fraud', 'other'
  target_type VARCHAR(50), -- 'user', 'post', 'comment'
  target_id UUID,
  description TEXT NOT NULL,
  evidence JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- 22. 이벤트
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL, -- 'mission', 'reward', 'ranking', 'special'
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  banner_url TEXT,
  reward_data JSONB,
  participants_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 23. 이벤트 참여
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  reward_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- 24. 알림
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL, -- 'system', 'mission', 'social', 'reward'
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 25. 푸시 알림 로그
CREATE TABLE IF NOT EXISTS push_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  target_type VARCHAR(50) NOT NULL, -- 'all', 'store', 'level', 'custom'
  target_data JSONB,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  recipient_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 26. 아이템 상점
CREATE TABLE IF NOT EXISTS shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  item_type VARCHAR(50) NOT NULL, -- 'avatar', 'theme', 'booster', 'skip'
  price_coins INTEGER NOT NULL,
  item_data JSONB,
  is_available BOOLEAN DEFAULT true,
  stock INTEGER, -- null이면 무제한
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 27. 사용자 아이템
CREATE TABLE IF NOT EXISTS user_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES shop_items(id),
  quantity INTEGER DEFAULT 1,
  is_equipped BOOLEAN DEFAULT false,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 28. 코인 히스토리
CREATE TABLE IF NOT EXISTS coin_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- 양수면 획득, 음수면 사용
  transaction_type VARCHAR(50) NOT NULL, -- 'earned', 'spent', 'refund'
  source VARCHAR(50) NOT NULL, -- 'mission', 'levelup', 'shop', 'event'
  source_id UUID,
  description TEXT,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 29. 페이백 히스토리 (기존 paybacks 확장)
ALTER TABLE paybacks ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE paybacks ADD COLUMN IF NOT EXISTS account_number VARCHAR(100);
ALTER TABLE paybacks ADD COLUMN IF NOT EXISTS account_holder VARCHAR(100);
ALTER TABLE paybacks ADD COLUMN IF NOT EXISTS tax_amount INTEGER DEFAULT 0;
ALTER TABLE paybacks ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE paybacks ADD COLUMN IF NOT EXISTS evidence_urls JSONB DEFAULT '[]';

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level);
CREATE INDEX IF NOT EXISTS idx_xp_history_user_id ON xp_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_rankings_type_period ON rankings(ranking_type, period);
CREATE INDEX IF NOT EXISTS idx_daily_missions_user_date ON daily_missions(user_id, assigned_date);
CREATE INDEX IF NOT EXISTS idx_missions_chapter ON missions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feeds_user_id ON activity_feeds(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, is_read);

-- RLS 정책

-- xp_history
ALTER TABLE xp_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own xp history" ON xp_history FOR SELECT USING (auth.uid() = user_id);

-- level_history
ALTER TABLE level_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own level history" ON level_history FOR SELECT USING (auth.uid() = user_id);

-- badges (모두 읽기 가능)
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (true);

-- user_badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);

-- daily_missions
ALTER TABLE daily_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own daily missions" ON daily_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own daily missions" ON daily_missions FOR UPDATE USING (auth.uid() = user_id);

-- friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own friendships" ON friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can create friendships" ON friendships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own friendships" ON friendships FOR UPDATE USING (auth.uid() = user_id);

-- activity_feeds
ALTER TABLE activity_feeds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view public feeds or own feeds" ON activity_feeds FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can create own feeds" ON activity_feeds FOR INSERT WITH CHECK (auth.uid() = user_id);

-- community_posts
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON community_posts FOR DELETE USING (auth.uid() = user_id);

-- notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- shop_items (모두 읽기 가능)
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view shop items" ON shop_items FOR SELECT USING (is_available = true);

-- user_items
ALTER TABLE user_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own items" ON user_items FOR SELECT USING (auth.uid() = user_id);

-- coin_history
ALTER TABLE coin_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own coin history" ON coin_history FOR SELECT USING (auth.uid() = user_id);

-- 초기 데이터 삽입

-- 레벨 1-100 데이터
INSERT INTO levels (level, title, required_xp, coin_reward) VALUES
(1, '새내기 드라이버', 0, 10),
(2, '초보 운전자', 100, 20),
(3, '연습생', 200, 30),
(4, '열정맨', 300, 40),
(5, '도전자', 400, 50),
(10, '초보 탈출', 1000, 100),
(20, '도로 위의 신인', 3000, 200),
(30, '안전 운전자', 6000, 300),
(50, '베테랑 드라이버', 15000, 500),
(100, '운전 마스터', 50000, 1000)
ON CONFLICT (level) DO NOTHING;

-- 스토리 챕터
INSERT INTO story_chapters (chapter_number, title, description) VALUES
(1, '시작의 발걸음', '운전의 첫 걸음을 내딛으세요'),
(2, '학습의 시작', '본격적인 학습을 시작합니다'),
(3, '도전과 성장', '실력을 키우고 성장하세요'),
(4, '합격의 문턱', '합격을 향해 달려갑니다'),
(5, '합격 축하', '축하합니다! 합격하셨습니다'),
(6, '전문가의 길', '이제 전문가가 되어보세요')
ON CONFLICT (chapter_number) DO NOTHING;

-- 기본 뱃지
INSERT INTO badges (name, description, category, icon_url, rarity, condition_type, condition_data) VALUES
('첫 발걸음', '첫 미션을 완료했습니다', 'mission_master', '/badges/first-mission.svg', 'bronze', 'count', '{"event": "MISSION_COMPLETED", "threshold": 1}'),
('미션 마스터 I', '미션 10개를 완료했습니다', 'mission_master', '/badges/master-1.svg', 'silver', 'count', '{"event": "MISSION_COMPLETED", "threshold": 10}'),
('미션 마스터 II', '미션 50개를 완료했습니다', 'mission_master', '/badges/master-2.svg', 'gold', 'count', '{"event": "MISSION_COMPLETED", "threshold": 50}'),
('출석왕 I', '7일 연속 출석했습니다', 'attendance', '/badges/streak-7.svg', 'silver', 'streak', '{"type": "daily_checkin", "threshold": 7}'),
('출석왕 II', '30일 연속 출석했습니다', 'attendance', '/badges/streak-30.svg', 'gold', 'streak', '{"type": "daily_checkin", "threshold": 30}'),
('소셜 스타 I', 'SNS에 첫 공유를 했습니다', 'social_star', '/badges/social-1.svg', 'bronze', 'count', '{"event": "SNS_SHARED", "threshold": 1}'),
('친구왕', '친구 10명을 초대했습니다', 'social_star', '/badges/friend-master.svg', 'gold', 'count', '{"event": "FRIEND_INVITED", "threshold": 10}'),
('스피드 러너', '14시간 내 합격했습니다', 'speed_runner', '/badges/speed.svg', 'platinum', 'time_based', '{"max_hours": 14}'),
('심야학습자', '자정 이후에 미션을 완료했습니다', 'hidden', '/badges/midnight.svg', 'silver', 'time_based', '{"hour_min": 0, "hour_max": 6}'),
('얼리버드', '오전 6시 이전에 체크인했습니다', 'hidden', '/badges/earlybird.svg', 'silver', 'time_based', '{"hour_max": 6}')
ON CONFLICT DO NOTHING;

-- 일일 미션 템플릿
INSERT INTO daily_mission_templates (title, description, category, difficulty, xp_reward, coin_reward, completion_criteria) VALUES
('교통법규 OX 퀴즈', '오늘의 교통법규 퀴즈를 풀어보세요', 'quiz', 'easy', 50, 10, '{"type": "quiz", "count": 5}'),
('학원 체크인', '오늘도 학원에 출석했나요?', 'checkin', 'easy', 30, 5, '{"type": "checkin"}'),
('교육 영상 시청', '안전운전 교육 영상을 시청하세요', 'learning', 'medium', 80, 15, '{"type": "video", "duration_min": 5}'),
('친구에게 응원 보내기', '친구에게 응원 메시지를 보내세요', 'social', 'easy', 40, 10, '{"type": "send_cheer"}'),
('학습 일지 작성', '오늘 배운 내용을 기록하세요', 'learning', 'medium', 70, 12, '{"type": "diary", "min_length": 50}')
ON CONFLICT DO NOTHING;

-- 상점 아이템
INSERT INTO shop_items (name, description, item_type, price_coins, item_data) VALUES
('프로필 테마: 스포츠카', '멋진 스포츠카 테마', 'theme', 500, '{"theme": "sports_car", "color": "#ff0000"}'),
('XP 부스터 (1시간)', '1시간 동안 XP 2배', 'booster', 300, '{"type": "xp_booster", "multiplier": 2, "duration_hours": 1}'),
('미션 스킵권', '일일 미션 1개를 스킵할 수 있습니다', 'skip', 100, '{"type": "mission_skip", "count": 1}'),
('프리미엄 아바타 1', '특별한 아바타로 꾸며보세요', 'avatar', 200, '{"avatar_url": "/avatars/premium-1.png"}'),
('프리미엄 아바타 2', '특별한 아바타로 꾸며보세요', 'avatar', 200, '{"avatar_url": "/avatars/premium-2.png"}')
ON CONFLICT DO NOTHING;
