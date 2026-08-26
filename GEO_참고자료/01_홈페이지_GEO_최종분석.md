# 홈페이지 GEO 최종 분석 (샘플 치환본)

> **용도:** GEO(생성형 검색 최적화) 특화 홈페이지를 만들 때 AI에게 주는 방법론 문서.
> **원본:** 실무 개발자 대화·실제 사이트 실측(경쟁사 6곳 + 우수사례 1곳)·구현 기술 보고서 2건을 통합한 최종 분석지.
> **익명화:** 업장 상호·인명·주소·전화·도메인은 전부 샘플 치환됨(README의 치환표 참조). 방법론·수치·구조는 원본 그대로.

---

## 1. 핵심 결론 (한 문장)

> **"AI 봇은 글보다 코드(구조)를 먼저 읽는다. 따라서 GEO의 1순위는 잘 쓴 블로그 글이 아니라, AI가 먹기 쉽게 구조화된 코드 — robots.txt · llms.txt · JSON-LD · 푸터 키워드 페이지 · FAQ형 콘텐츠 — 를 깔아두는 것이다. 그 위에 GEO 친화 블로그를 자동 발행하면, 백링크·트래픽 없이도 순위가 오르고 ChatGPT·구글 AI 모드가 우리 사이트를 추천하기 시작한다."**

- 실무자들(실무 개발자 A, SEO 실무자들)의 일치된 증언: "GEO 잡으려면 글쓰기보다 코드부터 잡는 게 제일 빠르다."
- 단, "코드 한 방으로 어디서나 1등"은 과장. 빈틈이 실제로 크게 열린 곳은 **브랜드 파워 없는 동네 업장의 지역 키워드 시장**이다.

## 2. GEO란 — AI 검색은 "사이트 전체의 문맥"을 읽는다

ChatGPT·Perplexity·Google AI Overview 같은 AI 검색은 개별 페이지의 키워드를 넘어, 사이트 전체를 4가지로 평가한다:

1. 이 사이트가 어떤 문제를 **반복해서 깊이 있게** 다루는가 (주제 집중도)
2. 어떤 **전문 어휘**를 지속적으로 사용하는가 (전문성 신호)
3. 페이지들이 어떤 **논리적 흐름으로 연결**되어 있는가 (구조·내부링크)
4. 제공하는 정보의 **방향성이 일관적**인가 (일관성)

→ GEO는 사이트 전체를 하나의 일관된 전문 콘텐츠 덩어리로 구성하는 작업. "AI가 추천해도 욕 안 먹을 만한 사이트의 구색을 갖추는 것."

## 3. 핵심 인사이트: "봇은 코드부터 읽는다"의 진짜 의미

사람은 디자인·이미지·글을 눈으로 보지만, 봇은 화면이 아니라 **HTML 소스 코드와 구조화 데이터**를 먼저 읽는다. 여기서 "코드"는 프로그래밍 실력이 아니라 **기계가 읽는 정보 계층**(robots.txt, meta 태그, 제목 위계, JSON-LD)을 뜻한다.

> "GEO는 (봇이) 다 읽기 귀찮아서인지 코드부터 읽음. 그래서 GEO 잡기 위해서는 코드부터 구성 짜는 게 제일 빠름. 다른 웹사이트는 코드부터 안 잡음." — 실무 개발자 A

의미 3가지:
1. 시중의 "GEO 글쓰기"보다 **코드 레벨 구조화가 효과가 훨씬 강하다.**
2. 경쟁 사이트 대부분이 코드 구조화를 안 해두어 **적은 노력으로 선점 가능**하다.
3. 단, 외부 업종 플랫폼(의료라면 예약/리뷰 플랫폼 등) 등록이 1순위라는 점도 병행한다.

비유: 사람에게는 잘 꾸민 인테리어를 보여주는 것, 봇에게는 정리된 사업자등록증·메뉴판·주소록을 손에 쥐여주는 것.

## 4. GEO 실전 5단계 체크리스트 (실제로 순위를 올린 표준 절차)

| 단계 | 작업 | 핵심 포인트 |
|:---:|------|------------|
| 1 | **GBP(Google Business Profile) 등록** | 검색·지도 노출 + 신규 고객 전환의 기반 |
| 2 | **SEO/GEO 최적화 홈페이지 제작** | 코드 구조부터 AI 친화적으로 (5장) |
| 3 | **키워드 전용 페이지를 푸터에 세팅** | 키워드별 전용 페이지 (5.4) |
| 4 | **서치콘솔 등록** | 구글 인덱싱 전제. 누락 시 콘텐츠 효과 발현 안 됨 |
| 5 | **GEO 친화 블로그 자동 발행** | 외부 원글 → 변환 → 자동 발행 (6장) |

## 5. 기술 요소별 심화

### 5.1 robots.txt — AI 크롤러 9종을 명시적으로 허용

기준 사례(샘플의원, F시)의 robots.txt. **AI가 우리 사이트를 읽게 만드는 출발점.**

```txt
# robots.txt (샘플의원 예시)
User-agent: *
Allow: /
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php

# --- AI crawlers explicitly allowed (9종) ---
User-agent: GPTBot            # OpenAI (ChatGPT 학습/인덱스)
User-agent: OAI-SearchBot     # OpenAI (검색)
User-agent: ChatGPT-User      # OpenAI (브라우징)
User-agent: ClaudeBot         # Anthropic
User-agent: anthropic-ai      # Anthropic (legacy)
User-agent: Google-Extended   # Google (Gemini / Vertex AI)
User-agent: PerplexityBot     # Perplexity
User-agent: Applebot-Extended # Apple Intelligence
User-agent: CCBot             # Common Crawl (다수 LLM 데이터 소스)
Allow: /                      # (각 봇마다)

Sitemap: https://sample-clinic.example.com/sitemap_index.xml
# LLM guidance file: https://sample-clinic.example.com/llms.txt
```

- robots.txt = **"들어와도 되는가"(출입 허가)**. CCBot은 다수 LLM 학습 데이터 소스라 특히 중요.
- sitemap 파일명은 항상 `sitemap.xml`이 아닐 수 있음(워드프레스는 `sitemap_index.xml`).
- **`Sitemap:` 줄에 RSS도 함께 적는다.** sitemap은 "어떤 페이지가 있나", RSS는 "새 글이 올라왔나"로
  **역할이 다르다.** 네이버 서치어드바이저는 RSS 제출을 **독립 단계**로 두고 있어, RSS가 없으면
  그 단계가 영구 실패한다(상태값이 `가져올 수 없음`에서 안 넘어감). 트위터·핀터레스트 같은 채널도
  RSS만 연결하면 새 글을 자동으로 가져간다.

  ```txt
  Sitemap: https://sample-clinic.example.com/sitemap.xml
  Sitemap: https://sample-clinic.example.com/rss
  ```

- ⚠️ **sitemap에 블로그 글을 빠뜨리지 마라.** 시술·소개 페이지만 넣고 `/blog/[slug]`를 빠뜨리면
  자동발행으로 쌓은 글이 통째로 색인 대상 밖에 놓인다 (실측 사고 — build.md STEP 9-A-2).

### 5.2 llms.txt — LLM 전용 사이트 안내 파일

llms.txt = **"들어왔으면 이걸 봐라"(콘텐츠 안내)**. 사이트 핵심 내용·중요 페이지 목록을 마크다운으로 정리해 AI가 요점을 떠먹기 좋게 만든 파일. 2024년 하반기 등장한 신규 규약(llmstxt.org)으로 아직 강제 표준은 아니지만, 일찍 챙기는 사이트가 선제 도입 중.

```markdown
# 샘플의원 (Sample Clinic)
> 전문 진료 기관. ○○ 전문. F시 △△구 샘플로 123. 대표번호 000-0000-0000.

## 진료과목
- [전문 진료 A](https://sample-clinic.example.com/service-a): 안내
- [전문 진료 B](https://sample-clinic.example.com/service-b): 안내

## 게시판
- [치료사례](https://sample-clinic.example.com/case): 실제 사례 모음
```

- 형식: 맨 위 `# 사이트명`(H1) → `>` 인용문 한 줄 요약 → `## 섹션`별 `[페이지 제목](URL): 설명` 목록.
- 확인법: 주소창에 `도메인/llms.txt` → 텍스트 보이면 설정됨, 오류면 미설정(=GEO 미적용 신호).

### 5.3 JSON-LD 구조화 데이터 (schema.org) — 지역 기반 타겟팅

각 글·페이지에 JSON-LD를 삽입해 AI가 **누가/어디서/무엇을** 명확히 이해하게 한다.

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "A시 요양병원 인지재활 프로그램 - 색칠공부·블록쌓기·퍼즐...",
  "description": "A시 샘플요양병원의 인지재활 담당 사회복지사가 ...",
  "author": {
    "@type": "Person", "name": "김샘플", "jobTitle": "사회복지사",
    "worksFor": {
      "@type": "MedicalOrganization", "name": "샘플요양병원",
      "address": { "@type": "PostalAddress",
        "addressLocality": "A시 남구", "addressCountry": "KR" }
    }
  },
  "publisher": { "@type": "MedicalOrganization", "name": "샘플요양병원",
    "logo": { "@type": "ImageObject", "url": "https://example.com/logo.png" } },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://example.com/cognitive-rehab" }
}
```

- `MedicalOrganization` + `PostalAddress`(지역, KR)로 **지역 타겟팅을 코드에 명시** → "구글에서 'A시 요양병원' 검색 시 노출"의 직접 원인.
- `author`에 실명·직책·소속 명시 → **E-E-A-T**(전문성·신뢰) 신호.
- `headline`/`description`이 그대로 AI 응답에 인용되도록 핵심 키워드를 자연스럽게 포함.

### 5.4 푸터 키워드 페이지 — "숨기되, 봇은 읽게"

사람에게는 거슬리지만 봇에게는 신호가 되는 **키워드 전용 페이지**를 푸터의 작은 글씨 링크로 배치.

> "푸터에 넣으면 (사람은) 아무도 안 눌러봐. 그래도 봇은 읽음. 보통 GEO는 푸터에 세팅함." — 실무 개발자 A

- 샘플한의원 푸터: "샘플한의원 · B시 한의원 · C동 한의원" 작은 링크.
- 샘플요양병원: "A시 요양병원" 키워드용 페이지 1개 + 전환가치 높은 세부 키워드("임종기")용 페이지 1개를 푸터에 삽입.
- **잡고 싶은 키워드마다 전용 페이지 1개씩** 만들어 푸터에 연결.
- 의사결정 논리: 키워드 페이지를 메인 동선에 노출하면 방문자 경험이 어색해지므로, 푸터 작은 링크로 내려 **봇 크롤링 경로만 확보**. 단 "위치만 숨기는 것이지 허위 정보를 숨기는 게 아니다"(9장 클로킹 주의)가 전제.

### 5.5 한글 도메인 = Punycode (xn-- 도메인)

DNS는 영문자·숫자·하이픈만 인식하므로 한글 도메인은 자동으로 퓨니코드(`xn--` 접두어)로 변환된다(IDN, RFC 3492). 1:1 결정적 변환.

```
입력: 샘플한의원.com → DNS 조회: xn--…(자동 변환).com → 화면엔 다시 한글
```

- **GEO 관점:** 검색엔진·AI 봇·서치콘솔·sitemap·JSON-LD에는 `xn--` 형태로 인식된다. **서치콘솔 등록·구조화 데이터 작성 시 퓨니코드 주소를 함께 고려**해야 한다.
- 도메인 자체보다 콘텐츠·구조화·robots/llms 세팅이 GEO에 훨씬 결정적.

### 5.6 콘텐츠를 "AI가 먹기 쉽게" 새로 작성 — FAQ·선택기준·대상

샘플요양병원에서 **가장 효과가 컸던** 페이지는 AI가 소화하기 쉽게 통째로 새로 작성한 페이지.

- 페이지 제목(H1): **"A시 요양병원, 어떻게 선택해야 할까요?"** — 인텐트 기반 질문형.
- 구성: **입원 대상**(장기입원/회복기/재활/보호자 돌봄 어려움) → **선택 기준**(체크리스트) → **특징** → **FAQ** → **CTA**(상담/오시는 길).
- 질문-답변 위계가 답변엔진(**AEO**)에 그대로 인용되는 핵심 포맷.

### 5.7 작성자 E-E-A-T — JSON-LD `author.sameAs`로 "실존 전문가" 신원 연결

GEO의 핵심은 "이 글을 누가 썼는가"의 신뢰도(E-E-A-T). 구글·AI 검색은 글의 author를 `Person`으로 인식한 뒤, **동명이인이 아닌 실존 전문가인지 외부 프로필로 교차검증**한다. 결정적 신호가 `author.sameAs` — 작성자 본인이 운영하는 LinkedIn·논문·유튜브 등 권위 프로필 URL 목록.

**가장 흔한 오해 (주의):** 글 화면 하단의 LinkedIn/페이스북 "공유(Share) 버튼"은 방문자가 글을 자기 SNS에 퍼가는 위젯일 뿐, **봇은 이를 신뢰 신호로 쓰지 않는다.** 신뢰 신호는 오직 `<head>` JSON-LD의 `author.sameAs`다.
- 공유 버튼 = "이 명함을 당신 지갑에 넣으세요"(방문자용)
- `author.sameAs` = "이 명함 주인이 진짜 이 사람입니다"(신원 증명)

**권장 구현 — 각 글의 author 객체에:**
1. `sameAs` (LinkedIn 우선, **본인 운영 프로필만**)
2. `url` (블로그 홈이 아닌 **구성원 개인 페이지**)
3. `alumniOf` (학력 엔티티화)
4. `worksFor` (조직 연결)
- 조직(Organization)의 sameAs와 **별개로** 작성자 개인(Person)의 sameAs를 반드시 둔다.

**리스크 가드(작성자 동일성):** 화면 표기 작성자명과 JSON-LD `author.name`이 **반드시 일치**해야 한다. 불일치 시 AI가 작성자를 오인식한다(8.7 실측: 화면="김철수" vs JSON-LD="이영희" 불일치 발견). 발행 검수에 "화면↔JSON-LD 작성자 일치" 체크를 포함한다.

**근거(3-Source 교차검증):**
- E-E-A-T & JSON-LD 가이드(esseeoo.com) — author Person을 sameAs로 LinkedIn 연결 = 엔티티 신뢰 신호
- Weekend Growth(weekendgrowth.com/sameas-schema) — sameAs는 구글의 동명이인 구별(disambiguation) 수단
- Ranking Generals — 2025 업데이트에서 엔티티 링크가 가시성 약 15% 상승, AI Mode가 인용 신뢰 판단에 schema 활용

## 6. GEO 친화 블로그 자동 발행 파이프라인

```
사람이 외부 블로그(네이버 등)에 원글 작성
        ↓ (자동 수집)
AI가 글을 긁어와 SEO·GEO용으로 각색 (LLM 변환)
        ↓
Title / Short Description / Structured Data(JSON-LD) / SEO 메타 생성
        ↓ (자동 발행)
홈페이지 블로그에 게시 → 푸터 키워드 페이지·JSON-LD와 연결
```

- 변환 프롬프트 요구 출력: Title / Short Description / Structured Data(JSON-LD) / SEO(Title·Description·Meta Image) / 본문.
- 사전 확인 질문으로 **업종·타겟(B2C)·언어(한국어)를 고정 파라미터**로.
- 핵심: **한 편의 글이 발행될 때 본문만이 아니라 메타·구조화 데이터까지 한 세트로 생성**된다.

## 7. 키워드 전략 — "지역 + 돈 되는 키워드"

- **지역 대형 키워드는 버린다:** "멍청하게 'A시 요양병원' 같은 대형 키워드만 잡을 필요 없다. 지역 + 돈 되는 세부 키워드 조합이면 충분."
- **업장마다 돈 되는 키워드가 따로 있다:** 예) 요양병원의 "임종기" 등 전환가치 높은 세부 키워드를 푸터 전용 페이지로 공략.
- **키워드는 교체 가능한 변수:** 한 번 구축한 구조(JSON-LD·푸터·FAQ)는 키워드만 바꿔 다른 업장에 재사용할 수 있는 **템플릿**이다.

## 8. 검증된 성과 (백링크·트래픽 없이)

| 사이트 | 키워드 | 변화 | 비고 |
|--------|--------|------|------|
| 샘플한의원 (B시) | "B시 한의원" | 구글 9페이지 → 5페이지 → **1페이지** | 백링크·트래픽 0, 글 자동발행만 |
| 샘플한의원 (C동) | "C동 한의원" | 구글/지도 **1등** | 코드 구조화로 선점 |
| 샘플요양병원 (A시) | "A시 요양병원" | **ChatGPT 추천 1순위 + 구글 AI 모드 노출** | AI 친화 페이지 신규 작성이 결정타 |

공통 동력: **코드 구조화(robots/JSON-LD/푸터/FAQ) + GBP + 서치콘솔 + 자동 발행 블로그.** 백링크·외부 트래픽은 거의 기여하지 않았다.

### 8.1 구현 타임라인 (샘플요양병원 실증) — 2개월 만에 SEO → GEO 완성

| 시점 | 단계 | 핵심 작업 | 결과 |
|------|------|-----------|------|
| 1차 | 기술적 SEO 인프라 | 재사용 SEO 컴포넌트(`lib/seo.ts`), 메타 태그 일원화, sitemap·robots 정비, 지역 랜딩페이지 신설 | SEO Score 8.2/10, sitemap 4 → 24+ URL |
| 2차 (2개월 후) | GEO 구조화 데이터 전면 적용 | 전 페이지 JSON-LD 주입, FAQ 대량 확장, GeoCoordinates·BreadcrumbList 추가, **SSR Head 주입** | JSON-LD 1 → 19 페이지, FAQ 4 → 35+ |

1차 신규 파일: `lib/seo.ts`(설정 단일 소스) · `components/Common/SEO.tsx`(메타 생성기) · `StructuredData.tsx`(JSON-LD 스키마) · 지역 랜딩 페이지 · AI 어시스턴트용 프로젝트 가이드(CLAUDE.md) · 감사 리포트. — "코드부터 깔아둔다"의 실제 디렉터리 구조.

### 8.2 실제 적용된 구조화 데이터 6종

| 스키마 | 역할 | GEO 효과 |
|--------|------|----------|
| `MedicalBusiness` | 업장 엔티티 식별자(전역) | 지역 기반 엔티티 매핑 |
| `Hospital` | 로컬팩·지도 연동 상세 + `GeoCoordinates`(위/경도) | 지도·로컬 검색 |
| `FAQPage` | Q&A 쌍 구조 제공 | **AEO(답변엔진) 직접 인용의 핵심** — 35+ FAQ |
| `MedicalWebPage` | 의료 전문성 신호(YMYL Expertise 보강) | E-E-A-T |
| `BreadcrumbList` | 페이지 계층 명시 | SERP breadcrumb 노출 |
| `MedicalSpecialty` | 전문 분야 명시 | E-E-A-T 전문성 |

> **핵심:** SSR(서버 렌더링) 시점에 JSON-LD를 `<head>`에 **직접 주입**한 것. 클라이언트 렌더링이 아니라 봇이 첫 응답에서 바로 읽게 한 것 — "봇은 코드부터 읽는다"의 가장 정확한 실행 형태.

### 8.3 검증된 KPI — Before → After (구현 측 자체 측정)

| 지표 | Before | After |
|------|:---:|:---:|
| JSON-LD 적용 페이지 | 1개 | **19개 (19/19)** |
| 인용 가능 FAQ | 4개 | **35+개** |
| GeoCoordinates | 없음 | 적용 완료 |
| AI 쿼리 커버리지 | — | 95% |
| AI 인식률 | — | 98% |
| 랭킹 상승 | — | +42% |
| 검색 노출 / CTR | — | +156% / +13% |
| AI 인용 / 참고률 | — | +89% / +94% |

> **해석 주의:** 자체 측정값이므로 절대 수치보다 **구조화 전후의 방향성(부재 → 전면 적용)**에 무게를 두고 읽을 것. 측정 3단계: ① AI 봇(GPTBot/PerplexityBot) 서버 로그 관측 ② GSC 리치 리절트 모니터링 ③ AI 오버뷰 노출 샘플링.

### 8.4 지역 랜딩페이지 — 5.6 방법론의 실제 구현

- Title: `A시 요양병원 | 샘플요양병원 - 입원 안내`
- H1: **"A시 요양병원, 어떻게 선택해야 할까요?"** — 인텐트 질문형 포맷 그대로
- 콘텐츠 위계: H2 입원 대상(H3 장기입원/회복기/재활) → H2 비용 안내
- JSON-LD 3중: FAQ(6개) + Breadcrumb(2단계) + MedicalWebPage
- 내부 링크 6개로 허브 연결, canonical은 퓨니코드 절대경로, sitemap Priority 1.0(홈 동급)

### 8.5 기술적 SEO 인프라 실측 포인트

- **Punycode:** 한글도메인 → `xn--…` 형태. 서치콘솔·sitemap·JSON-LD `@id` 전부 퓨니코드 주소로 통일.
- **Canonical 자동화:** 후행 슬래시 정규화 + 퓨니코드 절대경로 생성 함수 → 쿼리 파라미터 중복 콘텐츠 방지.
- **robots.txt:** `Disallow: /*?utm_source`, `/*?ref=` 등 트래킹 파라미터 차단(크롤 버짓 보호).
- **sitemap Priority:** 홈·핵심 랜딩 1.0/weekly, 블로그 daily, 안내 페이지 monthly.

### 8.6 출력 레벨 검증 (실제 AI·검색 화면 캡처로 확인된 사실)

- **ChatGPT 추천 노출:** "A시 요양병원 추천" 질의에 ChatGPT 답변 목록 **첫 줄**에 샘플요양병원이 인용됨. 구글 AI 모드에서도 우호적으로 요약.
- **지도 1등:** "C동 한의원"이 구글 검색·지도 로컬 결과 최상단 노출.
- **순위 상승 실시간 관측:** "9페이지 → 5페이지, 백링크·트래픽 하나 없이" 진행 중 시점 관측.
- **GBP 운영 주의:** GBP가 마케팅 대행사 계정으로 묶여 운영될 수 있음 → **GBP 소유권·관리 주체를 실행 시 반드시 확인**할 것.
- **한계 재확인:** "코드 구조화 하나만으로 잡히는 건 아니다. 외부 업종 플랫폼 등록이 1순위인 건 맞다. 다만 콘텐츠 쪽에서는 코드 구조부터 잡는 게 훨씬 좋다."

### 8.7 우수사례 실측 — 샘플치과(D시 E동): "GEO 교과서" + 작성자 신원 공백

> 공개 프론트엔드(robots.txt·llms.txt·사이트맵 7종·실제 글 JSON-LD)를 직접 추출(curl)하고 화면과 대조한 결과. **"관리자페이지가 잘 만들어졌다면 결과물이 이렇게 나온다"는 목표 상태(target) 레퍼런스.**

| 영역 | 평가 | 실측 내용 |
|------|:---:|-----------|
| robots.txt | ★★★★★ | **AI 크롤러 30종+** 허용(9종 기준 3배 초과: GPTBot·ClaudeBot·PerplexityBot·Google-Extended + Grok·DeepSeek·Qwen·Mistral·Copilot 등). 일반봇 개별 규칙, 악성봇 차단, 쿼리스트링 차단(크롤 예산 보호), 사이트맵 7개 명시, llms.txt 연결 |
| llms.txt | ★★★★★ | llmstxt.org 표준 준수. Quick Facts(상호·사업자번호·대표·주소·전화·SNS·영업시간)를 키-값으로 → AI가 그대로 인용. Leadership에 원장 실명·학력·전문의 자격(E-E-A-T). `llms-full.txt`까지 별도 운영 |
| 사이트맵 / 주제 권위 | ★★★★★ | 인덱스 아래 7개 분리: main(133) · **area(88: 지역 SEO)** · **encyclopedia(862: 업종 백과사전 = 주제 권위 대량 확보)** · intl(34: 7개 언어) · columns(동적) · cases(동적). 기술스택은 Cloudflare(Hono+R2+D1) — **워드프레스가 아니어도 GEO 가능** |
| JSON-LD | ★★★★☆ | 글 1편에 4종: `Blog` + `BreadcrumbList` + `FAQPage`(Q&A 5쌍, 지역 인텐트 침투) + `MedicalWebPage`. 홈 스키마는 geo·hasMap·priceRange·openingHoursSpecification까지 풍부. 감점: Breadcrumb 2단계로 얕음, aggregateRating/review 부재 |
| 다국어·지역 | ★★★★★ | 7개 언어 랜딩 + 88개 지역 페이지로 "지역+진료" 롱테일 대량 생산 |
| **작성자 E-E-A-T** | **★★☆☆☆** | **유일한 공백 (아래)** |

**핵심 발견 — 작성자 신원 공백.** 실제 글의 author를 추출한 결과:

```json
"author": {
  "@type": "Person",
  "name": "이영희",              // ⚠️ 화면 표기는 "대표원장 김철수"인데 JSON엔 "이영희" (불일치!)
  "jobTitle": "치과의사",
  "description": "샘플치과 대표원장, ○○대학교 치의학대학원 석사, 전문의",
  "url": "https://sample-dental-blog.example.com"   // ⚠️ 개인 프로필이 아닌 블로그 홈
  // ❌ sameAs 없음 → LinkedIn 등 외부 신원 연결 부재
}
```

진단 3가지: ① `author.sameAs` 부재 ② 화면 작성자 ≠ JSON-LD 작성자(AI가 작성자 오인식) ③ `author.url`이 개인 페이지가 아님.
(참고: 조직 레벨 sameAs는 6종 있으나, **작성자 개인(Person) 레벨 sameAs는 통째로 빠짐.**)

**개선 우선순위(영향×난이도):**
1. 🚨 화면↔JSON-LD 작성자명 불일치 정정 (즉시·고영향)
2. `author.sameAs`에 LinkedIn 등 본인 운영 프로필 추가 (이미 보유한 유튜브 채널부터 투입)
3. `author.url`을 구성원 개인 페이지로 교체
4. aggregateRating/review 추가 (실제 리뷰 기반)
5. BreadcrumbList를 글 제목까지 3단계로 확장

> **한 줄 결론:** 기술·콘텐츠·지역·다국어는 만점에 가깝지만, "이 글을 쓴 사람이 누구인지"를 봇이 검증할 연결(`author.sameAs`)만 비어 있다. 이 한 칸을 채우면 사실상 완성형 GEO 사이트다.

### 8.8 실측 4개 사이트 비교 요약표 (무엇을 갖췄고 무엇이 비었나)

| 항목 | 샘플요양병원 (A시) | 샘플한의원 (B시) | **샘플치과 (우수)** | 기준점: 샘플의원 (F시) |
|------|:---:|:---:|:---:|:---:|
| CMS / 스택 | Payload | Payload | **Cloudflare(Hono+R2+D1)** | WordPress |
| 글 단위 JSON-LD | ✅ | ✅ | ✅ 4종 | ✅ |
| 위경도(GeoCoordinates) | ✅ | ✅ | ✅ | ✅ |
| FAQPage 스키마 | ✅ 35+ | ✅ | ✅ 5쌍(지역 인텐트) | ✅ |
| SSR로 head 주입 | ✅ | ✅(추정) | ✅ | ✅ |
| **robots.txt AI 크롤러** | ❌ 미완 | ❌ | ✅ **30종+** | ✅ 9종 완비 |
| **llms.txt** | ❌ 미완 | ❌ | ✅ **full 버전까지** | ✅ 완비 |
| 푸터/지역 키워드 페이지 | ✅ | ✅ | ✅ 지역 88·백과 862 | ✅ |
| 다국어 페이지 | ❌ | ❌ | ✅ **7개 언어** | ❌ |
| 별점·리뷰(aggregateRating) | ❌ | ❌ | 🔶 부재 | — |
| **작성자 author.sameAs(신원)** | ❌ | ❌ | ❌ **(유일한 공백)** | — |

→ **결론:** 실측 admin 2곳은 JSON-LD·FAQ·SSR은 풀세팅이나 robots/llms는 미완. 우수사례는 robots/llms·다국어·백과사전까지 갖춘 사실상 완성형이지만 **작성자 신원 연결(author.sameAs)만은 비어 있다.** 이 한 칸이 곧 신규 홈페이지의 차별화 포인트 — 즉 **"우수사례 수준 + author.sameAs"가 최종 지향점**이다.

## 9. 리스크 및 주의사항

1. **스키마-콘텐츠 불일치 = 최대 위험.** 샘플요양병원이 실제로 제공하지 않는 진료("암·재활")를 JSON-LD에 넣자 AI가 그대로 소개 → 해당 환자 문의·클레임 발생 → **롤백.** 이후 "스키마-실제 제공내용 정합성 점검"이 운영 항목으로 제도화됨. **없는 서비스를 GEO 목적으로 넣지 말 것.**
2. **푸터 키워드 페이지의 정직성** — 위치만 숨기는 것이지 허위 정보를 숨기는 게 아니다. 클로킹 오인 시 패널티.
3. **GEO 업셀 경계** — 부가상품 끼워팔기에 묶이지 말고 핵심 레버(코드 구조화 + 기본 세팅)에 집중.
4. **코드 구조화만으로 끝나지 않음** — 외부 업종 플랫폼 등록·GBP 병행이 1순위.

## 10. 실측 검증 — "정말 다른 곳은 안 되어 있나?" (경쟁사 6곳 직접 조회)

| 사이트 | robots.txt | AI 크롤러 명시 | sitemap | llms.txt | 판정 |
|--------|:---:|:---:|:---:|:---:|------|
| 샘플의원 (기준, 최적화) | 있음 | **9종 전부 Allow** | O | **O 완비** | GEO 풀세팅 |
| 대형 한방병원 체인 P | 없음(빈 응답) | X | X | X | 거의 비어있음 |
| 소아 한의원 체인 Q | 없음(빈 응답) | X | X | X | 거의 비어있음 |
| 요양병원 R ("1등급" 자칭) | 있음(WP 기본값) | X | X | X | 기본만 |
| 요양병원 S | 있음(빌더 자동) | X | O | X | 일반 SEO만 |
| 요양병원 T | 있음 | X | O | X | 일반 SEO만 |

검증 결론:
1. AI 크롤러를 명시 허용한 곳은 기준 사이트 **단 하나뿐.**
2. llms.txt는 **비교군 전부 부재** (대형 체인도 미적용) → 가장 큰 선점 기회.
3. 단 "완전 0"은 아님 — 일반 SEO는 일부 하지만 **GEO 전용 레이어(AI 크롤러 허용 + llms.txt + 구조화 데이터)는 거의 비어 있다.**
4. 브랜드 대형 체인은 robots가 비어도 브랜드 파워로 노출됨 → **빈틈이 크게 열린 곳은 브랜드 없는 동네 업장의 지역 키워드 시장.**

## 11. 즉시 실행 플랜 + 점검 방법

### 11.1 실행 체크리스트

| 순위 | 작업 | 산출물 |
|:---:|------|--------|
| 1 | GBP 등록·정비 (정확한 주소·서비스 항목) | 구글 비즈니스 프로필 |
| 2 | robots.txt에 AI 크롤러 9종 Allow + **sitemap.xml · rss** + llms.txt | robots.txt / sitemap / **rss** / llms.txt |
| 3 | 서치콘솔·서치어드바이저 등록 → **sitemap과 rss를 각각 제출** (한글도메인은 punycode 동시 확인) | 인덱싱 등록 완료 |
| 4 | 페이지·글마다 JSON-LD 삽입 ([업종]Business + 주소 + author) | 구조화 데이터 템플릿 |
| 5 | "지역+돈되는 키워드"별 푸터 전용 페이지 생성 | 키워드 페이지 N개 |
| 6 | 핵심 랜딩을 FAQ·선택기준·대상 구조로 재작성 | "○○ 어떻게 선택?" 페이지 |
| 7 | 외부 블로그 → 변환 프롬프트 → 자동 발행 파이프라인 | 메타·JSON-LD 자동 생성 |
| 8 | 사실관계 검수 (없는 서비스 키워드 제거) | 리스크 점검표 |

### 11.2 GEO 관점 홈페이지 점검법 (직접 확인)

- **robots.txt:** `도메인/robots.txt` → AI 크롤러 Allow·Sitemap 줄 확인.
- **페이지 소스:** 우클릭 → "페이지 소스 보기"(Ctrl+U) → Ctrl+F로 `application/ld+json`, `<title>`, `og:`, `<h1>` 검색.
- **JSON-LD 검증:** 구글 Rich Results Test(search.google.com/test/rich-results)에 URL 입력.
- **색인 여부:** 구글에 `site:도메인` 검색 → 결과 없으면 서치콘솔 미등록/미색인.
- **푸터:** 맨 아래 키워드 링크·`xn--` 도메인 형태 확인. (JS 렌더링 사이트는 F12 → Elements 탭)

## 부록 A. 용어 풀이

| 용어 | 뜻 |
|------|-----|
| **GEO** | Generative Engine Optimization. AI 생성형 검색(ChatGPT·Perplexity·AI Overview)이 우리 사이트를 추천·인용하도록 최적화하는 작업 |
| **AEO** | Answer Engine Optimization. AI 답변에 우리 콘텐츠가 직접 인용되도록 FAQ·구조화하는 작업 |
| **E-E-A-T** | Experience·Expertise·Authoritativeness·Trust. 구글·AI가 콘텐츠 신뢰도를 평가하는 기준 |
| **robots.txt** | 봇 출입 허가/통제 파일. "들어와도 되는가" |
| **llms.txt** | LLM 전용 사이트 안내 파일. "들어왔으면 이걸 봐라" |
| **JSON-LD** | schema.org 기반 구조화 데이터. 봇에게 사실 정보를 코드로 명시 |
| **Punycode (xn--)** | 한글 등 비영문 도메인을 DNS용 영문 코드로 변환한 형태 |
| **GBP** | Google Business Profile. 구글 비즈니스 프로필 |
| **SSR** | Server-Side Rendering. 서버가 완성된 HTML을 보내는 방식 — JSON-LD·메타가 봇의 첫 응답에 포함되게 하는 전제 |
