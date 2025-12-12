# 🛫 Plane 프로젝트 기획 - 드라이빙존 미션 시스템 V2

## 1. 프로젝트 개요

### 프로젝트 정보
- **프로젝트명**: 드라이빙존 미션 시스템 V2 (Driving Zone Mission System V2)
- **프로젝트 식별자**: `DZM`
- **목표**: 게이미피케이션과 소셜 기능을 강화한 차세대 운전면허 학습 동기부여 플랫폼
- **기간**: 2025-01-20 ~ 2025-05-11 (16주)
- **팀 규모**: 5명 (백엔드 2, 프론트엔드 2, UI/UX 1)

### 비즈니스 목표
1. **신규 가입자 200% 증대**: 바이럴 미션과 추천 보너스로 신규 고객 유입
2. **재방문율 80% 달성**: 일일 미션과 연속 출석 보너스로 고객 리텐션 강화
3. **SNS 노출 300% 증가**: 소셜 미션과 공유 기능으로 브랜드 인지도 향상
4. **페이백 전환율 60% 달성**: 미션 완료 후 실제 보상 지급률 극대화

### 성공 지표 (KPI)
- [ ] MAU (월간 활성 사용자) 5,000명 달성
- [ ] 일일 미션 참여율 60% 이상
- [ ] SNS 공유를 통한 신규 유입 30% 달성
- [ ] 추천 미션 전환율 40% 이상
- [ ] 평균 세션 시간 8분 이상
- [ ] 앱 평점 4.5/5.0 이상

### 타겟 사용자
- **주 타겟**: 18-35세 운전면허 취득 예정자
- **특성**:
  - 스마트폰 네이티브 세대 (90%+ 일일 스마트폰 사용)
  - 게임/앱 리워드 프로그램 익숙
  - SNS 활동 활발 (Instagram, TikTok 주 사용)
  - 즉각적 피드백과 보상 선호
- **페인 포인트**:
  - 운전면허 학습 지루함
  - 동기부여 부족
  - 합격 후 혜택 부재
  - 학원 선택 어려움

---

## 2. Workspace 설정

### Workspace 구성
```yaml
Workspace 이름: "드라이빙존 (Driving Zone)"
로고: "/assets/logo-driving-zone.svg"
도메인: "drivingzone.plane.so"
```

### 통합 설정
- [x] GitHub 연동 (코드 리뷰 자동화)
- [x] Slack 연동 (#dev-notifications, #mission-alerts)
- [ ] Figma 연동 (디자인 시스템 동기화)
- [ ] Sentry 연동 (에러 추적)

---

## 3. Project 생성

### Project 기본 정보
```yaml
name: "드라이빙존 미션 시스템 V2"
identifier: "DZM"
description: "게이미피케이션 기반 운전면허 학습 동기부여 플랫폼. 미션, 레벨, 뱃지, 랭킹 시스템을 통한 사용자 참여 극대화"
network: "Private"
cover_image: "/assets/cover-dzm-v2.jpg"
icon: "🎯"
lead: "@product-manager"
default_assignee: "@tech-lead"
```

---

## 4. States 정의

### 워크플로우 상태

#### Backlog (백로그)
- **색상**: `#94a3b8` (회색)
- **설명**: 우선순위 미정 작업

#### Todo (시작 전)
- **색상**: `#3b82f6` (파란색)
- **설명**: 스프린트에 할당된 작업

#### In Progress (진행 중)
- **색상**: `#f59e0b` (주황색)
- **설명**: 현재 개발 진행 중

#### In Review (리뷰 중)
- **색상**: `#8b5cf6` (보라색)
- **설명**: 코드 리뷰 또는 QA 진행 중

#### Done (완료)
- **색상**: `#10b981` (초록색)
- **설명**: 작업 완료 및 배포됨

#### Cancelled (취소)
- **색상**: `#ef4444` (빨간색)
- **설명**: 작업 취소 또는 보류

---

## 5. Labels 설정

### 작업 유형 (Type)
- `feature` - #3b82f6 (파랑) - 새 기능
- `bug` - #ef4444 (빨강) - 버그 수정
- `enhancement` - #10b981 (초록) - 기능 개선
- `refactor` - #8b5cf6 (보라) - 리팩토링
- `design` - #ec4899 (핑크) - 디자인 작업
- `documentation` - #6366f1 (인디고) - 문서화
- `testing` - #f59e0b (주황) - 테스트

### 우선순위 (Priority)
- `critical` - #dc2626 - 서비스 중단
- `high` - #f97316 - 이번 스프린트 필수
- `medium` - #eab308 - 중요하지만 조정 가능
- `low` - #64748b - 시간 날 때

### 영역 (Area)
- `frontend` - #06b6d4 - 프론트엔드
- `backend` - #14b8a6 - 백엔드
- `database` - #84cc16 - 데이터베이스
- `api` - #a855f7 - API
- `ui-ux` - #f43f5e - UI/UX
- `gamification` - #10b981 - 게임화 요소
- `social` - #3b82f6 - 소셜 기능
- `analytics` - #f59e0b - 분석/통계

### 상태 태그
- `blocked` - #ef4444 - 블록됨
- `needs-review` - #8b5cf6 - 리뷰 필요
- `ready-for-dev` - #10b981 - 개발 준비 완료
- `needs-design` - #ec4899 - 디자인 필요

---

## 6. Issue Types 정의

### Task (작업)
- **아이콘**: ✓
- **설명**: 일반적인 개발 작업
- **예시**: "로그인 API 구현"

### Bug (버그)
- **아이콘**: 🐛
- **설명**: 버그 수정 작업
- **예시**: "레벨업 애니메이션 오류 수정"

### Feature (기능)
- **아이콘**: ✨
- **설명**: 새로운 기능 개발
- **예시**: "일일 미션 시스템 구축"

### Epic (에픽)
- **아이콘**: 🎯
- **설명**: 여러 하위 작업을 포함하는 큰 단위
- **예시**: "게이미피케이션 시스템 전체 구축"

---

## 7. Modules 계획

### Module 1: 인증 및 온보딩 시스템
```yaml
name: "인증 및 온보딩 시스템"
description: "SMS 인증, 회원가입, 튜토리얼, 초기 설정 플로우"
start_date: "2025-01-20"
target_date: "2025-02-16"
lead: "@backend-lead"
members: ["@backend-dev1", "@frontend-dev1", "@ui-designer"]
status: "planned"
```

**목표**:
- 원클릭 회원가입 (30초 이내)
- 직관적인 튜토리얼 (3단계 이내)
- 첫 미션 즉시 시작 가능

**핵심 작업** (총 42pt, 12 Issues):
1. SMS 인증 API (카카오/네이버 알림톡 연동) - 8pt
2. 회원가입 플로우 (지점 자동 매칭) - 5pt
3. 소셜 로그인 (Google, Kakao, Naver) - 13pt
4. 온보딩 튜토리얼 UI (스와이프 인터랙션) - 8pt
5. 프로필 초기 설정 (닉네임, 아바타) - 5pt
6. 추천인 코드 자동 적용 시스템 - 3pt

### Module 2: 게이미피케이션 코어 시스템
```yaml
name: "게이미피케이션 코어 시스템"
description: "레벨, 경험치, 뱃지, 업적, 랭킹 시스템"
start_date: "2025-02-03"
target_date: "2025-03-16"
lead: "@backend-lead"
members: ["@backend-dev1", "@backend-dev2", "@frontend-dev2", "@ui-designer"]
status: "planned"
```

**목표**:
- 실시간 경험치 반영
- 레벨업 축하 애니메이션
- 뱃지 컬렉션 시스템
- 주간/월간 랭킹 보드

**핵심 작업** (총 65pt, 18 Issues):

#### 레벨 시스템 (20pt, 5 Issues)
1. 경험치 계산 엔진 구현 - 8pt
   - 미션별 XP 테이블 설계
   - 레벨별 요구 XP 곡선 (지수 함수)
   - 보너스 XP 시스템 (연속 출석, 완벽 달성)

2. 레벨 테이블 및 보상 정의 - 3pt
   - Level 1-100 설계
   - 레벨별 언락 컨텐츠 (특별 미션, 뱃지)
   - 레벨별 타이틀 시스템

3. 레벨업 알림 및 애니메이션 - 5pt
   - Confetti 파티클 효과
   - 레벨업 모달 (보상 표시)
   - 사운드 효과 추가

4. 경험치 바 실시간 업데이트 - 2pt
   - 프로그레스 바 애니메이션
   - 퍼센티지 표시

5. 레벨 히스토리 추적 - 2pt
   - 레벨업 타임라인
   - 통계 페이지

#### 뱃지 시스템 (25pt, 7 Issues)
1. 뱃지 카테고리 정의 및 디자인 - 5pt
   - 미션 마스터 뱃지 (미션 완료 수)
   - 스피드 러너 뱃지 (빠른 합격)
   - 소셜 스타 뱃지 (SNS 공유)
   - 출석왕 뱃지 (연속 출석)
   - 추천왕 뱃지 (친구 추천)
   - 히든 뱃지 (특별 조건)

2. 뱃지 획득 조건 엔진 - 8pt
   - 조건 평가 시스템 (이벤트 기반)
   - 실시간 진행률 추적
   - 중복 획득 방지

3. 뱃지 언락 애니메이션 - 5pt
   - 뱃지 언락 모달
   - 3D 회전 효과
   - 축하 사운드

4. 뱃지 컬렉션 UI - 3pt
   - 그리드 레이아웃
   - 미획득 뱃지 실루엣
   - 상세 정보 툴팁

5. 뱃지 공유 기능 - 2pt
   - SNS 공유 이미지 생성
   - 공유 링크 생성

6. 특별 뱃지 이벤트 시스템 - 2pt
   - 시즌 한정 뱃지
   - 이벤트 뱃지

#### 랭킹 시스템 (20pt, 6 Issues)
1. 랭킹 알고리즘 설계 - 8pt
   - 종합 랭킹 (레벨 + 미션 완료)
   - 주간 랭킹 (최근 7일 활동)
   - 지점별 랭킹
   - 카테고리별 랭킹 (속도, 사교성 등)

2. 실시간 랭킹 업데이트 (Redis 캐싱) - 5pt
   - Sorted Set 활용
   - 1분 단위 갱신
   - 순위 변동 알림

3. 리더보드 UI 구현 - 3pt
   - 상위 100명 표시
   - 내 순위 하이라이트
   - 순위 변동 화살표

4. 랭킹 보상 시스템 - 2pt
   - 주간 1-3위 보상
   - 월간 명예의 전당

5. 랭킹 필터 및 검색 - 1pt
   - 기간별 필터
   - 지점별 필터

6. 랭킹 공유 기능 - 1pt
   - 내 순위 이미지 생성

### Module 3: 일일 미션 시스템
```yaml
name: "일일 미션 시스템"
description: "매일 리셋되는 간단한 미션으로 재방문 유도"
start_date: "2025-02-17"
target_date: "2025-03-16"
lead: "@backend-dev2"
members: ["@backend-dev2", "@frontend-dev1", "@ui-designer"]
status: "planned"
```

**목표**:
- 매일 오전 0시 미션 리셋
- 5-10분 내 완료 가능한 간단한 미션
- 연속 출석 보너스

**핵심 작업** (총 38pt, 11 Issues):

1. 일일 미션 템플릿 시스템 - 8pt
   - 미션 풀 관리 (30+ 미션)
   - 랜덤 또는 로테이션 로직
   - 난이도 조절

2. 일일 미션 카테고리 - 5pt
   - 퀴즈 미션 (교통법규 OX)
   - 체크인 미션 (학원 위치 인증)
   - 학습 미션 (교육 영상 시청)
   - 소셜 미션 (친구에게 응원 보내기)

3. 미션 리셋 스케줄러 - 3pt
   - Cron Job 설정
   - 타임존 처리

4. 연속 출석 추적 시스템 - 5pt
   - 연속 일수 카운트
   - 보너스 계산 (7일, 14일, 30일)
   - 출석 캘린더 UI

5. 일일 미션 UI 카드 - 5pt
   - 진행률 프로그레스 바
   - 타이머 (리셋까지 남은 시간)
   - 완료 체크 애니메이션

6. 일일 미션 알림 - 3pt
   - 푸시 알림 (오전 10시)
   - 인앱 배너

7. 미션 완료 보상 UI - 2pt
   - XP 획득 애니메이션
   - 코인 획득 (가상 화폐)

8. 일일 보너스 시스템 - 3pt
   - 모든 일일 미션 완료 시 추가 보상
   - 완벽한 주 달성 보너스

9. 미션 건너뛰기 기능 - 2pt
   - 코인 소모로 미션 스킵
   - 1일 1회 제한

10. 일일 미션 통계 - 1pt
    - 완료율 추적
    - 가장 인기 있는 미션 분석

11. 특별 일일 이벤트 - 1pt
    - 주말 특별 미션 (2배 보상)
    - 기념일 이벤트

### Module 4: 스토리 미션 시스템
```yaml
name: "스토리 미션 시스템"
description: "합격까지의 여정을 스토리로 구성한 메인 미션"
start_date: "2025-02-24"
target_date: "2025-04-06"
lead: "@frontend-dev2"
members: ["@frontend-dev1", "@frontend-dev2", "@backend-dev1", "@ui-designer"]
status: "planned"
```

**목표**:
- 운전면허 취득 과정을 6개 챕터로 스토리화
- 각 챕터는 3-5개 미션으로 구성
- 순차적 언락 (이전 챕터 완료 필수)

**핵심 작업** (총 52pt, 15 Issues):

#### 챕터 1: "시작의 발걸음" (10pt, 3 Issues)
1. 챕터 1 스토리 및 미션 설계 - 3pt
   - 미션 1-1: 수강 카드 등록
   - 미션 1-2: 프로필 완성하기
   - 미션 1-3: 첫 친구 추천하기

2. 챕터 UI 디자인 - 5pt
   - 맵 인터페이스 (지도 형태)
   - 미션 노드 (아이콘, 잠금 상태)
   - 진행 경로 선

3. 챕터 언락 애니메이션 - 2pt

#### 챕터 2: "학습의 시작" (8pt, 2 Issues)
1. 챕터 2 미션 설계 - 3pt
   - 미션 2-1: 교육 시간 10시간 달성
   - 미션 2-2: 학과 시험 합격 인증
   - 미션 2-3: 학습 일지 3일 작성

2. 학습 시간 추적 시스템 - 5pt
   - 체크인/체크아웃
   - 자동 시간 계산

#### 챕터 3: "도전과 성장" (10pt, 3 Issues)
1. 챕터 3 미션 설계 - 3pt
   - 미션 3-1: 기능 시험 1회 합격
   - 미션 3-2: 연습 주행 5회 완료
   - 미션 3-3: 강사님 리뷰 작성

2. 시험 결과 인증 시스템 - 5pt
   - 응시원서 업로드
   - OCR 자동 인식
   - 관리자 승인 플로우

3. 실패 격려 시스템 - 2pt
   - 재도전 미션
   - 응원 메시지

#### 챕터 4: "합격의 문턱" (8pt, 2 Issues)
1. 챕터 4 미션 설계 - 3pt
   - 미션 4-1: 도로 주행 시험 합격
   - 미션 4-2: 14시간 내 합격 (보너스)
   - 미션 4-3: 합격 인증샷 SNS 공유

2. 합격 인증 시스템 - 5pt
   - 면허증 사진 업로드
   - 자동 검증 로직

#### 챕터 5: "합격 축하" (8pt, 2 Issues)
1. 챕터 5 미션 설계 - 3pt
   - 미션 5-1: 합격 후기 작성
   - 미션 5-2: 별점 평가
   - 미션 5-3: 3곳 플랫폼 리뷰 작성

2. 리뷰 작성 UI - 5pt
   - 템플릿 제공
   - 이미지 첨부
   - 자동 플랫폼 링크

#### 챕터 6: "전문가의 길" (8pt, 3 Issues)
1. 챕터 6 미션 설계 - 3pt
   - 미션 6-1: 친구 3명 추천 성공
   - 미션 6-2: 운전 팁 공유
   - 미션 6-3: 커뮤니티 활동 10회

2. 커뮤니티 기능 - 3pt
   - 게시판 (팁, 후기)
   - 댓글 시스템

3. 전문가 뱃지 및 혜택 - 2pt
   - 졸업 뱃지
   - 특별 할인 쿠폰

### Module 5: 소셜 및 커뮤니티 기능
```yaml
name: "소셜 및 커뮤니티 기능"
description: "친구, 그룹, 커뮤니티, 공유 기능"
start_date: "2025-03-17"
target_date: "2025-04-20"
lead: "@frontend-dev1"
members: ["@frontend-dev1", "@backend-dev2", "@ui-designer"]
status: "planned"
```

**목표**:
- 친구 추가 및 활동 피드
- 그룹 챌린지 (같은 학원 친구들과 경쟁)
- 커뮤니티 게시판

**핵심 작업** (총 48pt, 14 Issues):

1. 친구 시스템 - 8pt
   - 친구 추가/삭제
   - 친구 요청 알림
   - 친구 목록 UI

2. 친구 활동 피드 - 5pt
   - 레벨업, 미션 완료 피드
   - 좋아요, 댓글

3. 친구 초대 시스템 - 5pt
   - 초대 링크 생성
   - 카카오톡 공유
   - 초대 보상

4. 그룹 챌린지 - 13pt
   - 그룹 생성 (최대 10명)
   - 그룹 랭킹
   - 그룹 미션 (협동)
   - 그룹 보상 분배

5. 커뮤니티 게시판 - 8pt
   - 카테고리별 게시판 (팁, 후기, 질문)
   - 글 작성/수정/삭제
   - 이미지 업로드

6. 댓글 및 좋아요 시스템 - 3pt
   - 댓글 작성
   - 좋아요 카운트

7. 신고 및 차단 기능 - 2pt
   - 부적절한 게시물 신고
   - 사용자 차단

8. 인기글 및 베스트 - 2pt
   - 주간 베스트
   - 인기 순 정렬

9. 검색 기능 - 2pt
   - 키워드 검색
   - 태그 검색

### Module 6: 보상 및 페이백 시스템
```yaml
name: "보상 및 페이백 시스템"
description: "포인트, 코인, 실제 현금 페이백 관리"
start_date: "2025-03-31"
target_date: "2025-04-27"
lead: "@backend-lead"
members: ["@backend-dev1", "@backend-dev2", "@frontend-dev2"]
status: "planned"
```

**목표**:
- 가상 화폐 (코인) 시스템
- 실제 현금 페이백 자동화
- 보상 히스토리 투명성

**핵심 작업** (총 42pt, 12 Issues):

1. 포인트 시스템 설계 - 5pt
   - XP (경험치)
   - Coin (가상 화폐)
   - Cash (실제 페이백)

2. 코인 적립 로직 - 5pt
   - 미션 완료 시 적립
   - 보너스 코인 이벤트

3. 코인 사용 시스템 - 8pt
   - 아이템 상점 (아바타, 테마)
   - 미션 스킵
   - 부스터 (XP 2배)

4. 페이백 신청 플로우 - 8pt
   - 신청 조건 확인
   - 계좌 정보 입력
   - 신청 내역 추적

5. 관리자 페이백 승인 시스템 - 5pt
   - 승인/거부 인터페이스
   - 증빙 자료 확인
   - 일괄 처리

6. 페이백 지급 자동화 - 5pt
   - 은행 API 연동
   - 지급 스케줄러
   - 실패 재시도

7. 보상 히스토리 UI - 3pt
   - 적립 내역
   - 사용 내역
   - 페이백 내역

8. 세금 계산 시스템 - 2pt
   - 기타 소득 신고
   - 연말정산 서류

9. 보상 알림 - 1pt
   - 페이백 승인 알림
   - 입금 완료 알림

### Module 7: 관리자 대시보드 V2
```yaml
name: "관리자 대시보드 V2"
description: "실시간 통계, 미션 관리, 사용자 관리, 페이백 처리"
start_date: "2025-04-07"
target_date: "2025-05-04"
lead: "@frontend-dev2"
members: ["@frontend-dev2", "@backend-dev1"]
status: "planned"
```

**핵심 작업** (총 55pt, 16 Issues):

1. 실시간 대시보드 - 8pt
   - 금일 가입자 수
   - 미션 완료율
   - 페이백 대기 건수
   - 활성 사용자 수

2. 미션 생성 및 편집 - 8pt
   - 드래그 앤 드롭 빌더
   - 미션 템플릿
   - 미리보기

3. 사용자 관리 - 5pt
   - 검색 및 필터
   - 상세 정보 조회
   - 계정 정지/복구

4. 미션 제출물 검토 - 8pt
   - 이미지 뷰어
   - 승인/거부
   - 거부 사유 템플릿

5. 페이백 일괄 처리 - 5pt
   - 체크박스 선택
   - 일괄 승인
   - 엑셀 다운로드

6. 통계 및 분석 - 8pt
   - 차트 (가입 추이, 미션 완료율)
   - 지점별 비교
   - 기간별 필터

7. 알림 관리 - 3pt
   - 푸시 알림 발송
   - 예약 발송
   - 타겟 설정

8. 이벤트 관리 - 5pt
   - 이벤트 생성
   - 배너 관리
   - 기간 설정

9. 권한 관리 - 3pt
   - 역할별 권한 설정
   - 지점별 접근 제어

10. 신고 관리 - 2pt
    - 신고 목록
    - 처리 상태

### Module 8: UI/UX 개선 및 애니메이션
```yaml
name: "UI/UX 개선 및 애니메이션"
description: "마이크로 인터랙션, 스켈레톤, 로딩 상태, 반응형"
start_date: "2025-04-14"
target_date: "2025-05-11"
lead: "@ui-designer"
members: ["@ui-designer", "@frontend-dev1", "@frontend-dev2"]
status: "planned"
```

**핵심 작업** (총 45pt, 13 Issues):

1. 디자인 시스템 구축 - 8pt
   - 컬러 팔레트 (밝고 친근한 톤)
   - 타이포그래피
   - 컴포넌트 라이브러리

2. 스켈레톤 로딩 - 5pt
   - 카드 스켈레톤
   - 리스트 스켈레톤

3. 마이크로 인터랙션 - 8pt
   - 버튼 호버 효과
   - 카드 확대 효과
   - 스와이프 제스처

4. 페이지 전환 애니메이션 - 5pt
   - Fade in/out
   - Slide transition

5. 보상 애니메이션 - 8pt
   - Confetti 효과
   - 코인 획득 애니메이션
   - 레벨업 효과

6. 하단 탭바 네비게이션 - 5pt
   - 홈, 미션, 랭킹, 친구, 프로필
   - 선택 시 아이콘 애니메이션

7. 반응형 디자인 - 3pt
   - 모바일 우선
   - 태블릿 최적화

8. 다크 모드 - 2pt
   - 테마 전환
   - 컬러 변수화

9. 접근성 개선 - 1pt
   - ARIA 레이블
   - 키보드 네비게이션

### Module 9: 성능 최적화 및 배포
```yaml
name: "성능 최적화 및 배포"
description: "캐싱, CDN, 이미지 최적화, CI/CD"
start_date: "2025-04-28"
target_date: "2025-05-11"
lead: "@tech-lead"
members: ["@backend-dev1", "@backend-dev2", "@frontend-dev1"]
status: "planned"
```

**핵심 작업** (총 38pt, 11 Issues):

1. Redis 캐싱 - 8pt
   - 랭킹 캐시
   - 미션 목록 캐시
   - 세션 관리

2. 이미지 최적화 - 5pt
   - WebP 변환
   - Lazy loading
   - CDN 연동

3. API 응답 최적화 - 5pt
   - GraphQL 또는 REST 최적화
   - N+1 쿼리 해결
   - Pagination

4. 번들 최적화 - 3pt
   - Code splitting
   - Tree shaking
   - Minification

5. CI/CD 파이프라인 - 5pt
   - GitHub Actions
   - 자동 테스트
   - 자동 배포

6. 모니터링 설정 - 3pt
   - Sentry (에러 추적)
   - Google Analytics
   - Performance monitoring

7. 보안 강화 - 5pt
   - HTTPS 강제
   - CORS 설정
   - Rate limiting

8. 백업 및 복구 - 2pt
   - DB 백업 스케줄
   - 재해 복구 계획

9. 로드 테스트 - 2pt
   - k6 또는 Artillery
   - 병목 지점 파악

---

## 8. Cycles 계획 (2주 스프린트)

### Cycle 1: Sprint 1 - Foundation & Auth (2025-01-20 ~ 2025-02-02)
```yaml
name: "Sprint 1: Foundation & Auth"
start_date: "2025-01-20"
end_date: "2025-02-02"
owned_by: "@tech-lead"
description: "프로젝트 기반 설정 및 인증 시스템 구축"
```

**목표**:
- [x] 개발 환경 설정 완료
- [x] DB 스키마 설계 (게이미피케이션 테이블 추가)
- [x] SMS 인증 API 구현
- [x] 회원가입 플로우 완성

**할당 Issues**: 8개, 40pt

### Cycle 2: Sprint 2 - Gamification Core (2025-02-03 ~ 2025-02-16)
```yaml
name: "Sprint 2: Gamification Core"
start_date: "2025-02-03"
end_date: "2025-02-16"
owned_by: "@backend-lead"
description: "레벨, 경험치, 뱃지 시스템 핵심 구현"
```

**목표**:
- [ ] 경험치 계산 엔진 완성
- [ ] 레벨 테이블 및 보상 정의
- [ ] 레벨업 애니메이션 구현
- [ ] 뱃지 시스템 기초 구축

**할당 Issues**: 10개, 50pt

### Cycle 3: Sprint 3 - Daily Missions & Badges (2025-02-17 ~ 2025-03-02)
```yaml
name: "Sprint 3: Daily Missions & Badges"
start_date: "2025-02-17"
end_date: "2025-03-02"
description: "일일 미션 시스템 및 뱃지 완성"
```

**목표**:
- [ ] 일일 미션 템플릿 30개 생성
- [ ] 연속 출석 추적 시스템
- [ ] 뱃지 획득 조건 엔진 완성
- [ ] 뱃지 컬렉션 UI

**할당 Issues**: 12개, 55pt

### Cycle 4: Sprint 4 - Story Missions Ch.1-3 (2025-03-03 ~ 2025-03-16)
```yaml
name: "Sprint 4: Story Missions Ch.1-3"
start_date: "2025-03-03"
end_date: "2025-03-16"
description: "스토리 미션 챕터 1-3 구현"
```

**목표**:
- [ ] 맵 인터페이스 UI 완성
- [ ] 챕터 1-3 미션 구현
- [ ] 학습 시간 추적 시스템
- [ ] 시험 결과 인증 시스템

**할당 Issues**: 11개, 52pt

### Cycle 5: Sprint 5 - Ranking & Story Ch.4-6 (2025-03-17 ~ 2025-03-30)
```yaml
name: "Sprint 5: Ranking & Story Ch.4-6"
start_date: "2025-03-17"
end_date: "2025-03-30"
description: "랭킹 시스템 및 스토리 미션 완료"
```

**목표**:
- [ ] 실시간 랭킹 시스템 (Redis)
- [ ] 리더보드 UI
- [ ] 챕터 4-6 미션 구현
- [ ] 합격 인증 시스템

**할당 Issues**: 10개, 48pt

### Cycle 6: Sprint 6 - Social Features (2025-03-31 ~ 2025-04-13)
```yaml
name: "Sprint 6: Social Features"
start_date: "2025-03-31"
end_date: "2025-04-13"
description: "소셜 기능 및 커뮤니티 구축"
```

**목표**:
- [ ] 친구 시스템 완성
- [ ] 그룹 챌린지 구현
- [ ] 커뮤니티 게시판
- [ ] 활동 피드

**할당 Issues**: 14개, 48pt

### Cycle 7: Sprint 7 - Rewards & Payback (2025-04-14 ~ 2025-04-27)
```yaml
name: "Sprint 7: Rewards & Payback"
start_date: "2025-04-14"
end_date: "2025-04-27"
description: "보상 시스템 및 페이백 자동화"
```

**목표**:
- [ ] 코인 시스템 완성
- [ ] 아이템 상점
- [ ] 페이백 자동화
- [ ] 관리자 페이백 승인 시스템

**할당 Issues**: 12개, 42pt

### Cycle 8: Sprint 8 - Admin Dashboard & Polish (2025-04-28 ~ 2025-05-11)
```yaml
name: "Sprint 8: Admin Dashboard & Polish"
start_date: "2025-04-28"
end_date: "2025-05-11"
description: "관리자 대시보드 및 최종 마무리"
```

**목표**:
- [ ] 실시간 대시보드 완성
- [ ] 성능 최적화
- [ ] UI/UX 폴리싱
- [ ] 배포 및 모니터링 설정

**할당 Issues**: 16개, 60pt

---

## 9. Issues 생성

### Module 1: 인증 및 온보딩 시스템 (12 Issues, 42pt)

#### DZM-001: SMS 인증 API 구현 (8pt, High)
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
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>인증 코드 발송 성공률 95% 이상</li>
    <li>10분 내 만료 동작</li>
    <li>재발송 제한 동작</li>
    <li>단위 테스트 커버리지 80% 이상</li>
  </ul>

  <h2>기술 스택</h2>
  <ul>
    <li>Supabase Edge Functions</li>
    <li>Kakao Business Message API</li>
    <li>Redis (Upstash)</li>
  </ul>

assignees: ["@backend-dev1"]
labels: ["backend", "api", "feature", "auth"]
priority: "high"
estimate_point: 8
state: "Todo"
module: "인증 및 온보딩 시스템"
cycle: "Sprint 1: Foundation & Auth"
```

#### DZM-002: 회원가입 플로우 구현 (5pt, High)
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
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>회원가입 30초 이내 완료</li>
    <li>지점 자동 매칭 동작</li>
    <li>추천인 보너스 즉시 적립</li>
    <li>에러 핸들링 (중복 전화번호 등)</li>
  </ul>

assignees: ["@backend-dev1"]
labels: ["backend", "api", "feature", "auth"]
priority: "high"
estimate_point: 5
state: "Todo"
module: "인증 및 온보딩 시스템"
cycle: "Sprint 1: Foundation & Auth"
```

#### DZM-003: 소셜 로그인 구현 (Google, Kakao, Naver) (13pt, Medium)
```yaml
name: "소셜 로그인 구현 (Google, Kakao, Naver)"
description_html: |
  <h2>개요</h2>
  <p>3개 소셜 플랫폼 OAuth 로그인을 구현합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>Supabase Auth Provider 설정</li>
    <li>Google OAuth 2.0 연동</li>
    <li>Kakao OAuth 연동</li>
    <li>Naver OAuth 연동</li>
    <li>기존 계정 연동 처리</li>
    <li>프로필 정보 자동 입력 (이름, 이메일)</li>
    <li>소셜 계정 연결/해제 기능</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>3개 플랫폼 로그인 정상 동작</li>
    <li>기존 전화번호와 자동 연동</li>
    <li>프로필 정보 동기화</li>
    <li>계정 연결/해제 동작</li>
  </ul>

assignees: ["@backend-dev1", "@frontend-dev1"]
labels: ["backend", "frontend", "feature", "auth"]
priority: "medium"
estimate_point: 13
state: "Todo"
module: "인증 및 온보딩 시스템"
cycle: "Sprint 1: Foundation & Auth"
```

#### DZM-004: 온보딩 튜토리얼 UI (스와이프 인터랙션) (8pt, High)
```yaml
name: "온보딩 튜토리얼 UI (스와이프 인터랙션)"
description_html: |
  <h2>개요</h2>
  <p>첫 방문 사용자를 위한 3단계 튜토리얼을 구현합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>3개 슬라이드 디자인</li>
    <li>슬라이드 1: "미션으로 혜택 받자!"</li>
    <li>슬라이드 2: "레벨업하고 뱃지 모으자!"</li>
    <li>슬라이드 3: "친구 추천하고 보너스 받자!"</li>
    <li>스와이프 제스처 구현</li>
    <li>진행 인디케이터 (점 3개)</li>
    <li>Skip 버튼</li>
    <li>시작하기 버튼 (마지막 슬라이드)</li>
    <li>LocalStorage에 완료 상태 저장</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>부드러운 스와이프 애니메이션</li>
    <li>Skip 시 다시 표시 안함</li>
    <li>모바일 반응형 완벽 지원</li>
  </ul>

assignees: ["@frontend-dev1", "@ui-designer"]
labels: ["frontend", "ui-ux", "feature"]
priority: "high"
estimate_point: 8
state: "Todo"
module: "인증 및 온보딩 시스템"
cycle: "Sprint 1: Foundation & Auth"
```

#### DZM-005: 프로필 초기 설정 (닉네임, 아바타) (5pt, Medium)
```yaml
name: "프로필 초기 설정 (닉네임, 아바타)"
description_html: |
  <h2>개요</h2>
  <p>회원가입 후 프로필 개인화 단계를 구현합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>닉네임 입력 (2-10자, 중복 체크)</li>
    <li>아바타 선택 (기본 제공 12종)</li>
    <li>아바타 업로드 (선택)</li>
    <li>프로필 미리보기</li>
    <li>Skip 가능 (나중에 설정)</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>닉네임 중복 체크 실시간 반영</li>
    <li>아바타 이미지 최적화 (WebP)</li>
    <li>Skip 시에도 기본값 설정</li>
  </ul>

assignees: ["@frontend-dev1"]
labels: ["frontend", "feature"]
priority: "medium"
estimate_point: 5
state: "Todo"
module: "인증 및 온보딩 시스템"
cycle: "Sprint 1: Foundation & Auth"
```

#### DZM-006: 추천인 코드 자동 적용 시스템 (3pt, Low)
```yaml
name: "추천인 코드 자동 적용 시스템"
description_html: |
  <h2>개요</h2>
  <p>URL 파라미터 또는 수동 입력으로 추천인 코드를 적용합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>URL에서 ref 파라미터 읽기</li>
    <li>추천인 코드 검증 API</li>
    <li>추천인 정보 표시 (이름, 프로필)</li>
    <li>보너스 금액 안내</li>
    <li>가입 완료 시 양측 보너스 적립</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>추천인 코드 검증 동작</li>
    <li>보너스 즉시 적립</li>
    <li>추천인에게 알림 발송</li>
  </ul>

assignees: ["@backend-dev1"]
labels: ["backend", "feature"]
priority: "low"
estimate_point: 3
state: "Todo"
module: "인증 및 온보딩 시스템"
cycle: "Sprint 1: Foundation & Auth"
```

### Module 2: 게이미피케이션 코어 시스템 (18 Issues, 65pt)

#### DZM-007: 경험치 계산 엔진 구현 (8pt, Critical)
```yaml
name: "경험치 계산 엔진 구현"
description_html: |
  <h2>개요</h2>
  <p>미션 완료, 활동 등에 따른 경험치 계산 및 적립 시스템을 구현합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>경험치 테이블 설계 (missions_xp, activities_xp)</li>
    <li>미션 타입별 기본 XP 설정</li>
    <li>보너스 XP 로직
      <ul>
        <li>연속 출석: +10% (7일), +20% (14일), +50% (30일)</li>
        <li>완벽 달성: +30% (모든 조건 만족)</li>
        <li>스피드 보너스: +20% (빠른 완료)</li>
        <li>첫 완료: +50% (미션 카테고리 최초)</li>
      </ul>
    </li>
    <li>XP 적립 트랜잭션 관리</li>
    <li>레벨업 자동 감지</li>
    <li>XP 히스토리 저장</li>
  </ul>

  <h2>미션별 기본 XP</h2>
  <ul>
    <li>일일 미션: 50-100 XP</li>
    <li>스토리 미션: 200-500 XP</li>
    <li>챌린지 미션: 1000 XP</li>
    <li>추천 미션: 500 XP</li>
    <li>소셜 미션: 300 XP</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>XP 적립 시 즉시 반영</li>
    <li>레벨업 자동 감지 및 알림</li>
    <li>보너스 XP 정확히 계산</li>
    <li>트랜잭션 롤백 지원</li>
  </ul>

assignees: ["@backend-dev1"]
labels: ["backend", "gamification", "feature", "critical"]
priority: "urgent"
estimate_point: 8
state: "Todo"
module: "게이미피케이션 코어 시스템"
cycle: "Sprint 2: Gamification Core"
```

#### DZM-008: 레벨 테이블 및 보상 정의 (3pt, High)
```yaml
name: "레벨 테이블 및 보상 정의 (Level 1-100)"
description_html: |
  <h2>개요</h2>
  <p>레벨 1부터 100까지의 경험치 요구량과 보상을 정의합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>레벨 테이블 설계
      <ul>
        <li>Level 1-10: 초보 운전자 (100 XP 간격)</li>
        <li>Level 11-30: 연습생 (200 XP 간격)</li>
        <li>Level 31-50: 숙련가 (500 XP 간격)</li>
        <li>Level 51-80: 전문가 (1000 XP 간격)</li>
        <li>Level 81-100: 마스터 (2000 XP 간격)</li>
      </ul>
    </li>
    <li>레벨별 타이틀
      <ul>
        <li>Level 1: 새내기 드라이버</li>
        <li>Level 10: 초보 탈출</li>
        <li>Level 20: 도로 위의 신인</li>
        <li>Level 30: 안전 운전자</li>
        <li>Level 50: 베테랑 드라이버</li>
        <li>Level 100: 운전 마스터</li>
      </ul>
    </li>
    <li>레벨별 보상
      <ul>
        <li>코인 지급 (레벨 × 10)</li>
        <li>특별 뱃지 언락</li>
        <li>특별 미션 언락</li>
      </ul>
    </li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>레벨 1-100 테이블 완성</li>
    <li>XP 곡선이 자연스러움</li>
    <li>보상이 매력적</li>
  </ul>

assignees: ["@product-manager", "@backend-dev1"]
labels: ["backend", "gamification", "design"]
priority: "high"
estimate_point: 3
state: "Todo"
module: "게이미피케이션 코어 시스템"
cycle: "Sprint 2: Gamification Core"
```

#### DZM-009: 레벨업 알림 및 애니메이션 (5pt, High)
```yaml
name: "레벨업 알림 및 애니메이션 (Confetti 효과)"
description_html: |
  <h2>개요</h2>
  <p>레벨업 시 화려한 축하 애니메이션과 모달을 표시합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>레벨업 감지 (실시간)</li>
    <li>Confetti 파티클 효과 (canvas-confetti 라이브러리)</li>
    <li>레벨업 모달 디자인
      <ul>
        <li>새 레벨 표시 (큰 숫자)</li>
        <li>레벨 타이틀 표시</li>
        <li>획득한 보상 목록</li>
        <li>다음 레벨까지 XP</li>
      </ul>
    </li>
    <li>사운드 효과 (레벨업 징글)</li>
    <li>푸시 알림 발송</li>
    <li>모달 닫기 버튼</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>레벨업 즉시 모달 표시</li>
    <li>Confetti 효과 부드러움</li>
    <li>사운드 ON/OFF 설정 가능</li>
    <li>모달 외부 클릭으로 닫기</li>
  </ul>

assignees: ["@frontend-dev2", "@ui-designer"]
labels: ["frontend", "gamification", "ui-ux", "feature"]
priority: "high"
estimate_point: 5
state: "Todo"
module: "게이미피케이션 코어 시스템"
cycle: "Sprint 2: Gamification Core"
```

#### DZM-010: 경험치 바 실시간 업데이트 (2pt, Medium)
```yaml
name: "경험치 바 실시간 업데이트 (프로그레스 바)"
description_html: |
  <h2>개요</h2>
  <p>헤더 또는 프로필에 경험치 바를 표시하고 실시간 업데이트합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>프로그레스 바 컴포넌트</li>
    <li>현재 XP / 다음 레벨 필요 XP 표시</li>
    <li>퍼센티지 계산</li>
    <li>XP 증가 애니메이션 (부드럽게 증가)</li>
    <li>툴팁 (자세한 정보)</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>XP 획득 시 바 즉시 증가</li>
    <li>애니메이션 부드러움 (0.5초)</li>
    <li>레벨업 시 바 리셋</li>
  </ul>

assignees: ["@frontend-dev1"]
labels: ["frontend", "gamification", "ui-ux"]
priority: "medium"
estimate_point: 2
state: "Todo"
module: "게이미피케이션 코어 시스템"
cycle: "Sprint 2: Gamification Core"
```

#### DZM-011: 레벨 히스토리 추적 (2pt, Low)
```yaml
name: "레벨 히스토리 추적 (타임라인)"
description_html: |
  <h2>개요</h2>
  <p>사용자의 레벨업 히스토리를 타임라인 형태로 표시합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>level_history 테이블 설계</li>
    <li>레벨업 시 기록 저장</li>
    <li>타임라인 UI (프로필 페이지)</li>
    <li>각 레벨업 날짜, 소요 시간 표시</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>레벨업 히스토리 정확히 기록</li>
    <li>타임라인 UI 직관적</li>
  </ul>

assignees: ["@backend-dev1", "@frontend-dev1"]
labels: ["backend", "frontend", "gamification"]
priority: "low"
estimate_point: 2
state: "Todo"
module: "게이미피케이션 코어 시스템"
cycle: "Sprint 2: Gamification Core"
```

#### DZM-012: 뱃지 카테고리 정의 및 디자인 (5pt, High)
```yaml
name: "뱃지 카테고리 정의 및 디자인 (30+ 뱃지)"
description_html: |
  <h2>개요</h2>
  <p>다양한 카테고리의 뱃지를 정의하고 디자인합니다.</p>

  <h2>뱃지 카테고리</h2>

  <h3>1. 미션 마스터 뱃지</h3>
  <ul>
    <li>첫 미션 완료</li>
    <li>미션 10개 완료</li>
    <li>미션 50개 완료</li>
    <li>미션 100개 완료</li>
    <li>모든 미션 완료</li>
  </ul>

  <h3>2. 스피드 러너 뱃지</h3>
  <ul>
    <li>10시간 내 합격</li>
    <li>12시간 내 합격</li>
    <li>14시간 내 합격</li>
  </ul>

  <h3>3. 소셜 스타 뱃지</h3>
  <ul>
    <li>SNS 첫 공유</li>
    <li>SNS 10회 공유</li>
    <li>친구 초대 1명</li>
    <li>친구 초대 10명</li>
  </ul>

  <h3>4. 출석왕 뱃지</h3>
  <ul>
    <li>연속 출석 7일</li>
    <li>연속 출석 30일</li>
    <li>연속 출석 100일</li>
  </ul>

  <h3>5. 히든 뱃지</h3>
  <ul>
    <li>심야 학습 (자정 이후 미션 완료)</li>
    <li>얼리버드 (오전 6시 이전 체크인)</li>
    <li>완벽주의자 (모든 미션 100% 완료)</li>
    <li>행운아 (추첨 이벤트 당첨)</li>
  </ul>

  <h2>작업 내용</h2>
  <ul>
    <li>badges 테이블 설계</li>
    <li>각 뱃지 아이콘 디자인 (SVG)</li>
    <li>뱃지 등급 (브론즈, 실버, 골드, 플래티넘)</li>
    <li>뱃지 설명 및 획득 조건 텍스트</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>30개 이상 뱃지 정의</li>
    <li>모든 뱃지 아이콘 디자인 완료</li>
    <li>획득 조건 명확</li>
  </ul>

assignees: ["@ui-designer", "@product-manager"]
labels: ["design", "gamification", "ui-ux"]
priority: "high"
estimate_point: 5
state: "Todo"
module: "게이미피케이션 코어 시스템"
cycle: "Sprint 2: Gamification Core"
```

#### DZM-013: 뱃지 획득 조건 엔진 구현 (8pt, Critical)
```yaml
name: "뱃지 획득 조건 엔진 구현 (이벤트 기반)"
description_html: |
  <h2>개요</h2>
  <p>사용자 활동을 추적하고 뱃지 획득 조건을 자동으로 평가하는 엔진을 구현합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>이벤트 시스템 설계
      <ul>
        <li>MISSION_COMPLETED</li>
        <li>LEVEL_UP</li>
        <li>STREAK_UPDATED</li>
        <li>FRIEND_INVITED</li>
        <li>SNS_SHARED</li>
      </ul>
    </li>
    <li>조건 평가 엔진
      <ul>
        <li>조건 타입: COUNT, STREAK, TIME_BASED, COMBINATION</li>
        <li>JSON 기반 조건 정의</li>
        <li>실시간 진행률 계산</li>
      </ul>
    </li>
    <li>중복 획득 방지</li>
    <li>뱃지 언락 이벤트 발행</li>
    <li>user_badges 테이블 업데이트</li>
  </ul>

  <h2>조건 예시</h2>
  <pre><code>{
  "type": "COUNT",
  "event": "MISSION_COMPLETED",
  "threshold": 10,
  "filter": {
    "mission_type": "daily"
  }
}</code></pre>

  <h2>완료 조건</h2>
  <ul>
    <li>모든 뱃지 조건 정확히 평가</li>
    <li>실시간 진행률 업데이트</li>
    <li>중복 획득 방지</li>
    <li>성능 최적화 (1초 이내 평가)</li>
  </ul>

assignees: ["@backend-dev1", "@backend-dev2"]
labels: ["backend", "gamification", "feature", "critical"]
priority: "urgent"
estimate_point: 8
state: "Todo"
module: "게이미피케이션 코어 시스템"
cycle: "Sprint 2: Gamification Core"
```

#### DZM-014: 뱃지 언락 애니메이션 (5pt, High)
```yaml
name: "뱃지 언락 애니메이션 (3D 회전 효과)"
description_html: |
  <h2>개요</h2>
  <p>뱃지 획득 시 화려한 언락 애니메이션을 표시합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>뱃지 언락 모달 디자인</li>
    <li>3D 회전 효과 (CSS transform 또는 Three.js)</li>
    <li>빛 효과 (glow, shimmer)</li>
    <li>축하 사운드</li>
    <li>뱃지 이름 및 설명 표시</li>
    <li>SNS 공유 버튼</li>
    <li>컬렉션 보러가기 버튼</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>3D 회전 애니메이션 부드러움</li>
    <li>모바일에서도 성능 좋음</li>
    <li>사운드 ON/OFF 설정 반영</li>
  </ul>

assignees: ["@frontend-dev2", "@ui-designer"]
labels: ["frontend", "gamification", "ui-ux", "feature"]
priority: "high"
estimate_point: 5
state: "Todo"
module: "게이미피케이션 코어 시스템"
cycle: "Sprint 3: Daily Missions & Badges"
```

#### DZM-015: 뱃지 컬렉션 UI (3pt, Medium)
```yaml
name: "뱃지 컬렉션 UI (그리드 레이아웃)"
description_html: |
  <h2>개요</h2>
  <p>획득한 뱃지와 미획득 뱃지를 한눈에 볼 수 있는 컬렉션 페이지를 구현합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>그리드 레이아웃 (3-4열)</li>
    <li>획득한 뱃지: 컬러 표시</li>
    <li>미획득 뱃지: 실루엣 (흑백)</li>
    <li>진행률 표시 (예: 15/30 획득)</li>
    <li>뱃지 클릭 시 상세 정보 모달
      <ul>
        <li>뱃지 이름, 설명</li>
        <li>획득 조건</li>
        <li>획득 날짜 (획득 시)</li>
        <li>진행률 (미획득 시)</li>
      </ul>
    </li>
    <li>카테고리별 필터</li>
    <li>정렬 (획득일, 이름, 희귀도)</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>획득/미획득 구분 명확</li>
    <li>진행률 정확히 표시</li>
    <li>반응형 그리드</li>
  </ul>

assignees: ["@frontend-dev1"]
labels: ["frontend", "gamification", "ui-ux"]
priority: "medium"
estimate_point: 3
state: "Todo"
module: "게이미피케이션 코어 시스템"
cycle: "Sprint 3: Daily Missions & Badges"
```

#### DZM-016: 뱃지 공유 기능 (2pt, Low)
```yaml
name: "뱃지 공유 기능 (SNS 이미지 생성)"
description_html: |
  <h2>개요</h2>
  <p>획득한 뱃지를 SNS에 공유할 수 있는 이미지를 자동 생성합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>Canvas API로 공유 이미지 생성
      <ul>
        <li>뱃지 아이콘</li>
        <li>뱃지 이름</li>
        <li>사용자 이름</li>
        <li>드라이빙존 로고</li>
      </ul>
    </li>
    <li>공유 링크 생성 (딥링크)</li>
    <li>카카오톡, 인스타그램, 페이스북 공유</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>이미지 자동 생성 동작</li>
    <li>SNS 공유 정상 동작</li>
  </ul>

assignees: ["@frontend-dev1"]
labels: ["frontend", "social", "feature"]
priority: "low"
estimate_point: 2
state: "Todo"
module: "게이미피케이션 코어 시스템"
cycle: "Sprint 3: Daily Missions & Badges"
```

#### DZM-017: 랭킹 알고리즘 설계 (8pt, High)
```yaml
name: "랭킹 알고리즘 설계 (종합, 주간, 지점별)"
description_html: |
  <h2>개요</h2>
  <p>다양한 기준의 랭킹 시스템을 설계합니다.</p>

  <h2>랭킹 타입</h2>

  <h3>1. 종합 랭킹</h3>
  <ul>
    <li>점수 = 레벨 × 100 + 총 XP + 뱃지 수 × 50</li>
    <li>전체 사용자 대상</li>
  </ul>

  <h3>2. 주간 랭킹</h3>
  <ul>
    <li>최근 7일 XP 합계</li>
    <li>매주 월요일 리셋</li>
    <li>상위 3명 보상</li>
  </ul>

  <h3>3. 지점별 랭킹</h3>
  <ul>
    <li>같은 지점 사용자끼리 경쟁</li>
    <li>월간 최우수 지점 선정</li>
  </ul>

  <h3>4. 카테고리별 랭킹</h3>
  <ul>
    <li>스피드 랭킹 (합격까지 시간)</li>
    <li>소셜 랭킹 (SNS 공유 횟수)</li>
    <li>친구 랭킹 (추천 성공 수)</li>
  </ul>

  <h2>작업 내용</h2>
  <ul>
    <li>rankings 테이블 설계</li>
    <li>점수 계산 함수</li>
    <li>랭킹 업데이트 로직</li>
    <li>동점자 처리 (최근 활동 우선)</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>4가지 랭킹 정확히 계산</li>
    <li>동점자 처리 공정</li>
    <li>주간 랭킹 자동 리셋</li>
  </ul>

assignees: ["@backend-dev1", "@product-manager"]
labels: ["backend", "gamification", "design"]
priority: "high"
estimate_point: 8
state: "Todo"
module: "게이미피케이션 코어 시스템"
cycle: "Sprint 5: Ranking & Story Ch.4-6"
```

#### DZM-018: 실시간 랭킹 업데이트 (Redis 캐싱) (5pt, High)
```yaml
name: "실시간 랭킹 업데이트 (Redis Sorted Set)"
description_html: |
  <h2>개요</h2>
  <p>Redis Sorted Set을 활용하여 실시간 랭킹을 구현합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>Redis Sorted Set 활용
      <ul>
        <li>ranking:overall - 종합 랭킹</li>
        <li>ranking:weekly - 주간 랭킹</li>
        <li>ranking:store:{store_id} - 지점별 랭킹</li>
      </ul>
    </li>
    <li>점수 업데이트 이벤트 리스너</li>
    <li>ZADD, ZREVRANGE 활용</li>
    <li>1분 단위 갱신 (Cron)</li>
    <li>순위 변동 감지 및 알림</li>
    <li>캐시 무효화 전략</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>랭킹 조회 속도 100ms 이내</li>
    <li>점수 업데이트 즉시 반영</li>
    <li>순위 변동 알림 발송</li>
  </ul>

assignees: ["@backend-dev2"]
labels: ["backend", "gamification", "performance"]
priority: "high"
estimate_point: 5
state: "Todo"
module: "게이미피케이션 코어 시스템"
cycle: "Sprint 5: Ranking & Story Ch.4-6"
```

#### DZM-019: 리더보드 UI 구현 (3pt, Medium)
```yaml
name: "리더보드 UI 구현 (상위 100명)"
description_html: |
  <h2>개요</h2>
  <p>리더보드를 직관적으로 표시하는 UI를 구현합니다.</p>

  <h2>작업 내용</h2>
  <ul>
    <li>상위 100명 리스트 표시</li>
    <li>1-3위 특별 표시 (금, 은, 동 메달)</li>
    <li>내 순위 하이라이트 (고정 상단)</li>
    <li>각 항목 표시 정보
      <ul>
        <li>순위</li>
        <li>프로필 사진</li>
        <li>닉네임</li>
        <li>레벨</li>
        <li>점수</li>
        <li>순위 변동 (↑↓)</li>
      </ul>
    </li>
    <li>탭 전환 (종합, 주간, 지점, 카테고리)</li>
    <li>무한 스크롤 또는 페이지네이션</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>리스트 부드럽게 스크롤</li>
    <li>내 순위 항상 보임</li>
    <li>순위 변동 애니메이션</li>
  </ul>

assignees: ["@frontend-dev2"]
labels: ["frontend", "gamification", "ui-ux"]
priority: "medium"
estimate_point: 3
state: "Todo"
module: "게이미피케이션 코어 시스템"
cycle: "Sprint 5: Ranking & Story Ch.4-6"
```

(계속해서 모든 Module의 Issues를 작성... 총 100+ Issues)

---

## 10. Views & Filters 설정

### View 1: My Active Missions
```yaml
name: "내 진행 중 미션"
filters:
  - assignee: "본인"
  - labels: ["gamification", "frontend", "backend"]
  - state: ["In Progress", "In Review"]
grouping: "module"
ordering: "priority" (desc)
```

### View 2: This Sprint
```yaml
name: "이번 스프린트"
filters:
  - cycle: "현재 Cycle"
  - state: !["Done", "Cancelled"]
grouping: "state"
ordering: "estimate_point" (desc)
```

### View 3: High Priority
```yaml
name: "높은 우선순위"
filters:
  - priority: ["urgent", "high"]
  - state: !["Done", "Cancelled"]
grouping: "assignee"
ordering: "priority" (desc)
```

### View 4: UI/UX Tasks
```yaml
name: "UI/UX 작업"
filters:
  - labels: ["ui-ux", "design", "frontend"]
grouping: "module"
ordering: "created_at" (desc)
```

---

## 11. Team & Permissions

### 팀 구성

| 이름 | 역할 | 담당 영역 | Email |
|------|------|-----------|-------|
| @product-manager | Admin | 전체 기획 및 관리 | pm@drivingzone.com |
| @tech-lead | Admin | 기술 총괄 | tech@drivingzone.com |
| @backend-lead | Member | 백엔드 리드 | backend-lead@drivingzone.com |
| @backend-dev1 | Member | 백엔드 개발 (인증, 게임화) | backend1@drivingzone.com |
| @backend-dev2 | Member | 백엔드 개발 (미션, 소셜) | backend2@drivingzone.com |
| @frontend-dev1 | Member | 프론트엔드 (UI 컴포넌트) | frontend1@drivingzone.com |
| @frontend-dev2 | Member | 프론트엔드 (애니메이션) | frontend2@drivingzone.com |
| @ui-designer | Member | UI/UX 디자인 | design@drivingzone.com |
| @qa-engineer | Member | QA 및 테스트 | qa@drivingzone.com |

---

## 12. Pages 문서화

### 1. 프로젝트 README
- 프로젝트 개요
- 기술 스택
- 개발 환경 설정
- 배포 가이드

### 2. API 문서
- 인증 API
- 게이미피케이션 API
- 미션 API
- 소셜 API
- 페이백 API

### 3. 게이미피케이션 가이드
- 레벨 시스템 설명
- 뱃지 목록 및 조건
- 랭킹 알고리즘
- 보상 체계

### 4. UI/UX 디자인 시스템
- 컬러 팔레트
- 타이포그래피
- 컴포넌트 라이브러리
- 애니메이션 가이드

### 5. 회의록
- Sprint Planning 회의록
- Retrospective 회의록

---

## 13. 워크플로우 자동화

### GitHub 통합
- PR 제목에 이슈 번호 포함 시 자동 연결
- PR 머지 시 이슈 자동 완료
- 브랜치 전략: main ← develop ← feature/DZM-###

### Slack 알림
- 새 이슈 생성 알림
- 이슈 상태 변경 알림
- PR 생성/머지 알림
- Sprint 종료 요약 리포트

---

## 📊 프로젝트 요약

### 전체 통계
- **기간**: 16주 (2025-01-20 ~ 2025-05-11)
- **Cycles**: 8개 (각 2주)
- **Modules**: 9개
- **Issues**: 100+ 개 (예상)
- **Total Story Points**: 450+ pt

### Module별 Story Points
1. 인증 및 온보딩: 42pt
2. 게이미피케이션 코어: 65pt
3. 일일 미션: 38pt
4. 스토리 미션: 52pt
5. 소셜 및 커뮤니티: 48pt
6. 보상 및 페이백: 42pt
7. 관리자 대시보드: 55pt
8. UI/UX 개선: 45pt
9. 성능 최적화: 38pt

### 팀 워크로드 (주당)
- 백엔드 (2명): 25-30pt (적정)
- 프론트엔드 (2명): 20-25pt (적정)
- UI/UX (1명): 10-15pt (적정)
- **전체**: Cycle당 110-140pt

---

## 🎯 핵심 차별점

### 1. 게이미피케이션 강화
- 100레벨 시스템
- 30+ 뱃지 컬렉션
- 실시간 랭킹 (4가지 타입)
- 일일 미션으로 재방문 유도

### 2. 스토리텔링
- 6개 챕터로 구성된 여정
- 순차적 언락으로 성취감
- 합격까지의 과정을 게임처럼

### 3. 소셜 기능
- 친구 시스템
- 그룹 챌린지
- 커뮤니티 게시판
- 활동 피드

### 4. UI/UX 혁신
- 밝고 친근한 디자인
- 부드러운 애니메이션
- 하단 탭바 네비게이션
- 반응형 디자인

### 5. 보상 체계
- 가상 화폐 (코인)
- 실제 페이백
- 아이템 상점
- 투명한 히스토리

---

## 🚀 다음 단계

### 1. 기획서 검토
```bash
cat plans/driving-zone-mission-v2.md
```

### 2. Plane에 업로드
```bash
/upload-plan plans/driving-zone-mission-v2.md
```

### 3. Sprint 1 시작
- Kickoff 미팅
- 백로그 우선순위 조정
- 개발 환경 설정

---

**작성일**: 2025-01-10
**버전**: 2.0.0
**작성자**: Product Team & Claude Code
