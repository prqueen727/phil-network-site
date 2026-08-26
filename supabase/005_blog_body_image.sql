-- ═══════════════════════════════════════════════════════════════════════════
--  005_blog_body_image.sql
--  칼럼 본문에 넣을 이미지 1장(대표 이미지와 별개) — 목록/카드 썸네일은 그대로
--  featured_image_id를 쓰고, 이건 글 본문 안에 노출되는 용도.
--
--  적용 방법: Supabase 대시보드 → SQL Editor 에 이 파일 전체를 붙여넣고 실행.
-- ═══════════════════════════════════════════════════════════════════════════

alter table blogs add column if not exists body_image_id uuid references media(id) on delete set null;
