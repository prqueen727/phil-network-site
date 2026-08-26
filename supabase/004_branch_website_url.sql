-- ═══════════════════════════════════════════════════════════════════════════
--  004_branch_website_url.sql
--  지점별 독립 홈페이지 URL — 지점 카드/상세 페이지의 "홈페이지" 버튼과
--  상단 메뉴 "지점 바로가기" 드롭다운에서 사용. 이 파일 하나로 컬럼 추가 +
--  4개 지점 값 채움까지 끝낸다.
--
--  적용 방법: Supabase 대시보드 → SQL Editor 에 이 파일 전체를 붙여넣고 실행.
-- ═══════════════════════════════════════════════════════════════════════════

alter table branches add column if not exists website_url text;

update branches set website_url = 'https://www.phokm.com/' where slug = 'daejeon';
update branches set website_url = 'https://cheongju-philhospital.com/' where slug = 'cheongju';
update branches set website_url = 'https://www.sdphilhanbang.com/' where slug = 'seongdong';
update branches set website_url = 'https://www.chungmuro-philhospital.com/' where slug = 'chungmuro';
