-- 드라이빙존 미션 시스템 데이터베이스 성능 최적화
-- Phase 4.1 - 데이터베이스 인덱스 최적화

-- ============================================================================
-- 1. 인덱스 최적화
-- ============================================================================

-- users 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_store_id ON users(store_id);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(id) WHERE deleted_at IS NULL;

-- missions 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_missions_type ON missions(mission_type);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_store_id ON missions(store_id);
CREATE INDEX IF NOT EXISTS idx_missions_active ON missions(id) WHERE deleted_at IS NULL;

-- mission_participations 테이블 인덱스 (가장 중요)
CREATE INDEX IF NOT EXISTS idx_participations_user_id ON mission_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_participations_mission_id ON mission_participations(mission_id);
CREATE INDEX IF NOT EXISTS idx_participations_status ON mission_participations(status);
CREATE INDEX IF NOT EXISTS idx_participations_user_status ON mission_participations(user_id, status);
CREATE INDEX IF NOT EXISTS idx_participations_mission_status ON mission_participations(mission_id, status);
CREATE INDEX IF NOT EXISTS idx_participations_created_at ON mission_participations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_participations_completed_at ON mission_participations(completed_at DESC) WHERE completed_at IS NOT NULL;

-- paybacks 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_paybacks_user_id ON paybacks(user_id);
CREATE INDEX IF NOT EXISTS idx_paybacks_mission_participation_id ON paybacks(mission_participation_id);
CREATE INDEX IF NOT EXISTS idx_paybacks_status ON paybacks(status);
CREATE INDEX IF NOT EXISTS idx_paybacks_user_status ON paybacks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_paybacks_created_at ON paybacks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_paybacks_amount ON paybacks(amount DESC);

-- referrals 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at DESC);

-- stores 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_stores_region ON stores(region);
CREATE INDEX IF NOT EXISTS idx_stores_active ON stores(id) WHERE deleted_at IS NULL;

-- notifications 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 복합 인덱스 (자주 함께 조회되는 컬럼들)
CREATE INDEX IF NOT EXISTS idx_participations_user_mission_status 
ON mission_participations(user_id, mission_id, status);

CREATE INDEX IF NOT EXISTS idx_paybacks_user_status_amount 
ON paybacks(user_id, status, amount DESC);

-- ============================================================================
-- 2. 파티셔닝 (큰 테이블의 경우)
-- ============================================================================

-- mission_participations 테이블을 월별로 파티셔닝 (데이터가 많아질 경우)
-- CREATE TABLE mission_participations_2025_01 PARTITION OF mission_participations
-- FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- ============================================================================
-- 3. 통계 정보 업데이트
-- ============================================================================

-- PostgreSQL 통계 정보 수집 (성능 개선)
ANALYZE users;
ANALYZE missions;
ANALYZE mission_participations;
ANALYZE paybacks;
ANALYZE referrals;
ANALYZE stores;
ANALYZE notifications;

-- ============================================================================
-- 4. 뷰 최적화 (자주 사용되는 조인 쿼리)
-- ============================================================================

-- 사용자 미션 상태 뷰 (대시보드용)
CREATE OR REPLACE VIEW user_mission_summary AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.phone,
    s.name as store_name,
    COUNT(mp.id) as total_missions,
    COUNT(CASE WHEN mp.status = 'completed' THEN 1 END) as completed_missions,
    COUNT(CASE WHEN mp.status = 'in_progress' THEN 1 END) as in_progress_missions,
    COALESCE(SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END), 0) as total_payback
FROM users u
LEFT JOIN stores s ON u.store_id = s.id
LEFT JOIN mission_participations mp ON u.id = mp.user_id
LEFT JOIN paybacks p ON mp.id = p.mission_participation_id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.name, u.phone, s.name;

-- 미션 통계 뷰 (관리자용)
CREATE OR REPLACE VIEW mission_statistics AS
SELECT 
    m.id as mission_id,
    m.title,
    m.mission_type,
    s.name as store_name,
    COUNT(mp.id) as total_participants,
    COUNT(CASE WHEN mp.status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN mp.status = 'in_progress' THEN 1 END) as in_progress_count,
    ROUND(
        COUNT(CASE WHEN mp.status = 'completed' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(mp.id), 0), 2
    ) as completion_rate,
    COALESCE(SUM(p.amount), 0) as total_payback_amount
FROM missions m
LEFT JOIN stores s ON m.store_id = s.id
LEFT JOIN mission_participations mp ON m.id = mp.mission_id
LEFT JOIN paybacks p ON mp.id = p.mission_participation_id
WHERE m.deleted_at IS NULL
GROUP BY m.id, m.title, m.mission_type, s.name;

-- ============================================================================
-- 5. 함수 최적화 (자주 사용되는 집계 쿼리)
-- ============================================================================

-- 사용자 총 페이백 조회 함수 (캐시 가능)
CREATE OR REPLACE FUNCTION get_user_total_payback_optimized(user_id_param UUID)
RETURNS DECIMAL AS $$
BEGIN
    RETURN (
        SELECT COALESCE(SUM(amount), 0)
        FROM paybacks p
        JOIN mission_participations mp ON p.mission_participation_id = mp.id
        WHERE mp.user_id = user_id_param 
        AND p.status = 'paid'
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- 지점별 월간 통계 함수 (최적화)
CREATE OR REPLACE FUNCTION get_store_monthly_stats_optimized(
    store_id_param INTEGER,
    year_param INTEGER,
    month_param INTEGER
)
RETURNS TABLE(
    total_users BIGINT,
    new_users BIGINT,
    completed_missions BIGINT,
    total_payback DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH monthly_data AS (
        SELECT 
            u.id as user_id,
            u.created_at,
            mp.status as mission_status,
            p.amount as payback_amount
        FROM users u
        LEFT JOIN mission_participations mp ON u.id = mp.user_id
        LEFT JOIN paybacks p ON mp.id = p.mission_participation_id
        WHERE u.store_id = store_id_param
        AND u.deleted_at IS NULL
    )
    SELECT 
        COUNT(DISTINCT user_id)::BIGINT as total_users,
        COUNT(DISTINCT CASE 
            WHEN EXTRACT(YEAR FROM created_at) = year_param 
            AND EXTRACT(MONTH FROM created_at) = month_param 
            THEN user_id 
        END)::BIGINT as new_users,
        COUNT(CASE WHEN mission_status = 'completed' THEN 1 END)::BIGINT as completed_missions,
        COALESCE(SUM(payback_amount), 0)::DECIMAL as total_payback
    FROM monthly_data;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 6. 성능 모니터링 쿼리
-- ============================================================================

-- 느린 쿼리 모니터링 (개발 환경에서 사용)
-- SELECT query, mean_time, calls, total_time
-- FROM pg_stat_statements
-- WHERE mean_time > 100
-- ORDER BY mean_time DESC
-- LIMIT 10;

-- 테이블별 사용량 통계
-- SELECT 
--     schemaname,
--     tablename,
--     n_tup_ins as inserts,
--     n_tup_upd as updates,
--     n_tup_del as deletes,
--     seq_scan,
--     seq_tup_read,
--     idx_scan,
--     idx_tup_fetch
-- FROM pg_stat_user_tables
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- ============================================================================
-- 7. 정리 작업 (옵션)
-- ============================================================================

-- 오래된 알림 정리 (30일 이전)
-- DELETE FROM notifications 
-- WHERE created_at < NOW() - INTERVAL '30 days';

-- 오래된 로그 정리 (필요시)
-- DELETE FROM audit_logs 
-- WHERE created_at < NOW() - INTERVAL '90 days';

-- ============================================================================
-- 성능 최적화 적용 완료
-- ============================================================================

-- 변경사항 커밋
COMMIT;

-- 성능 최적화 완료 로그
INSERT INTO optimization_logs (type, description, applied_at) 
VALUES ('database_optimization', 'Phase 4.1 - 데이터베이스 인덱스 최적화 완료', NOW())
ON CONFLICT DO NOTHING;