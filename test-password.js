const bcrypt = require('bcryptjs')

async function testPassword() {
  const password = 'admin123!'
  const hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'

  console.log('비밀번호 테스트 중...')
  console.log('비밀번호:', password)
  console.log('해시:', hash)

  const isValid = await bcrypt.compare(password, hash)
  console.log('비밀번호 검증 결과:', isValid)

  if (!isValid) {
    console.log('새로운 해시 생성 중...')
    const newHash = await bcrypt.hash(password, 10)
    console.log('새로운 해시:', newHash)

    const newIsValid = await bcrypt.compare(password, newHash)
    console.log('새로운 해시 검증 결과:', newIsValid)
  }
}

testPassword().catch(console.error)
