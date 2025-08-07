import { supabase } from './supabase'

// Supabase 연결 테스트 함수
export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // 환경변수 확인
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Supabase environment variables not found')
    }
    
    console.log('Environment variables found:', { url, keyLength: key.length })
    
    // 간단한 쿼리 테스트
    const { data, error } = await supabase
      .from('missions')
      .select('id, title')
      .limit(1)
    
    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }
    
    console.log('Supabase connection successful:', data)
    return { success: true, data, error: null }
  } catch (error) {
    console.error('Supabase connection failed:', error)
    return { 
      success: false, 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}