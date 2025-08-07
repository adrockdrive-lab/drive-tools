import { supabase } from './supabase'

// 데이터베이스 연결 테스트 함수
export async function testDatabaseConnection() {
  try {
    console.log('🔄 Testing Supabase connection...')
    
    // 1. 기본 연결 테스트
    const { error } = await supabase.from('users').select('count').single()
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful!')
    return true
    
  } catch (error) {
    console.error('❌ Connection error:', error)
    return false
  }
}

// 테이블 존재 여부 확인
export async function checkTablesExist() {
  const tables = ['users', 'missions', 'user_missions', 'paybacks', 'referrals']
  const results = []
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.log(`❌ Table '${table}' not found or accessible`)
        results.push({ table, exists: false, error: error.message })
      } else {
        console.log(`✅ Table '${table}' exists and accessible`)
        results.push({ table, exists: true })
      }
    } catch (error) {
      console.log(`❌ Error checking table '${table}':`, error)
      results.push({ table, exists: false, error: String(error) })
    }
  }
  
  return results
}

// 미션 데이터 확인
export async function checkMissionData() {
  try {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .order('id')
    
    if (error) {
      console.error('❌ Error fetching missions:', error.message)
      return null
    }
    
    console.log('📋 Mission data:')
    data?.forEach(mission => {
      console.log(`  - ${mission.title} (${mission.mission_type}): ${mission.reward_amount}원`)
    })
    
    return data
  } catch (error) {
    console.error('❌ Error in checkMissionData:', error)
    return null
  }
}

// 전체 데이터베이스 상태 체크
export async function fullDatabaseCheck() {
  console.log('🚀 Starting full database check...\n')
  
  const isConnected = await testDatabaseConnection()
  if (!isConnected) {
    console.log('❌ Database connection failed. Please check your Supabase configuration.')
    return false
  }
  
  const tableResults = await checkTablesExist()
  const missingTables = tableResults.filter(result => !result.exists)
  
  if (missingTables.length > 0) {
    console.log('\n❌ Missing tables found:')
    missingTables.forEach(result => {
      console.log(`  - ${result.table}: ${result.error}`)
    })
    console.log('\n💡 Please run the database-setup.sql script in Supabase SQL Editor')
    return false
  }
  
  await checkMissionData()
  
  console.log('\n✅ Database setup is complete and ready for use!')
  return true
}