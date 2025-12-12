# API Implementation Complete

## Summary
모든 클라이언트 페이지와 Supabase API 연동이 완료되었습니다.

## Implemented Services (8개)

### 1. Gamification Service (`/src/lib/services/gamification.ts`)
**기능:**
- 레벨/경험치 시스템
- 뱃지 시스템 (자동 지급 및 조건 확인)
- 연속 참여 시스템 (스트릭)
- 알림 생성 및 관리

**주요 함수:**
- `getUserLevel(userId)` - 사용자 레벨 정보 조회
- `addExperience(userId, points, source)` - 경험치 추가
- `handleLevelUpRewards(userId, newLevel)` - 레벨업 보상 처리
- `getUserBadges(userId)` - 사용자 뱃지 목록 조회
- `checkAndAwardBadges(userId)` - 뱃지 조건 확인 및 자동 지급
- `getUserStreak(userId, type)` - 스트릭 정보 조회
- `updateStreak(userId, type)` - 스트릭 업데이트
- `createNotification(userId, type, data)` - 알림 생성
- `getUserNotifications(userId, limit)` - 알림 목록 조회

### 2. Badges Service (`/src/lib/services/badges.ts`)
**기능:**
- 뱃지 진행률 계산 및 업데이트
- 다양한 조건 타입 지원 (count, streak, level, time_based, combination)

**주요 함수:**
- `getAllBadgesWithProgress(userId)` - 모든 뱃지 목록을 진행률과 함께 조회
- `updateBadgeProgress(userId, badgeId, progress)` - 뱃지 진행률 업데이트
- `checkBadgeConditions(userId)` - 뱃지 조건 체크 및 자동 업데이트

**지원하는 조건 타입:**
- `count`: 특정 이벤트 발생 횟수
- `streak`: 연속 일수
- `level`: 레벨 달성
- `time_based`: 시간 기반 활동
- `combination`: 여러 조건의 조합

### 3. Shop Service (`/src/lib/services/shop.ts`)
**기능:**
- 아이템 구매 및 관리
- 코인 시스템 (획득, 차감, 히스토리)
- 인벤토리 관리
- 아이템 장착/해제

**주요 함수:**
- `getShopItems(userId)` - 상점 아이템 목록 조회 (구매 여부 포함)
- `purchaseItem(userId, itemId)` - 아이템 구매 (코인 차감, 트랜잭션)
- `equipItem(userId, itemId)` - 아이템 장착
- `unequipItem(userId, itemId)` - 아이템 장착 해제
- `getUserInventory(userId)` - 사용자 인벤토리 조회
- `getCoinHistory(userId, limit)` - 코인 히스토리 조회
- `addCoins(userId, amount, type, description, metadata)` - 코인 추가

### 4. Friends Service (`/src/lib/services/friends.ts`)
**기능:**
- 친구 요청 및 수락/거절
- 친구 목록 관리
- 사용자 검색

**주요 함수:**
- `sendFriendRequest(userId, friendId)` - 친구 요청 보내기 (알림 생성)
- `acceptFriendRequest(userId, friendshipId)` - 친구 요청 수락 (양방향 관계 생성)
- `rejectFriendRequest(userId, friendshipId)` - 친구 요청 거절
- `getFriends(userId)` - 친구 목록 조회
- `getFriendRequests(userId)` - 받은 친구 요청 목록
- `removeFriend(userId, friendId)` - 친구 삭제 (양방향)
- `searchUsers(query, currentUserId)` - 닉네임으로 사용자 검색

### 5. Notifications Service (`/src/lib/services/notifications.ts`)
**기능:**
- 알림 목록 조회 및 관리
- 읽음/안읽음 상태 관리
- 알림 선호 설정

**주요 함수:**
- `getUserNotifications(userId, limit)` - 사용자 알림 목록 조회
- `markAsRead(notificationId)` - 알림 읽음 처리
- `markAllAsRead(userId)` - 모든 알림 읽음 처리
- `getUnreadCount(userId)` - 읽지 않은 알림 수 조회
- `getNotificationPreferences(userId)` - 알림 선호 설정 조회
- `updateNotificationPreference(userId, type, channel, enabled)` - 알림 선호 설정 업데이트

### 6. Activity Feed Service (`/src/lib/services/activity-feed.ts`)
**기능:**
- 활동 피드 조회 (전체, 친구, 지점, 내 활동)
- 좋아요 및 댓글 기능
- 자동 활동 생성 (미션 완료, 레벨업, 뱃지, 스트릭, 챕터)

**주요 함수:**
- `getActivityFeed(userId, filter, limit)` - 활동 피드 조회
- `createActivity(userId, type, content, metadata)` - 활동 생성
- `toggleActivityLike(userId, activityId)` - 좋아요 토글
- `addActivityComment(userId, activityId, content)` - 댓글 추가
- `getActivityComments(activityId)` - 댓글 조회

**자동 활동 생성 함수:**
- `createMissionCompleteActivity(userId, missionType, missionName)`
- `createLevelUpActivity(userId, newLevel)`
- `createBadgeUnlockActivity(userId, badgeName)`
- `createStreakActivity(userId, streakDays)`
- `createChapterCompleteActivity(userId, chapterNumber, chapterName)`

### 7. Community Service (`/src/lib/services/community.ts`)
**기능:**
- 게시글 작성, 수정, 삭제
- 댓글 작성, 삭제
- 좋아요 기능
- 조회수 자동 증가

**주요 함수:**
- `getPosts(category, userId, limit)` - 게시글 목록 조회
- `getPost(postId, userId)` - 게시글 상세 조회 (조회수 증가)
- `createPost(userId, category, title, content)` - 게시글 작성
- `updatePost(postId, userId, title, content)` - 게시글 수정
- `deletePost(postId, userId)` - 게시글 삭제
- `togglePostLike(userId, postId)` - 게시글 좋아요 토글
- `getComments(postId, userId)` - 댓글 목록 조회
- `createComment(userId, postId, content)` - 댓글 작성
- `deleteComment(commentId, userId)` - 댓글 삭제
- `toggleCommentLike(userId, commentId)` - 댓글 좋아요 토글

### 8. Storage Service (`/src/lib/services/storage.ts`)
**기능:**
- Supabase Storage를 통한 파일 업로드
- 이미지 압축 (클라이언트 사이드)
- 파일 유효성 검사

**주요 함수:**
- `uploadFile(bucket, path, file)` - 범용 파일 업로드
- `uploadMissionProof(userId, missionId, file)` - 미션 증빙 이미지 업로드
- `uploadAvatar(userId, file)` - 아바타 이미지 업로드
- `uploadPostImage(userId, file)` - 게시글 이미지 업로드
- `deleteFile(bucket, path)` - 파일 삭제
- `uploadMultipleFiles(bucket, path, files)` - 다중 파일 업로드
- `compressImage(file, maxWidth, quality)` - 이미지 압축
- `validateFile(file)` - 파일 유효성 검사

**버킷:**
- `mission-proofs`: 미션 증빙 이미지
- `avatars`: 사용자 아바타
- `post-images`: 게시글 이미지

### 9. Rankings Service (`/src/lib/services/rankings.ts`)
**기능:**
- 다양한 랭킹 조회 (종합, 주간, 지점별, 스피드)
- 사용자 순위 및 순위 변동 조회
- 랭킹 스냅샷 저장

**주요 함수:**
- `getOverallRanking(limit)` - 종합 랭킹 (레벨 + XP + 뱃지)
- `getWeeklyRanking(limit)` - 주간 랭킹 (최근 7일간 XP)
- `getStoreRanking(storeId, limit)` - 지점별 랭킹
- `getSpeedRanking(limit)` - 스피드 랭킹 (미션 완료 속도)
- `getUserRank(userId, type)` - 사용자 순위 조회
- `getRankChange(userId)` - 랭킹 변동 조회 (전날 대비)
- `saveRankingSnapshot()` - 랭킹 스냅샷 저장 (크론잡)

## Realtime Hooks (7개)

### useNotifications
실시간 알림 구독. INSERT/UPDATE 이벤트를 구독하여 읽지 않은 알림 수를 실시간 업데이트.
```typescript
const { unreadCount, channel } = useNotifications(userId, (notification) => {
  toast.info(notification.title)
})
```

### useFriendRequests
실시간 친구 요청 구독. 새로운 친구 요청이 올 때마다 카운트 업데이트.
```typescript
const { requestCount, channel } = useFriendRequests(userId)
```

### useActivityFeed
친구들의 활동 피드 실시간 구독. 친구가 새로운 활동을 생성하면 콜백 호출.
```typescript
const { channel } = useActivityFeed(userId, (activity) => {
  console.log('New activity:', activity)
})
```

### useUserLevel
사용자 레벨 및 XP 실시간 구독. 레벨업 시 콜백 호출.
```typescript
const { level, xp, channel } = useUserLevel(userId, (newLevel) => {
  toast.success(`레벨 ${newLevel} 달성!`)
})
```

### useComments
게시글 댓글 실시간 구독. 새 댓글이 추가되면 콜백 호출.
```typescript
const { channel } = useComments(postId, (comment) => {
  setComments((prev) => [...prev, comment])
})
```

### useMissionStatus
미션 상태 변경 실시간 구독. 관리자가 미션을 승인/거절하면 즉시 반영.
```typescript
const { channel } = useMissionStatus(userId, (mission) => {
  if (mission.status === 'approved') {
    toast.success('미션이 승인되었습니다!')
  }
})
```

### useRealtimeSubscription
범용 실시간 구독 훅. 모든 테이블의 변경 사항을 구독 가능.
```typescript
const { channel } = useRealtimeSubscription('users', `id=eq.${userId}`, 'UPDATE', (payload) => {
  console.log('User updated:', payload.new)
})
```

## Database Tables Structure

### 기존 테이블 (V1)
- `users`, `stores`, `branches`, `missions`, `mission_participations`, `paybacks`, `referrals`

### 새로 추가된 테이블 (V2)
**Gamification:**
- `levels` - 레벨 정의
- `user_levels` - 사용자 레벨 정보
- `badges` - 뱃지 정의
- `user_badges` - 사용자 뱃지 (진행률 포함)
- `user_streaks` - 연속 참여 정보

**Rankings:**
- `rankings` - 랭킹 캐시
- `ranking_snapshots` - 랭킹 스냅샷 (일별 저장)

**Missions:**
- `daily_mission_templates` - 일일 미션 템플릿
- `daily_missions` - 사용자별 일일 미션
- `story_chapters` - 스토리 챕터
- `story_missions` - 스토리 미션

**Social:**
- `friendships` - 친구 관계
- `activity_feeds` - 활동 피드
- `activity_likes` - 활동 좋아요
- `activity_comments` - 활동 댓글
- `community_posts` - 커뮤니티 게시글
- `post_likes` - 게시글 좋아요
- `post_comments` - 게시글 댓글
- `comment_likes` - 댓글 좋아요

**Shop:**
- `shop_items` - 상점 아이템
- `user_inventory` - 사용자 인벤토리
- `coin_history` - 코인 히스토리

**Notifications:**
- `notifications` - 알림
- `notification_preferences` - 알림 선호 설정

**Events:**
- `events` - 이벤트 정의
- `event_participations` - 이벤트 참여

## Integration Points

### 1. Client Pages → Services
모든 클라이언트 페이지는 service 레이어를 통해 Supabase와 통신합니다.

**예시:**
```typescript
// ❌ 잘못된 방법
const { data } = await supabase.from('users').select('*')

// ✅ 올바른 방법
import { getShopItems } from '@/lib/services/shop'
const items = await getShopItems(userId)
```

### 2. Automatic Activities
특정 이벤트 발생 시 자동으로 활동 피드 생성:

**daily-missions.ts**
```typescript
// 미션 완료 시
await createMissionCompleteActivity(userId, 'daily', missionName)
```

**gamification.ts**
```typescript
// 레벨업 시
await createLevelUpActivity(userId, newLevel)
```

### 3. Notifications
모든 중요한 이벤트에 대해 자동 알림 생성:

- 친구 요청: `friend_request`
- 댓글: `comment`
- 좋아요: `like`
- 레벨업: `level_up`
- 뱃지 획득: `badge_unlock`
- 미션 승인/거절: `mission_approved`, `mission_rejected`

### 4. Realtime Updates
Supabase Realtime을 통한 실시간 업데이트:

- 알림 수신 시 즉시 UI 업데이트
- 친구 요청 수 실시간 반영
- 댓글 실시간 추가
- 레벨/XP 즉시 반영

## File Upload Flow

1. 사용자가 파일 선택
2. `validateFile(file)` - 파일 유효성 검사
3. `compressImage(file)` - 이미지 압축 (선택사항)
4. `uploadFile(bucket, path, file)` - Supabase Storage에 업로드
5. 공개 URL 반환 및 DB에 저장

## Coin Economy Flow

1. **코인 획득:**
   - 미션 완료
   - 레벨업 보상
   - 연속 출석 보너스
   - 이벤트 보상

2. **코인 사용:**
   - 상점에서 아이템 구매
   - 스킵권, 부스터 구매

3. **히스토리 기록:**
   - 모든 코인 거래는 `coin_history`에 기록
   - 타입: `mission`, `level_up`, `purchase`, `bonus`

## Badge System Flow

1. **뱃지 정의:**
   - `badges` 테이블에 조건 정의 (JSONB)
   - 조건 타입: count, streak, level, time_based, combination

2. **진행률 계산:**
   - 이벤트 발생 시 `checkBadgeConditions(userId)` 호출
   - 각 뱃지의 진행률 계산 및 업데이트

3. **자동 지급:**
   - 진행률 100% 달성 시 자동 지급
   - 알림 생성 및 활동 피드 추가

## Next Steps

### 1. Database Setup
```bash
# 1. Database schema V2 실행
psql -f database-schema-v2.sql

# 2. Storage buckets 생성
# Supabase Dashboard → Storage → New bucket
# - mission-proofs (public)
# - avatars (public)
# - post-images (public)

# 3. RLS policies 설정
# 각 테이블에 대한 Row Level Security 정책 적용
```

### 2. Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Cron Jobs (선택사항)
```typescript
// 매일 자정 실행: 랭킹 스냅샷 저장
import { saveRankingSnapshot } from '@/lib/services/rankings'
await saveRankingSnapshot()

// 매일 자정 실행: 일일 미션 할당
import { assignDailyMissions } from '@/lib/services/daily-missions'
// 모든 사용자에 대해 실행
```

### 4. Testing
- Supabase 연결 테스트: `/test` 페이지
- 각 service 함수 단위 테스트
- 실시간 구독 테스트

## Performance Considerations

### 1. 캐싱
- 랭킹은 `rankings` 테이블에 캐시 저장
- 자주 조회되는 데이터는 Redis 캐싱 고려

### 2. 인덱싱
중요한 쿼리에 대한 인덱스:
```sql
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_activity_feeds_user_id ON activity_feeds(user_id);
CREATE INDEX idx_friendships_user_friend ON friendships(user_id, friend_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
```

### 3. 실시간 구독 최적화
- 필요한 채널만 구독
- 컴포넌트 언마운트 시 채널 정리
- 필터를 사용하여 불필요한 이벤트 제외

## Statistics

- **Service Files**: 9개
- **Realtime Hooks**: 7개
- **Database Tables**: 30+ (V1 + V2)
- **API Functions**: 100+
- **Client Pages**: 11개 (모두 API 연동 완료)

## Documentation

- [Database Schema V2](./database-schema-v2.sql)
- [Client Pages Complete](./CLIENT-PAGES-COMPLETE.md)
- [MVP Implementation](./MVP-IMPLEMENTATION.md)
- [Project Specification](./driving-zone-mission-v2.md)
