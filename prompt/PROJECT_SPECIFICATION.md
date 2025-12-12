# 드라이빙존 미션 시스템 기획서

## 📋 프로젝트 개요

### 프로젝트명
**드라이빙존 미션 시스템 (Driving Zone Mission System)**

### 프로젝트 목적
운전면허 학원 고객들의 참여도를 높이고, 지점별 고객 관리를 위한 게이미피케이션 기반 미션 시스템 구축

### 핵심 가치
- **고객 참여도 증대**: 미션을 통한 학습 동기 부여
- **지점별 데이터 관리**: 각 지점의 고객 활동 추적
- **리워드 시스템**: 미션 완료 시 현금 보상 제공
- **추천 마케팅**: 고객 추천을 통한 신규 고객 확보

---

## 🏗️ 시스템 아키텍처

### 기술 스택
- **Frontend**: Next.js 15.4.6, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: Zustand
- **UI Framework**: Tailwind CSS, shadcn/ui
- **Styling**: CSS Modules, CSS-in-JS
- **Deployment**: Vercel

### 데이터베이스 구조
```
users (사용자)
├── id (UUID)
├── name (이름)
├── phone (휴대폰 번호)
├── phone_verified (인증 여부)
├── store_id (지점 ID) - FK
├── referral_code (추천 코드)
├── referred_by (추천인 ID)
├── referral_bonus (추천 보너스)
└── created_at, updated_at

stores (지점)
├── id (지점 ID)
├── name (지점명)
├── address (주소)
├── summary_address (요약 주소)
├── phone_number (전화번호)
├── latitude, longitude (위치)
├── max_capacity (최대 수용 인원)
├── machine_count_class1, class2 (기계 수)
├── opening_date (개업일)
├── has_wifi, has_restrooms, has_parking (편의시설)
└── created_at, updated_at

missions (미션 템플릿)
├── id (미션 ID)
├── title (미션 제목)
├── description (미션 설명)
├── mission_type (미션 타입)
├── reward_amount (보상 금액)
├── is_active (활성화 여부)
├── store_id (지점 ID) - FK
└── created_at

mission_participations (미션 참여)
├── id (참여 ID)
├── user_id (사용자 ID) - FK
├── mission_id (미션 ID) - FK
├── status (상태: pending/in_progress/completed)
├── started_at (시작 시간)
├── completed_at (완료 시간)
├── proof_data (증빙 데이터 - JSONB)
├── reward_amount (보상 금액)
└── created_at, updated_at

paybacks (페이백)
├── id (페이백 ID)
├── user_id (사용자 ID) - FK
├── mission_id (미션 ID) - FK
├── amount (금액)
├── status (상태: pending/paid)
├── paid_at (지급 시간)
├── store_id (지점 ID) - FK
└── created_at

referrals (추천)
├── id (추천 ID)
├── referrer_id (추천인 ID) - FK
├── referee_name (추천받은 사람 이름)
├── referee_phone (추천받은 사람 전화번호)
├── is_verified (인증 여부)
├── reward_paid (보상 지급 여부)
├── store_id (지점 ID) - FK
└── created_at

sms_verifications (SMS 인증)
├── id (인증 ID)
├── phone (휴대폰 번호)
├── code (인증 코드)
├── expires_at (만료 시간)
├── verified (인증 완료 여부)
└── created_at
```

---

## 🎯 핵심 기능

### 1. 사용자 인증 시스템
- **SMS 인증 기반 로그인**
  - 휴대폰 번호 입력
  - 6자리 인증 코드 발송 (개발용: 콘솔 출력)
  - 10분 유효기간
  - 인증 완료 후 자동 로그인

- **회원가입**
  - 이름, 휴대폰 번호 입력
  - 지점 선택 (필수)
  - 추천 코드 입력 (선택)
  - SMS 인증 후 가입 완료

### 2. 지점별 사용자 관리
- **URL 파라미터를 통한 자동 지점 등록**
  ```
  /register?store=70&ref=ABC123
  ```
  - `store`: 지점 ID
  - `ref`: 추천 코드 (선택사항)

- **일반 회원가입 시 지점 선택**
  - 드롭다운으로 지점 선택
  - 지점명과 주소 표시
  - 필수 입력 항목

### 3. 미션 시스템

#### 미션 타입
1. **Challenge (도전 미션)**
   - 학습 시간 기록
   - 자격증 이미지 업로드
   - 보상: 15,000원

2. **SNS (소셜 미션)**
   - 드라이빙존 경험 SNS 공유
   - 플랫폼 선택 (Instagram, Facebook, Twitter, YouTube, TikTok)
   - SNS URL 입력
   - 보상: 10,000원

3. **Review (리뷰 미션)**
   - 드라이빙존 리뷰 작성
   - 별점 평가 (1-5점)
   - 리뷰 텍스트 입력
   - 보상: 8,000원

4. **Attendance (출석 미션)**
   - 출석 날짜 선택
   - 캘린더 기반 출석 체크
   - 보상: 5,000원

5. **Referral (추천 미션)**
   - 친구 추천
   - 추천인 정보 입력
   - 추천 코드 생성
   - 보상: 20,000원

#### 미션 플로우
1. **미션 시작**: 사용자가 미션 참여 신청
2. **미션 진행**: 미션별 요구사항 수행
3. **증빙 제출**: 미션 완료 증빙 데이터 입력
4. **미션 완료**: 자동으로 페이백 생성
5. **보상 지급**: 관리자가 페이백 승인 후 지급

### 4. 게이미피케이션 요소
- **레벨 시스템**: 미션 완료에 따른 레벨 상승
- **진행률 표시**: 미션별 진행 상황 시각화
- **실시간 알림**: 미션 완료, 보상 지급 알림
- **파티클 효과**: 미션 완료 시 축하 애니메이션

### 5. 대시보드
- **사용자 정보**: 이름, 레벨, 총 보상 금액
- **미션 현황**: 각 미션별 진행 상태
- **페이백 내역**: 지급된 보상 내역
- **추천 현황**: 추천한 친구 목록

---

## 📱 사용자 인터페이스

### 페이지 구조
```
/                    # 랜딩 페이지
/login               # 로그인 페이지
/register            # 회원가입 페이지
/dashboard           # 메인 대시보드
/profile              # 프로필 페이지
/missions/
├── challenge        # 도전 미션 페이지
├── sns              # SNS 미션 페이지
├── review           # 리뷰 미션 페이지
├── attendance       # 출석 미션 페이지
└── referral         # 추천 미션 페이지
```

### 디자인 시스템
- **색상**: 다크 테마 기반
- **그라디언트**: Primary → Purple 그라디언트
- **카드 디자인**: 반투명 배경, 테두리 효과
- **애니메이션**: 부드러운 전환 효과
- **반응형**: 모바일 우선 디자인

---

## 🔐 보안 및 권한

### Row Level Security (RLS)
- **사용자 데이터**: 본인 데이터만 접근 가능
- **미션 데이터**: 공개 데이터 (활성화된 미션만)
- **페이백 데이터**: 본인 페이백만 조회 가능
- **추천 데이터**: 본인 추천 내역만 조회 가능

### 데이터 검증
- **휴대폰 번호**: 정규화 (하이픈 제거)
- **미션 증빙**: JSONB 형태로 구조화된 데이터 저장
- **지점 검증**: 유효한 지점 ID만 허용

---

## 📊 데이터 분석

### 추적 지표
- **사용자 참여도**: 미션 완료율, 평균 미션 참여 수
- **지점별 성과**: 지점별 사용자 수, 미션 완료율
- **미션 효과**: 미션 타입별 인기도, 완료율
- **추천 효과**: 추천 전환율, 추천인 보상 지급율

### 리포트
- **일일 리포트**: 신규 가입자, 미션 완료 현황
- **주간 리포트**: 지점별 성과 비교
- **월간 리포트**: 전체 시스템 성과 분석

---

## 🚀 배포 및 운영

### 배포 환경
- **Frontend**: Vercel
- **Database**: Supabase
- **Domain**: 사용자 정의 도메인

### 환경 변수
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 모니터링
- **에러 추적**: Vercel Analytics
- **성능 모니터링**: Core Web Vitals
- **사용자 행동**: Google Analytics

---

## 🔄 향후 개발 계획

### Phase 2 (다음 단계)
- [ ] 관리자 대시보드 구축
- [ ] 페이백 승인/거부 시스템
- [ ] 푸시 알림 시스템
- [ ] 미션 자동 검증 시스템

### Phase 3 (고도화)
- [ ] AI 기반 미션 추천
- [ ] 소셜 기능 강화
- [ ] 리더보드 시스템
- [ ] 이벤트 시스템

### Phase 4 (확장)
- [ ] 다국어 지원
- [ ] API 개발
- [ ] 모바일 앱 개발
- [ ] 외부 시스템 연동

---

## 📝 개발 가이드

### 코드 구조
```
src/
├── app/              # Next.js App Router
├── components/       # 재사용 가능한 컴포넌트
├── lib/             # 유틸리티 및 서비스
├── types/           # TypeScript 타입 정의
└── styles/          # 전역 스타일
```

### 코딩 컨벤션
- **TypeScript**: 엄격한 타입 체크
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **Git**: Conventional Commits

### 테스트
- **Unit Test**: Jest + React Testing Library
- **E2E Test**: Playwright
- **Integration Test**: Supabase 테스트 환경

---

## 📞 문의 및 지원

### 개발팀
- **프로젝트 매니저**: [담당자명]
- **프론트엔드 개발자**: [담당자명]
- **백엔드 개발자**: [담당자명]
- **UI/UX 디자이너**: [담당자명]

### 문서
- **API 문서**: [링크]
- **사용자 매뉴얼**: [링크]
- **개발자 가이드**: [링크]

---

*이 문서는 프로젝트 진행 상황에 따라 지속적으로 업데이트됩니다.*
*최종 업데이트: 2025년 1월*
