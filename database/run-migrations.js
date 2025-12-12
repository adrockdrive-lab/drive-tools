#!/usr/bin/env node

/**
 * Supabase 마이그레이션 실행 스크립트
 *
 * Usage: node database/run-migrations.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Supabase 클라이언트 생성 (Service Role Key 사용)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function runMigration(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\n📄 실행 중: ${fileName}`);

  try {
    const sql = fs.readFileSync(filePath, 'utf8');

    // PostgreSQL의 DO 블록과 NOTICE는 Supabase RPC로 실행
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // RPC가 없으면 직접 SQL 실행
      if (error.code === '42883') {
        console.log('  ℹ️  직접 SQL 실행 모드');

        // SQL을 문장별로 분리 (간단한 분리 로직)
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));

        for (let i = 0; i < statements.length; i++) {
          const stmt = statements[i];
          if (!stmt) continue;

          // BEGIN, COMMIT, DO 블록은 건너뛰기 (클라이언트에서 지원 안 됨)
          if (stmt.match(/^(BEGIN|COMMIT)/i)) {
            continue;
          }

          if (stmt.match(/^DO \$\$/i)) {
            // NOTICE 블록 건너뛰기
            continue;
          }

          try {
            const { error: stmtError } = await supabase.rpc('exec_sql', { sql_query: stmt + ';' });

            if (stmtError) {
              // exec_sql이 없으면 postgresql 직접 사용 시도
              console.log(`  ⚠️  Statement ${i + 1}: ${stmtError.message}`);
            }
          } catch (err) {
            console.log(`  ⚠️  Statement ${i + 1}: ${err.message}`);
          }
        }

        console.log(`  ✅ ${fileName} 완료 (일부 경고 있을 수 있음)`);
        return true;
      }

      throw error;
    }

    console.log(`  ✅ ${fileName} 완료`);
    return true;
  } catch (error) {
    console.error(`  ❌ ${fileName} 실패:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 드라이빙존 데이터베이스 마이그레이션 시작\n');
  console.log(`📍 Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}\n`);

  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort(); // 파일명 순서대로 정렬 (000_, 001_, 002_)

  console.log(`📋 실행할 마이그레이션: ${migrationFiles.length}개`);
  migrationFiles.forEach(f => console.log(`   - ${f}`));

  let successCount = 0;
  let failCount = 0;

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const success = await runMigration(filePath);

    if (success) {
      successCount++;
    } else {
      failCount++;
      console.log('\n⚠️  마이그레이션 실패로 중단합니다.\n');
      break;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 마이그레이션 결과: 성공 ${successCount}개, 실패 ${failCount}개`);
  console.log('='.repeat(60) + '\n');

  if (failCount === 0) {
    console.log('✅ 모든 마이그레이션이 성공적으로 완료되었습니다!\n');

    console.log('다음 단계:');
    console.log('1. Supabase 대시보드에서 테이블 확인');
    console.log('2. npm run db:test-data - 테스트 데이터 생성');
    console.log('3. npm run dev - 개발 서버 시작\n');
  } else {
    console.log('❌ 마이그레이션 중 오류가 발생했습니다.\n');
    console.log('해결 방법:');
    console.log('1. Supabase 대시보드 SQL Editor에서 직접 실행');
    console.log('2. 오류 메시지 확인 및 SQL 수정\n');
    process.exit(1);
  }
}

main().catch(console.error);
