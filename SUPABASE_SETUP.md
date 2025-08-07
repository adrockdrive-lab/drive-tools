# 🚀 Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase 콘솔](https://supabase.com/dashboard)에 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: `driving-zone-mission`
   - **Database Password**: 안전한 비밀번호 설정
   - **Region**: `Northeast Asia (Seoul)` 선택
4. "Create new project" 클릭

## 2. 프로젝트 URL 및 키 확인

프로젝트가 생성되면 Settings > API 메뉴에서 확인:

- **Project URL**: `https://your-project-id.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 3. 환경변수 설정

`.env.local` 파일을 다음과 같이 수정:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# SMS Service (나중에 설정)
SMS_API_KEY=your-sms-api-key-here
SMS_USER_ID=your-sms-user-id-here

# Application Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. 데이터베이스 스키마 적용

1. Supabase 콘솔에서 **SQL Editor** 메뉴로 이동
2. **New query** 클릭
3. `database-setup.sql` 파일의 내용을 복사하여 붙여넣기
4. **Run** 버튼 클릭하여 실행

## 5. 연결 테스트

1. 환경변수 설정 완료 후 개발 서버 재시작:
   ```bash
   npm run dev
   ```

2. http://localhost:3000/test 페이지에서 **Run Database Test** 버튼 클릭

3. 다음과 같은 메시지가 나오면 성공:
   ```
   ✅ Database connection successful!
   ✅ Table 'users' exists and accessible
   ✅ Table 'missions' exists and accessible
   ✅ Table 'user_missions' exists and accessible
   ✅ Table 'paybacks' exists and accessible
   ✅ Table 'referrals' exists and accessible
   📋 Mission data:
     - 재능충 챌린지 (challenge): 20000원
     - SNS 인증 미션 (sns): 10000원
     - 후기 쓰기 미션 (review): 0원
     - 친구 추천 미션 (referral): 50000원
   ✅ Database setup is complete and ready for use!
   ```

## 6. Storage 설정 (이미지 업로드용)

1. Supabase 콘솔에서 **Storage** 메뉴로 이동
2. **New bucket** 클릭
3. 버킷 설정:
   - **Name**: `mission-proofs`
   - **Public bucket**: ✅ 체크
   - **File size limit**: `10 MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, application/pdf`
4. **Create bucket** 클릭

## 7. 실시간 기능 설정 (선택사항)

1. Supabase 콘솔에서 **Database > Replication** 메뉴로 이동
2. `user_missions`, `paybacks` 테이블에 대해 실시간 업데이트 활성화
3. 클라이언트에서 실시간 구독 가능

## 8. 보안 설정

### RLS (Row Level Security) 정책 확인

데이터베이스 스키마가 적용되면 다음 정책들이 자동으로 설정됩니다:

- **users**: 본인 프로필만 조회/수정 가능
- **user_missions**: 본인 미션만 조회/수정/생성 가능  
- **paybacks**: 본인 페이백 내역만 조회 가능
- **referrals**: 본인 추천 내역만 조회/생성 가능
- **missions**: 모든 사용자가 활성화된 미션 조회 가능

### API 키 보안

- **Anon Key**: 클라이언트에서 사용, 공개 가능
- **Service Role Key**: 서버에서만 사용, 절대 공개 금지

## 9. 문제 해결

### 연결 실패 시

1. 환경변수 값 재확인
2. Supabase 프로젝트 상태 확인 (일시 중지되지 않았는지)
3. 개발 서버 재시작
4. 브라우저 캐시 클리어

### 테이블 생성 실패 시

1. SQL Editor에서 에러 메시지 확인
2. 권한 문제인 경우 Service Role로 실행
3. 테이블 이름 충돌 확인

### RLS 정책 문제

1. Database > Authentication > Policies 메뉴에서 정책 확인
2. 필요시 정책 수동 생성

## 10. 다음 단계

- SMS 인증 서비스 연동 (Aligo, NCP SENS 등)
- 실제 파일 업로드 기능 구현
- 결제 시스템 연동 (페이백 지급)
- 관리자 페이지 구현
- 배포 (Vercel + Supabase)