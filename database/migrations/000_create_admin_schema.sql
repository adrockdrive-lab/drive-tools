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
