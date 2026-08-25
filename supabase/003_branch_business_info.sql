-- ═══════════════════════════════════════════════════════════════════════════
--  003_branch_business_info.sql
--  지점별 법적 사업자 정보(팩스·사업자등록번호·대표자명) — 푸터에 지점마다
--  표시해야 하는 통신판매/사업자 고지 정보. branches 테이블에 컬럼 추가 + 4개
--  지점 값 채움까지 이 파일 하나로 끝낸다.
--
--  적용 방법: Supabase 대시보드 → SQL Editor 에 이 파일 전체를 붙여넣고 실행.
-- ═══════════════════════════════════════════════════════════════════════════

alter table branches add column if not exists fax text;
alter table branches add column if not exists business_registration_number text;
alter table branches add column if not exists representative_name text;

update branches set
  fax = '042-336-1099',
  business_registration_number = '291-92-00353',
  representative_name = '윤제필'
where slug = 'daejeon';

update branches set
  fax = '043-715-1472',
  business_registration_number = '142-93-01246',
  representative_name = '염선규'
where slug = 'cheongju';

update branches set
  fax = '02-6941-0703',
  business_registration_number = '158-94-01836',
  representative_name = '안지훈'
where slug = 'seongdong';

update branches set
  fax = '02-2261-3336',
  business_registration_number = '110-98-39342',
  representative_name = '이현호'
where slug = 'chungmuro';
