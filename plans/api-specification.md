# 드라이빙존 미션 시스템 V2 - API 명세서

## 📋 목차
1. [인증 API](#1-인증-api)
2. [사용자 API](#2-사용자-api)
3. [게이미피케이션 API](#3-게이미피케이션-api)
4. [미션 API](#4-미션-api)
5. [소셜 API](#5-소셜-api)
6. [페이백 API](#6-페이백-api)
7. [관리자 API](#7-관리자-api)
8. [공통 응답 형식](#8-공통-응답-형식)

---

## 기본 정보

### Base URL
```
Production: https://api.drivingzone.com/v2
Development: http://localhost:3000/api
```

### 인증 방식
```
Authorization: Bearer {JWT_TOKEN}
```

### 공통 헤더
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {JWT_TOKEN}
X-Client-Version: 2.0.0
X-Platform: web | ios | android
```

### Rate Limiting
```
일반 사용자: 100 requests / minute
관리자: 1000 requests / minute
```

---

## 1. 인증 API

### 1.1 SMS 인증 코드 발송

**POST** `/auth/send-code`

회원가입 또는 로그인을 위한 SMS 인증 코드를 발송합니다.

#### Request Body
```json
{
  "phone": "01012345678"
}
```

#### Request Example
```bash
curl -X POST https://api.drivingzone.com/v2/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "01012345678"
  }'
```

#### Response (Success)
```json
{
  "success": true,
  "message": "인증 코드가 발송되었습니다",
  "data": {
    "phone": "01012345678",
    "expiresIn": 600,
    "expiresAt": "2025-01-20T10:10:00Z",
    "canResendAt": "2025-01-20T10:01:00Z"
  }
}
```

#### Response (Error - Rate Limit)
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "1분 후에 재시도해주세요",
    "retryAfter": 45
  }
}
```

#### Response (Error - Daily Limit)
```json
{
  "success": false,
  "error": {
    "code": "DAILY_LIMIT_EXCEEDED",
    "message": "오늘 최대 발송 횟수를 초과했습니다",
    "dailyLimit": 10
  }
}
```

#### Error Codes
- `RATE_LIMIT_EXCEEDED`: 1분 내 재발송 시도
- `DAILY_LIMIT_EXCEEDED`: 일일 발송 한도 초과 (10회)
- `INVALID_PHONE_NUMBER`: 잘못된 전화번호 형식
- `SMS_SERVICE_ERROR`: SMS 발송 서비스 오류

---

### 1.2 SMS 인증 코드 검증

**POST** `/auth/verify-code`

발송된 인증 코드를 검증합니다.

#### Request Body
```json
{
  "phone": "01012345678",
  "code": "123456"
}
```

#### Response (Success)
```json
{
  "success": true,
  "message": "인증이 완료되었습니다",
  "data": {
    "verified": true,
    "verificationToken": "temp_token_for_registration"
  }
}
```

#### Response (Error)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CODE",
    "message": "인증 코드가 일치하지 않습니다",
    "attemptsLeft": 2
  }
}
```

#### Error Codes
- `INVALID_CODE`: 잘못된 인증 코드
- `CODE_EXPIRED`: 인증 코드 만료 (10분)
- `MAX_ATTEMPTS_EXCEEDED`: 최대 시도 횟수 초과 (5회)

---

### 1.3 회원가입

**POST** `/auth/register`

새로운 사용자를 등록합니다.

#### Request Body
```json
{
  "name": "홍길동",
  "phone": "01012345678",
  "verificationToken": "temp_token_from_verify",
  "storeId": 70,
  "referralCode": "ABC123",
  "termsAgreed": true,
  "privacyAgreed": true,
  "marketingAgreed": false
}
```

#### Response (Success)
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "홍길동",
      "phone": "01012345678",
      "storeId": 70,
      "storeName": "드라이빙존 강남점",
      "level": 1,
      "xp": 200,
      "coins": 2000,
      "referralCode": "HGD789",
      "badges": [
        {
          "id": "welcome",
          "name": "웰컴 뱃지",
          "description": "드라이빙존에 오신 것을 환영합니다!",
          "iconUrl": "https://storage.../welcome-badge.svg",
          "earnedAt": "2025-01-20T10:00:00Z"
        }
      ],
      "createdAt": "2025-01-20T10:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600,
      "tokenType": "Bearer"
    },
    "referralBonus": {
      "applied": true,
      "referrerName": "김철수",
      "bonusXp": 200,
      "bonusCoins": 2000
    }
  }
}
```

#### Response (Error)
```json
{
  "success": false,
  "error": {
    "code": "PHONE_ALREADY_EXISTS",
    "message": "이미 가입된 전화번호입니다"
  }
}
```

#### Error Codes
- `PHONE_ALREADY_EXISTS`: 이미 가입된 전화번호
- `INVALID_VERIFICATION_TOKEN`: 잘못된 검증 토큰
- `INVALID_STORE_ID`: 존재하지 않는 지점 ID
- `INVALID_REFERRAL_CODE`: 잘못된 추천인 코드
- `TERMS_NOT_AGREED`: 필수 약관 미동의

---

### 1.4 소셜 로그인 (OAuth)

**GET** `/auth/oauth/{provider}/authorize`

OAuth 인증 URL로 리다이렉트합니다.

#### Parameters
- `provider`: google | kakao | naver
- `redirect_uri`: 콜백 URL (옵션)

#### Example
```
https://api.drivingzone.com/v2/auth/oauth/google/authorize?redirect_uri=https://app.drivingzone.com/auth/callback
```

---

**GET** `/auth/oauth/{provider}/callback`

OAuth 콜백을 처리하고 사용자 정보를 반환합니다.

#### Query Parameters
- `code`: OAuth authorization code
- `state`: CSRF 방지 state

#### Response (신규 사용자)
```json
{
  "success": true,
  "data": {
    "isNewUser": true,
    "oauthProfile": {
      "provider": "google",
      "providerId": "google_user_id",
      "email": "user@gmail.com",
      "name": "홍길동",
      "profilePictureUrl": "https://..."
    },
    "nextStep": "PHONE_VERIFICATION"
  }
}
```

#### Response (기존 사용자 - 계정 연동 필요)
```json
{
  "success": true,
  "data": {
    "isNewUser": false,
    "matchingAccount": {
      "id": "uuid",
      "name": "홍길동",
      "email": "user@gmail.com"
    },
    "nextStep": "ACCOUNT_LINKING_CONFIRMATION"
  }
}
```

#### Response (기존 사용자 - 연동 완료)
```json
{
  "success": true,
  "data": {
    "isNewUser": false,
    "user": {
      "id": "uuid",
      "name": "홍길동",
      "email": "user@gmail.com",
      "level": 15,
      "xp": 5000
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresIn": 3600
    }
  }
}
```

---

### 1.5 토큰 갱신

**POST** `/auth/refresh`

Refresh Token을 사용하여 새로운 Access Token을 발급받습니다.

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "expiresIn": 3600
  }
}
```

#### Error Codes
- `INVALID_REFRESH_TOKEN`: 잘못된 리프레시 토큰
- `REFRESH_TOKEN_EXPIRED`: 만료된 리프레시 토큰
- `USER_NOT_FOUND`: 사용자를 찾을 수 없음

---

### 1.6 로그아웃

**POST** `/auth/logout`

로그아웃하고 토큰을 무효화합니다.

#### Request Headers
```
Authorization: Bearer {ACCESS_TOKEN}
```

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response
```json
{
  "success": true,
  "message": "로그아웃되었습니다"
}
```

---

## 2. 사용자 API

### 2.1 내 프로필 조회

**GET** `/users/me`

현재 로그인한 사용자의 프로필을 조회합니다.

#### Request Headers
```
Authorization: Bearer {ACCESS_TOKEN}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "홍길동",
    "nickname": "스피드마스터",
    "phone": "01012345678",
    "email": "user@example.com",
    "profilePictureUrl": "https://storage.../profile.jpg",
    "level": 15,
    "xp": 5230,
    "nextLevelXp": 6000,
    "xpProgress": 87.17,
    "coins": 12500,
    "cashBalance": 35000,
    "referralCode": "HGD789",
    "consecutiveDays": 7,
    "totalMissionsCompleted": 42,
    "badgesCount": 8,
    "rank": {
      "overall": 125,
      "weekly": 15,
      "store": 3
    },
    "store": {
      "id": 70,
      "name": "드라이빙존 강남점",
      "address": "서울시 강남구..."
    },
    "socialAccounts": [
      {
        "provider": "google",
        "email": "user@gmail.com",
        "linkedAt": "2025-01-20T10:00:00Z"
      }
    ],
    "createdAt": "2025-01-20T10:00:00Z",
    "updatedAt": "2025-01-25T15:30:00Z"
  }
}
```

---

### 2.2 프로필 수정

**PUT** `/users/me`

프로필 정보를 수정합니다.

#### Request Body
```json
{
  "nickname": "새로운닉네임",
  "profilePictureUrl": "https://storage.../new-profile.jpg",
  "email": "newemail@example.com"
}
```

#### Response
```json
{
  "success": true,
  "message": "프로필이 수정되었습니다",
  "data": {
    "id": "uuid",
    "nickname": "새로운닉네임",
    "profilePictureUrl": "https://storage.../new-profile.jpg",
    "updatedAt": "2025-01-25T16:00:00Z"
  }
}
```

#### Error Codes
- `NICKNAME_ALREADY_TAKEN`: 이미 사용 중인 닉네임
- `INVALID_EMAIL_FORMAT`: 잘못된 이메일 형식

---

### 2.3 닉네임 중복 확인

**GET** `/users/check-nickname`

닉네임 사용 가능 여부를 확인합니다.

#### Query Parameters
- `nickname`: 확인할 닉네임 (required)

#### Example
```
GET /users/check-nickname?nickname=홍길동
```

#### Response (사용 가능)
```json
{
  "success": true,
  "data": {
    "available": true,
    "nickname": "홍길동"
  }
}
```

#### Response (이미 사용 중)
```json
{
  "success": true,
  "data": {
    "available": false,
    "nickname": "홍길동",
    "suggestions": ["홍길동123", "홍길동456", "멋진홍길동"]
  }
}
```

---

### 2.4 프로필 사진 업로드

**POST** `/users/upload-avatar`

프로필 사진을 업로드합니다.

#### Request
```
Content-Type: multipart/form-data

file: [Binary File]
```

#### Example (cURL)
```bash
curl -X POST https://api.drivingzone.com/v2/users/upload-avatar \
  -H "Authorization: Bearer {TOKEN}" \
  -F "file=@profile.jpg"
```

#### Response
```json
{
  "success": true,
  "data": {
    "url": "https://storage.drivingzone.com/avatars/uuid/profile.jpg",
    "thumbnailUrl": "https://storage.drivingzone.com/avatars/uuid/profile_thumb.jpg",
    "size": 45678,
    "format": "image/jpeg"
  }
}
```

#### Constraints
- Max file size: 2MB
- Allowed formats: JPG, PNG, WebP
- Auto-resize: 200x200px
- Auto-compression: WebP format

---

### 2.5 사용자 통계 조회

**GET** `/users/me/stats`

사용자의 통계 정보를 조회합니다.

#### Response
```json
{
  "success": true,
  "data": {
    "overview": {
      "level": 15,
      "xp": 5230,
      "coins": 12500,
      "cashEarned": 35000,
      "consecutiveDays": 7,
      "memberDays": 45
    },
    "missions": {
      "total": 42,
      "completed": 38,
      "inProgress": 4,
      "completionRate": 90.48,
      "byType": {
        "daily": 25,
        "story": 10,
        "challenge": 2,
        "social": 5
      }
    },
    "badges": {
      "total": 8,
      "bronze": 3,
      "silver": 3,
      "gold": 2,
      "platinum": 0
    },
    "social": {
      "friendsCount": 12,
      "referralsCount": 3,
      "referralsCompleted": 2,
      "postsCount": 5,
      "likesReceived": 28
    },
    "ranking": {
      "overall": {
        "rank": 125,
        "percentile": 15.5,
        "change": 5
      },
      "weekly": {
        "rank": 15,
        "percentile": 2.3,
        "change": -3
      },
      "store": {
        "rank": 3,
        "percentile": 5.0,
        "change": 0
      }
    }
  }
}
```

---

## 3. 게이미피케이션 API

### 3.1 레벨 정보 조회

**GET** `/gamification/levels/{level}`

특정 레벨의 상세 정보를 조회합니다.

#### Response
```json
{
  "success": true,
  "data": {
    "level": 15,
    "title": "안전 운전자",
    "requiredXp": 5000,
    "nextLevelXp": 6000,
    "rewards": {
      "coins": 150,
      "unlockedBadges": ["level-15-badge"],
      "unlockedMissions": ["advanced-challenge-1"],
      "perks": [
        "일일 미션 XP +5%",
        "특별 미션 언락"
      ]
    },
    "color": "#10b981",
    "iconUrl": "https://storage.../level-15-icon.svg"
  }
}
```

---

### 3.2 경험치 내역 조회

**GET** `/gamification/xp-history`

경험치 획득/차감 내역을 조회합니다.

#### Query Parameters
- `limit`: 조회 개수 (default: 20, max: 100)
- `offset`: 시작 위치 (default: 0)
- `startDate`: 시작 날짜 (ISO 8601)
- `endDate`: 종료 날짜 (ISO 8601)

#### Response
```json
{
  "success": true,
  "data": {
    "total": 156,
    "items": [
      {
        "id": "uuid",
        "type": "MISSION_COMPLETED",
        "amount": 500,
        "balance": 5230,
        "source": {
          "type": "mission",
          "id": "mission-123",
          "name": "재능충 챌린지 완료"
        },
        "bonuses": [
          {
            "type": "STREAK_BONUS",
            "amount": 50,
            "description": "연속 출석 7일 보너스"
          }
        ],
        "createdAt": "2025-01-25T14:30:00Z"
      },
      {
        "id": "uuid",
        "type": "DAILY_MISSION",
        "amount": 100,
        "balance": 4730,
        "source": {
          "type": "daily_mission",
          "id": "daily-456",
          "name": "퀴즈 5문제 풀기"
        },
        "createdAt": "2025-01-25T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 156,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

### 3.3 뱃지 목록 조회

**GET** `/gamification/badges`

사용자의 뱃지 컬렉션을 조회합니다.

#### Query Parameters
- `status`: all | earned | locked (default: all)
- `category`: all | mission | speed | social | attendance | hidden

#### Response
```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 30,
      "earned": 8,
      "locked": 22,
      "earnedPercentage": 26.67
    },
    "categories": [
      {
        "name": "미션 마스터",
        "badges": [
          {
            "id": "mission-10",
            "name": "미션 초보 탈출",
            "description": "미션 10개를 완료했습니다",
            "iconUrl": "https://storage.../mission-10.svg",
            "rarity": "bronze",
            "earned": true,
            "earnedAt": "2025-01-22T10:00:00Z",
            "progress": {
              "current": 10,
              "required": 10,
              "percentage": 100
            }
          },
          {
            "id": "mission-50",
            "name": "미션 중독자",
            "description": "미션 50개를 완료했습니다",
            "iconUrl": "https://storage.../mission-50.svg",
            "rarity": "silver",
            "earned": false,
            "progress": {
              "current": 38,
              "required": 50,
              "percentage": 76
            }
          }
        ]
      },
      {
        "name": "스피드 러너",
        "badges": [
          {
            "id": "speed-14h",
            "name": "스피드 마스터",
            "description": "14시간 내 합격했습니다",
            "iconUrl": "https://storage.../speed-14h.svg",
            "rarity": "gold",
            "earned": true,
            "earnedAt": "2025-01-20T16:00:00Z"
          }
        ]
      }
    ]
  }
}
```

---

### 3.4 랭킹 조회

**GET** `/gamification/ranking/{type}`

랭킹을 조회합니다.

#### Path Parameters
- `type`: overall | weekly | monthly | store

#### Query Parameters
- `limit`: 조회 개수 (default: 100)
- `offset`: 시작 위치 (default: 0)

#### Response
```json
{
  "success": true,
  "data": {
    "type": "overall",
    "updatedAt": "2025-01-25T16:00:00Z",
    "myRank": {
      "rank": 125,
      "user": {
        "id": "uuid",
        "nickname": "홍길동",
        "level": 15,
        "avatarUrl": "https://..."
      },
      "score": 5230,
      "change": 5
    },
    "rankings": [
      {
        "rank": 1,
        "user": {
          "id": "uuid",
          "nickname": "운전왕",
          "level": 42,
          "avatarUrl": "https://...",
          "badges": ["champion-badge"]
        },
        "score": 25680,
        "change": 0,
        "reward": {
          "type": "monthly",
          "coins": 20000,
          "badge": "monthly-champion"
        }
      },
      {
        "rank": 2,
        "user": {
          "id": "uuid",
          "nickname": "달리기선수",
          "level": 38,
          "avatarUrl": "https://..."
        },
        "score": 23450,
        "change": 1
      }
    ],
    "pagination": {
      "total": 1543,
      "limit": 100,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

### 3.5 코인 내역 조회

**GET** `/gamification/coins/history`

코인 획득/사용 내역을 조회합니다.

#### Response
```json
{
  "success": true,
  "data": {
    "balance": 12500,
    "total": 85,
    "items": [
      {
        "id": "uuid",
        "type": "EARNED",
        "amount": 500,
        "balance": 12500,
        "source": {
          "type": "mission",
          "id": "mission-123",
          "name": "재능충 챌린지 완료"
        },
        "createdAt": "2025-01-25T14:30:00Z"
      },
      {
        "id": "uuid",
        "type": "SPENT",
        "amount": -200,
        "balance": 12000,
        "source": {
          "type": "item_purchase",
          "id": "item-456",
          "name": "특별 아바타 구매"
        },
        "createdAt": "2025-01-25T12:00:00Z"
      }
    ]
  }
}
```

---

## 4. 미션 API

### 4.1 일일 미션 목록 조회

**GET** `/missions/daily`

오늘의 일일 미션 목록을 조회합니다.

#### Response
```json
{
  "success": true,
  "data": {
    "date": "2025-01-25",
    "resetsAt": "2025-01-26T00:00:00Z",
    "timeUntilReset": 25200,
    "summary": {
      "total": 5,
      "completed": 3,
      "completionRate": 60,
      "bonusAvailable": true,
      "bonusRequirement": "모든 미션 완료"
    },
    "missions": [
      {
        "id": "daily-quiz-001",
        "title": "교통법규 OX 퀴즈",
        "description": "교통법규 퀴즈 5문제를 풀어보세요",
        "category": "quiz",
        "difficulty": "easy",
        "status": "completed",
        "rewards": {
          "xp": 100,
          "coins": 50
        },
        "completedAt": "2025-01-25T09:30:00Z",
        "iconUrl": "https://storage.../quiz-icon.svg"
      },
      {
        "id": "daily-checkin-001",
        "title": "아침 체크인",
        "description": "오전 6-9시에 학원에 체크인하세요",
        "category": "checkin",
        "difficulty": "easy",
        "status": "in_progress",
        "rewards": {
          "xp": 80,
          "coins": 40
        },
        "progress": {
          "current": 0,
          "required": 1,
          "percentage": 0
        },
        "deadline": "2025-01-25T09:00:00Z",
        "iconUrl": "https://storage.../checkin-icon.svg"
      }
    ],
    "allCompleteBonus": {
      "available": false,
      "rewards": {
        "xp": 500,
        "coins": 300
      },
      "description": "모든 일일 미션을 완료하면 추가 보상을 받을 수 있습니다"
    }
  }
}
```

---

### 4.2 스토리 미션 목록 조회

**GET** `/missions/story`

스토리 미션 챕터 및 미션 목록을 조회합니다.

#### Response
```json
{
  "success": true,
  "data": {
    "chapters": [
      {
        "id": "chapter-1",
        "title": "시작의 발걸음",
        "description": "드라이빙존 여정의 첫 발걸음",
        "order": 1,
        "status": "completed",
        "unlocked": true,
        "completedAt": "2025-01-22T10:00:00Z",
        "progress": {
          "completed": 3,
          "total": 3,
          "percentage": 100
        },
        "rewards": {
          "xp": 500,
          "coins": 300,
          "badges": ["chapter-1-complete"]
        },
        "missions": [
          {
            "id": "mission-1-1",
            "title": "수강 카드 등록",
            "description": "나의 수강 정보를 등록하세요",
            "order": 1,
            "status": "completed",
            "completedAt": "2025-01-20T11:00:00Z",
            "rewards": {
              "xp": 200,
              "coins": 100
            }
          }
        ]
      },
      {
        "id": "chapter-2",
        "title": "학습의 시작",
        "description": "본격적인 운전 교육의 시작",
        "order": 2,
        "status": "in_progress",
        "unlocked": true,
        "progress": {
          "completed": 1,
          "total": 3,
          "percentage": 33.33
        },
        "missions": [
          {
            "id": "mission-2-1",
            "title": "교육 시간 10시간 달성",
            "description": "학원에서 10시간 교육을 받으세요",
            "order": 1,
            "status": "in_progress",
            "progress": {
              "current": 7,
              "required": 10,
              "percentage": 70,
              "unit": "시간"
            },
            "rewards": {
              "xp": 500,
              "coins": 300
            }
          }
        ]
      },
      {
        "id": "chapter-3",
        "title": "도전과 성장",
        "order": 3,
        "status": "locked",
        "unlocked": false,
        "unlockCondition": "챕터 2를 완료하세요"
      }
    ]
  }
}
```

---

### 4.3 미션 상세 조회

**GET** `/missions/{missionId}`

특정 미션의 상세 정보를 조회합니다.

#### Response
```json
{
  "success": true,
  "data": {
    "id": "mission-2-1",
    "type": "story",
    "chapter": {
      "id": "chapter-2",
      "title": "학습의 시작"
    },
    "title": "교육 시간 10시간 달성",
    "description": "학원에서 10시간 교육을 받으세요",
    "longDescription": "운전면허 취득을 위해서는 최소 10시간의 교육이 필요합니다. 학원에 출석하여 교육을 받고, 출석 체크를 통해 진행 상황을 기록하세요.",
    "status": "in_progress",
    "difficulty": "medium",
    "startedAt": "2025-01-23T10:00:00Z",
    "progress": {
      "current": 7,
      "required": 10,
      "percentage": 70,
      "unit": "시간"
    },
    "requirements": [
      {
        "id": "req-1",
        "type": "CHECKIN",
        "description": "학원 체크인 10회",
        "completed": false,
        "progress": {
          "current": 7,
          "required": 10
        }
      }
    ],
    "proofRequirements": [
      {
        "type": "IMAGE",
        "description": "출석부 사진 또는 교육 수강 증빙"
      }
    ],
    "rewards": {
      "xp": 500,
      "coins": 300,
      "cash": 0
    },
    "tips": [
      "학원 방문 시 매번 체크인하는 것을 잊지 마세요",
      "교육 시간은 자동으로 기록됩니다"
    ],
    "relatedMissions": [
      {
        "id": "mission-2-2",
        "title": "학과 시험 합격 인증",
        "type": "next"
      }
    ]
  }
}
```

---

### 4.4 미션 시작

**POST** `/missions/{missionId}/start`

미션을 시작합니다.

#### Response
```json
{
  "success": true,
  "message": "미션이 시작되었습니다",
  "data": {
    "missionId": "mission-2-1",
    "status": "in_progress",
    "startedAt": "2025-01-25T16:00:00Z"
  }
}
```

#### Error Codes
- `MISSION_ALREADY_STARTED`: 이미 시작된 미션
- `MISSION_LOCKED`: 잠긴 미션 (이전 챕터 미완료)
- `MISSION_NOT_FOUND`: 존재하지 않는 미션

---

### 4.5 미션 완료 제출

**POST** `/missions/{missionId}/complete`

미션 완료 증빙을 제출합니다.

#### Request Body
```json
{
  "proofData": {
    "type": "challenge",
    "learningHours": 12,
    "certificateImage": "https://storage.../cert.jpg",
    "completedAt": "2025-01-25T16:00:00Z",
    "notes": "14시간 내 합격했습니다!"
  }
}
```

#### Response (Success - 자동 승인)
```json
{
  "success": true,
  "message": "미션이 완료되었습니다!",
  "data": {
    "missionId": "mission-2-1",
    "status": "completed",
    "completedAt": "2025-01-25T16:00:00Z",
    "rewards": {
      "xp": 500,
      "xpBonus": 50,
      "coins": 300,
      "cash": 15000,
      "badges": ["speed-master"]
    },
    "levelUp": {
      "occurred": true,
      "oldLevel": 15,
      "newLevel": 16,
      "rewards": {
        "coins": 160
      }
    },
    "newBadges": [
      {
        "id": "speed-master",
        "name": "스피드 마스터",
        "description": "14시간 내 합격",
        "rarity": "gold"
      }
    ]
  }
}
```

#### Response (Pending - 관리자 승인 필요)
```json
{
  "success": true,
  "message": "미션 완료가 제출되었습니다. 관리자 승인을 기다려주세요.",
  "data": {
    "missionId": "mission-2-1",
    "status": "pending_review",
    "submittedAt": "2025-01-25T16:00:00Z",
    "estimatedReviewTime": "영업일 기준 1-2일"
  }
}
```

#### Error Codes
- `MISSION_NOT_STARTED`: 미션을 시작하지 않음
- `INVALID_PROOF`: 잘못된 증빙 데이터
- `MISSING_REQUIRED_FIELDS`: 필수 필드 누락

---

### 4.6 미션 제출 내역 조회

**GET** `/missions/submissions`

미션 제출 내역을 조회합니다.

#### Query Parameters
- `status`: all | pending | approved | rejected
- `limit`: 조회 개수
- `offset`: 시작 위치

#### Response
```json
{
  "success": true,
  "data": {
    "total": 12,
    "items": [
      {
        "id": "submission-123",
        "mission": {
          "id": "mission-2-1",
          "title": "교육 시간 10시간 달성"
        },
        "status": "approved",
        "submittedAt": "2025-01-25T16:00:00Z",
        "reviewedAt": "2025-01-26T09:00:00Z",
        "reviewer": {
          "name": "관리자",
          "role": "admin"
        },
        "rewards": {
          "xp": 500,
          "coins": 300,
          "cash": 0
        }
      },
      {
        "id": "submission-124",
        "mission": {
          "id": "mission-3-1",
          "title": "기능 시험 합격 인증"
        },
        "status": "pending",
        "submittedAt": "2025-01-27T14:00:00Z",
        "estimatedReviewTime": "영업일 기준 1-2일"
      }
    ]
  }
}
```

---

## 5. 소셜 API

### 5.1 친구 목록 조회

**GET** `/social/friends`

친구 목록을 조회합니다.

#### Query Parameters
- `status`: all | accepted | pending | blocked
- `limit`, `offset`

#### Response
```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 12,
      "online": 3,
      "pendingRequests": 2
    },
    "friends": [
      {
        "id": "uuid",
        "user": {
          "id": "user-uuid",
          "nickname": "김철수",
          "level": 18,
          "avatarUrl": "https://...",
          "isOnline": true,
          "lastActiveAt": "2025-01-25T16:30:00Z"
        },
        "status": "accepted",
        "becameFriendsAt": "2025-01-20T10:00:00Z",
        "mutualFriendsCount": 3
      }
    ]
  }
}
```

---

### 5.2 친구 요청 보내기

**POST** `/social/friends/request`

친구 요청을 보냅니다.

#### Request Body
```json
{
  "userId": "target-user-uuid"
}
```

#### Response
```json
{
  "success": true,
  "message": "친구 요청을 보냈습니다",
  "data": {
    "requestId": "request-uuid",
    "targetUser": {
      "id": "user-uuid",
      "nickname": "김철수",
      "level": 18
    },
    "createdAt": "2025-01-25T16:00:00Z"
  }
}
```

---

### 5.3 활동 피드 조회

**GET** `/social/feed`

친구들의 활동 피드를 조회합니다.

#### Response
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "feed-123",
        "type": "LEVEL_UP",
        "user": {
          "id": "user-uuid",
          "nickname": "김철수",
          "avatarUrl": "https://..."
        },
        "content": {
          "oldLevel": 17,
          "newLevel": 18
        },
        "message": "김철수님이 레벨 18이 되었습니다!",
        "likesCount": 15,
        "commentsCount": 3,
        "liked": false,
        "createdAt": "2025-01-25T15:00:00Z"
      },
      {
        "id": "feed-124",
        "type": "BADGE_EARNED",
        "user": {
          "id": "user-uuid",
          "nickname": "이영희",
          "avatarUrl": "https://..."
        },
        "content": {
          "badge": {
            "id": "speed-master",
            "name": "스피드 마스터",
            "iconUrl": "https://...",
            "rarity": "gold"
          }
        },
        "message": "이영희님이 '스피드 마스터' 뱃지를 획득했습니다!",
        "likesCount": 28,
        "commentsCount": 5,
        "liked": true,
        "createdAt": "2025-01-25T14:30:00Z"
      }
    ]
  }
}
```

---

### 5.4 커뮤니티 게시글 목록 조회

**GET** `/social/community/posts`

커뮤니티 게시글 목록을 조회합니다.

#### Query Parameters
- `category`: all | tips | reviews | questions | general
- `sort`: latest | popular | trending
- `limit`, `offset`

#### Response
```json
{
  "success": true,
  "data": {
    "total": 156,
    "items`: [
      {
        "id": "post-123",
        "category": "tips",
        "author": {
          "id": "user-uuid",
          "nickname": "운전왕",
          "level": 42,
          "avatarUrl": "https://...",
          "badges": ["veteran"]
        },
        "title": "기능 시험 한번에 합격하는 꿀팁",
        "content": "안녕하세요! 저는 기능 시험을 한 번에 합격했는데요...",
        "contentPreview": "안녕하세요! 저는 기능 시험을 한 번에 합격했는데요...",
        "images": [
          "https://storage.../post-image-1.jpg"
        ],
        "tags": ["기능시험", "꿀팁", "합격"],
        "viewsCount": 1250,
        "likesCount": 85,
        "commentsCount": 23,
        "bookmarksCount": 42,
        "liked": false,
        "bookmarked": false,
        "isPinned": false,
        "createdAt": "2025-01-25T10:00:00Z",
        "updatedAt": "2025-01-25T10:00:00Z"
      }
    ]
  }
}
```

---

### 5.5 게시글 작성

**POST** `/social/community/posts`

커뮤니티에 게시글을 작성합니다.

#### Request Body
```json
{
  "category": "tips",
  "title": "기능 시험 꿀팁",
  "content": "안녕하세요! 저는 기능 시험을...",
  "images": [
    "https://storage.../image1.jpg"
  ],
  "tags": ["기능시험", "꿀팁"]
}
```

#### Response
```json
{
  "success": true,
  "message": "게시글이 작성되었습니다",
  "data": {
    "id": "post-123",
    "createdAt": "2025-01-25T16:00:00Z"
  }
}
```

---

## 6. 페이백 API

### 6.1 페이백 내역 조회

**GET** `/paybacks`

페이백 내역을 조회합니다.

#### Query Parameters
- `status`: all | pending | approved | rejected | paid
- `limit`, `offset`

#### Response
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEarned": 45000,
      "totalPaid": 35000,
      "pending": 10000,
      "available": 10000
    },
    "items": [
      {
        "id": "payback-123",
        "mission": {
          "id": "mission-123",
          "title": "재능충 챌린지",
          "type": "challenge"
        },
        "amount": 15000,
        "status": "paid",
        "requestedAt": "2025-01-22T10:00:00Z",
        "approvedAt": "2025-01-23T09:00:00Z",
        "paidAt": "2025-01-24T10:00:00Z",
        "approvedBy": {
          "name": "관리자",
          "role": "admin"
        },
        "bankAccount": {
          "bank": "국민은행",
          "accountNumber": "****1234"
        }
      }
    ]
  }
}
```

---

### 6.2 페이백 신청

**POST** `/paybacks/request`

페이백을 신청합니다.

#### Request Body
```json
{
  "missionId": "mission-123",
  "amount": 15000,
  "bankAccount": {
    "bank": "국민은행",
    "accountNumber": "123456789012",
    "accountHolder": "홍길동"
  }
}
```

#### Response
```json
{
  "success": true,
  "message": "페이백이 신청되었습니다",
  "data": {
    "id": "payback-123",
    "amount": 15000,
    "status": "pending",
    "requestedAt": "2025-01-25T16:00:00Z",
    "estimatedProcessTime": "영업일 기준 3-5일"
  }
}
```

---

## 7. 관리자 API

### 7.1 대시보드 통계 조회

**GET** `/admin/dashboard/stats`

관리자 대시보드 통계를 조회합니다.

#### Response
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 1543,
      "newUsersToday": 12,
      "activeUsers": 456,
      "totalMissions": 2340,
      "pendingReviews": 23,
      "pendingPaybacks": 15
    },
    "missions": {
      "completionRate": 78.5,
      "averageCompletionTime": 3.2,
      "byType": {
        "daily": 1200,
        "story": 800,
        "challenge": 200,
        "social": 140
      }
    },
    "revenue": {
      "totalPaybackAmount": 4500000,
      "paidAmount": 3200000,
      "pendingAmount": 1300000
    }
  }
}
```

---

### 7.2 미션 제출물 관리

**GET** `/admin/missions/submissions`

관리자가 미션 제출물을 조회합니다.

#### Query Parameters
- `status`: pending | approved | rejected
- `storeId`: 지점 필터
- `limit`, `offset`

#### Response
```json
{
  "success": true,
  "data": {
    "total": 23,
    "items": [
      {
        "id": "submission-123",
        "user": {
          "id": "user-uuid",
          "name": "홍길동",
          "phone": "010-1234-5678",
          "store": "드라이빙존 강남점"
        },
        "mission": {
          "id": "mission-123",
          "title": "재능충 챌린지",
          "type": "challenge"
        },
        "proofData": {
          "learningHours": 12,
          "certificateImage": "https://storage.../cert.jpg",
          "notes": "14시간 내 합격했습니다!"
        },
        "status": "pending",
        "submittedAt": "2025-01-25T16:00:00Z",
        "rewards": {
          "xp": 1000,
          "cash": 15000
        }
      }
    ]
  }
}
```

---

### 7.3 미션 제출물 승인/거부

**PUT** `/admin/missions/submissions/{submissionId}`

미션 제출물을 승인하거나 거부합니다.

#### Request Body
```json
{
  "action": "approve",
  "reason": "",
  "adjustedRewards": {
    "xp": 1000,
    "cash": 15000
  }
}
```

또는

```json
{
  "action": "reject",
  "reason": "증빙 자료가 불명확합니다. 다시 제출해주세요."
}
```

#### Response (승인)
```json
{
  "success": true,
  "message": "미션이 승인되었습니다",
  "data": {
    "submissionId": "submission-123",
    "status": "approved",
    "approvedAt": "2025-01-26T09:00:00Z",
    "rewardsIssued": {
      "xp": 1000,
      "cash": 15000
    }
  }
}
```

---

## 8. 공통 응답 형식

### Success Response
```json
{
  "success": true,
  "data": { },
  "message": "작업이 완료되었습니다"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자 친화적인 에러 메시지",
    "details": {
      "field": "phone",
      "value": "invalid"
    }
  },
  "timestamp": "2025-01-25T16:00:00Z",
  "requestId": "req-123456"
}
```

### Pagination
```json
{
  "pagination": {
    "total": 156,
    "limit": 20,
    "offset": 0,
    "hasMore": true,
    "nextOffset": 20
  }
}
```

### 공통 HTTP 상태 코드
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `429`: Rate Limit 초과
- `500`: 서버 오류

---

**버전**: 2.0.0
**최종 업데이트**: 2025-01-10
**작성자**: Backend Team
