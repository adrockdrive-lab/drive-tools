#!/usr/bin/env node

/**
 * Supabase 마이그레이션 실행 스크립트
 * PostgreSQL REST API를 사용하여 SQL을 직접 실행
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SERVICE_ROLE_KEY ? '✓' : '✗');
  process.exit(1);
}

async function executeSQL(sql) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql })
    });

    const data = await response.text();

    if (!response.ok) {
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Supabase 마이그레이션 실행\n');
  console.log(`📍 URL: ${SUPABASE_URL}`);
  console.log(`🔑 Service Role Key: ${SERVICE_ROLE_KEY.substring(0, 20)}...\n`);

  // 통합 마이그레이션 파일 읽기
  const migrationPath = path.join(__dirname, 'complete_migration.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error('❌ complete_migration.sql 파일을 찾을 수 없습니다.');
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log(`📄 파일 크기: ${(sql.length / 1024).toFixed(2)} KB`);
  console.log(`📝 실행할 SQL 라인 수: ${sql.split('\n').length}\n`);

  console.log('⏳ SQL 실행 중...\n');

  console.log('━'.repeat(60));
  console.log('⚠️  Supabase JS 클라이언트는 직접 SQL 실행을 지원하지 않습니다.');
  console.log('   다음 방법 중 하나를 선택하세요:\n');

  console.log('📋 방법 1: Supabase Dashboard 사용 (권장)');
  console.log('   1. https://supabase.com/dashboard 접속');
  console.log('   2. 프로젝트 선택');
  console.log('   3. SQL Editor 메뉴 클릭');
  console.log('   4. database/complete_migration.sql 파일 내용 복사하여 실행\n');

  console.log('📋 방법 2: Supabase CLI 사용');
  console.log('   1. npm install -g supabase');
  console.log('   2. supabase link --project-ref rhofpgbzunxgmcjcoxex');
  console.log('   3. supabase db push\n');

  console.log('📋 방법 3: psql 직접 연결');
  console.log('   Supabase Dashboard > Settings > Database에서 연결 정보 확인\n');
  console.log('━'.repeat(60));

  console.log('\n✅ 마이그레이션 파일이 준비되었습니다: database/complete_migration.sql');
  console.log('   위 방법 중 하나를 사용하여 실행해주세요.\n');
}

main().catch(console.error);
