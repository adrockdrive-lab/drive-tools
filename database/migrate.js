#!/usr/bin/env node

/**
 * PostgreSQL 직접 연결을 통한 마이그레이션 실행
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Supabase 연결 정보
// Format: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Supabase URL에서 프로젝트 참조 추출
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Supabase URL에서 프로젝트 참조를 찾을 수 없습니다.');
  console.error(`   URL: ${SUPABASE_URL}`);
  process.exit(1);
}

async function main() {
  console.log('🚀 드라이빙존 데이터베이스 마이그레이션\n');

  // 데이터베이스 비밀번호 입력받기
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('📍 Supabase 프로젝트 참조:', projectRef);
  console.log('ℹ️  데이터베이스 비밀번호는 Supabase Dashboard > Settings > Database에서 확인할 수 있습니다.\n');

  readline.question('🔐 데이터베이스 비밀번호를 입력하세요: ', async (password) => {
    readline.close();

    if (!password) {
      console.error('\n❌ 비밀번호가 입력되지 않았습니다.');
      process.exit(1);
    }

    // PostgreSQL 연결 문자열 생성
    const connectionString = `postgresql://postgres.${projectRef}:${password}@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`;

    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    try {
      console.log('\n⏳ 데이터베이스 연결 중...');
      await client.connect();
      console.log('✅ 데이터베이스 연결 성공\n');

      // 마이그레이션 파일 목록
      const migrationsDir = path.join(__dirname, 'migrations');
      const migrationFiles = fs
        .readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

      console.log(`📋 실행할 마이그레이션: ${migrationFiles.length}개`);
      migrationFiles.forEach(f => console.log(`   - ${f}`));
      console.log();

      let successCount = 0;

      for (const file of migrationFiles) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        console.log(`📄 실행 중: ${file}...`);

        try {
          await client.query(sql);
          console.log(`   ✅ 완료\n`);
          successCount++;
        } catch (error) {
          console.error(`   ❌ 실패: ${error.message}\n`);
          console.error('상세 오류:', error);
          break;
        }
      }

      console.log('='.repeat(60));
      console.log(`📊 결과: ${successCount}/${migrationFiles.length} 완료`);
      console.log('='.repeat(60) + '\n');

      if (successCount === migrationFiles.length) {
        console.log('✅ 모든 마이그레이션이 성공적으로 완료되었습니다!\n');

        // 테이블 확인
        const { rows } = await client.query(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          ORDER BY table_name;
        `);

        console.log('📋 생성된 테이블 목록:');
        rows.forEach(row => console.log(`   - ${row.table_name}`));
        console.log();

        console.log('다음 단계:');
        console.log('1. npm run db:test-data - 테스트 데이터 생성');
        console.log('2. npm run dev - 개발 서버 시작\n');
      }

    } catch (error) {
      console.error('❌ 오류 발생:', error.message);
      console.error(error);
      process.exit(1);
    } finally {
      await client.end();
      console.log('🔌 데이터베이스 연결 종료\n');
    }
  });
}

main().catch(console.error);
