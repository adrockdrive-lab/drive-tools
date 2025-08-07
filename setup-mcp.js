#!/usr/bin/env node

/**
 * MCP 서버 설정 및 테스트 도우미 스크립트
 * Usage: node setup-mcp.js [command]
 * Commands: test, setup, status
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PROJECT_ROOT = __dirname;
const MCP_CONFIG = path.join(PROJECT_ROOT, '.claude', 'claude_project.json');

// MCP 서버 상태 확인
function checkMCPServers() {
  console.log('🔍 MCP 서버 상태 확인 중...\n');
  
  if (!fs.existsSync(MCP_CONFIG)) {
    console.log('❌ claude_project.json 파일이 없습니다.');
    console.log('   run: node setup-mcp.js setup');
    return false;
  }

  const config = JSON.parse(fs.readFileSync(MCP_CONFIG, 'utf8'));
  
  console.log(`📋 프로젝트: ${config.name}`);
  console.log(`📝 설명: ${config.description}\n`);
  
  console.log('🔧 구성된 MCP 서버들:');
  Object.entries(config.mcpServers || {}).forEach(([name, server]) => {
    console.log(`  ✅ ${name}: ${server.description || 'No description'}`);
  });
  
  return true;
}

// Supabase 연결 테스트
async function testSupabaseConnection() {
  console.log('🧪 Supabase 연결 테스트...\n');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    require('dotenv').config({ path: '.env.local' });
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // 테이블 존재 확인
    const tables = ['users', 'missions', 'user_missions', 'paybacks', 'referrals'];
    
    console.log('📊 테이블 상태:');
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`  ❌ ${table}: ${error.message}`);
        } else {
          console.log(`  ✅ ${table}: 존재함 (${data.length} rows 확인)`);
        }
      } catch (e) {
        console.log(`  ❌ ${table}: ${e.message}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Supabase 테스트 실패:', error.message);
    console.log('💡 npm install @supabase/supabase-js dotenv 를 실행해보세요.');
  }
}

// 환경 변수 확인
function checkEnvironmentVariables() {
  console.log('🔐 환경 변수 확인...\n');
  
  const envFile = path.join(PROJECT_ROOT, '.env.local');
  if (!fs.existsSync(envFile)) {
    console.log('❌ .env.local 파일이 없습니다.');
    return false;
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  let allPresent = true;
  
  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your_`)) {
      console.log(`  ✅ ${varName}: 설정됨`);
    } else {
      console.log(`  ❌ ${varName}: 누락 또는 미설정`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

// 메인 실행 함수
async function main() {
  const command = process.argv[2] || 'status';
  
  console.log('🚀 드라이빙존 미션 MCP 설정 도우미\n');
  
  switch (command) {
    case 'status':
      checkMCPServers();
      console.log('');
      checkEnvironmentVariables();
      break;
      
    case 'test':
      if (checkMCPServers() && checkEnvironmentVariables()) {
        await testSupabaseConnection();
      }
      break;
      
    case 'setup':
      console.log('📋 MCP 설정 가이드:');
      console.log('1. .claude/claude_project.json 파일 확인');
      console.log('2. 필요한 패키지들이 설치되어 있는지 확인');
      console.log('3. 환경 변수 설정 확인');
      console.log('4. Claude Code 재시작');
      console.log('');
      console.log('💡 실행 명령어:');
      console.log('  npm install --save-dev @supabase/mcp-server-supabase');
      console.log('  npm install --save-dev @modelcontextprotocol/server-filesystem');
      break;
      
    default:
      console.log('사용법: node setup-mcp.js [status|test|setup]');
      console.log('  status: 현재 설정 상태 확인');
      console.log('  test: 연결 테스트 실행');
      console.log('  setup: 설정 가이드 표시');
  }
  
  console.log('\n✨ 완료!');
}

// 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkMCPServers, testSupabaseConnection, checkEnvironmentVariables };