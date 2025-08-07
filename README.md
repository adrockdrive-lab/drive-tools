# 🚗 드라이빙존 미션 페이백 시스템

운전면허 합격자를 위한 미션 기반 페이백 시스템입니다. 4개의 미션을 완료하여 최대 87,000원의 혜택을 받을 수 있습니다.

## 🎯 프로젝트 개요

### 주요 기능
- **사용자 등록 시스템**: 휴대폰 인증을 통한 안전한 가입
- **미션 시스템**: 4개의 다양한 미션 (챌린지, SNS, 후기, 추천)
- **페이백 관리**: 자동 페이백 계산 및 지급 추적
- **반응형 디자인**: 모바일 및 데스크톱 최적화

### 미션 목록
1. **🏆 재능충 챌린지** - 20,000원 (14시간 이내 합격)
2. **📱 SNS 인증 미션** - 10,000원 (SNS 합격 자랑)
3. **📝 후기 쓰기 미션** - 커피쿠폰 + 장학금 추첨 (3개 플랫폼 후기)
4. **👥 친구 추천 미션** - 50,000원/명 (최대 3명)

## 🛠 기술 스택

### Frontend
- **Next.js 15** - React 기반 풀스택 프레임워크
- **React 19** - 최신 React 버전
- **TypeScript** - 타입 안전성
- **TailwindCSS** - 유틸리티 기반 CSS
- **shadcn/ui** - 재사용 가능한 컴포넌트

### State Management
- **Zustand** - 경량 상태 관리 라이브러리
- **LocalStorage 영구저장** - 사용자 세션 유지

### Backend & Database
- **Supabase** - PostgreSQL 기반 BaaS
- **Row Level Security (RLS)** - 데이터 보안
- **Real-time Subscriptions** - 실시간 업데이트

## 🚀 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
`.env.local` 파일을 생성하고 다음을 설정:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 데이터베이스 설정
1. [Supabase 콘솔](https://supabase.com/dashboard)에서 프로젝트 생성
2. SQL Editor에서 `database-setup.sql` 실행
3. Storage에서 `mission-proofs` 버킷 생성

### 4. 개발 서버 실행
```bash
npm run dev
```

서버가 http://localhost:3000 에서 실행됩니다.

## 🧪 테스트

### MCP 설정 및 상태 확인
```bash
# MCP 설정 상태 확인
npm run mcp:status

# 데이터베이스 연결 테스트
npm run mcp:test

# MCP 설정 가이드 표시
npm run mcp:setup
```

### 개발 테스트 페이지
http://localhost:3000/test 에서 다음을 확인할 수 있습니다:

- ✅ 환경변수 설정 상태
- ✅ 데이터베이스 연결 테스트
- ✅ 테이블 존재 여부 확인
- ✅ 초기 데이터 검증

### 수동 테스트 시나리오
1. **회원가입**: `/register` - 휴대폰 인증 포함 3단계 가입
2. **대시보드**: `/dashboard` - 미션 현황 및 페이백 확인
3. **미션 완료**: 각 미션 페이지에서 인증 데이터 제출
4. **상태 추적**: 미션 진행 상태 실시간 업데이트 확인

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 홈 (랜딩 페이지)
│   ├── register/          # 사용자 등록
│   ├── dashboard/         # 미션 대시보드
│   ├── missions/          # 미션 페이지들
│   │   ├── challenge/     # 재능충 챌린지
│   │   ├── sns/          # SNS 인증
│   │   ├── review/       # 후기 쓰기
│   │   └── referral/     # 친구 추천
│   └── test/             # 개발 테스트 페이지
├── components/           # 재사용 컴포넌트
├── lib/                 # 유틸리티 및 설정
├── types/               # TypeScript 타입 정의
└── ...
```

## 🔐 보안 기능

### Row Level Security (RLS)
- **users**: 본인 프로필만 접근 가능
- **user_missions**: 본인 미션만 조회/수정 가능
- **paybacks**: 본인 페이백 내역만 조회 가능

## 🌟 주요 특징

- 📱 **모바일 우선 설계**: 스마트폰에서 완벽한 사용성
- ⚡ **빠른 로딩**: 최적화된 성능
- 🔄 **실시간 피드백**: 즉시 상태 업데이트
- 💾 **자동 저장**: 세션 유지 및 진행상황 보존

## 📞 지원

문제가 있거나 질문이 있으시면:

1. **테스트 페이지**: http://localhost:3000/test 에서 진단
2. **설정 가이드**: `SUPABASE_SETUP.md` 참조

---

**개발 완료**: ✅ 프로덕션 준비 완료
