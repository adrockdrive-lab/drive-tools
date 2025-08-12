const bcrypt = require('bcryptjs')

async function testLogin() {
  const email = 'admin@drivingzone.com'
  const password = 'admin123!'
  const hash = '$2b$10$0RyVxKakQxbUVNBY/ckXeuMcL5o/tZMTDkTq69S0fkyyOPi2o1yLe'

  console.log('=== 로그인 테스트 ===')
  console.log('이메일:', email)
  console.log('비밀번호:', password)
  console.log('해시:', hash)

  // 비밀번호 검증
  const isPasswordValid = await bcrypt.compare(password, hash)
  console.log('비밀번호 검증 결과:', isPasswordValid)

  if (isPasswordValid) {
    console.log('✅ 비밀번호가 올바릅니다!')
  } else {
    console.log('❌ 비밀번호가 잘못되었습니다!')

    // 새로운 해시 생성
    console.log('\n새로운 해시 생성 중...')
    const newHash = await bcrypt.hash(password, 10)
    console.log('새로운 해시:', newHash)

    const newIsValid = await bcrypt.compare(password, newHash)
    console.log('새로운 해시 검증 결과:', newIsValid)
  }
}

testLogin().catch(console.error)
