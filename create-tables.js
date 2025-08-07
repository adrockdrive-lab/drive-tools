#!/usr/bin/env node

/**
 * Supabase 테이블 생성 스크립트
 * database-setup.sql 내용을 기반으로 테이블들을 단계별로 생성합니다.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// SQL 실행 함수
async function executeSQL(name, sql) {
  console.log(`\n🔄 Creating ${name}...`);
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // exec_sql이 없다면 다른 방법 시도
      console.log(`❌ ${name} failed with exec_sql:`, error.message);
      return false;
    }
    
    console.log(`✅ ${name} created successfully`);
    return true;
  } catch (err) {
    console.log(`❌ ${name} error:`, err.message);
    return false;
  }
}

// REST API를 사용한 대안 방법
async function createTableDirectly() {
  console.log('🚀 Creating database tables directly...\n');
  
  // 1. users 테이블 생성
  console.log('📋 Step 1: Creating users table...');
  
  try {
    // Supabase의 Management API를 사용해서 테이블 생성을 시도
    // 하지만 이는 보안상 제한될 수 있음
    
    const { data, error } = await supabase.rpc('create_users_table');
    if (error) {
      console.log('❌ Direct table creation not supported via API');
      console.log('💡 Please use Supabase Dashboard SQL Editor instead');
      return false;
    }
  } catch (err) {
    console.log('❌ Direct table creation failed');
    console.log('💡 Using alternative approach...');
  }
  
  return true;
}

// 테이블 존재 여부 확인
async function checkTablesExist() {
  console.log('🔍 Checking if tables already exist...\n');
  
  const tables = ['users', 'missions', 'user_missions', 'paybacks', 'referrals'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        results[table] = false;
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        results[table] = true;
        console.log(`✅ ${table}: exists`);
      }
    } catch (e) {
      results[table] = false;
      console.log(`❌ ${table}: ${e.message}`);
    }
  }
  
  return results;
}

// SQL 파일을 읽어서 실행 가능한 SQL 문으로 분할
function parseSQLFile(content) {
  // 주석 제거 및 빈 줄 제거
  const lines = content.split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('--'));
  
  const sqlContent = lines.join('\n');
  
  // 개별 SQL 문으로 분할 (세미콜론 기준)
  const statements = sqlContent.split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);
  
  return statements;
}

// 메인 실행 함수
async function main() {
  console.log('🚀 드라이빙존 미션 데이터베이스 테이블 생성\n');
  
  // 환경 변수 확인
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('❌ Supabase 환경 변수가 설정되지 않았습니다.');
    console.log('💡 .env.local 파일을 확인해주세요.');
    return;
  }
  
  console.log('✅ Supabase 환경 변수 확인됨');
  console.log(`🔗 URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  
  // 현재 테이블 상태 확인
  const existingTables = await checkTablesExist();
  
  const missingTables = Object.entries(existingTables)
    .filter(([table, exists]) => !exists)
    .map(([table]) => table);
  
  if (missingTables.length === 0) {
    console.log('\n🎉 모든 테이블이 이미 존재합니다!');
    return;
  }
  
  console.log(`\n🔧 생성이 필요한 테이블: ${missingTables.join(', ')}`);
  
  // Supabase Dashboard 가이드 제공
  console.log('\n📋 테이블 생성 방법:');
  console.log('1. Supabase Dashboard 열기: https://supabase.com/dashboard/project/rhofpgbzunxgmcjcoxex');
  console.log('2. SQL Editor로 이동');
  console.log('3. database-setup.sql 파일 내용 복사 후 붙여넣기');
  console.log('4. 실행 (RUN 버튼 클릭)');
  
  console.log('\n💡 또는 아래 SQL을 직접 복사해서 사용하세요:');
  console.log('=' .repeat(60));
  
  // SQL 파일 내용 출력
  const fs = require('fs');
  const path = require('path');
  
  try {
    const sqlContent = fs.readFileSync(path.join(__dirname, 'database-setup.sql'), 'utf8');
    console.log(sqlContent);
  } catch (err) {
    console.log('❌ database-setup.sql 파일을 읽을 수 없습니다:', err.message);
  }
  
  console.log('=' .repeat(60));
  
  // 테이블 생성 후 확인을 위한 안내
  console.log('\n⏭️  테이블 생성 후 다음 명령어로 확인:');
  console.log('npm run mcp:test');
}

// 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkTablesExist, createTableDirectly };