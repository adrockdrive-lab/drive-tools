# Vercel 배포 가이드

## 환경변수 설정 (필수)

Vercel에서 프로젝트 배포 전에 다음 환경변수를 설정해야 합니다:

### 1. Vercel 대시보드에서 환경변수 설정

1. Vercel 프로젝트 설정으로 이동
2. "Environment Variables" 탭 클릭
3. 다음 변수들을 추가:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Supabase 설정 정보 얻기

1. [Supabase 대시보드](https://app.supabase.com/)에 로그인
2. 프로젝트 선택
3. Settings > API로 이동
4. 다음 정보 복사:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 빌드 오류 해결

### "supabaseUrl is required" 오류

이 오류는 환경변수가 설정되지 않았을 때 발생합니다.

**해결방법:**
1. Vercel 프로젝트 설정에서 환경변수 확인
2. 변수명이 정확한지 확인 (`NEXT_PUBLIC_` 접두사 포함)
3. 값이 올바른 Supabase URL/키인지 확인

### 환경변수 확인

```bash
# 로컬에서 환경변수 확인
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 배포 후 확인사항

1. `/test` 페이지에서 데이터베이스 연결 테스트
2. 회원가입/로그인 기능 테스트
3. 미션 페이지 로딩 확인

## 문제 해결

### 일반적인 문제들

1. **환경변수 누락**: Vercel 환경변수 설정 재확인
2. **Supabase 접근 권한**: RLS 정책 및 테이블 권한 확인
3. **빌드 캐시 문제**: Vercel에서 deployment 재시도

### 디버깅

로컬에서 프로덕션 빌드 테스트:
```bash
npm run build
npm start
```

## 참고사항

- 환경변수 변경 후 반드시 재배포 필요
- `NEXT_PUBLIC_` 접두사가 있는 변수만 클라이언트에서 접근 가능
- Supabase 프로젝트가 활성화 상태인지 확인

