# 드라이빙존 미션 시스템 V2 - 전체 Issues 상세

## 목차
- [Module 1: 인증 및 온보딩 시스템](#module-1-인증-및-온보딩-시스템-12-issues-42pt)
- [Module 2: 게이미피케이션 코어 시스템](#module-2-게이미피케이션-코어-시스템-18-issues-65pt)
- [Module 3: 일일 미션 시스템](#module-3-일일-미션-시스템-11-issues-38pt)
- [Module 4: 스토리 미션 시스템](#module-4-스토리-미션-시스템-15-issues-52pt)
- [Module 5: 소셜 및 커뮤니티 기능](#module-5-소셜-및-커뮤니티-기능-14-issues-48pt)
- [Module 6: 보상 및 페이백 시스템](#module-6-보상-및-페이백-시스템-12-issues-42pt)
- [Module 7: 관리자 대시보드 V2](#module-7-관리자-대시보드-v2-16-issues-55pt)
- [Module 8: UI/UX 개선 및 애니메이션](#module-8-uiux-개선-및-애니메이션-13-issues-45pt)
- [Module 9: 성능 최적화 및 배포](#module-9-성능-최적화-및-배포-11-issues-38pt)

---

## Module 1: 인증 및 온보딩 시스템 (12 Issues, 42pt)

### DZM-001: SMS 인증 API 구현 (8pt, High)
```yaml
name: "SMS 인증 API 구현 (카카오 알림톡 연동)"
description_html: |
  <h2>개요</h2>
  <p>카카오 알림톡을 활용한 SMS 인증 시스템을 구축합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>POST /api/auth/send-code 엔드포인트 구현</li>
    <li>카카오 비즈메시지 API 연동</li>
    <li>6자리 인증 코드 생성 (숫자)</li>
    <li>Redis에 코드 저장 (10분 TTL)</li>
    <li>인증 코드 검증 로직</li>
    <li>재발송 제한 (1분 쿨다운)</li>
    <li>일일 발송 제한 (10회)</li>
    <li>IP 기반 스팸 방지</li>
  </ul>

  <h2>API 스펙</h2>
  <h3>POST /api/auth/send-code</h3>
  <pre><code>{
  "phone": "01012345678"
}</code></pre>

  <h3>Response (Success)</h3>
  <pre><code>{
  "success": true,
  "message": "인증 코드가 발송되었습니다",
  "expiresIn": 600,
  "canResendAt": 1642012345
}</code></pre>

  <h3>Response (Error)</h3>
  <pre><code>{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "1분 후에 재시도해주세요",
  "retryAfter": 45
}</code></pre>

  <h3>POST /api/auth/verify-code</h3>
  <pre><code>{
  "phone": "01012345678",
  "code": "123456"
}</code></pre>

  <h2>완료 조건</h2>
  <ul>
    <li>인증 코드 발송 성공률 95% 이상</li>
    <li>10분 내 만료 동작</li>
    <li>재발송 제한 동작</li>
    <li>단위 테스트 커버리지 80% 이상</li>
    <li>에러 핸들링 완벽 (네트워크 오류, API 오류 등)</li>
  </ul>

  <h2>기술 스택</h2>
  <ul>
    <li>Supabase Edge Functions (Deno)</li>
    <li>Kakao Business Message API v2</li>
    <li>Redis (Upstash)</li>
    <li>Rate Limiter (upstash/ratelimit)</li>
  </ul>

  <h2>보안 고려사항</h2>
  <ul>
    <li>전화번호 정규화 (하이픈 제거)</li>
    <li>브루트포스 공격 방지</li>
    <li>로깅 (개인정보 마스킹)</li>
  </ul>

assignees: ["@backend-dev1"]
labels: ["backend", "api", "feature", "auth", "critical"]
priority: "high"
estimate_point: 8
state: "Todo"
module: "인증 및 온보딩 시스템"
cycle: "Sprint 1: Foundation & Auth"
start_date: "2025-01-20"
target_date: "2025-01-24"
```

### DZM-002: 회원가입 플로우 구현 (5pt, High)
```yaml
name: "회원가입 플로우 구현 (지점 자동 매칭)"
description_html: |
  <h2>개요</h2>
  <p>원클릭 회원가입 플로우를 구현합니다. URL 파라미터로 지점 자동 매칭 지원.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>POST /api/auth/register 엔드포인트</li>
    <li>필수 정보: 이름, 전화번호, 지점 ID</li>
    <li>선택 정보: 추천인 코드</li>
    <li>URL 파라미터 파싱 (store_id, referral_code)</li>
    <li>추천인 코드 검증 및 보너스 적립</li>
    <li>초기 레벨 1, XP 0 설정</li>
    <li>웰컴 뱃지 자동 부여</li>
    <li>고유 추천 코드 생성 (6자리 영숫자)</li>
  </ul>

  <h2>API 스펙</h2>
  <h3>POST /api/auth/register</h3>
  <pre><code>{
  "name": "홍길동",
  "phone": "01012345678",
  "storeId": 70,
  "referralCode": "ABC123" // optional
}</code></pre>

  <h3>Response (Success)</h3>
  <pre><code>{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "홍길동",
    "phone": "01012345678",
    "storeId": 70,
    "level": 1,
    "xp": 0,
    "referralCode": "HGD789",
    "badges": [
      {
        "id": "welcome-badge",
        "name": "웰컴 뱃지",
        "earnedAt": "2025-01-20T10:00:00Z"
      }
    ]
  },
  "token": "jwt_token_here"
}</code></pre>

  <h2>비즈니스 로직</h2>
  <h3>추천인 코드 검증</h3>
  <ul>
    <li>추천인 코드가 유효한지 확인</li>
    <li>추천인과 피추천인 모두 보너스 적립
      <ul>
        <li>추천인: +500 XP, +5000 코인</li>
        <li>피추천인: +200 XP, +2000 코인</li>
      </ul>
    </li>
    <li>referrals 테이블에 기록</li>
  </ul>

  <h3>지점 자동 매칭</h3>
  <ul>
    <li>URL: /register?store=70&ref=ABC123</li>
    <li>store 파라미터 → storeId 자동 설정</li>
    <li>ref 파라미터 → referralCode 자동 입력</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>회원가입 30초 이내 완료</li>
    <li>지점 자동 매칭 동작</li>
    <li>추천인 보너스 즉시 적립</li>
    <li>에러 핸들링 (중복 전화번호, 잘못된 지점 ID 등)</li>
    <li>웰컴 뱃지 자동 부여</li>
  </ul>

  <h2>데이터베이스 변경</h2>
  <pre><code>-- users 테이블에 컬럼 추가
ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN coins INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN referral_code VARCHAR(6) UNIQUE;
ALTER TABLE users ADD COLUMN referred_by UUID REFERENCES users(id);</code></pre>

assignees: ["@backend-dev1"]
labels: ["backend", "api", "feature", "auth"]
priority: "high"
estimate_point: 5
state: "Todo"
module: "인증 및 온보딩 시스템"
cycle: "Sprint 1: Foundation & Auth"
start_date: "2025-01-25"
target_date: "2025-01-27"
```

### DZM-003: 소셜 로그인 구현 (Google, Kakao, Naver) (13pt, Medium)
```yaml
name: "소셜 로그인 구현 (Google, Kakao, Naver)"
description_html: |
  <h2>개요</h2>
  <p>3개 소셜 플랫폼 OAuth 로그인을 구현합니다.</p>

  <h2>작업 내용</h2>

  <h3>백엔드 작업</h3>
  <ul>
    <li>Supabase Auth Provider 설정</li>
    <li>Google OAuth 2.0 연동
      <ul>
        <li>Client ID/Secret 설정</li>
        <li>Redirect URI 설정</li>
        <li>Scope: email, profile</li>
      </ul>
    </li>
    <li>Kakao OAuth 연동
      <ul>
        <li>REST API 키 설정</li>
        <li>JavaScript 키 설정</li>
        <li>동의 항목: 닉네임, 이메일, 전화번호</li>
      </ul>
    </li>
    <li>Naver OAuth 연동
      <ul>
        <li>Client ID/Secret 설정</li>
        <li>서비스 URL 등록</li>
      </ul>
    </li>
    <li>기존 계정 연동 처리
      <ul>
        <li>전화번호 매칭</li>
        <li>이메일 매칭</li>
      </ul>
    </li>
    <li>프로필 정보 자동 입력 (이름, 이메일, 프로필 사진)</li>
    <li>소셜 계정 연결/해제 기능</li>
  </ul>

  <h3>프론트엔드 작업</h3>
  <ul>
    <li>로그인 페이지에 소셜 로그인 버튼 추가</li>
    <li>각 플랫폼별 브랜드 가이드라인 준수</li>
    <li>로딩 상태 표시</li>
    <li>에러 핸들링 (팝업 차단, 취소 등)</li>
  </ul>

  <h2>플로우</h2>
  <h3>신규 사용자</h3>
  <ol>
    <li>소셜 로그인 버튼 클릭</li>
    <li>OAuth 인증 팝업</li>
    <li>인증 완료 → 프로필 정보 가져오기</li>
    <li>전화번호 입력 (필수)</li>
    <li>SMS 인증</li>
    <li>지점 선택</li>
    <li>회원가입 완료</li>
  </ol>

  <h3>기존 사용자 (계정 연동)</h3>
  <ol>
    <li>소셜 로그인 시도</li>
    <li>전화번호/이메일로 기존 계정 찾기</li>
    <li>계정 연동 여부 확인 모달</li>
    <li>연동 → 자동 로그인</li>
  </ol>

  <h2>API 스펙</h2>
  <h3>GET /api/auth/oauth/{provider}/authorize</h3>
  <p>OAuth 인증 URL 리다이렉트</p>

  <h3>GET /api/auth/oauth/{provider}/callback</h3>
  <p>OAuth 콜백 처리</p>

  <h3>POST /api/auth/oauth/link</h3>
  <pre><code>{
  "provider": "google",
  "userId": "uuid"
}</code></pre>

  <h3>DELETE /api/auth/oauth/unlink</h3>
  <pre><code>{
  "provider": "google",
  "userId": "uuid"
}</code></pre>

  <h2>완료 조건</h2>
  <ul>
    <li>3개 플랫폼 로그인 정상 동작</li>
    <li>기존 전화번호와 자동 연동</li>
    <li>프로필 정보 동기화 (이름, 이메일, 사진)</li>
    <li>계정 연결/해제 동작</li>
    <li>에러 케이스 처리 (팝업 차단, 취소, API 오류)</li>
    <li>모바일 웹뷰 지원</li>
  </ul>

  <h2>기술 스택</h2>
  <ul>
    <li>Supabase Auth</li>
    <li>Google OAuth 2.0</li>
    <li>Kakao Login REST API</li>
    <li>Naver Login API</li>
    <li>React (프론트엔드)</li>
  </ul>

  <h2>보안 고려사항</h2>
  <ul>
    <li>CSRF 토큰 검증</li>
    <li>State 파라미터 검증</li>
    <li>HTTPS 강제</li>
  </ul>

assignees: ["@backend-dev1", "@frontend-dev1"]
labels: ["backend", "frontend", "feature", "auth"]
priority: "medium"
estimate_point: 13
state: "Todo"
module: "인증 및 온보딩 시스템"
cycle: "Sprint 1: Foundation & Auth"
start_date: "2025-01-28"
target_date: "2025-02-02"
```

### DZM-004: 온보딩 튜토리얼 UI (8pt, High)
```yaml
name: "온보딩 튜토리얼 UI (스와이프 인터랙션)"
description_html: |
  <h2>개요</h2>
  <p>첫 방문 사용자를 위한 3단계 튜토리얼을 구현합니다.</p>

  <h2>디자인 요구사항</h2>

  <h3>슬라이드 1: "미션으로 혜택 받자!"</h3>
  <ul>
    <li>일러스트: 미션 카드와 보상 아이콘</li>
    <li>제목: "재미있는 미션으로 페이백 받자!"</li>
    <li>설명: "일일 미션부터 스토리 미션까지, 다양한 미션을 완료하고 실제 현금을 받아보세요"</li>
    <li>배경 색상: 밝은 파란색 그라디언트</li>
  </ul>

  <h3>슬라이드 2: "레벨업하고 뱃지 모으자!"</h3>
  <ul>
    <li>일러스트: 레벨업 애니메이션, 뱃지 컬렉션</li>
    <li>제목: "레벨업하고 특별한 뱃지를 모아보세요!"</li>
    <li>설명: "경험치를 쌓아 레벨을 올리고, 30가지 이상의 뱃지를 수집하세요"</li>
    <li>배경 색상: 밝은 보라색 그라디언트</li>
  </ul>

  <h3>슬라이드 3: "친구 추천하고 보너스 받자!"</h3>
  <ul>
    <li>일러스트: 친구 추천 아이콘, 코인 비</li>
    <li>제목: "친구를 초대하고 함께 혜택 받자!"</li>
    <li>설명: "친구 1명당 5,000원! 최대 3명까지 추천하고 15,000원을 받으세요"</li>
    <li>배경 색상: 밝은 초록색 그라디언트</li>
  </ul>

  <h2>작업 내용</h2>
  <ul>
    <li>Swiper.js 또는 react-slick 라이브러리 사용</li>
    <li>스와이프 제스처 구현 (터치, 마우스 드래그)</li>
    <li>진행 인디케이터 (점 3개)
      <ul>
        <li>현재 슬라이드: 파란색 점</li>
        <li>나머지: 회색 점</li>
        <li>애니메이션 전환</li>
      </ul>
    </li>
    <li>Skip 버튼 (우측 상단)
      <ul>
        <li>텍스트 버튼</li>
        <li>클릭 시 튜토리얼 종료</li>
      </ul>
    </li>
    <li>시작하기 버튼 (마지막 슬라이드)
      <ul>
        <li>큰 CTA 버튼</li>
        <li>클릭 시 메인 화면으로</li>
      </ul>
    </li>
    <li>LocalStorage에 완료 상태 저장
      <ul>
        <li>키: "onboarding_completed"</li>
        <li>값: true</li>
      </ul>
    </li>
    <li>자동 재생 (5초 간격, 선택)</li>
  </ul>

  <h2>애니메이션</h2>
  <ul>
    <li>슬라이드 전환: Fade + Slide (0.3초)</li>
    <li>일러스트 등장: Scale + Fade (0.5초)</li>
    <li>텍스트 등장: Fade up (0.4초, 0.1초 지연)</li>
    <li>버튼 펄스 애니메이션 (시작하기 버튼)</li>
  </ul>

  <h2>컴포넌트 구조</h2>
  <pre><code>&lt;OnboardingTutorial&gt;
  &lt;OnboardingSlide
    illustration={slide1Img}
    title="미션으로 혜택 받자!"
    description="..."
    backgroundColor="#E3F2FD"
  /&gt;
  &lt;OnboardingSlide ... /&gt;
  &lt;OnboardingSlide ... /&gt;

  &lt;ProgressIndicator current={0} total={3} /&gt;
  &lt;SkipButton onClick={handleSkip} /&gt;
  &lt;StartButton onClick={handleStart} /&gt; {/* 마지막 슬라이드만 */}
&lt;/OnboardingTutorial&gt;</code></pre>

  <h2>완료 조건</h2>
  <ul>
    <li>부드러운 스와이프 애니메이션 (60fps)</li>
    <li>Skip 시 다시 표시 안함</li>
    <li>모바일 반응형 완벽 지원 (320px ~ 768px)</li>
    <li>일러스트 최적화 (WebP, 50KB 이하)</li>
    <li>접근성: 키보드 네비게이션 지원</li>
  </ul>

  <h2>기술 스택</h2>
  <ul>
    <li>React</li>
    <li>Swiper.js 또는 react-slick</li>
    <li>Framer Motion (애니메이션)</li>
    <li>Tailwind CSS</li>
  </ul>

assignees: ["@frontend-dev1", "@ui-designer"]
labels: ["frontend", "ui-ux", "feature", "design"]
priority: "high"
estimate_point: 8
state: "Todo"
module: "인증 및 온보딩 시스템"
cycle: "Sprint 1: Foundation & Auth"
start_date: "2025-01-28"
target_date: "2025-01-31"
```

### DZM-005: 프로필 초기 설정 (5pt, Medium)
```yaml
name: "프로필 초기 설정 (닉네임, 아바타)"
description_html: |
  <h2>개요</h2>
  <p>회원가입 후 프로필 개인화 단계를 구현합니다.</p>

  <h2>UI 플로우</h2>
  <ol>
    <li>회원가입 완료 후 프로필 설정 화면 표시</li>
    <li>닉네임 입력</li>
    <li>아바타 선택 또는 업로드</li>
    <li>프로필 미리보기</li>
    <li>완료 또는 Skip</li>
  </ol>

  <h2>작업 내용</h2>

  <h3>닉네임 설정</h3>
  <ul>
    <li>입력 제약
      <ul>
        <li>길이: 2-10자</li>
        <li>허용 문자: 한글, 영문, 숫자</li>
        <li>특수문자 불가</li>
      </ul>
    </li>
    <li>실시간 중복 체크
      <ul>
        <li>디바운싱 (500ms)</li>
        <li>API: GET /api/users/check-nickname?nickname=홍길동</li>
        <li>사용 가능: 초록색 체크 아이콘</li>
        <li>중복: 빨간색 X 아이콘 + 에러 메시지</li>
      </ul>
    </li>
    <li>랜덤 닉네임 제안 버튼
      <ul>
        <li>형용사 + 명사 조합</li>
        <li>예: "활발한 드라이버", "신속한 러너"</li>
      </ul>
    </li>
  </ul>

  <h3>아바타 설정</h3>
  <ul>
    <li>기본 제공 아바타 (12종)
      <ul>
        <li>다양한 스타일 (남성 6종, 여성 6종)</li>
        <li>그리드 레이아웃 (3열)</li>
        <li>선택 시 테두리 하이라이트</li>
      </ul>
    </li>
    <li>커스텀 아바타 업로드
      <ul>
        <li>파일 형식: JPG, PNG, WebP</li>
        <li>최대 크기: 2MB</li>
        <li>자동 리사이징: 200x200px</li>
        <li>크롭 기능 (react-easy-crop)</li>
      </ul>
    </li>
  </ul>

  <h3>프로필 미리보기</h3>
  <ul>
    <li>카드 형태 미리보기
      <ul>
        <li>아바타 (원형)</li>
        <li>닉네임</li>
        <li>레벨 1</li>
        <li>XP 0 / 100</li>
      </ul>
    </li>
  </ul>

  <h3>Skip 기능</h3>
  <ul>
    <li>Skip 시 기본값 설정
      <ul>
        <li>닉네임: "드라이버{랜덤숫자}"</li>
        <li>아바타: 기본 아바타 1번</li>
      </ul>
    </li>
    <li>나중에 프로필 페이지에서 수정 가능</li>
  </ul>

  <h2>API 스펙</h2>
  <h3>GET /api/users/check-nickname</h3>
  <pre><code>Query: ?nickname=홍길동

Response:
{
  "available": true
}</code></pre>

  <h3>PUT /api/users/profile</h3>
  <pre><code>{
  "userId": "uuid",
  "nickname": "홍길동",
  "avatarUrl": "https://storage.../avatar.jpg"
}

Response:
{
  "success": true,
  "user": {
    "id": "uuid",
    "nickname": "홍길동",
    "avatarUrl": "https://..."
  }
}</code></pre>

  <h3>POST /api/users/upload-avatar</h3>
  <pre><code>Content-Type: multipart/form-data
{
  "file": File
}

Response:
{
  "success": true,
  "url": "https://storage.../avatar.jpg"
}</code></pre>

  <h2>완료 조건</h2>
  <ul>
    <li>닉네임 중복 체크 실시간 반영 (500ms 디바운싱)</li>
    <li>아바타 이미지 최적화 (WebP, 50KB 이하)</li>
    <li>크롭 기능 직관적</li>
    <li>Skip 시에도 기본값 설정</li>
    <li>프로필 미리보기 정확</li>
  </ul>

  <h2>기술 스택</h2>
  <ul>
    <li>React</li>
    <li>react-easy-crop (이미지 크롭)</li>
    <li>Supabase Storage (이미지 업로드)</li>
    <li>Sharp (서버 사이드 이미지 리사이징)</li>
  </ul>

assignees: ["@frontend-dev1", "@backend-dev1"]
labels: ["frontend", "backend", "feature"]
priority: "medium"
estimate_point: 5
state: "Todo"
module: "인증 및 온보딩 시스템"
cycle: "Sprint 1: Foundation & Auth"
start_date: "2025-02-01"
target_date: "2025-02-02"
```

### DZM-006: 추천인 코드 자동 적용 시스템 (3pt, Low)
```yaml
name: "추천인 코드 자동 적용 시스템"
description_html: |
  <h2>개요</h2>
  <p>URL 파라미터 또는 수동 입력으로 추천인 코드를 적용합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>URL에서 ref 파라미터 읽기
      <ul>
        <li>예: /register?store=70&ref=ABC123</li>
        <li>React Router useSearchParams 사용</li>
      </ul>
    </li>
    <li>추천인 코드 검증 API
      <ul>
        <li>GET /api/referral/validate?code=ABC123</li>
        <li>유효성 확인 (존재 여부, 자기 자신 여부)</li>
      </ul>
    </li>
    <li>추천인 정보 표시
      <ul>
        <li>추천인 닉네임</li>
        <li>추천인 프로필 사진</li>
        <li>추천 보너스 금액 (5,000원)</li>
      </ul>
    </li>
    <li>추천인 코드 수동 입력
      <ul>
        <li>입력 필드 (6자리)</li>
        <li>대소문자 구분 없음</li>
        <li>실시간 검증</li>
      </ul>
    </li>
    <li>가입 완료 시 양측 보너스 적립
      <ul>
        <li>추천인: +500 XP, +5000 코인</li>
        <li>피추천인: +200 XP, +2000 코인</li>
        <li>referrals 테이블에 기록</li>
      </ul>
    </li>
  </ul>

  <h2>UI 디자인</h2>
  <h3>추천인 정보 카드</h3>
  <pre><code>┌─────────────────────────────┐
│  👤 [프로필 사진]            │
│  홍길동님의 추천으로 가입     │
│                              │
│  🎁 가입 시 혜택             │
│  • 경험치 200 XP             │
│  • 코인 2,000개              │
│                              │
│  추천인도 5,000원 받아요!    │
└─────────────────────────────┘</code></pre>

  <h2>API 스펙</h2>
  <h3>GET /api/referral/validate</h3>
  <pre><code>Query: ?code=ABC123

Response (Success):
{
  "valid": true,
  "referrer": {
    "id": "uuid",
    "nickname": "홍길동",
    "avatarUrl": "https://...",
    "level": 15
  },
  "bonus": {
    "xp": 200,
    "coins": 2000
  }
}

Response (Invalid):
{
  "valid": false,
  "error": "REFERRAL_CODE_NOT_FOUND"
}</code></pre>

  <h2>완료 조건</h2>
  <ul>
    <li>추천인 코드 검증 동작 (실시간)</li>
    <li>보너스 즉시 적립 (트랜잭션)</li>
    <li>추천인에게 알림 발송 ("홍길동님이 가입했어요!")</li>
    <li>잘못된 코드 입력 시 에러 메시지</li>
    <li>자기 자신 추천 방지</li>
  </ul>

assignees: ["@backend-dev1", "@frontend-dev1"]
labels: ["backend", "frontend", "feature"]
priority: "low"
estimate_point: 3
state: "Todo"
module: "인증 및 온보딩 시스템"
cycle: "Sprint 1: Foundation & Auth"
```

### DZM-007: 비밀번호 재설정 플로우 (3pt, Medium)
```yaml
name: "비밀번호 재설정 플로우 (소셜 로그인용)"
description_html: |
  <h2>개요</h2>
  <p>소셜 로그인 사용자를 위한 비밀번호 재설정 기능 (나중에 일반 로그인 전환 시 사용)</p>

  <h2>작업 내용</h2>
  <ul>
    <li>비밀번호 재설정 요청
      <ul>
        <li>전화번호 입력</li>
        <li>SMS 인증 코드 발송</li>
        <li>코드 검증</li>
      </ul>
    </li>
    <li>새 비밀번호 설정
      <ul>
        <li>비밀번호 입력 (8자 이상)</li>
        <li>비밀번호 확인</li>
        <li>강도 체크 (약함/보통/강함)</li>
      </ul>
    </li>
    <li>재설정 완료 알림</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>SMS 인증 동작</li>
    <li>비밀번호 암호화 저장 (bcrypt)</li>
    <li>완료 후 자동 로그인</li>
  </ul>

assignees: ["@backend-dev1"]
labels: ["backend", "feature", "auth"]
priority: "medium"
estimate_point: 3
state: "Todo"
module: "인증 및 온보딩 시스템"
cycle: "Sprint 1: Foundation & Auth"
```

### DZM-008: 세션 관리 및 자동 로그인 (2pt, Medium)
```yaml
name: "세션 관리 및 자동 로그인"
description_html: |
  <h2>개요</h2>
  <p>JWT 토큰 기반 세션 관리 및 자동 로그인 기능을 구현합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>JWT 토큰 발급
      <ul>
        <li>Access Token: 1시간</li>
        <li>Refresh Token: 7일</li>
      </ul>
    </li>
    <li>토큰 저장
      <ul>
        <li>LocalStorage에 저장 (또는 HttpOnly Cookie)</li>
      </ul>
    </li>
    <li>토큰 자동 갱신
      <ul>
        <li>Access Token 만료 5분 전 자동 갱신</li>
        <li>Refresh Token 사용</li>
      </ul>
    </li>
    <li>자동 로그인
      <ul>
        <li>앱 시작 시 토큰 유효성 검증</li>
        <li>유효하면 자동 로그인</li>
      </ul>
    </li>
    <li>로그아웃
      <ul>
        <li>토큰 삭제</li>
        <li>서버 사이드 블랙리스트 추가 (선택)</li>
      </ul>
    </li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>자동 로그인 동작</li>
    <li>토큰 갱신 동작</li>
    <li>로그아웃 시 완전히 로그아웃됨</li>
  </ul>

assignees: ["@backend-dev1", "@frontend-dev1"]
labels: ["backend", "frontend", "feature", "auth"]
priority: "medium"
estimate_point: 2
state: "Todo"
module: "인증 및 온보딩 시스템"
cycle: "Sprint 1: Foundation & Auth"
```

### DZM-009: 로그인 페이지 UI 개선 (3pt, Medium)
```yaml
name: "로그인 페이지 UI 개선"
description_html: |
  <h2>개요</h2>
  <p>밝고 친근한 로그인 페이지를 디자인합니다.</p>

  <h2>디자인 요구사항</h2>
  <ul>
    <li>밝은 배경 (흰색 또는 밝은 그라디언트)</li>
    <li>드라이빙존 로고 (상단 중앙)</li>
    <li>전화번호 입력 필드
      <ul>
        <li>플레이스홀더: "010-1234-5678"</li>
        <li>자동 하이픈 삽입</li>
      </ul>
    </li>
    <li>인증 코드 발송 버튼 (큰 CTA 버튼)</li>
    <li>소셜 로그인 버튼 (3개)
      <ul>
        <li>Google</li>
        <li>Kakao (노란색)</li>
        <li>Naver (초록색)</li>
      </ul>
    </li>
    <li>회원가입 링크 (하단)</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>반응형 디자인</li>
    <li>접근성 준수</li>
  </ul>

assignees: ["@frontend-dev1", "@ui-designer"]
labels: ["frontend", "ui-ux", "design"]
priority: "medium"
estimate_point: 3
state: "Todo"
module: "인증 및 온보딩 시스템"
cycle: "Sprint 1: Foundation & Auth"
```

### DZM-010: 회원가입 페이지 UI 개선 (3pt, Medium)
```yaml
name: "회원가입 페이지 UI 개선"
description_html: |
  <h2>개요</h2>
  <p>회원가입 프로세스를 단계별로 나누어 직관적으로 개선합니다.</p>

  <h2>디자인 요구사항</h2>
  <h3>Step 1: 전화번호 인증</h3>
  <ul>
    <li>전화번호 입력</li>
    <li>인증 코드 발송</li>
    <li>인증 코드 입력</li>
  </ul>

  <h3>Step 2: 기본 정보 입력</h3>
  <ul>
    <li>이름 입력</li>
    <li>지점 선택 (드롭다운 또는 자동 완성)</li>
    <li>추천인 코드 (선택)</li>
  </ul>

  <h3>Step 3: 프로필 설정 (DZM-005)</h3>

  <h3>진행 상태 표시</h3>
  <ul>
    <li>상단에 스텝 인디케이터 (1/3, 2/3, 3/3)</li>
    <li>프로그레스 바</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>각 단계 전환 애니메이션</li>
    <li>이전 단계로 돌아가기 가능</li>
  </ul>

assignees: ["@frontend-dev1", "@ui-designer"]
labels: ["frontend", "ui-ux", "design"]
priority: "medium"
estimate_point: 3
state: "Todo"
module: "인증 및 온보딩 시스템"
cycle: "Sprint 1: Foundation & Auth"
```

### DZM-011: 에러 핸들링 및 사용자 피드백 (2pt, Low)
```yaml
name: "에러 핸들링 및 사용자 피드백 (토스트, 모달)"
description_html: |
  <h2>개요</h2>
  <p>인증 관련 에러를 사용자 친화적으로 표시합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>토스트 알림 (react-hot-toast)
      <ul>
        <li>성공: 초록색</li>
        <li>에러: 빨간색</li>
        <li>정보: 파란색</li>
      </ul>
    </li>
    <li>에러 메시지 예시
      <ul>
        <li>"인증 코드가 일치하지 않습니다"</li>
        <li>"이미 가입된 전화번호입니다"</li>
        <li>"추천인 코드를 찾을 수 없습니다"</li>
      </ul>
    </li>
    <li>로딩 상태 표시
      <ul>
        <li>버튼 스피너</li>
        <li>전체 화면 로딩 (페이지 전환 시)</li>
      </ul>
    </li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>모든 에러 케이스 처리</li>
    <li>사용자 친화적 메시지</li>
  </ul>

assignees: ["@frontend-dev1"]
labels: ["frontend", "ui-ux"]
priority: "low"
estimate_point: 2
state: "Todo"
module: "인증 및 온보딩 시스템"
cycle: "Sprint 1: Foundation & Auth"
```

### DZM-012: 단위 테스트 작성 (인증 모듈) (3pt, Medium)
```yaml
name: "단위 테스트 작성 (인증 모듈)"
description_html: |
  <h2>개요</h2>
  <p>인증 관련 API 및 컴포넌트의 단위 테스트를 작성합니다.</p>

  <h2>작업 내용</h2>
  <h3>백엔드 테스트 (Jest)</h3>
  <ul>
    <li>SMS 인증 코드 생성</li>
    <li>SMS 인증 코드 검증</li>
    <li>회원가입 API</li>
    <li>로그인 API</li>
    <li>JWT 토큰 발급</li>
    <li>추천인 코드 검증</li>
  </ul>

  <h3>프론트엔드 테스트 (React Testing Library)</h3>
  <ul>
    <li>로그인 폼 렌더링</li>
    <li>회원가입 폼 렌더링</li>
    <li>전화번호 입력 검증</li>
    <li>인증 코드 입력</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>테스트 커버리지 80% 이상</li>
    <li>모든 테스트 통과</li>
  </ul>

assignees: ["@backend-dev1", "@frontend-dev1"]
labels: ["testing", "backend", "frontend"]
priority: "medium"
estimate_point: 3
state: "Todo"
module: "인증 및 온보딩 시스템"
cycle: "Sprint 1: Foundation & Auth"
```

---

## Module 2: 게이미피케이션 코어 시스템 (18 Issues, 65pt)

(DZM-013 ~ DZM-030: 이미 작성된 내용 + 추가 상세 Issues)

### DZM-020: 특별 뱃지 이벤트 시스템 (2pt, Low)
```yaml
name: "특별 뱃지 이벤트 시스템 (시즌 한정)"
description_html: |
  <h2>개요</h2>
  <p>시즌별, 이벤트별 특별 뱃지를 발급하는 시스템을 구축합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>이벤트 뱃지 테이블 설계
      <ul>
        <li>시작일, 종료일</li>
        <li>발급 조건</li>
        <li>한정 수량 (선택)</li>
      </ul>
    </li>
    <li>시즌 뱃지 예시
      <ul>
        <li>설날 특별 뱃지 (2025-01-28 ~ 02-02)</li>
        <li>여름 휴가 뱃지 (2025-07-01 ~ 08-31)</li>
        <li>크리스마스 뱃지 (2025-12-20 ~ 12-26)</li>
      </ul>
    </li>
    <li>자동 발급 스케줄러</li>
    <li>이벤트 종료 시 뱃지 비활성화</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>기간 내에만 획득 가능</li>
    <li>이벤트 종료 후에도 보유한 뱃지는 유지</li>
  </ul>

assignees: ["@backend-dev2"]
labels: ["backend", "gamification", "feature"]
priority: "low"
estimate_point: 2
state: "Todo"
module: "게이미피케이션 코어 시스템"
cycle: "Sprint 3: Daily Missions & Badges"
```

### DZM-021: 랭킹 보상 시스템 (2pt, Medium)
```yaml
name: "랭킹 보상 시스템 (주간/월간 1-3위)"
description_html: |
  <h2>개요</h2>
  <p>주간 및 월간 랭킹 상위권에게 자동으로 보상을 지급합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>주간 랭킹 보상
      <ul>
        <li>1위: 5,000 코인</li>
        <li>2위: 3,000 코인</li>
        <li>3위: 2,000 코인</li>
      </ul>
    </li>
    <li>월간 랭킹 보상
      <ul>
        <li>1위: 20,000 코인 + 특별 뱃지</li>
        <li>2위: 15,000 코인 + 특별 뱃지</li>
        <li>3위: 10,000 코인 + 특별 뱃지</li>
      </ul>
    </li>
    <li>자동 지급 스케줄러
      <ul>
        <li>주간: 매주 월요일 00:00</li>
        <li>월간: 매월 1일 00:00</li>
      </ul>
    </li>
    <li>명예의 전당 페이지
      <ul>
        <li>역대 1위 목록</li>
        <li>월별 챔피언</li>
      </ul>
    </li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>자동 보상 지급 동작</li>
    <li>보상 지급 알림 발송</li>
    <li>명예의 전당 페이지 정상 표시</li>
  </ul>

assignees: ["@backend-dev1"]
labels: ["backend", "gamification", "feature"]
priority: "medium"
estimate_point: 2
state: "Todo"
module: "게이미피케이션 코어 시스템"
cycle: "Sprint 5: Ranking & Story Ch.4-6"
```

(계속해서 나머지 Issues 작성... 총 100+ Issues)

---

## Module 3: 일일 미션 시스템 (11 Issues, 38pt)

### DZM-031: 일일 미션 템플릿 시스템 (8pt, High)
```yaml
name: "일일 미션 템플릿 시스템 (30+ 미션 풀)"
description_html: |
  <h2>개요</h2>
  <p>다양한 일일 미션 템플릿을 생성하고 랜덤/로테이션 방식으로 할당합니다.</p>

  <h2>미션 카테고리</h2>

  <h3>1. 퀴즈 미션 (10개)</h3>
  <ul>
    <li>교통법규 OX 퀴즈 (5문제)
      <ul>
        <li>예: "신호등이 없는 횡단보도에서는 보행자가 건너려고 하면 반드시 정지해야 한다 (O)"</li>
        <li>예: "어린이 보호구역 제한속도는 시속 40km이다 (X, 30km)"</li>
      </ul>
    </li>
    <li>표지판 맞히기
      <ul>
        <li>이미지 표시 → 의미 선택</li>
      </ul>
    </li>
    <li>운전 상식 퀴즈</li>
  </ul>

  <h3>2. 체크인 미션 (5개)</h3>
  <ul>
    <li>학원 위치 인증
      <ul>
        <li>GPS 기반 위치 확인</li>
        <li>반경 500m 이내</li>
      </ul>
    </li>
    <li>아침 체크인 (오전 6-9시)</li>
    <li>저녁 체크인 (오후 6-9시)</li>
  </ul>

  <h3>3. 학습 미션 (8개)</h3>
  <ul>
    <li>교육 영상 시청 (3분)
      <ul>
        <li>주제: 안전운전, 교통법규, 주차요령 등</li>
        <li>시청 완료 검증</li>
      </ul>
    </li>
    <li>학습 노트 작성
      <ul>
        <li>오늘 배운 내용 한 줄 요약</li>
      </ul>
    </li>
    <li>안전 운전 팁 읽기</li>
  </ul>

  <h3>4. 소셜 미션 (7개)</h3>
  <ul>
    <li>친구에게 응원 메시지 보내기</li>
    <li>커뮤니티 게시글 좋아요 3개</li>
    <li>댓글 1개 작성</li>
    <li>학습 일지 공유</li>
  </ul>

  <h2>작업 내용</h2>
  <ul>
    <li>daily_mission_templates 테이블 설계
      <ul>
        <li>id, title, description, category, reward_xp, difficulty</li>
      </ul>
    </li>
    <li>미션 할당 로직
      <ul>
        <li>매일 3-5개 미션 랜덤 선택</li>
        <li>카테고리별 최소 1개 보장</li>
        <li>난이도 균형 (쉬움 2개, 보통 2개, 어려움 1개)</li>
      </ul>
    </li>
    <li>미션 완료 검증 로직</li>
    <li>보상 지급 (XP, 코인)</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>30개 이상 미션 템플릿 생성</li>
    <li>매일 다른 미션 조합</li>
    <li>완료 검증 정확</li>
  </ul>

assignees: ["@backend-dev2", "@product-manager"]
labels: ["backend", "gamification", "feature", "content"]
priority: "high"
estimate_point: 8
state: "Todo"
module: "일일 미션 시스템"
cycle: "Sprint 3: Daily Missions & Badges"
start_date: "2025-02-17"
target_date: "2025-02-21"
```

### DZM-032: 일일 미션 리셋 스케줄러 (3pt, High)
```yaml
name: "일일 미션 리셋 스케줄러 (매일 0시)"
description_html: |
  <h2>개요</h2>
  <p>매일 자정에 일일 미션을 리셋하고 새로운 미션을 할당합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>Cron Job 설정
      <ul>
        <li>Supabase Edge Functions + pg_cron</li>
        <li>또는 외부 서비스 (Vercel Cron, GitHub Actions)</li>
        <li>스케줄: 0 0 * * * (매일 00:00 KST)</li>
      </ul>
    </li>
    <li>리셋 로직
      <ul>
        <li>전날 미션 완료 상태 확인</li>
        <li>미완료 미션 만료 처리</li>
        <li>새로운 미션 3-5개 할당</li>
        <li>사용자별 일일 미션 생성</li>
      </ul>
    </li>
    <li>타임존 처리
      <ul>
        <li>KST (UTC+9) 기준</li>
        <li>사용자 위치 고려 (선택)</li>
      </ul>
    </li>
    <li>에러 핸들링
      <ul>
        <li>실패 시 재시도 (3회)</li>
        <li>Slack 알림</li>
      </ul>
    </li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>매일 정시 리셋 동작</li>
    <li>모든 활성 사용자에게 미션 할당</li>
    <li>에러 발생 시 알림</li>
  </ul>

assignees: ["@backend-dev2"]
labels: ["backend", "gamification", "automation"]
priority: "high"
estimate_point: 3
state: "Todo"
module: "일일 미션 시스템"
cycle: "Sprint 3: Daily Missions & Badges"
```

### DZM-033: 연속 출석 추적 시스템 (5pt, High)
```yaml
name: "연속 출석 추적 시스템 (보너스 7일, 30일)"
description_html: |
  <h2>개요</h2>
  <p>사용자의 연속 출석을 추적하고 보너스를 지급합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>attendance_records 테이블 설계
      <ul>
        <li>user_id, date, completed_missions_count</li>
      </ul>
    </li>
    <li>연속 출석 계산 로직
      <ul>
        <li>전날 출석 여부 확인</li>
        <li>연속 일수 증가/리셋</li>
        <li>users 테이블의 consecutive_days 업데이트</li>
      </ul>
    </li>
    <li>보너스 지급
      <ul>
        <li>7일 연속: +1000 XP, +500 코인, 뱃지</li>
        <li>14일 연속: +2000 XP, +1000 코인</li>
        <li>30일 연속: +5000 XP, +3000 코인, 특별 뱃지</li>
        <li>100일 연속: +10000 XP, +10000 코인, 골드 뱃지</li>
      </ul>
    </li>
    <li>출석 캘린더 UI
      <ul>
        <li>월별 캘린더</li>
        <li>출석일 체크 표시</li>
        <li>현재 연속 일수 표시</li>
      </ul>
    </li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>연속 출석 정확히 계산</li>
    <li>보너스 자동 지급</li>
    <li>캘린더 UI 직관적</li>
  </ul>

assignees: ["@backend-dev2", "@frontend-dev1"]
labels: ["backend", "frontend", "gamification", "feature"]
priority: "high"
estimate_point: 5
state: "Todo"
module: "일일 미션 시스템"
cycle: "Sprint 3: Daily Missions & Badges"
```

(계속해서 나머지 38pt 분량의 Issues 작성...)

---

(총 100+ Issues를 모두 작성하면 너무 길어지므로, 파일을 분리하여 계속 작성하겠습니다)
