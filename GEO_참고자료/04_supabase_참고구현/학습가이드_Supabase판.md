# 04 Supabase 참고구현 — 학습가이드

> **용도:** 이 폴더는 GEO 홈페이지의 **관리자·콘텐츠 백엔드를 Supabase로 구현**한 참고 코드다.
> 구버전 `04_payload_참고구현`(Payload CMS)을 대체한다. AI 빌더는 새 홈페이지를 지을 때 이 코드를 직접 참조한다.
> **스택 결정 근거:** [06 인증·저장소 세팅가이드](../06_인증_저장소_세팅가이드.md) — 세 유형 모두 Supabase 단일.

---

## 0. 이 폴더가 하는 일 (한 장 요약)

```
네이버 블로그 URL
   │  (05 참고구현: fetchPostList → scrapePost → rewriteGeoArticle)
   ▼
GeoArticle (구조화 초안)
   │
   ▼  ★ saveBlogWithJsonLd() ← 저장 단일 진입점
   │     - Supabase에서 biz·staff 읽기
   │     - buildBlogJsonLd()로 JSON-LD 자동 조립  ← Payload 훅 대체
   │     - blogs 테이블에 insert
   ▼
Supabase Postgres (blogs.structured_data 에 JSON-LD 포함)
   │
   ▼  프론트(Vercel)가 anon 키로 published만 읽어 SSR
   ▼
AI 봇이 <head>의 JSON-LD 읽음 → GEO 인용
```

## 1. 파일 구성

| 파일 | 역할 | Payload 대응 |
|------|------|-------------|
| [schema.sql](schema.sql) | 테이블 9개 + settings 3개 + **RLS 정책** | 컬렉션 정의 = 스키마 |
| [lib/supabase.ts](lib/supabase.ts) | anon(읽기)·service_role(쓰기) 클라이언트 | — |
| [lib/buildJsonLd.ts](lib/buildJsonLd.ts) | JSON-LD @graph 조립 **순수함수** | buildAuthor + generateBlogJsonLd |
| [lib/saveBlogWithJsonLd.ts](lib/saveBlogWithJsonLd.ts) | ★**저장 단일 진입점** (훅 대체) | beforeChange 훅 |
| [lib/scheduler.ts](lib/scheduler.ts) | 네이버 자동발행 (Railway 상주) | autoPublish.ts |

## 2. Payload와 무엇이 다른가 (핵심 3가지)

### ① "저장 시 자동 훅" → "저장 단일 함수 강제"
Payload는 글 저장 시 프레임워크가 `beforeChange` 훅을 자동 발동해 JSON-LD를 만들었다.
Supabase엔 그런 자동 훅이 없으므로, **저장하는 모든 경로가 `saveBlogWithJsonLd()` 하나만 호출**하게 강제한다.
→ 이 함수 안에서 JSON-LD가 항상 조립되므로 **누락이 원천 불가능**하다. (Design R1)

> ⚠️ **규칙:** blogs에 직접 `insert`하지 마라. 반드시 `saveBlogWithJsonLd()`를 거쳐라.
> 안 그러면 그 글은 `structured_data`가 비어 GEO가 깨진다.

### ② "스키마=코드" → "schema.sql"
Payload는 컬렉션 TS 정의가 곧 DB였다. Supabase는 [schema.sql](schema.sql)을 SQL Editor에 한 번 실행한다.

### ③ "access 함수" → "RLS 정책"
Payload `access: { read:()=>true, create:user }` 를 RLS로 번역:
- `public read published` — 프론트(anon)는 발행글만 읽음
- `service_role` — 스케줄러·서버가 RLS 우회하여 write
- `anon insert inquiry` — 문의는 익명 접수, 읽기는 관리자만(개인정보)

## 3. 관리자 인증 (가벼운 방식 — 2026-07-22 확정)

관리자 **1명 + 방문자 로그인 없음**이므로 role 계층은 오버스펙 → **`is_admin` 단일 플래그**.
- Supabase Auth 이메일 로그인은 유지 (세션·비번재설정·보안이 공짜)
- 구축 시 1회: 관리자 이메일 가입 → `profiles`에 `is_admin=true` 지정 (schema.sql 주석 참조)
- 관리자 화면의 write는 로그인 세션 또는 서버의 service_role로 처리
- 확장(회원·팀) 필요 시 `profiles`에 role 컬럼 추가 → 갈아엎지 않고 성장

## 4. 구축 순서 (AI 빌더용)

1. **CP-1**: Supabase 프로젝트 생성 → URL·anon·service_role 키 확보 (06 §3)
2. **schema.sql 실행** → SQL Editor에 붙여넣기 → 테이블·RLS 생성
   - 검증: `select * from blogs limit 1` (빈 결과 정상), `\d blogs`로 컬럼 확인
3. **관리자 계정**: Auth에서 이메일 가입 → profiles에 is_admin=true 1회 설정
4. **환경변수**: `.env`에 SUPABASE_URL/ANON/SERVICE_ROLE + GEMINI_API_KEY (06 §8)
5. **저장 검증 (G1·G2)**: 네이버 URL 1개 → saveBlogWithJsonLd → blogs에 1건 + structured_data non-null 확인
6. **스케줄러 (G3)**: scheduler.ts를 Railway 상주 배포 → settings_autopublish.enabled=true → 1 tick 로그 관찰

## 5. ⚠️ 미검증 (반드시 실측할 것)

이 코드는 **참고구현**이다. 실제 홈페이지 구축 시:
- schema.sql을 진짜 Supabase에 적용해 `\d`로 컬럼 대조
- 더미 insert 1회로 **RLS가 실제로 막는지/통과시키는지** 관찰 (anon으로 draft 안 보이는지 등)
- saveBlogWithJsonLd를 실제 실행해 structured_data의 @graph 3종을 눈으로 확인
- `naver-core`(05의 크롤링 함수)는 이 폴더에 미포함 — 05 참고구현에서 가져와 배선

> "코드가 있으니 된다"가 아니라, **실행해서 관찰**해야 검증이다.
