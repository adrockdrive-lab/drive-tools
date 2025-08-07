#!/usr/bin/env node

/**
 * Supabase API를 통한 테이블 생성 시도
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 1. users 테이블 생성
async function createUsersTable() {
  console.log('📋 Creating users table...');
  
  const sql = `
    create table if not exists users (
      id uuid default gen_random_uuid() primary key,
      name varchar(50) not null,
      phone varchar(15) unique not null,
      phone_verified boolean default false,
      created_at timestamp with time zone default now(),
      updated_at timestamp with time zone default now()
    );
    
    create index if not exists idx_users_phone on users(phone);
  `;
  
  try {
    // PostgreSQL 연결을 시도해서 직접 SQL 실행
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql })
    });
    
    if (response.ok) {
      console.log('✅ Users table created successfully');
      return true;
    } else {
      const error = await response.text();
      console.log('❌ Users table creation failed:', error);
      return false;
    }
  } catch (err) {
    console.log('❌ Error creating users table:', err.message);
    return false;
  }
}

// 대안: Supabase REST API로 직접 생성 시도
async function attemptDirectCreation() {
  console.log('🔄 Attempting direct table creation via API...\n');
  
  // 단계별로 테이블 생성 시도
  const success = await createUsersTable();
  
  if (success) {
    console.log('\n🎉 Table creation successful!');
    console.log('⏭️  Run "npm run db:check" to verify');
  } else {
    console.log('\n❌ Direct API creation failed');
    console.log('💡 Please use Supabase Dashboard instead:');
    console.log('1. Open: https://supabase.com/dashboard/project/rhofpgbzunxgmcjcoxex/sql');
    console.log('2. Paste the SQL from database-setup.sql');
    console.log('3. Click RUN');
  }
}

// 메인 실행
attemptDirectCreation().catch(console.error);