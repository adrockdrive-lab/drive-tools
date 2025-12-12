-- 드라이빙존 미션 시스템 소셜 기능 스키마
-- Phase 4.2 - 소셜 기능 구현

-- ============================================================================
-- 1. 친구 시스템 테이블
-- ============================================================================

-- 친구 관계 테이블
CREATE TABLE IF NOT EXISTS friendships (
    id SERIAL PRIMARY KEY,
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status friendship_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 제약조건: 자기 자신과는 친구 불가, 중복 요청 방지
    CONSTRAINT check_not_self_friend CHECK (requester_id != addressee_id),
    CONSTRAINT unique_friendship UNIQUE (
        LEAST(requester_id, addressee_id), 
        GREATEST(requester_id, addressee_id)
    )
);

-- 친구 상태 타입
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked', 'cancelled');

-- ============================================================================
-- 2. 리더보드 시스템
-- ============================================================================

-- 사용자 통계 테이블 (리더보드용)
CREATE TABLE IF NOT EXISTS user_statistics (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 미션 통계
    total_missions_completed INTEGER DEFAULT 0,
    total_experience_points INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0, -- 연속 미션 완료 일수
    max_streak INTEGER DEFAULT 0,
    
    -- 페이백 통계
    total_payback_earned DECIMAL(10,2) DEFAULT 0,
    total_referrals INTEGER DEFAULT 0,
    
    -- 소셜 통계
    friends_count INTEGER DEFAULT 0,
    likes_received INTEGER DEFAULT 0,
    
    -- 시간 정보
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    weekly_score INTEGER DEFAULT 0, -- 주간 점수
    monthly_score INTEGER DEFAULT 0, -- 월간 점수
    
    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_statistics UNIQUE (user_id)
);

-- ============================================================================
-- 3. 미션 공유 시스템
-- ============================================================================

-- 미션 공유 게시물 테이블
CREATE TABLE IF NOT EXISTS mission_posts (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_participation_id INTEGER REFERENCES mission_participations(id) ON DELETE CASCADE,
    
    -- 게시물 내용
    title VARCHAR(100) NOT NULL,
    content TEXT,
    image_urls TEXT[], -- 이미지 URL 배열
    tags TEXT[], -- 해시태그 배열
    
    -- 공개 설정
    visibility post_visibility DEFAULT 'public',
    
    -- 통계
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    
    -- 메타데이터
    is_featured BOOLEAN DEFAULT FALSE, -- 추천 게시물 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 게시물 공개 설정
CREATE TYPE post_visibility AS ENUM ('public', 'friends', 'private');

-- 게시물 좋아요 테이블
CREATE TABLE IF NOT EXISTS post_likes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER NOT NULL REFERENCES mission_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_post_like UNIQUE (user_id, post_id)
);

-- 게시물 댓글 테이블
CREATE TABLE IF NOT EXISTS post_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES mission_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id INTEGER REFERENCES post_comments(id) ON DELETE CASCADE, -- 대댓글용
    
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 4. 사용자 프로필 확장
-- ============================================================================

-- 사용자 프로필 확장 테이블
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 프로필 정보
    bio TEXT, -- 자기소개
    avatar_url TEXT, -- 프로필 사진 URL
    cover_image_url TEXT, -- 커버 이미지 URL
    location VARCHAR(100), -- 위치
    website_url TEXT, -- 웹사이트
    
    -- 설정
    is_public BOOLEAN DEFAULT TRUE, -- 공개 프로필 여부
    show_achievements BOOLEAN DEFAULT TRUE, -- 업적 공개 여부
    show_statistics BOOLEAN DEFAULT TRUE, -- 통계 공개 여부
    allow_friend_requests BOOLEAN DEFAULT TRUE, -- 친구 요청 허용 여부
    
    -- 소셜 링크
    social_links JSONB DEFAULT '{}', -- SNS 링크들
    
    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- ============================================================================
-- 5. 업적/배지 시스템
-- ============================================================================

-- 업적 정의 테이블
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE, -- 업적 코드
    name VARCHAR(100) NOT NULL, -- 업적 이름
    description TEXT NOT NULL, -- 업적 설명
    icon_url TEXT, -- 업적 아이콘 URL
    category achievement_category DEFAULT 'mission', -- 업적 카테고리
    tier achievement_tier DEFAULT 'bronze', -- 업적 등급
    points INTEGER DEFAULT 0, -- 획득 점수
    requirements JSONB, -- 업적 달성 조건
    is_hidden BOOLEAN DEFAULT FALSE, -- 숨겨진 업적 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 업적 카테고리
CREATE TYPE achievement_category AS ENUM ('mission', 'social', 'streak', 'payback', 'referral', 'special');

-- 업적 등급
CREATE TYPE achievement_tier AS ENUM ('bronze', 'silver', 'gold', 'diamond', 'legendary');

-- 사용자 업적 테이블
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    progress JSONB DEFAULT '{}', -- 진행 상황 데이터
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

-- ============================================================================
-- 6. 알림 시스템 확장 (소셜 알림)
-- ============================================================================

-- 기존 notifications 테이블에 소셜 알림 타입 추가
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'friend_request';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'friend_accepted';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'post_liked';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'post_commented';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'achievement_earned';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'leaderboard_rank';

-- ============================================================================
-- 7. 인덱스 생성
-- ============================================================================

-- 친구 시스템 인덱스
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_friendships_created_at ON friendships(created_at DESC);

-- 사용자 통계 인덱스
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_total_missions ON user_statistics(total_missions_completed DESC);
CREATE INDEX IF NOT EXISTS idx_user_statistics_experience ON user_statistics(total_experience_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_statistics_payback ON user_statistics(total_payback_earned DESC);
CREATE INDEX IF NOT EXISTS idx_user_statistics_weekly_score ON user_statistics(weekly_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_statistics_monthly_score ON user_statistics(monthly_score DESC);

-- 미션 게시물 인덱스
CREATE INDEX IF NOT EXISTS idx_mission_posts_user_id ON mission_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_posts_visibility ON mission_posts(visibility);
CREATE INDEX IF NOT EXISTS idx_mission_posts_created_at ON mission_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mission_posts_likes ON mission_posts(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_mission_posts_featured ON mission_posts(is_featured) WHERE is_featured = TRUE;

-- 좋아요/댓글 인덱스
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);

-- 업적 시스템 인덱스
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_tier ON achievements(tier);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON user_achievements(is_completed);

-- ============================================================================
-- 8. RLS (Row Level Security) 정책
-- ============================================================================

-- 친구 시스템 RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view friendships they are part of" ON friendships
    FOR SELECT USING (
        requester_id = auth.uid() OR 
        addressee_id = auth.uid()
    );

CREATE POLICY "Users can create friend requests" ON friendships
    FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update their own friendship requests" ON friendships
    FOR UPDATE USING (
        requester_id = auth.uid() OR 
        addressee_id = auth.uid()
    );

-- 사용자 통계 RLS
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public statistics" ON user_statistics
    FOR SELECT USING (TRUE); -- 리더보드용으로 공개

CREATE POLICY "System can manage user statistics" ON user_statistics
    FOR ALL USING (TRUE); -- 시스템에서 관리

-- 미션 게시물 RLS
ALTER TABLE mission_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public posts" ON mission_posts
    FOR SELECT USING (
        visibility = 'public' OR 
        user_id = auth.uid() OR
        (visibility = 'friends' AND EXISTS (
            SELECT 1 FROM friendships 
            WHERE (requester_id = auth.uid() AND addressee_id = mission_posts.user_id) OR
                  (addressee_id = auth.uid() AND requester_id = mission_posts.user_id)
            AND status = 'accepted'
        ))
    );

CREATE POLICY "Users can create their own posts" ON mission_posts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own posts" ON mission_posts
    FOR UPDATE USING (user_id = auth.uid());

-- 좋아요 RLS
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own likes" ON post_likes
    FOR ALL USING (user_id = auth.uid());

-- 댓글 RLS
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on visible posts" ON post_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mission_posts 
            WHERE id = post_comments.post_id
            AND (visibility = 'public' OR user_id = auth.uid())
        )
    );

CREATE POLICY "Users can create comments" ON post_comments
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 9. 트리거 함수들
-- ============================================================================

-- 친구 수 자동 업데이트
CREATE OR REPLACE FUNCTION update_friends_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
        -- 양쪽 사용자의 친구 수 증가
        UPDATE user_statistics 
        SET friends_count = friends_count + 1, updated_at = NOW()
        WHERE user_id IN (NEW.requester_id, NEW.addressee_id);
        
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
        -- 친구 요청 승인시 양쪽 사용자의 친구 수 증가
        UPDATE user_statistics 
        SET friends_count = friends_count + 1, updated_at = NOW()
        WHERE user_id IN (NEW.requester_id, NEW.addressee_id);
        
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
        -- 친구 관계 삭제시 양쪽 사용자의 친구 수 감소
        UPDATE user_statistics 
        SET friends_count = friends_count - 1, updated_at = NOW()
        WHERE user_id IN (OLD.requester_id, OLD.addressee_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_friends_count
    AFTER INSERT OR UPDATE OR DELETE ON friendships
    FOR EACH ROW EXECUTE FUNCTION update_friends_count();

-- 게시물 좋아요 수 자동 업데이트
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE mission_posts 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE mission_posts 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_likes_count
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- ============================================================================
-- 10. 기본 데이터 삽입
-- ============================================================================

-- 기본 업적 데이터
INSERT INTO achievements (code, name, description, category, tier, points, requirements) VALUES
('first_mission', '첫 번째 미션', '첫 번째 미션을 완료하세요', 'mission', 'bronze', 100, '{"missions_completed": 1}'),
('mission_master', '미션 마스터', '10개의 미션을 완료하세요', 'mission', 'silver', 500, '{"missions_completed": 10}'),
('social_butterfly', '소셜 나비', '10명의 친구를 사귀세요', 'social', 'bronze', 200, '{"friends_count": 10}'),
('popular_poster', '인기 포스터', '게시물로 100개의 좋아요를 받으세요', 'social', 'gold', 1000, '{"total_likes": 100}'),
('streak_starter', '연속 도전자', '3일 연속 미션을 완료하세요', 'streak', 'bronze', 300, '{"daily_streak": 3}'),
('payback_collector', '페이백 수집가', '총 10만원의 페이백을 받으세요', 'payback', 'silver', 800, '{"total_payback": 100000}')
ON CONFLICT (code) DO NOTHING;

-- 통계 정보 업데이트
ANALYZE friendships;
ANALYZE user_statistics;
ANALYZE mission_posts;
ANALYZE post_likes;
ANALYZE post_comments;
ANALYZE achievements;
ANALYZE user_achievements;

COMMIT;