-- ═══════════════════════════════════════════════════════════════════════════
--  002_page_sections.sql
--  서브페이지 "섹션 카탈로그" 시스템 — 운영자가 코드 수정 없이
--  섹션을 추가·수정·삭제·순서변경할 수 있도록 하는 스키마.
--
--  적용 방법: Supabase 대시보드 → SQL Editor 에 이 파일 전체를 붙여넣고 실행.
--  적용 후: `node scripts/seed-page-sections.mjs` 를 1회 실행해
--           about(/about)·director(/network/director) 페이지의 현재 텍스트를
--           그대로 시딩한다.
--
--  kind 카탈로그(page_sections.data JSONB 필드 형태):
--   - text     : { "paragraphs": ["문단1", "문단2", ...] }
--   - quote    : { "quote": "인용문", "attribution": "출처/이름", "body": "보충 설명(선택)" }
--   - cards    : { "columns": 2~4, "items": [{ "key": "선택", "title": "...", "body": "..." }] }
--   - timeline : { "items": [{ "date": "2017. 06", "event": "..." }] }
--   - facts    : { "items": [{ "label": "전문분야", "value": "..." }] }
--
--  주의: 이 파일은 schema.sql에 이미 정의된 is_admin()/touch_updated_at() 함수를
--        재사용한다(중복 생성하지 않음). schema.sql이 먼저 적용되어 있어야 한다.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists site_pages (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,        -- 'about', 'director' (URL과 매핑, 라우트는 그대로 두고 이 slug로 콘텐츠만 조회)
  title            text not null,
  meta_description text,
  eyebrow          text,                         -- 상단 작은 라벨 (예: "ABOUT PHIL")
  hero_title       text,                         -- h1 텍스트(줄바꿈은 \n으로 저장 후 렌더링에서 <br/> 치환)
  hero_intro       text,                         -- 히어로 밑 한 줄 소개
  is_published     boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists page_sections (
  id          uuid primary key default gen_random_uuid(),
  page_id     uuid not null references site_pages(id) on delete cascade,
  kind        text not null check (kind in ('text','quote','cards','timeline','facts')),
  heading     text,                              -- 섹션 소제목 (예: "Overview", "Brand Story")
  data        jsonb not null default '{}'::jsonb, -- kind별 필드 (위 카탈로그 참조)
  sort_order  int not null default 0,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists page_sections_page_id_idx on page_sections(page_id, sort_order);

alter table site_pages    enable row level security;
alter table page_sections enable row level security;
create policy "public read published pages" on site_pages for select using (is_published);
create policy "admin all pages" on site_pages for all using (is_admin()) with check (is_admin());
create policy "public read visible sections" on page_sections for select using (
  is_visible and exists (select 1 from site_pages p where p.id = page_id and p.is_published)
);
create policy "admin all sections" on page_sections for all using (is_admin()) with check (is_admin());

create trigger site_pages_touch    before update on site_pages    for each row execute function touch_updated_at();
create trigger page_sections_touch before update on page_sections for each row execute function touch_updated_at();
