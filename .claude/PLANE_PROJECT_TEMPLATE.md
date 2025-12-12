# 🛫 Plane 프로젝트 기획 템플릿

> Plane의 모든 기능을 활용한 체계적인 프로젝트 관리 템플릿입니다.

---

## 📋 목차
1. [프로젝트 개요](#1-프로젝트-개요)
2. [Workspace 설정](#2-workspace-설정)
3. [Project 생성](#3-project-생성)
4. [States 정의](#4-states-정의)
5. [Labels 설정](#5-labels-설정)
6. [Issue Types 정의](#6-issue-types-정의)
7. [Modules 계획](#7-modules-계획)
8. [Cycles 계획](#8-cycles-계획)
9. [Issues 생성](#9-issues-생성)
10. [Views & Filters 설정](#10-views--filters-설정)
11. [Team & Permissions](#11-team--permissions)
12. [Pages 문서화](#12-pages-문서화)
13. [워크플로우 자동화](#13-워크플로우-자동화)

---

## 1. 프로젝트 개요

### 프로젝트 정보
- **프로젝트명**: `[프로젝트 이름]`
- **프로젝트 식별자**: `[PROJ]` (3-7자 대문자)
- **목표**: `[프로젝트의 핵심 목표]`
- **기간**: `[YYYY-MM-DD] ~ [YYYY-MM-DD]`
- **팀 규모**: `[N명]`

### 비즈니스 목표
- 목표 1
- 목표 2
- 목표 3

### 성공 지표 (KPI)
- [ ] 지표 1: [구체적인 숫자]
- [ ] 지표 2: [구체적인 숫자]
- [ ] 지표 3: [구체적인 숫자]

---

## 2. Workspace 설정

### Workspace 구성
```
Workspace 이름: [조직/회사명]
로고: [로고 경로 또는 URL]
도메인: [사용자 지정 도메인 - 선택사항]
```

### 통합 설정
- [ ] GitHub 연동
- [ ] Slack 연동
- [ ] 기타 통합 도구

### CLI 예시
```bash
# Workspace 정보 확인
"현재 워크스페이스 정보 보여줘"
```

---

## 3. Project 생성

### Project 기본 정보
```yaml
name: "[프로젝트명]"
identifier: "[PROJ]"
description: "[프로젝트 상세 설명]"
network: "Public/Private"
```

### Project 설정
- **Cover Image**: `[이미지 URL]`
- **Icon**: `[아이콘 선택]`
- **Lead**: `[@담당자]`
- **Default Assignee**: `[@기본 담당자]`

### CLI 예시
```bash
# 프로젝트 생성
"PROJ 식별자로 '[프로젝트명]' 프로젝트 만들어줘"

# 프로젝트 목록 확인
"프로젝트 목록 보여줘"
```

---

## 4. States 정의

### 워크플로우 상태 (Workflow States)

#### Backlog (백로그)
- **상태명**: Backlog
- **색상**: `#94a3b8` (회색)
- **설명**: 우선순위가 정해지지 않은 작업

#### Unstarted (시작 전)
- **상태명**: Todo
- **색상**: `#3b82f6` (파란색)
- **설명**: 작업 예정이지만 아직 시작하지 않음

#### Started (진행 중)
- **상태명**: In Progress
- **색상**: `#f59e0b` (주황색)
- **설명**: 현재 작업 진행 중

- **상태명**: In Review
- **색상**: `#8b5cf6` (보라색)
- **설명**: 코드 리뷰 또는 QA 진행 중

#### Completed (완료)
- **상태명**: Done
- **색상**: `#10b981` (초록색)
- **설명**: 작업 완료 및 배포됨

#### Cancelled (취소)
- **상태명**: Cancelled
- **색상**: `#ef4444` (빨간색)
- **설명**: 작업 취소 또는 보류

### CLI 예시
```bash
# State 생성
"In Review 상태를 보라색으로 만들어줘"

# State 목록 확인
"현재 프로젝트의 모든 상태 보여줘"
```

---

## 5. Labels 설정

### 카테고리별 라벨

#### 작업 유형 (Type)
- 🐛 `bug` - #ef4444 (빨강)
- ✨ `feature` - #3b82f6 (파랑)
- 🔧 `enhancement` - #10b981 (초록)
- 📚 `documentation` - #6366f1 (인디고)
- 🎨 `design` - #ec4899 (핑크)
- ♻️ `refactor` - #8b5cf6 (보라)
- 🧪 `testing` - #f59e0b (주황)

#### 우선순위 (Priority Label - 선택)
- 🔥 `critical` - #dc2626
- ⚡ `high` - #f97316
- 📌 `medium` - #eab308
- 💤 `low` - #64748b

#### 영역 (Area)
- 🎯 `frontend` - #06b6d4
- ⚙️ `backend` - #14b8a6
- 💾 `database` - #84cc16
- 🔐 `security` - #f43f5e
- 🌐 `api` - #a855f7
- 📱 `mobile` - #0ea5e9

#### 상태 태그 (Status Tags)
- 🚧 `blocked` - #ef4444
- 🤔 `needs-discussion` - #f59e0b
- 👀 `needs-review` - #8b5cf6
- ✅ `ready-for-dev` - #10b981

### CLI 예시
```bash
# Label 생성
"bug 라벨을 빨간색으로 만들어줘"

# Label 목록 확인
"프로젝트의 모든 라벨 보여줘"
```

---

## 6. Issue Types 정의

### Issue 타입 구조

#### Task (작업)
- **설명**: 일반적인 개발 작업
- **아이콘**: ✓
- **예시**: "로그인 API 구현"

#### Bug (버그)
- **설명**: 버그 수정 작업
- **아이콘**: 🐛
- **예시**: "로그인 시 에러 발생 수정"

#### Feature (기능)
- **설명**: 새로운 기능 개발
- **아이콘**: ✨
- **예시**: "소셜 로그인 기능 추가"

#### Epic (에픽)
- **설명**: 여러 하위 작업을 포함하는 큰 단위 작업
- **아이콘**: 🎯
- **예시**: "사용자 인증 시스템 구축"

### CLI 예시
```bash
# Issue Type 생성
"Epic 타입을 '대규모 기능 단위'로 설명하여 만들어줘"
```

---

## 7. Modules 계획

### Module 구조

각 Module은 Agile의 Epic과 유사하며, 큰 기능 단위를 그룹화합니다.

#### Module 1: [모듈명]
```yaml
name: "[모듈명]"
description: "[모듈 설명]"
start_date: "YYYY-MM-DD"
target_date: "YYYY-MM-DD"
lead: "[@담당자]"
members: ["@멤버1", "@멤버2"]
status: "backlog/planned/in-progress/paused/completed/cancelled"
```

**목표**:
- 목표 1
- 목표 2

**하위 작업 (예상 Issues)**:
- [ ] 작업 1
- [ ] 작업 2
- [ ] 작업 3

#### Module 2: [모듈명]
```yaml
name: "[모듈명]"
description: "[모듈 설명]"
```

### Module 예시

#### 예시: 사용자 인증 모듈
```yaml
name: "사용자 인증 시스템"
description: "회원가입, 로그인, 비밀번호 재설정 기능"
start_date: "2025-01-15"
target_date: "2025-02-28"
lead: "@backend-lead"
members: ["@dev1", "@dev2", "@qa1"]
status: "planned"
```

### CLI 예시
```bash
# Module 생성
"'사용자 인증 시스템' 모듈을 2025-01-15부터 2025-02-28까지로 만들어줘"

# Module 목록 확인
"프로젝트의 모든 모듈 보여줘"

# Module에 Issue 추가
"PROJ-123, PROJ-124 이슈를 사용자 인증 시스템 모듈에 추가해줘"
```

---

## 8. Cycles 계획

### Cycle 구조

Cycle은 Scrum의 Sprint와 동일하며, 1-2주 단위로 작업을 계획합니다.

#### Cycle Template
```yaml
name: "[Cycle 이름]"
start_date: "YYYY-MM-DD"
end_date: "YYYY-MM-DD"
owned_by: "[@담당자]"
description: "[사이클 목표]"
```

### 분기별 Cycle 계획

#### Q1 2025
- **Cycle 1**: 2025-01-06 ~ 2025-01-19 - 기반 설정
- **Cycle 2**: 2025-01-20 ~ 2025-02-02 - 핵심 기능 개발
- **Cycle 3**: 2025-02-03 ~ 2025-02-16 - 통합 및 테스트
- **Cycle 4**: 2025-02-17 ~ 2025-03-02 - 버그 수정 및 배포
- **Cycle 5**: 2025-03-03 ~ 2025-03-16 - 피드백 반영
- **Cycle 6**: 2025-03-17 ~ 2025-03-30 - 개선 및 최적화

#### Cycle 상세 예시

##### Cycle 1: Sprint 1 - Foundation
```yaml
name: "Sprint 1: Foundation"
start_date: "2025-01-06"
end_date: "2025-01-19"
owned_by: "@scrum-master"
description: "프로젝트 기반 설정 및 아키텍처 구성"
```

**목표**:
- [ ] 개발 환경 설정 완료
- [ ] DB 스키마 설계 완료
- [ ] CI/CD 파이프라인 구축

**예상 Issues**: 8-10개

### CLI 예시
```bash
# Cycle 생성
"'Sprint 1: Foundation' 사이클을 2025-01-06부터 2025-01-19까지로 만들어줘"

# Cycle 목록 확인
"프로젝트의 모든 사이클 보여줘"

# Cycle에 Issue 추가
"PROJ-101, PROJ-102를 Sprint 1 사이클에 추가해줘"

# Cycle 이슈 확인
"Sprint 1 사이클의 이슈들 보여줘"
```

---

## 9. Issues 생성

### Issue 작성 템플릿

#### Standard Issue
```yaml
name: "[이슈 제목]"
description_html: |
  <h2>개요</h2>
  <p>이슈에 대한 설명</p>

  <h2>작업 내용</h2>
  <ul>
    <li>작업 1</li>
    <li>작업 2</li>
  </ul>

  <h2>완료 조건 (Definition of Done)</h2>
  <ul>
    <li>조건 1</li>
    <li>조건 2</li>
  </ul>

assignees: ["@담당자ID"]
labels: ["bug", "frontend"]
priority: "urgent/high/medium/low/none"
state: "[State ID]"
start_date: "YYYY-MM-DD"
target_date: "YYYY-MM-DD"
estimate_point: "[Estimate ID]" # 1, 2, 3, 5, 8, 13
parent: "[Parent Issue ID]" # 하위 작업인 경우
```

### Issue 우선순위 가이드

- **Urgent** 🔥: 즉시 해결 필요 (서비스 다운, 보안 이슈)
- **High** ⚡: 이번 스프린트 내 필수
- **Medium** 📌: 중요하지만 조정 가능
- **Low** 💤: 시간 날 때 처리
- **None**: 우선순위 미정

### Issue Estimate (Story Points)

Fibonacci 수열 기반:
- **1**: 매우 간단 (1시간 이내)
- **2**: 간단 (2-4시간)
- **3**: 보통 (1일)
- **5**: 복잡 (2-3일)
- **8**: 매우 복잡 (1주)
- **13**: 거대 작업 (2주+, Epic으로 분할 고려)

### Issue 예시

#### Bug Issue
```yaml
name: "[BUG] 로그인 시 500 에러 발생"
description_html: |
  <h2>버그 설명</h2>
  <p>이메일 로그인 시 간헐적으로 500 에러가 발생합니다.</p>

  <h2>재현 방법</h2>
  <ol>
    <li>로그인 페이지 접속</li>
    <li>이메일/비밀번호 입력</li>
    <li>로그인 버튼 클릭</li>
  </ol>

  <h2>예상 동작</h2>
  <p>정상적으로 로그인되어 대시보드로 이동</p>

  <h2>실제 동작</h2>
  <p>500 Internal Server Error 응답</p>

  <h2>환경</h2>
  <ul>
    <li>브라우저: Chrome 120</li>
    <li>OS: macOS 14</li>
  </ul>

assignees: ["@backend-dev"]
labels: ["bug", "backend", "critical"]
priority: "urgent"
estimate_point: "3"
```

#### Feature Issue
```yaml
name: "[FEATURE] 소셜 로그인 (Google) 추가"
description_html: |
  <h2>기능 설명</h2>
  <p>Google OAuth를 이용한 소셜 로그인 기능을 추가합니다.</p>

  <h2>요구사항</h2>
  <ul>
    <li>Google OAuth 2.0 연동</li>
    <li>기존 계정과 연동 처리</li>
    <li>프로필 정보 자동 입력</li>
  </ul>

  <h2>기술 스택</h2>
  <ul>
    <li>Frontend: OAuth 로그인 버튼 UI</li>
    <li>Backend: Google OAuth API 연동</li>
  </ul>

  <h2>완료 조건</h2>
  <ul>
    <li>Google 계정으로 회원가입/로그인 가능</li>
    <li>기존 이메일과 자동 연동</li>
    <li>단위 테스트 작성 완료</li>
  </ul>

assignees: ["@fullstack-dev"]
labels: ["feature", "frontend", "backend"]
priority: "high"
estimate_point: "8"
```

### CLI 예시
```bash
# Issue 생성
"'로그인 API 구현' 이슈를 만들어줘. 설명은 'JWT 기반 인증 API 개발', 담당자는 @dev1, 라벨은 backend, feature"

# Issue 검색
"'로그인' 키워드로 이슈 검색해줘"

# Issue 조회 (식별자 사용)
"PROJ-123 이슈 보여줘"

# Issue 수정
"PROJ-123 이슈의 상태를 In Progress로 변경해줘"

# Issue 댓글 추가
"PROJ-123 이슈에 '작업 시작했습니다' 댓글 달아줘"
```

---

## 10. Views & Filters 설정

### Custom Views

#### View 1: My Active Tasks
```yaml
name: "내 진행 중 작업"
filters:
  - assignee: "본인"
  - state: ["In Progress", "In Review"]
grouping: "priority"
ordering: "priority" (desc)
```

#### View 2: This Sprint
```yaml
name: "이번 스프린트"
filters:
  - cycle: "[현재 Cycle]"
  - state: ["Todo", "In Progress", "In Review"]
grouping: "state"
ordering: "created_at" (asc)
```

#### View 3: Bugs
```yaml
name: "버그 리스트"
filters:
  - labels: ["bug"]
  - state: !["Done", "Cancelled"]
grouping: "priority"
ordering: "priority" (desc)
```

#### View 4: Blocked Issues
```yaml
name: "블록된 작업"
filters:
  - labels: ["blocked"]
grouping: "assignee"
ordering: "created_at" (asc)
```

### 뷰 활용 팁
- **List View**: 상세 정보 확인
- **Kanban View**: 워크플로우 시각화
- **Calendar View**: 일정 기반 작업 관리
- **Spreadsheet View**: 대량 이슈 편집
- **Gantt View**: 타임라인 관리 (Pro 기능)

---

## 11. Team & Permissions

### 팀 구성

#### 역할 정의

##### Owner (소유자)
- Workspace 완전 제어
- 결제 및 청구 관리
- 모든 프로젝트 접근

##### Admin (관리자)
- Workspace 설정 관리
- 멤버 초대/제거
- 프로젝트 생성/삭제

##### Member (멤버)
- 프로젝트 작업
- 이슈 생성/수정
- 댓글 및 협업

##### Guest (게스트)
- 읽기 전용 접근
- 특정 프로젝트만 접근
- 댓글 작성 가능

### 팀원 리스트

| 이름 | 역할 | 담당 영역 | Email |
|------|------|-----------|-------|
| @team-lead | Admin | 전체 관리 | lead@example.com |
| @dev1 | Member | Frontend | dev1@example.com |
| @dev2 | Member | Backend | dev2@example.com |
| @designer | Member | Design | design@example.com |
| @qa | Member | QA | qa@example.com |
| @stakeholder | Guest | 검토 | stakeholder@example.com |

### CLI 예시
```bash
# 팀원 목록 확인
"워크스페이스 멤버 보여줘"
```

---

## 12. Pages 문서화

### Pages 구조

Plane Pages를 활용하여 프로젝트 문서를 중앙화합니다.

#### 필수 문서 목록

##### 1. 프로젝트 README
```markdown
# 프로젝트명

## 개요
프로젝트 소개

## 아키텍처
시스템 구조도

## 개발 환경 설정
로컬 환경 설정 방법

## 배포 가이드
배포 프로세스
```

##### 2. API 문서
```markdown
# API 문서

## 인증 API
- POST /auth/login
- POST /auth/register
- POST /auth/refresh

## 사용자 API
- GET /users/me
- PUT /users/me
- DELETE /users/me
```

##### 3. 회의록
```markdown
# Sprint Planning - 2025-01-06

## 참석자
@dev1, @dev2, @team-lead

## 안건
1. Sprint 1 목표 설정
2. 백로그 우선순위 조정

## 결정 사항
- [ ] 작업 1 (PROJ-101)
- [ ] 작업 2 (PROJ-102)

## 다음 회의
2025-01-13 10:00
```

##### 4. Troubleshooting Guide
```markdown
# 문제 해결 가이드

## 자주 발생하는 문제

### 문제: 로그인 실패
**원인**: 토큰 만료
**해결**: localStorage 클리어 후 재로그인
```

##### 5. 코딩 컨벤션
```markdown
# 코딩 컨벤션

## 네이밍 규칙
- 컴포넌트: PascalCase
- 함수: camelCase
- 상수: UPPER_SNAKE_CASE

## 커밋 메시지
- feat: 새 기능
- fix: 버그 수정
- docs: 문서 수정
```

---

## 13. 워크플로우 자동화

### GitHub 통합

#### PR과 Issue 연동
```
PR Title: [PROJ-123] 로그인 API 구현
→ 자동으로 PROJ-123 이슈와 연결
→ PR 머지 시 이슈 상태 자동 변경 (In Progress → Done)
```

#### 브랜치 전략
```
main (배포용)
├── develop (개발용)
    ├── feature/PROJ-123-login-api
    ├── fix/PROJ-124-auth-bug
    └── refactor/PROJ-125-code-cleanup
```

### Slack 알림 설정

- ✅ 새 이슈 생성 시 알림
- ✅ 이슈 상태 변경 시 알림
- ✅ 댓글 달릴 때 알림
- ✅ PR 머지 시 알림
- ✅ Cycle 종료 시 요약 리포트

---

## 🎯 프로젝트 시작 체크리스트

### Phase 1: 초기 설정 (1일)
- [ ] Workspace 생성 및 브랜딩
- [ ] 팀원 초대 및 역할 부여
- [ ] GitHub/Slack 통합 설정

### Phase 2: 프로젝트 구조화 (1일)
- [ ] Project 생성
- [ ] States 커스터마이징
- [ ] Labels 생성
- [ ] Issue Types 정의

### Phase 3: 기획 및 백로그 (2-3일)
- [ ] Modules 정의 및 생성
- [ ] 첫 번째 Cycle 계획
- [ ] Issues 생성 (최소 20개)
- [ ] Issues를 Modules/Cycles에 할당
- [ ] 우선순위 및 Estimate 설정

### Phase 4: 문서화 (1일)
- [ ] Pages에 프로젝트 README 작성
- [ ] API 문서 작성
- [ ] 코딩 컨벤션 정리
- [ ] Troubleshooting 가이드 작성

### Phase 5: 개발 시작 (진행중)
- [ ] Daily Standup 진행
- [ ] Issue 상태 업데이트
- [ ] PR과 Issue 연동
- [ ] 번다운 차트 모니터링
- [ ] Sprint Retrospective 회의

---

## 📊 프로젝트 모니터링

### 일일 체크
- [ ] In Progress 이슈 수 확인
- [ ] Blocked 이슈 해결
- [ ] 금일 마감 이슈 확인

### 주간 체크
- [ ] Cycle 진행률 확인 (번다운 차트)
- [ ] 팀 워크로드 분산 확인
- [ ] 다음 주 작업 계획

### 월간 체크
- [ ] 완료된 Module 검토
- [ ] 팀 생산성 분석
- [ ] 다음 Quarter 계획 수립

---

## 🛠️ CLI 워크플로우 예시

### 아침 루틴 (Daily Standup 준비)
```bash
# 1. 내 진행중인 작업 확인
"내가 In Progress 상태인 이슈 보여줘"

# 2. 오늘 마감인 작업 확인
"오늘 마감인 이슈들 보여줘"

# 3. Blocked 이슈 확인
"blocked 라벨이 달린 이슈 찾아줘"
```

### 작업 시작
```bash
# 1. 이슈 상태 변경
"PROJ-123 이슈를 In Progress로 변경해줘"

# 2. 워크로그 기록 시작
"PROJ-123에 오늘부터 작업 시작한다고 댓글 달아줘"

# 3. 브랜치 생성 (로컬)
git checkout -b feature/PROJ-123-login-api
```

### 작업 완료
```bash
# 1. PR 생성 (자동 연동)
gh pr create --title "[PROJ-123] 로그인 API 구현" --body "Closes PROJ-123"

# 2. 워크로그 기록
"PROJ-123에 8시간 작업했다고 워크로그 추가해줘"

# 3. 다음 작업 준비
"다음 우선순위 높은 이슈 보여줘"
```

### Sprint 종료
```bash
# 1. 완료된 이슈 확인
"이번 Sprint에서 완료된 이슈 개수 알려줘"

# 2. 미완료 이슈 이동
"Sprint 1의 미완료 이슈들을 Sprint 2로 옮겨줘"

# 3. 회고 문서 작성
"Sprint 1 회고록 Page 만들어줘"
```

---

## 🎓 Best Practices

### Issue 작성 팁
1. **제목은 명확하게**: 동사로 시작 ("구현", "수정", "추가")
2. **Description에 컨텍스트 포함**: 왜 필요한지, 무엇을 하는지
3. **완료 조건 명시**: 체크리스트로 DoD 작성
4. **적절한 Estimate**: 너무 큰 작업은 분할

### Cycle 운영 팁
1. **1-2주 단위**: 너무 길면 집중력 저하
2. **달성 가능한 목표**: 70-80% 완료율 목표
3. **버퍼 시간 확보**: 예상치 못한 이슈 대비
4. **회고 필수**: 매 Sprint 종료 시 KPT 회고

### Module 관리 팁
1. **명확한 목표**: 측정 가능한 결과물 정의
2. **적절한 크기**: 2-4주 내 완료 가능한 범위
3. **진행률 모니터링**: 주기적으로 진행도 체크
4. **유연성 유지**: 우선순위 변경에 대응

### 협업 팁
1. **댓글 활용**: 이슈 내에서 소통
2. **@멘션 사용**: 담당자에게 직접 알림
3. **정기적인 동기화**: Daily Standup 활용
4. **문서화 습관**: Pages에 지식 축적

---

## 📚 추가 리소스

### 공식 문서
- [Plane 공식 문서](https://docs.plane.so/)
- [Plane API 문서](https://developers.plane.so/)
- [Plane GitHub](https://github.com/makeplane/plane)

### 커뮤니티
- [Plane Discord](https://discord.com/invite/plane)
- [Plane GitHub Discussions](https://github.com/makeplane/plane/discussions)

---

## 💡 템플릿 사용 방법

### 1. 이 템플릿 복사
```bash
cp PLANE_PROJECT_TEMPLATE.md MY_PROJECT_PLAN.md
```

### 2. 대괄호 `[]` 부분 수정
모든 `[프로젝트명]`, `[PROJ]` 등을 실제 값으로 교체

### 3. 불필요한 섹션 삭제
프로젝트에 맞지 않는 부분은 과감히 삭제

### 4. Plane에서 실행
CLI로 이 템플릿대로 생성하거나, Plane UI에서 직접 설정

### 5. 지속적 업데이트
프로젝트 진행하면서 템플릿을 개선하고 팀에 맞게 조정

---

**마지막 업데이트**: 2025-01-09
**버전**: 1.0.0
**작성자**: Claude Code + Plane MCP

---

이 템플릿을 사용하여 체계적이고 효율적인 프로젝트 관리를 시작하세요! 🚀
