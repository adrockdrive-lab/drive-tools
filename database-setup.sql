-- ===============================================
-- 드라이빙존 미션 시스템 데이터베이스 스키마
-- ===============================================

-- 1. users 테이블 - 사용자 정보 저장
-- ===============================================
create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  name varchar(50) not null,
  phone varchar(15) unique not null,
  phone_verified boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- users 테이블 업데이트 트리거
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

create trigger update_users_updated_at before update on users
for each row execute procedure update_updated_at_column();

-- users 테이블 인덱스
create index if not exists idx_users_phone on users(phone);

-- users 테이블 주석
comment on table users is 'Stores user registration information including name and phone verification status';

-- ===============================================
-- 2. missions 테이블 - 미션 기본 정보
-- ===============================================
create table if not exists missions (
  id serial primary key,
  title varchar(100) not null,
  description text,
  reward_amount integer default 0,
  mission_type varchar(20) not null, -- 'challenge', 'sns', 'review', 'referral'
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- missions 테이블 주석
comment on table missions is 'Stores mission information and reward details';
comment on column missions.mission_type is 'Type of mission: challenge, sns, review, referral';

-- ===============================================
-- 3. user_missions 테이블 - 사용자별 미션 진행상태
-- ===============================================
create table if not exists user_missions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  mission_id integer references missions(id),
  status varchar(20) default 'pending', -- 'pending', 'in_progress', 'completed', 'verified'
  proof_data jsonb, -- 인증 데이터 (교육시간, 링크, 이미지 URL 등)
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  unique(user_id, mission_id)
);

-- user_missions 테이블 인덱스
create index if not exists idx_user_missions_user_id on user_missions(user_id);
create index if not exists idx_user_missions_status on user_missions(status);

-- user_missions 테이블 주석
comment on table user_missions is 'Tracks user progress on each mission with proof data';
comment on column user_missions.status is 'Mission status: pending, in_progress, completed, verified';
comment on column user_missions.proof_data is 'JSON data containing proof of mission completion';

-- ===============================================
-- 4. paybacks 테이블 - 페이백 내역
-- ===============================================
create table if not exists paybacks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id),
  mission_id integer references missions(id),
  amount integer not null,
  status varchar(20) default 'pending', -- 'pending', 'paid', 'cancelled'
  paid_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- paybacks 테이블 인덱스
create index if not exists idx_paybacks_user_id on paybacks(user_id);
create index if not exists idx_paybacks_status on paybacks(status);

-- paybacks 테이블 주석
comment on table paybacks is 'Tracks payback amounts and payment status for completed missions';

-- ===============================================
-- 5. sms_verifications 테이블 - SMS 인증 코드
-- ===============================================
create table if not exists sms_verifications (
  id uuid default gen_random_uuid() primary key,
  phone varchar(15) not null,
  code varchar(6) not null,
  expires_at timestamp with time zone not null,
  verified boolean default false,
  created_at timestamp with time zone default now()
);

-- sms_verifications 테이블 인덱스
create index if not exists idx_sms_verifications_phone on sms_verifications(phone);
create index if not exists idx_sms_verifications_expires_at on sms_verifications(expires_at);

-- sms_verifications 테이블 주석
comment on table sms_verifications is 'Stores SMS verification codes for phone number verification';

-- ===============================================
-- 6. referrals 테이블 - 친구 추천
-- ===============================================
create table if not exists referrals (
  id uuid default gen_random_uuid() primary key,
  referrer_id uuid references users(id),
  referee_name varchar(50) not null,
  referee_phone varchar(15) not null,
  is_verified boolean default false,
  reward_paid boolean default false,
  created_at timestamp with time zone default now()
);

-- referrals 테이블 인덱스
create index if not exists idx_referrals_referrer_id on referrals(referrer_id);
create index if not exists idx_referrals_phone on referrals(referee_phone);

-- referrals 테이블 주석
comment on table referrals is 'Tracks friend referrals and reward payments';

-- ===============================================
-- 6. 기본 미션 데이터 삽입
-- ===============================================
insert into missions (title, description, reward_amount, mission_type) values
('재능충 챌린지', '교육시간 14시간 이내 합격 도전! 합격 인증 시 2만원 페이백', 20000, 'challenge'),
('SNS 인증 미션', '내 합격을 자랑하자! SNS에 합격 사진 업로드하고 링크 등록 시 1만원 페이백', 10000, 'sns'),
('후기 쓰기 미션', '진짜 후기, 진짜 혜택! 3개 플랫폼 후기 작성 시 커피 쿠폰 지급', 0, 'review'),
('친구 추천 미션', '친구 추천하고 5만원 받자! 친구가 등록하면 추천인에게 5만원 페이백', 50000, 'referral')
on conflict do nothing;

-- ===============================================
-- 7. Row Level Security (RLS) 정책 설정
-- ===============================================

-- users 테이블 RLS 활성화
alter table users enable row level security;

-- users 테이블 정책
create policy "Users can view own profile" on users for select using (auth.uid() = id);
create policy "Users can update own profile" on users for update using (auth.uid() = id);
create policy "Anyone can insert during registration" on users for insert with check (true);

-- user_missions 테이블 RLS 활성화
alter table user_missions enable row level security;

-- user_missions 테이블 정책
create policy "Users can view own missions" on user_missions for select using (auth.uid() = user_id);
create policy "Users can update own missions" on user_missions for update using (auth.uid() = user_id);
create policy "Users can insert own missions" on user_missions for insert with check (auth.uid() = user_id);

-- paybacks 테이블 RLS 활성화
alter table paybacks enable row level security;

-- paybacks 테이블 정책
create policy "Users can view own paybacks" on paybacks for select using (auth.uid() = user_id);

-- referrals 테이블 RLS 활성화
alter table referrals enable row level security;

-- referrals 테이블 정책
create policy "Users can view own referrals" on referrals for select using (auth.uid() = referrer_id);
create policy "Users can insert own referrals" on referrals for insert with check (auth.uid() = referrer_id);

-- missions 테이블은 모든 사용자가 읽기 가능 (공개 데이터)
alter table missions enable row level security;
create policy "Anyone can view active missions" on missions for select using (is_active = true);

-- ===============================================
-- 8. Storage 설정 (이미지 업로드용)
-- ===============================================

-- mission-proofs 버킷 생성 (Supabase 콘솔에서 수동으로 생성 필요)
-- 버킷 설정:
-- - 이름: mission-proofs
-- - Public: true
-- - File size limit: 10MB
-- - Allowed mime types: image/jpeg, image/png, image/webp, application/pdf

-- ===============================================
-- 9. 유용한 함수들
-- ===============================================

-- 사용자별 총 페이백 금액 계산 함수
create or replace function get_user_total_payback(user_uuid uuid)
returns integer as $$
declare
  total_amount integer;
begin
  select coalesce(sum(amount), 0) into total_amount
  from paybacks
  where user_id = user_uuid and status = 'paid';

  return total_amount;
end;
$$ language plpgsql security definer;

-- 미션 완료 시 페이백 생성 함수
create or replace function create_payback_on_mission_complete()
returns trigger as $$
begin
  -- 미션이 완료 상태로 변경될 때만 실행
  if new.status = 'completed' and old.status != 'completed' then
    insert into paybacks (user_id, mission_id, amount)
    select new.user_id, new.mission_id, m.reward_amount
    from missions m
    where m.id = new.mission_id and m.reward_amount > 0;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- 미션 완료 시 페이백 자동 생성 트리거
create trigger trigger_create_payback_on_complete
after update on user_missions
for each row execute procedure create_payback_on_mission_complete();

-- ===============================================
-- 완료!
-- ===============================================
