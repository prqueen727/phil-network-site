-- ═══════════════════════════════════════════════════════════════════════════
--  04 Supabase 참고구현 — schema.sql
--  GEO 홈페이지 관리자/콘텐츠 스키마 (Payload 04 참고구현의 Supabase 이식본)
-- ═══════════════════════════════════════════════════════════════════════════
--
--  적용 방법: Supabase 대시보드 → SQL Editor 에 붙여넣고 실행.
--  검증: 실행 후 `\d blogs` 로 컬럼이 04 Payload Blogs.ts 필드와 일치하는지 대조.
--
--  설계 근거 (3-Source 교차검증 완료 — 02-design 문서 §7):
--   - 읽기전용 중첩 덩어리(tldr/faqs/sections/quote_ready) = JSONB
--     (Supabase 공식문서: 구조 일정하고 join 불필요한 배열은 JSONB 허용)
--   - 참조·검색·무결성 필요(author/category/tags/related) = FK 테이블
--   - RLS: public read(published만) + service_role write (서버 전용)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 0. 확장 ────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";  -- gen_random_uuid()

-- ── 1. 관리자 인증 (가벼운 방식 — 관리자 1명 + 방문자 로그인 없음) ──────────
-- 결정(2026-07-22): 관리자 1명이므로 role 4종 계층은 오버스펙 → is_admin 단일 판별.
-- Supabase Auth 이메일 로그인은 유지(세션·비번재설정·보안이 공짜). role만 단순화.
-- 나중에 회원(유형②)·팀(에디터 추가) 필요 시 profiles에 role 컬럼을 확장하면 됨.
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  is_admin   boolean not null default false,   -- 관리자 계정만 true (수동 1회 설정)
  created_at timestamptz not null default now()
);

-- RLS에서 재사용할 관리자 판별 함수 (단일 플래그)
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and is_admin = true);
$$;

-- 관리자 계정 지정 (구축 시 1회): Auth에서 이메일 가입 후 그 user의 id로 아래 실행
--   insert into profiles (id, is_admin) values ('<관리자-uuid>', true)
--   on conflict (id) do update set is_admin = true;

-- ── 2. 보조 테이블 (FK 대상) ────────────────────────────────────────────────
create table if not exists staff (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique,                 -- /doctors/[slug]
  job_title   text,
  bio         text,
  specialty   text,
  alumni_of   text,
  profile_url text,
  photo_url   text,                         -- R2 공개 URL
  career      jsonb default '[]'::jsonb,    -- [{line}]
  same_as     jsonb default '[]'::jsonb,    -- [{url}] E-E-A-T 외부 신원
  created_at  timestamptz not null default now()
);

create table if not exists categories (
  id        uuid primary key default gen_random_uuid(),
  title     text not null,
  slug      text unique,
  parent_id uuid references categories(id) on delete set null
);

create table if not exists tags (
  id   uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique
);

create table if not exists media (
  id           uuid primary key default gen_random_uuid(),
  -- ★alt는 이미지 SEO·접근성 필수. 업로드 UI에서 필수값으로 강제하고,
  --   saveBlogWithJsonLd()가 대표 이미지 지정 시 공백이면 저장을 거부한다.
  alt          text,
  storage_path text,                        -- R2 키 또는 공개 URL
  -- OG image / schema.org ImageObject의 width·height 출력용.
  -- Google Article 가이드: 최소 50K픽셀(w×h), 16:9·4:3·1:1 권장 → 업로드 시 실측 저장.
  width        int,
  height       int,
  created_at   timestamptz not null default now()
);

-- ── 3. 콘텐츠: blogs (04 Blogs.ts 필드 1:1 매핑) ───────────────────────────
create table if not exists blogs (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text unique not null,
  excerpt         text,                     -- meta description / AI 인용 요약
  -- GEO 구조화 필드 (05 geo 모드 GeoArticle 매핑)
  lede            text,
  key_answer      text,                     -- BLUF 핵심답변
  content         jsonb,                    -- 수동 richText(slate) 보존용
  tldr            jsonb default '[]'::jsonb,       -- [{line}]
  quote_ready     jsonb default '[]'::jsonb,       -- [{line}]
  sections_html   jsonb default '[]'::jsonb,       -- [{heading, html}] 자동발행 본문
  faqs            jsonb default '[]'::jsonb,       -- [{question, answer}] FAQPage 추출용
  structured_data jsonb,                    -- ★자동 조립 JSON-LD (저장함수가 채움)
  -- 관계 (FK)
  featured_image_id uuid references media(id) on delete set null,
  author_id       uuid not null references staff(id),        -- E-E-A-T 필수
  category_id     uuid references categories(id) on delete set null,
  -- SEO
  seo_title       text,
  seo_description text,
  -- 발행 상태
  status          text not null default 'draft' check (status in ('draft','published','scheduled')),
  published_at    timestamptz,
  view_count      int not null default 0,
  trending_score  int not null default 0,
  -- 자동발행 중복방지 (blogId:logNo)
  source_url      text,
  source_log_no   text unique,
  -- 리스크 가드 (01 §9 클로킹/작성자 불일치 방지)
  schema_content_match  boolean default false,
  author_identity_match boolean default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists blogs_status_idx on blogs(status);
create index if not exists blogs_source_log_no_idx on blogs(source_log_no);

-- hasMany 관계 = 조인 테이블
create table if not exists blog_tags (
  blog_id uuid references blogs(id) on delete cascade,
  tag_id  uuid references tags(id)  on delete cascade,
  primary key (blog_id, tag_id)
);
create table if not exists blog_related (
  blog_id    uuid references blogs(id) on delete cascade,
  related_id uuid references blogs(id) on delete cascade,
  primary key (blog_id, related_id)
);

-- ── 4. 콘텐츠: keyword_pages (04 KeywordPages 매핑 — group/array 중첩 → JSONB) ─
create table if not exists keyword_pages (
  id               uuid primary key default gen_random_uuid(),
  target_keyword   text not null,           -- "강남 피부과"
  slug             text unique not null,    -- /k/slug
  title            text not null,
  subtitle         text,
  meta_description text,
  intro            jsonb,                    -- {em, heading, body}
  audience         jsonb,                    -- {heading, items:[{line}]}
  criteria         jsonb,                    -- {heading, items:[{title, body}]}
  hub              jsonb,                    -- {heading, items:[{href, label}]}
  faqs             jsonb default '[]'::jsonb,
  structured_data  jsonb,
  author_id        uuid references staff(id),
  hero_image_id    uuid references media(id) on delete set null,
  footer_exposed   boolean not null default true,
  honesty_check    boolean default false,
  status           text not null default 'draft' check (status in ('draft','published')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── 5. glossary / inquiries ────────────────────────────────────────────────
create table if not exists glossary (
  id           uuid primary key default gen_random_uuid(),
  term         text unique not null,
  slug         text unique,
  one_liner    text,
  description  text,
  is_published boolean not null default false
);

create table if not exists inquiries (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  contact      text not null,               -- 개인정보 — read는 관리자만
  service_type text,
  message      text not null,
  status       text not null default 'new' check (status in ('new','in_progress','done')),
  memo         text,                        -- 내부 응대 메모
  user_id      uuid references auth.users(id) on delete set null,  -- 유형②③ 회원 연결(nullable)
  created_at   timestamptz not null default now()
);

-- ── 6. 설정 (Payload 글로벌 3개 → 단일행 테이블) ───────────────────────────
create table if not exists settings_business (
  id               boolean primary key default true check (id),  -- 단일행 강제
  name             text,
  business_type    text default 'LocalBusiness',
  telephone        text,
  url              text,
  logo_url         text,
  street_address   text,
  address_locality text,
  address_region   text,
  postal_code      text,
  address_country  text default 'KR',
  latitude         numeric,
  longitude        numeric,
  opening_hours    jsonb default '[]'::jsonb,   -- ["Mo-Fr 08:30-20:00", ...]
  same_as          jsonb default '[]'::jsonb
);

create table if not exists settings_geo (
  id                    boolean primary key default true check (id),
  allow_ai_crawlers     boolean not null default true,
  block_tracking_params boolean not null default true,
  extra_robots_rules    text
);

create table if not exists settings_autopublish (
  id                  boolean primary key default true check (id),
  enabled             boolean not null default false,
  mode                text not null default 'draft' check (mode in ('auto','draft')),
  daily_limit         int not null default 5,
  naver_blog_ids      jsonb default '[]'::jsonb,   -- [{blogId}]
  default_author_id   uuid references staff(id),
  default_category_id uuid references categories(id),
  -- mode='auto'(즉시 발행)일 때 쓸 기본 대표 이미지(OG image fallback).
  -- 크롤링은 이미지를 제외([05 부록 D-7])하므로 자동 발행 글엔 대표 이미지가 없다.
  -- 이 값이 없으면 saveBlogWithJsonLd()가 발행을 거부한다 → mode='draft' 운영을 권장.
  default_featured_image_id uuid references media(id) on delete set null,
  last_run_at         timestamptz,
  last_run_log        text
);

-- ═══════════════════════════════════════════════════════════════════════════
--  7. RLS 정책 — public read(published) + service_role write
--     (Payload access 함수 1:1 번역. service_role은 RLS 우회하므로 write 정책 불필요)
-- ═══════════════════════════════════════════════════════════════════════════

-- 공개 읽기 콘텐츠: 발행된 것만 anon이 읽음
alter table blogs         enable row level security;
alter table keyword_pages enable row level security;
create policy "public read published blogs" on blogs
  for select using (status = 'published');
create policy "admin all blogs" on blogs
  for all using (is_admin()) with check (is_admin());
create policy "public read published kwpages" on keyword_pages
  for select using (status = 'published');
create policy "admin all kwpages" on keyword_pages
  for all using (is_admin()) with check (is_admin());

-- 공개 읽기(항상): staff/categories/tags/media/glossary/settings_business/settings_geo
--   → 프론트가 JSON-LD·목록·robots 조립에 필요
alter table staff             enable row level security;
alter table categories        enable row level security;
alter table tags              enable row level security;
alter table media             enable row level security;
alter table glossary          enable row level security;
alter table settings_business enable row level security;
alter table settings_geo      enable row level security;
create policy "public read staff"       on staff       for select using (true);
create policy "public read categories"  on categories  for select using (true);
create policy "public read tags"        on tags        for select using (true);
create policy "public read media"       on media       for select using (true);
create policy "public read glossary"    on glossary    for select using (is_published);
create policy "public read biz"         on settings_business for select using (true);
create policy "public read geo"         on settings_geo      for select using (true);
-- 위 테이블들의 write는 관리자만
create policy "admin write staff"      on staff       for all using (is_admin()) with check (is_admin());
create policy "admin write categories" on categories  for all using (is_admin()) with check (is_admin());
create policy "admin write tags"       on tags        for all using (is_admin()) with check (is_admin());
create policy "admin write media"      on media       for all using (is_admin()) with check (is_admin());
create policy "admin write glossary"   on glossary    for all using (is_admin()) with check (is_admin());
create policy "admin write biz"        on settings_business for all using (is_admin()) with check (is_admin());
create policy "admin write geo"        on settings_geo      for all using (is_admin()) with check (is_admin());

-- 문의: 익명 insert 허용, read/update는 관리자만 (연락처 개인정보 보호)
alter table inquiries enable row level security;
create policy "anon insert inquiry" on inquiries for insert with check (true);
create policy "admin read inquiry"  on inquiries for select using (is_admin());
create policy "admin update inquiry" on inquiries for update using (is_admin());
create policy "admin delete inquiry" on inquiries for delete using (is_admin());

-- 자동발행 설정: 관리자만 (service_role 스케줄러는 RLS 우회하여 접근)
alter table settings_autopublish enable row level security;
create policy "admin autopublish" on settings_autopublish
  for all using (is_admin()) with check (is_admin());

-- profiles: 본인 읽기 + 관리자 전체
alter table profiles enable row level security;
create policy "self read profile"  on profiles for select using (id = auth.uid() or is_admin());
create policy "admin write profile" on profiles for all using (is_admin()) with check (is_admin());

-- ── 8. updated_at 자동 갱신 트리거 ─────────────────────────────────────────
create or replace function touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create trigger blogs_touch          before update on blogs          for each row execute function touch_updated_at();
create trigger keyword_pages_touch  before update on keyword_pages  for each row execute function touch_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
--  ⚠️ 미검증 (R3): 이 스키마는 참고구현이다. 실제 Supabase 프로젝트에 적용 후
--     `\d blogs` 로 컬럼 대조 + 더미 insert 1회로 RLS 동작을 반드시 실측할 것.
-- ═══════════════════════════════════════════════════════════════════════════
