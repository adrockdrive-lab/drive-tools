# 드라이빙존 미션 시스템 V2 - 디자인 시스템

## 📋 목차
1. [브랜드 아이덴티티](#1-브랜드-아이덴티티)
2. [컬러 시스템](#2-컬러-시스템)
3. [타이포그래피](#3-타이포그래피)
4. [스페이싱 & 레이아웃](#4-스페이싱--레이아웃)
5. [아이콘 시스템](#5-아이콘-시스템)
6. [컴포넌트 라이브러리](#6-컴포넌트-라이브러리)
7. [애니메이션 가이드](#7-애니메이션-가이드)
8. [반응형 디자인](#8-반응형-디자인)

---

## 1. 브랜드 아이덴티티

### 1.1 브랜드 철학
- **밝고 친근한**: 기존 다크 테마에서 밝고 활기찬 분위기로 전환
- **게임처럼 재미있는**: 게이미피케이션 요소를 시각적으로 강조
- **성취감을 주는**: 진행 상황과 보상을 명확하게 표현
- **신뢰할 수 있는**: 페이백과 보상의 투명성 강조

### 1.2 디자인 키워드
- **Energy** (활력)
- **Achievement** (성취)
- **Community** (커뮤니티)
- **Transparency** (투명성)

### 1.3 비주얼 스타일
- **일러스트레이션**: 플랫 디자인, 친근한 캐릭터
- **아이콘**: 라운드 스타일, 명확한 의미 전달
- **사진**: 밝고 생동감 있는 톤

---

## 2. 컬러 시스템

### 2.1 Primary Colors (주 색상)

#### Blue (파란색) - 주 브랜드 컬러
```css
/* Primary Blue */
--color-primary-50: #eff6ff;
--color-primary-100: #dbeafe;
--color-primary-200: #bfdbfe;
--color-primary-300: #93c5fd;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6; /* Main */
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
--color-primary-800: #1e40af;
--color-primary-900: #1e3a8a;
```

**사용처**:
- CTA 버튼 (시작하기, 미션 시작)
- 링크
- 활성 상태

#### Purple (보라색) - 게이미피케이션
```css
/* Gamification Purple */
--color-purple-50: #faf5ff;
--color-purple-100: #f3e8ff;
--color-purple-200: #e9d5ff;
--color-purple-300: #d8b4fe;
--color-purple-400: #c084fc;
--color-purple-500: #a855f7; /* Main */
--color-purple-600: #9333ea;
--color-purple-700: #7e22ce;
--color-purple-800: #6b21a8;
--color-purple-900: #581c87;
```

**사용처**:
- 레벨업 효과
- 뱃지 (희귀 등급)
- 보상 하이라이트

### 2.2 Semantic Colors (의미 색상)

#### Success (성공)
```css
--color-success-50: #f0fdf4;
--color-success-100: #dcfce7;
--color-success-500: #22c55e; /* Main */
--color-success-600: #16a34a;
--color-success-700: #15803d;
```

**사용처**: 미션 완료, 승인, 성공 메시지

#### Warning (경고)
```css
--color-warning-50: #fffbeb;
--color-warning-100: #fef3c7;
--color-warning-500: #f59e0b; /* Main */
--color-warning-600: #d97706;
--color-warning-700: #b45309;
```

**사용처**: 주의 알림, 대기 상태

#### Error (에러)
```css
--color-error-50: #fef2f2;
--color-error-100: #fee2e2;
--color-error-500: #ef4444; /* Main */
--color-error-600: #dc2626;
--color-error-700: #b91c1c;
```

**사용처**: 에러 메시지, 거부, 실패

#### Info (정보)
```css
--color-info-50: #f0f9ff;
--color-info-100: #e0f2fe;
--color-info-500: #0ea5e9; /* Main */
--color-info-600: #0284c7;
--color-info-700: #0369a1;
```

**사용처**: 정보 알림, 팁

### 2.3 Neutral Colors (중립 색상)

```css
/* Gray Scale */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;

/* White & Black */
--color-white: #ffffff;
--color-black: #000000;
```

### 2.4 Gradient (그라디언트)

```css
/* Primary Gradient */
--gradient-primary: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);

/* Success Gradient */
--gradient-success: linear-gradient(135deg, #22c55e 0%, #10b981 100%);

/* Warm Gradient */
--gradient-warm: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);

/* Cool Gradient */
--gradient-cool: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
```

**사용처**:
- 배경 (히어로 섹션, 카드 헤더)
- 버튼 (중요한 CTA)
- 레벨업 효과

### 2.5 Badge Rarity Colors (뱃지 희귀도 색상)

```css
--color-bronze: #cd7f32;
--color-silver: #c0c0c0;
--color-gold: #ffd700;
--color-platinum: #e5e4e2;
--color-diamond: #b9f2ff;
```

### 2.6 컬러 사용 가이드

#### 배경 색상
- **Page Background**: `--color-gray-50` (밝은 회색)
- **Card Background**: `--color-white` (흰색)
- **Hover Background**: `--color-gray-100`
- **Active Background**: `--color-primary-50`

#### 텍스트 색상
- **Primary Text**: `--color-gray-900` (진한 회색)
- **Secondary Text**: `--color-gray-600` (중간 회색)
- **Disabled Text**: `--color-gray-400` (연한 회색)
- **Link Text**: `--color-primary-600` (파란색)

#### 경계선 색상
- **Border**: `--color-gray-200`
- **Focus Border**: `--color-primary-500`
- **Error Border**: `--color-error-500`

---

## 3. 타이포그래피

### 3.1 폰트 패밀리

```css
/* Primary Font (한글/영문) */
--font-family-primary: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace (숫자, 코드) */
--font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Display (제목, 강조) */
--font-family-display: 'Poppins', 'Pretendard', sans-serif;
```

**폰트 로딩**:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
```

### 3.2 폰트 크기

```css
/* Font Sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */
```

### 3.3 폰트 두께

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### 3.4 행간 (Line Height)

```css
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### 3.5 텍스트 스타일 정의

#### Heading Styles
```css
.h1 {
  font-family: var(--font-family-display);
  font-size: var(--text-5xl);
  font-weight: var(--font-extrabold);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
}

.h2 {
  font-family: var(--font-family-display);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.01em;
}

.h3 {
  font-family: var(--font-family-primary);
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-snug);
}

.h4 {
  font-family: var(--font-family-primary);
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
}
```

#### Body Styles
```css
.body-large {
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
}

.body {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}

.body-small {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}

.caption {
  font-size: var(--text-xs);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--color-gray-600);
}
```

#### 특수 스타일
```css
.display-number {
  font-family: var(--font-family-mono);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  font-variant-numeric: tabular-nums;
}

.label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

---

## 4. 스페이싱 & 레이아웃

### 4.1 Spacing Scale (8px 기준)

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### 4.2 Border Radius

```css
--radius-none: 0;
--radius-sm: 0.25rem;    /* 4px */
--radius-base: 0.5rem;   /* 8px */
--radius-md: 0.75rem;    /* 12px */
--radius-lg: 1rem;       /* 16px */
--radius-xl: 1.5rem;     /* 24px */
--radius-2xl: 2rem;      /* 32px */
--radius-full: 9999px;   /* 완전한 원 */
```

**사용처**:
- 버튼: `--radius-lg` (16px)
- 카드: `--radius-xl` (24px)
- 모달: `--radius-2xl` (32px)
- 아바타: `--radius-full`

### 4.3 Shadow (그림자)

```css
/* Elevation Shadows */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Colored Shadows */
--shadow-primary: 0 10px 30px -5px rgba(59, 130, 246, 0.3);
--shadow-success: 0 10px 30px -5px rgba(34, 197, 94, 0.3);
--shadow-warning: 0 10px 30px -5px rgba(245, 158, 11, 0.3);
```

**사용처**:
- 카드: `--shadow-md`
- 플로팅 버튼: `--shadow-lg`
- 모달: `--shadow-2xl`
- 호버 효과: `--shadow-primary`

### 4.4 Container & Grid

#### Max Width
```css
--container-sm: 640px;   /* Mobile */
--container-md: 768px;   /* Tablet */
--container-lg: 1024px;  /* Desktop */
--container-xl: 1280px;  /* Large Desktop */
--container-2xl: 1536px; /* Extra Large */
```

#### Grid System
```css
.container {
  width: 100%;
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
```

---

## 5. 아이콘 시스템

### 5.1 아이콘 라이브러리

**사용 라이브러리**: [Lucide Icons](https://lucide.dev/)

**이유**:
- 일관된 스타일 (라운드, 24px 기준)
- 가벼움 (Tree-shaking 지원)
- 커스터마이징 용이

### 5.2 아이콘 크기

```css
--icon-xs: 1rem;     /* 16px */
--icon-sm: 1.25rem;  /* 20px */
--icon-base: 1.5rem; /* 24px */
--icon-lg: 2rem;     /* 32px */
--icon-xl: 3rem;     /* 48px */
```

### 5.3 주요 아이콘 매핑

```typescript
const icons = {
  // 네비게이션
  home: 'Home',
  missions: 'Target',
  ranking: 'Trophy',
  friends: 'Users',
  profile: 'User',

  // 미션
  daily: 'Calendar',
  story: 'Map',
  challenge: 'Zap',
  social: 'Share2',

  // 게이미피케이션
  level: 'TrendingUp',
  xp: 'Star',
  coins: 'Coins',
  badge: 'Award',

  // 액션
  start: 'Play',
  complete: 'Check',
  lock: 'Lock',
  unlock: 'Unlock',

  // 상태
  pending: 'Clock',
  approved: 'CheckCircle',
  rejected: 'XCircle',
}
```

---

## 6. 컴포넌트 라이브러리

### 6.1 Button (버튼)

#### Variants
```css
/* Primary Button */
.btn-primary {
  background: var(--color-primary-500);
  color: var(--color-white);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-semibold);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--color-primary-600);
  box-shadow: var(--shadow-primary);
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: var(--color-white);
  color: var(--color-primary-600);
  border: 2px solid var(--color-primary-500);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-semibold);
}

/* Gradient Button (특별한 CTA) */
.btn-gradient {
  background: var(--gradient-primary);
  color: var(--color-white);
  padding: var(--space-4) var(--space-8);
  border-radius: var(--radius-xl);
  font-weight: var(--font-bold);
  box-shadow: var(--shadow-primary);
}
```

#### Sizes
```css
.btn-sm { padding: var(--space-2) var(--space-4); font-size: var(--text-sm); }
.btn-md { padding: var(--space-3) var(--space-6); font-size: var(--text-base); }
.btn-lg { padding: var(--space-4) var(--space-8); font-size: var(--text-lg); }
```

### 6.2 Card (카드)

```css
.card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  padding: var(--space-6);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-header {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--space-4);
}

.card-body {
  color: var(--color-gray-700);
}

.card-footer {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-gray-200);
}
```

### 6.3 Progress Bar (진행률 바)

```css
.progress-container {
  width: 100%;
  height: 8px;
  background: var(--color-gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-gray-700);
  margin-bottom: var(--space-2);
}
```

### 6.4 Badge (라벨)

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
}

.badge-success {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

.badge-warning {
  background: var(--color-warning-100);
  color: var(--color-warning-700);
}

.badge-info {
  background: var(--color-info-100);
  color: var(--color-info-700);
}
```

### 6.5 Modal (모달)

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 50;
}

.modal-container {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: 51;
}

.modal {
  background: var(--color-white);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  max-width: 500px;
  width: 100%;
  padding: var(--space-8);
}

.modal-header {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--space-6);
}
```

---

## 7. 애니메이션 가이드

### 7.1 Timing Functions

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 7.2 Duration

```css
--duration-fast: 150ms;
--duration-base: 300ms;
--duration-slow: 500ms;
--duration-slower: 800ms;
```

### 7.3 주요 애니메이션

#### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn var(--duration-base) var(--ease-out);
}
```

#### Slide Up
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up {
  animation: slideUp var(--duration-base) var(--ease-out);
}
```

#### Scale In (뱃지 언락)
```css
@keyframes scaleIn {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.scale-in {
  animation: scaleIn var(--duration-slow) var(--ease-bounce);
}
```

#### Pulse (버튼)
```css
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.pulse {
  animation: pulse 2s var(--ease-in-out) infinite;
}
```

---

## 8. 반응형 디자인

### 8.1 Breakpoints

```css
/* Mobile First */
--breakpoint-sm: 640px;   /* Tablet */
--breakpoint-md: 768px;   /* Small Desktop */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large Desktop */
--breakpoint-2xl: 1536px; /* Extra Large */
```

### 8.2 Media Queries

```css
/* Tablet and up */
@media (min-width: 640px) {
  .container {
    padding: 0 var(--space-6);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    padding: 0 var(--space-8);
  }
}
```

### 8.3 반응형 타이포그래피

```css
.heading-responsive {
  font-size: var(--text-2xl);
}

@media (min-width: 768px) {
  .heading-responsive {
    font-size: var(--text-4xl);
  }
}

@media (min-width: 1024px) {
  .heading-responsive {
    font-size: var(--text-5xl);
  }
}
```

---

**버전**: 2.0.0
**최종 업데이트**: 2025-01-10
**작성자**: Design Team
