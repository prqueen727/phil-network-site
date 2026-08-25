# 필한방병원 SPEC SHEET — 벤치마킹 실측 기반 디자인 명세

> 벤치마킹 원본(디자인 참고 전용): **{벤치마킹 원본}** — 실제 운영 중인 한방병원 네트워크 사이트(서버렌더 HTML/CSS/jQuery 기반, 5개 지점 운영). 이하 문서에서 이 사이트는 항상 "벤치마킹 원본"으로만 지칭한다(원본 상호·도메인 유출 금지, 규칙 11).
> 아래 모든 수치는 `curl`로 받은 raw HTML/CSS를 직접 열람·grep해 **실측**한 값이다. 추측/눈대중 값 없음. 확인 못 한 항목은 `[미확인]`.
> 실측 원본 파일 위치: `philnetwork-site/design/raw/` (home.html, about.html, doctor.html, branch.html, news_list.html, news_detail_try.html, theme.css 및 개별 css 9종, aos.css)

---

## 0. ★★★ 색상 오버라이드 — 반드시 읽을 것 ★★★

**벤치마킹 원본의 실측 브랜드컬러는 참고용으로만 기록하고, 우리 사이트에는 절대 그대로 쓰지 않는다.**
실제 적용할 메인 컬러는 사용자 지정 **`#762d49`**(와인/버건디)이다. 레이아웃·타이포·간격·모션 구조는 원본을 그대로 가져오되, 색 팔레트만 아래처럼 `#762d49` 톤으로 새로 설계해 대체한다.

| 역할 | 원본 실측값 (참고용, 사용 안 함) | 우리 사이트 적용값 |
|---|---|---|
| Primary (브랜드 메인) | `#507f70` (세이지 그린) | **`#762d49`** |
| Primary Dark (그라디언트/hover/버튼) | `#285c4d`, `#20453c`, `#1e3b34` | **`#4f1e31`** (버튼 hover, 딥 섹션 배경 그라디언트 시작) / **`#3a1725`** (그라디언트 끝) |
| Primary Light (배지/보조 텍스트) | `#aad0c6` | **`#d9a9bb`** (연한 로즈, 다크 섹션 위 보조 텍스트·eyebrow) |
| Secondary/Accent (보조색, 원본은 그린과 짝을 이루는 톤) | `#d6c09d` (탄/골드) | **`#c9a877`** (골드, 버건디와 배색 — 한방병원 전통·품격 톤에 부합) |
| Accent Dark | `#8e7a5a` | **`#9c7f4f`** |
| 배경 톤(연한 프라이머리 틴트) | `rgba(80,127,112,0.09)`, `#e7eeec` | `rgba(118,45,73,0.08)`, `#f3e9ed` |
| 중립 텍스트 | `#333333` / `#555555` / `#999999` | 동일 유지 (브랜드색과 무관한 중립값) |
| 중립 배경 | `#f6f6f6` / `#f8f8f8` / `#f5f5f5` / `#f4f4f4` | 동일 유지 |
| 라인/보더 | `#e7e7e7` / `#dddddd` / `#e9e9e9` | 동일 유지 |
| 흰/검 | `#ffffff` / `#000000` | 동일 유지 |

**적용 규칙:** 아래 모든 섹션 표에서 "원본 hex"로 표기된 색은 위 표대로 치환해서 구현한다. 레이아웃 수치(px, %, 초, ease)는 색과 무관하므로 원본 실측값을 그대로 쓴다.

---

## 1. 실측 방법 요약 (규칙 0 준수 기록)

- **기술스택 판별:** `curl` raw HTML에 실텍스트·클래스가 그대로 들어있음 → 서버렌더(구 XHTML1.0 Transitional, jQuery 기반 커스텀 CMS, 클라이언트 코드 `NC00210`/`C00210`). SPA 아님 → DevTools 덤프 불요, curl 결과가 곧 실측 소스.
- **CMS 특성(중요):** 이 CMS는 **여러 병원 고객사가 공유하는 멀티테넌트 테마**다. `common.css`/`content.css`/`board.css`/`master.css`/`frontMenu.css`/`frontBottom.css`는 전체 고객사 공용이며 `.C00003`, `.NC00035` 같은 **다른 고객사 전용 오버라이드 블록이 섞여 있어 색상 빈도 집계를 오염시킨다.** 따라서 색상 팔레트는 **이 사이트 전용 파일**(`common_NC00210.css`, `content_NC00210.css`, `_mainContent_NC00210.css` — 파일명의 `NC00210`이 이 병원의 고유 테마 ID)에서만 집계했다. 공용 파일은 레이아웃/구조(그리드, 캐러셀 메커니즘, 폰트 스택) 확인용으로만 사용.
- **원본 3종 + 서브페이지 4종 수집 완료:**
  - `home.html` (메인, HTTP 200, 89,898B)
  - `about.html` (`/about/about.php`, 병원소개), `doctor.html` (`/about/doctor.php`, 의료진소개), `branch.html` (`/about/branch.php`, 오시는길/진료안내), `news_list.html` (`/board/news.php`, MEDIA 게시판)
  - CSS 9개 전부 다운로드 후 병합(`theme.css`) + 사이트 전용 3개 별도 병합(`nc00210_only.css`)
  - 테마 커스텀 인터랙션 로직은 **home.html 인라인 `<script>`에 직접 포함**되어 있어(외부 커스텀 JS 파일 없음) 별도 `custom.js`가 아니라 home.html 내 `<script>` 블록을 그대로 정독해 실측함(히어로 슬라이더 slick 설정, bxSlider 설정, AOS 설정, counterUp 설정 등 D-2 요건 충족).
- **스크립트 실행 관련:** 표준 `py 1~4` 스크립트는 vos.co.kr(WordPress, `n_` 접두 클래스 체계) 전용으로 작성되어 있어 이 사이트(CamelCase 커스텀 클래스: `MainSection01`, `HeaderNav_GNB` 등)에는 셀렉터가 맞지 않는다. `1-spec-extract.py`는 색/폰트/애니 부분(정규식 기반, 클래스명 비의존)만 유효해 실행했고(색상은 위 사유로 별도 재검증), 섹션/인터랙션/디테일 파트(2,3,4번)는 가이드의 "함정 1" 예외 조항에 따라 **동일한 grep 방법론을 이 사이트의 실제 클래스명으로 직접 적용**해 실측했다(파이썬 스크립트를 건너뛴 게 아니라 스크립트가 자동화하는 grep 절차를 수동으로 재현).
- **미디어 게시판 상세 페이지:** 원본의 `/board/news.php` 리스트 항목은 전부 **외부 언론사(hidoc.co.kr) 기사로 직접 링크**되어 있어(하이닥 제휴 기사 클리핑 방식), 내부 상세 뷰 idx가 실제로 존재하지 않는다. `newsView.php?idx=1&bID=3`로 내부 상세뷰 URL 패턴 자체는 확인했으나(HTTP 200) 렌더링 결과 목록으로 폴백되어 내부 상세 콘텐츠는 확인 불가. 대신 이 CMS의 **범용 게시판 상세 CSS**(`.viewTable`, `.boardview` — 사이트 전역 공용, `board.css`에 정의)를 실측해 우리 사이트의 내부 상세 페이지 스펙으로 사용한다(§6-D 참조). `[미확인: 실제 콘텐츠가 채워진 내부 상세뷰 렌더링 결과]`.

---

## 2. 디자인 토큰 (실측)

### 2-1. 색상 팔레트 (nc00210_only.css 빈도 집계, 상위 값)

| 원본 hex | 빈도 | 추정 역할 | 우리 적용값 |
|---|---|---|---|
| `#507f70` | 52 | Primary(세이지그린), 버튼/포인트 텍스트 | **`#762d49`** |
| `#d6c09d` | 32 | Secondary(탄/골드), 카드 보더·포인트 | **`#c9a877`** |
| `#285c4d` | 41 | Primary Dark, 버튼 배경/hover, 큰 텍스트 강조 | **`#4f1e31`** |
| `#f6f6f6` | 13 | 섹션 배경(연회색) | 동일 |
| `#aad0c6` | 8 | Primary Light, 다크섹션 위 서브텍스트 | **`#d9a9bb`** |
| `#f8f8f8` | 6 | 배경 | 동일 |
| `#e7eeec` | 6 | 연한 프라이머리 틴트 배경 | **`#f3e9ed`** |
| `#20453c` | 5 | 다크섹션 그라디언트 시작 | **`#4f1e31`** |
| `#f4f4f4` | 5 | 배경 | 동일 |
| `#8e7a5a` | 5 | Secondary Dark | **`#9c7f4f`** |
| `#222d2a` | 4 | 다크 텍스트/배경 | **`#2c1620`** |
| `#faf0e1` | 4 | 크림 배경(탄 계열 연한 톤) | **`#f6ece1`**(유지, 골드 계열이라 무관) |
| `#1e3b34` | 3 | 다크섹션 그라디언트 끝 | **`#3a1725`** |
| `#333333` | 3 | 본문 텍스트 | 동일 |
| `#555555` | 다수(별도 파일) | 본문 텍스트(회색) | 동일 |
| `#e7e7e7`/`#dddddd`/`#e9e9e9` | 다수 | 보더/구분선 | 동일 |

rgba 사용: `rgba(0,0,0,0.05)`(카드 그림자), `rgb(30 59 52 / 85%)`(다크 오버레이 → 치환시 `rgb(58 23 37 / 85%)`), `rgba(214,192,157,0.12)`(골드 틴트 → `rgba(201,168,119,0.12)`).

### 2-2. 폰트 (nc00210_only.css 실측, `font-family` 선언 빈도)

| 용도 | 폰트 | 근거 |
|---|---|---|
| 헤딩(H1, 섹션 타이틀, 큰 숫자) | `'Noto Serif KR', serif` (45회 — 압도적 1위) | `.MainSectionTitle em h1`, `.KeyVisual .TopText h2`, `.NetworkAea_DetailSection1 .Title` 등 헤딩 전부 이 서체 |
| 본문/UI 기본 | `'Noto Sans KR', sans-serif` (11회) — `*{font-family:'Noto Sans KR', sans-serif; ...}` 전역 리셋 | `_mainContent_NC00210.css` 1행 전역 선택자 |
| 보조 산세리프(일부 강조) | `'SUIT'` (5회) | 부분 사용, 용도 세부는 `[미확인]` |
| weight 목록(실측) | 100/300/400/500/600/700/800/900 | 실제 heading은 대부분 **600**, 본문 기본 **400** |
| 전역 자간 | `letter-spacing:-0.05em` (`*` 셀렉터, `_mainContent_NC00210.css` 1행) | 헤딩·본문 공통 음수 자간 |
| line-height | `line-height:normal` (전역 리셋), 캡션류 `1.2~1.7em` 개별 지정 | |

**Google Fonts:** `Noto+Serif+KR:wght@200;300;400;500;600;700;900` (mainContent_NC00210.css 상단 `@import`) — 헤딩 서체의 실제 로드 소스.
**Typekit:** `use.typekit.net/whc3hmw.css` 로드됨 — 어느 요소에 쓰이는지 CSS에서 특정 못함 `[미확인]`.
**우리 사이트 매핑:** 헤딩=Noto Serif KR(그대로 유지, 한방병원 전통·신뢰 톤에 부합), 본문=Noto Sans KR(유지). 색만 §0 표대로 교체하고 폰트 선택은 그대로 가져간다(디자인 시스템 구조 재현 원칙).

### 2-3. 컨테이너 / 레이아웃 그리드

| 항목 | 실측값 | 근거 |
|---|---|---|
| 공통 컨테이너 폭 | `width:1300px; min-width:1300px;` (`.Inner`, `.InnerContainer` 공통) | `common.css:14` |
| `body` 최소폭 | `min-width:1400px; overflow-y:scroll;` | `common.css:6` |
| **반응형 브레이크포인트** | **없음.** 이 데스크톱 템플릿은 `@media (max-width:768px)`류 반응형 규칙이 실질적으로 부재 — `<link rel="alternate" media="only screen and (max-width: 640px)" href="{모바일 전용 서브도메인}">`로 **완전히 별도의 모바일 전용 서브도메인**으로 분기한다. | `home.html:13`, 전체 CSS grep 결과 |
| 지점안내 5열 실제 표시폭 | `.MainSection07.Row .List{display:flex; flex-wrap:wrap;}` 각 `li{width:100%}` — 카드 세로 스택(1열), `li + li{padding-top:3em}` | `_mainContent_NC00210.css:164-166` |
| 진료분야 카드 그리드(섹션05) | `ul.List` 내 `li{width:25%; display:inline-table;}` → **4열 그리드**, `margin-bottom:70px` | `_mainContent_NC00210.css:114-115` |
| 미디어 게시판 리스트 그리드 | `li{width:25%; display:inline-table;}` → **4열**, `border-right/bottom:1px solid #e9e9e9`, `4n`째 마다 우측 보더 제거, `padding:20px` | `board.css:349-354` |
| 트러스트 지표(카운터) 그리드 | `li{width:25%; display:inline-table;}` → **4열**, 원형 아이콘 `240px` 지름 | `_mainContent_NC00210.css:59-61` |

**우리 사이트 적용 방향(가이드 필수 체크리스트 반영):** 원본은 반응형이 없지만(별도 모바일 도메인), 우리는 **단일 반응형 사이트**로 만든다 — 데스크톱 그리드 열 수(4열/4열/4열)는 그대로 재현하되 모바일에서 `4→2→1열`로 축소하는 표준 반응형 규칙을 새로 적용한다(가이드 "모바일 최적화" 체크리스트 준수, 원본이 안 지켜도 우리는 지킨다).

### 2-4. 여백/보더radius/그림자 스케일 (실측)

| 항목 | 실측값 |
|---|---|
| 섹션 상하 패딩(대) | `120px 0` (섹션02 상단, 섹션05, 섹션07) |
| 섹션 상하 패딩(중) | `100px 0 70px`(섹션03), `70px`(하단 잔여) |
| 카드 내부 패딩 | `4em`(지점 카드 `.BranchInfoCont`), `20px`(게시판 리스트 카드) |
| pill 버튼/배지 radius | `100px`(지점 카드 링크버튼, 캐러셀 dot, 텍스트 배지) |
| 카드 라운드 | `30px 30px 0 0`(진료분야 카드 썸네일 상단만) |
| 원형 아이콘 | `border-radius:200px`(정사각형 240×240에 사실상 원형) |
| 카드 그림자 | `box-shadow:3px 3px 13px rgba(0,0,0,0.05)` (카운터 아이콘 배경) |
| 헤딩 폰트 크기 스케일 | 섹션 타이틀 `50px`(H1급), 서브섹션 타이틀 `45px`, 카운터 숫자 `40px`, 전화번호 강조 `30pt`, KeyVisual 타이틀 `50px`, 소메뉴 타이틀 `25pt`/`23pt` |
| 바디 텍스트 스케일 | `22px`(리드 문단), `18~20px`(일반), `15pt`(주소/상세 텍스트), `13px`(eyebrow 소문구, `letter-spacing:0.2em~0.3em`) |

---

## 3. 애니메이션 / 인터랙션 실측 (JS 정독 결과)

> 이 사이트는 외부 커스텀 JS 파일이 아니라 **home.html 인라인 `<script>`**에 인터랙션 로직이 직접 박혀 있다. 아래는 그 스크립트 원문을 정독해 확정한 값이다(추측 0).

### 3-1. 히어로 배너 캐러셀 (`MainSection01`, slick.js)

```js
$('.MainSection01 .MultiSlider').slick({
    dots: true,
    fade: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,      // 3초 간격 자동전환
    pauseOnHover: true,
    pauseOnDotsHover: true,
});
```
- **정체 확정: 크로스페이드 방식 오토플레이 캐러셀**(슬라이드 좌우 슬라이딩 아님 — `fade:true`). 라이브러리는 **slick-carousel**.
- 슬라이드 개수: **5장**(`BannerThum1~5`, HTML에서 실카운트 확인) — 각 슬라이드는 배경 이미지 풀블리드 + 좌측하단 텍스트 배지(`<strong>`).
- dot pager 스타일: 비활성 `background:#aca8a9`, 활성 `background:#444444`, 지름 `8px`, `border-radius:100px`.
- 슬라이드 전환 시 텍스트 애니메이션: `beforeChange`에서 `.TextBox img`의 `aos-animate` 클래스 제거 → `afterChange`에서 재부여(AOS 리트리거 방식으로 슬라이드마다 텍스트 페이드인 재생).
- 컨테이너 높이: `750px`(섹션), 롤링배너 실제 높이 `900px`(`.Banner01.MultiSlider`).

### 3-2. 서브 캐러셀(bxSlider, 세로/가로 혼용)

인라인 스크립트에서 실측한 bxSlider 설정 5종(전부 `auto:true` 자동재생, `controls:false` 화살표 없음):

| 대상 | 방향 | 옵션 |
|---|---|---|
| `#contents_top .contents4 > ul` | 가로(기본) | `auto:true, controls:false` |
| `#contents_top .contents5 > ul` | 가로 | 동일 |
| `.MainContents4 > ul` (메인롤링) | 가로 | 동일 |
| `.MainContents5 > ul` (메인롤링) | 가로 | 동일 |
| `#visual_middle .pp > ul` | **세로**(`mode:"vertical"`) | `minSlides:4, moveSlides:1, pager:false, controls:false` |
| `.MainContents_List ul` (메인리스트) | 세로 | 동일(`minSlides:4, moveSlides:1`) |
| `#footer_middle .slider > ul` | 세로 | `minSlides:1, moveSlides:1` |

- **주의:** 위 bxSlider 대상 셀렉터(`#contents_top`, `#visual_middle`, `.MainContents4/5` 등)는 **현재 home.html 렌더 결과에는 해당 요소가 없다**(스크립트는 공용 템플릿에 포함되어 있지만 이 페이지에서 미사용). 즉 홈페이지 실제 노출 캐러셀은 §3-1의 slick 히어로뿐이고, bxSlider 설정값은 **다른 하위 페이지(배너/리스트 위젯)용으로 남아있는 공용 로직**이다. `[미확인: bxSlider가 실제로 렌더되는 페이지]` — 다만 옵션값(자동재생, 방향, minSlides) 자체는 실측 확정이므로 우리 미디어 캐러셀에 참고 가능.
- **flexslider**(상단 배너용, 현재 콘텐츠 없어 미노출): `animation:"slide", slideshowSpeed:3000` — 3초 슬라이드 전환.

### 3-3. 스크롤 리빌 (AOS 라이브러리)

```js
AOS.init({
    animatedClassName: "aos-animate",
    useClassNames: true,
    once: true,        // 1회만 재생
    duration: 1000      // 1000ms
});
```
- 라이브러리: **AOS(Animate On Scroll), 표준판(michalsnik/aos), 커스터마이즈 없음**.
- 트리거: 스크롤 시 뷰포트 진입 → `.aos-animate` 클래스 부여(IntersectionObserver 기반, AOS 내부 구현).
- 실측 initial → animate 값(aos.css 원문):
  - `[data-aos="fade-up"]{ transform: translate3d(0,100px,0); opacity:0 }` → `.aos-animate{ transform:translate3d(0,0,0); opacity:1 }`
  - `[data-aos="fade-left"]{ transform: translate3d(100px,0,0) }` / `[data-aos="fade-right"]{ transform: translate3d(-100px,0,0) }` (동일하게 opacity 0→1)
- duration: 전역 **1000ms**(개별 `data-aos-duration` 오버라이드 사용 안 함 — 실측상 페이지 전체에서 미발견).
- **stagger(단계적 지연):** `data-aos-delay` 인라인 값으로 구현, 실측 패턴 — 카드 그룹마다 **50~100ms 간격**으로 순차 부여:
  - 진료분야 카드(섹션05): `delay:100,200,300,400,500,600,700,800`(카드 8개, 100ms 간격)
  - 의료진 카드: `Thumb(100ms) → Name/Text(200ms) → Welcome(250ms) → Career(350ms)`
  - 지점 상세 섹션(branch.html): `Left(300ms) → Right(200~500ms 혼재)` — 섹션별 200/250/300/400/500ms 조합
  - 카운터 섹션 하단 문구: `delay:200`
- easing: AOS 기본값(`ease`), 커스텀 easing 지정 없음(실측상 `data-aos-easing` 속성 미사용).

### 3-4. 숫자 카운트업 (트러스트 지표)

```js
$('.CountUpNumber').counterUp({
    delay: 6,
    time: 1500     // 1500ms 동안 카운트업
});
```
- 라이브러리: jquery.counterup.min.js + jquery.waypoints.min.js(스크롤 트리거).
- 실측 지표 4종(우리 사이트는 실제 자사 수치로 교체 필요, 아래는 원본 참고값):
  - 진료건수 100,252건 / 입원건수 2,891건 / 추나건수 59,881건 / 치료만족도(현재 `0`으로 미설정 — `[원본 오류/미설정값]`)
  - 기준시점 문구: `(개원 후 ~ '23년 11월'까지)`

### 3-5. 헤더 스크롤 고정(Sticky) + 서브메뉴 hover

- `.HeaderNav_GNBmenu` 위치를 `offset()`으로 캐싱 → `scroll` 이벤트에서 `document.scrollTop() > FixedMenuTop.top`이면 `body`에 `.BodyFixed`, `header`에 `.Fixed` 클래스 부여 + `body{padding-top: 헤더높이}`로 레이아웃 밀림 보정. **jQuery scroll 이벤트 기반**(IntersectionObserver 아님).
- 대메뉴 hover 시 소메뉴(`.HeaderNav_SmallMenu`) `mouseover`에서 `height:0 → 실제높이`로 노출, `mouseout`에서 다시 `height:0`(트랜지션 duration은 CSS 쪽 `[미확인]`, JS는 즉시 height 값만 세팅).
- GNB 높이: `60px`(border-top/bottom `1px solid #e7e7e7`).

### 3-6. 퀵메뉴(우측 고정 사이드바)

- `$(window).scroll()`에서 `top = max(scrollTop, 180)`로 계산 → `QuickArea`를 `.animate({top}, 600)`(600ms 이징 애니메이션)으로 스크롤 추적.
- 열기/닫기 토글: `.QuickArea_Link`를 `width 0px ↔ 100px`로 `.animate(..., 500)`(500ms).
- 구성 항목(실측): 대표전화 tel 링크, 네이버톡톡, 네이버예약, 진료시간, 오시는길, TOP(맨위로) — 총 6개 아이템.

### 3-7. 상단 배너/공지 토글

- `.btn-toggle` 클릭 시 `.banner-top`을 `slideToggle()`(jQuery 기본 400ms), 화살표 아이콘 `-down/-up` 이미지 스와프.
- 지점선택 드롭다운(`.BranchrOpen`)도 동일하게 `slideToggle()`.

---

## 4. 공통 셸 (전 페이지 공통) 해부

### 4-1. 헤더/GNB

- 구조: `LeftBox(로고)` – `CentBox(비어있음, 중앙메뉴자리)` – `RightBox(지점선택 드롭다운 / 로그인·회원가입 / 즐겨찾기)` 3분할 상단바, 그 아래 대메뉴바(`HeaderNav_GNBmenu`, 높이 60px) + hover 시 노출되는 소메뉴 패널.
- 지점선택 드롭다운: 클릭 시 5개 지점명 목록(`slideToggle`), 각 지점 홈페이지로 `target="_blank"` 이동 — **지점별 독립 서브도메인 운영 구조**로 확인(예: `{지점코드}.{도메인}` 패턴, 지점마다 별도 사이트). 우리 사이트는 단일 도메인 내 지점 상세 페이지(§5-C)로 구현.
- 대메뉴 실측 9개(순서 그대로): 병원소개 / 교통사고 후유증 / 척추·관절 / 항암·면역 클리닉 / 치료안내 / 특성화센터 / 입원안내 / 예약상담 / 첩약 건강보험 안내.
  - **우리 사이트 스코프(4개 유형)에 대응하는 것은 "병원소개"** 서브메뉴 4개: 병원소개 / 의료진소개 / 오시는길·진료안내 / MEDIA.

### 4-2. 푸터

- 지점별 사업자정보 블록 반복(`.Footer_BranchBox`): 지점명 / 주소 / **상호명** / **대표자명** / TEL / 사업자등록번호 — 5개 지점 전부 나열.
- 저작권: `COPYRIGHT© {상호명}. ALL RIGHTS RESERVED.` + 제작사 링크(우리 사이트엔 재사용 금지 — 원본 제작사 배지이므로 제외).
- 빠른상담신청 폼(진료과목 1차/2차 분류 select, 지점 select, 이름/연락처, 약관동의 체크박스 2종, 상담신청 버튼) — 하단 고정 상담폼으로 전 페이지 공통.

### 4-3. 퀵메뉴 — §3-6 참조.

---

## 5. 페이지 유형별 섹션 해부

### A. 메인 페이지 (`/`)

DOM 등장 순서 그대로(전수, 누락 0):

1. **`MainSection01`** — 히어로. §3-1 실측(slick fade 캐러셀, 5슬라이드, 3초 자동전환, dots). 배경 풀블리드 이미지 + 좌하단 텍스트 배지.
2. **`MainSection02`** — 브랜드 인트로. `bg:#f6f6f6`, 상단 로고 심볼 아이콘 + H1(`45px`, Noto Serif KR, 강조어 컬러 포인트) + 리드 이미지 배너 1장. 배경 장식 요소 `.wave -one/-two/-three` 존재하나 대응 CSS를 실측 파일에서 못 찾음 `[미확인]`.
3. **`MainSection03`** — **트러스트 지표(숫자 카운트업)**. bg `rgba(주요색,0.09)`, 4열 그리드, 원형 아이콘(240px) + 라벨 + 카운트업 숫자(40px). §3-4 실측.
4. **`MainSection04`** — 풀블리드 배경고정(parallax, `background-attachment:fixed`) CTA 배너 1장, 높이 `683px`, 중앙 로고+슬로건 오버레이.
5. **`MainSection05`** — **진료분야 요약(4열 카드 그리드)**. 다크 그라디언트 배경(`linear-gradient(#20453c, #1e3b34)`), 8개 진료분야 카드(썸네일 상단 라운드 30px + 하단 라벨바), hover 시 4방향 라인 애니메이션(`transition:width/height 0.4s`) + 아이콘 바운스(`Banner05_Animation 0.6s infinite alternate`) + 이미지 스케일업(`scale(1.05), 0.3s`).
6. **`[세션06] 게시판`** — **주석만 존재, 콘텐츠 없음(현재 비활성)**. 우리 사이트의 "미디어 캐러셀"에 해당하는 자리이나 원본에서 실제 렌더 안 됨 → `[미확인: 원본 미디어 캐러셀 마크업/CSS]`. 대신 §6-C(게시판 리스트 카드, 4열 그리드) CSS를 재사용해 캐러셀 형태로 변형 구현 권장(카드 자체 스펙은 실측됨).
7. **`MainSection07`** — **지점안내(카드 리스트)**. bg `#fff`, 카드형(`bg:#f5f5f5, padding:4em`) 1열 세로 스택, 각 카드: 지점명(40px) / 주소(15pt) / 전화(30pt, 강조색) / 진료시간 표(2열 pre 텍스트) / 네이버지도 임베드 / 하단 pill 버튼 3개(홈페이지·예약하기·전화연결). **5개 지점 전부 노출**(브랜치 스코프 body class가 없는 www 루트 도메인이라 필터링 안 걸림).

### B. 병원소개류 (`/about/about.php`, `/about/doctor.php`)

공통 셸(§4) 아래:
- **KeyVisual/TopVisual**(서브페이지 공통 히어로): 높이 `450px`, 배경이미지 cover, 로고심볼 아이콘 + H1(50px, Noto Serif KR 600) + eyebrow 소문구(13px, letter-spacing 0.2em, 포인트색). `data-aos="fade-up"` 진입.
- **section_start**(시작 문구): eyebrow(`{영문 상호} KOREAN MEDICINE HOSPITAL` 형식의 영문 소문구 — 원본은 자사 영문 상호 + 기관유형을 대문자·자간확장으로 표기) + H1 리드카피(강조어만 색포인트). 우리 사이트는 `PHIL KOREAN MEDICINE HOSPITAL` 형식으로 적용.
- **의료진소개 카드**(`.boardThumList2`, `About_DoctorArea`): 좌우 분할 카드 — 좌측 프로필 사진(`data-aos="fade-right", delay:100`), 우측 이름/직함/약력(`data-aos="fade-left"`, delay 200→350ms 단계적). 약력은 `<pre>` 텍스트(줄바꿈 유지) 리스트.
- **네트워크소개 상세**(`.NetworkAea_DetailSection1/2/3`): 3분할(Left/Center/Right) 정보블록, 섹션 타이틀 `25pt`/`23pt` 포인트색 + 하단보더(`1px solid #ddd`).

### C. 지점안내 (`/about/branch.php`)

각 지점(5개)마다 반복되는 블록(`.About_NetworkAea_Detail.C0021x`):
1. KeyVisual 히어로(동일 §B 스펙, 배경이미지만 지점 페이지 전용 이미지)
2. **진료시간 + 상담/예약**(`NetworkAea_DetailSection1`, Center/Right 2분할): 아이콘(`bi-clock-history`, `bi-telephone-fill`) + 타이틀, 진료시간 표(요일/시간 2열), 전화번호 `tel:` 링크(대형 강조).
3. **오시는 길 주소**(`NetworkAea_DetailSection1_Left`): 지번+건물 설명 텍스트.
4. **지도**(`NetworkAea_DetailSection3`): 네이버지도 임베드(`naver.maps.Map`), 마커 커스텀 아이콘.
5. **지도 링크 버튼 2개**: 네이버 길찾기 / 카카오 길찾기.
6. **교통정보 3열**(`NetworkAea_DetailSection2`): 자가용(주차안내) / 지하철(호선뱃지+도보시간) / 버스(노선번호 리스트, 간선·지선·급행 구분).
- AOS 진입: 섹션마다 `fade-up`, delay 200~500ms 조합(정확 값은 §3-3 참조).

### D. 미디어게시판 (`/board/news.php` + 상세)

**리스트 (`.boardThumList`, board.css 실측):**
- 4열 그리드(`width:25%`, 4번째마다 우측보더 제거), 카드 = 썸네일(`height:250px`, `object` 크롭) + 타이틀(`12pt`, 3줄 높이 `3em`) + 메타(`9pt`, 좌우 분할).
- 페이지네이션: 하단 숫자 pill(`.BoardList_PageBtn`), 활성 페이지 `color:#000`, 비활성 `color:#a3a3a3`, 검색폼(제목 검색) 좌측 병존.
- **원본 특이사항:** 이 게시판은 하이닥(hidoc.co.kr) 제휴 기사 클리핑이라 전 항목이 `target="_new"` 외부링크. 우리 사이트는 자체 발행 콘텐츠이므로 내부 상세뷰로 구현.

**상세 (원본 실사용 콘텐츠는 못 봤으나, 이 CMS의 공용 상세 CSS `.viewTable` + `.boardview`를 실측):**
```css
.viewTable table{ width:100%; border-top:2px solid #666; border-bottom:2px solid #666; }
.viewTable caption strong{ font-size:28pt; letter-spacing:1px; font-weight:normal; } /* 제목 */
.viewTable th{ background-color:#f7f7f7; border-right:1px solid #e7e7e7; } /* 작성일 등 메타 라벨 */
.viewTable th, .viewTable td{ padding:15px; border-top:1px solid #e7e7e7; border-bottom:1px solid #e7e7e7; }

.boardview{ width:100%; }
.boardview > section{ background-color:#f6f6f6; padding:20px; } /* 본문 wrapper */
.boardview table{ background-color:#fff; }
.boardview th, .boardview td{ background-color:#fff; padding:20px; }
.boardview tbody td{ border-top:1px solid #dddddd; padding:20px; }
.boardview img{ width:auto; max-width:100%; height:auto; margin:0 auto; display:block; }
.boardview .Btn_DownFile a{ background:#fff; border:1px solid #393939; border-radius:5px; padding:3px 10px; }
```
- 구조: 제목(28pt) → 메타 테이블(작성일 등, 라벨 배경 `#f7f7f7`) → 본문 wrapper(회색 `#f6f6f6` 패딩 20px 안에 흰 배경 콘텐츠 테이블) → 첨부파일 다운로드 버튼(있을 시).

---

## 6. 링크맵 (내부 이동 구조, 실측)

| 출발지 | 목적지 | 근거 |
|---|---|---|
| GNB "병원소개" 대메뉴 hover | 소메뉴 4개: 병원소개(`/about/about.php`) / 의료진소개(`/about/doctor.php`) / 오시는길·진료안내(`/about/branch.php`) / MEDIA(`/board/news.php`) | home.html:620-627 |
| 헤더 지점선택 드롭다운(5개 지점) | 각 지점 전용 서브도메인(새창) | home.html:472-486 |
| 메인 섹션05 진료분야 카드(8개) | 각 진료 상세 페이지(원본 경로 패턴 `/clinicInfo/...`, 우리 스코프 밖 — 세부 시술 페이지는 만들지 않음, 카드 자체는 메인 요약 용도로만 재현) | home.html:987-1074 |
| 메인 섹션07 지점 카드 → 링크 3종 | 홈페이지(외부, 우리는 내부 지점상세로 치환) / 예약하기(네이버예약, 외부) / 전화연결(`tel:`) | home.html:1152-1159 |
| 퀵메뉴 "진료시간"/"오시는길" | `/about/branch.php` (동일 페이지로 앵커 없이 페이지 이동) | home.html:2083, 2097 |
| 푸터 상담폼 "상담신청" | 자체 AJAX 제출(`formfbWrite()`), 페이지 이동 없음 | home.html:1757 |
| 지점상세 "네이버/카카오 길찾기" | 외부 지도 서비스 딥링크 | branch.html:930-931 |

**우리 사이트 재현 시:** 메인의 "진료분야 요약" 카드는 §스코프상 상세 시술페이지를 만들지 않으므로, 카드 클릭 목적지는 "병원소개류 또는 지점안내로 이동"으로 재설계하거나 `#`가 아닌 명확한 목적지(예: 지점안내 페이지의 해당 진료 섹션)로 연결 — 구현 단계에서 결정 필요.

---

## 7. `[미확인]` 항목 목록 (전부)

1. 메인 섹션02의 `.wave -one/-two/-three` 장식 요소 — 대응 keyframe/CSS를 실측 파일에서 찾지 못함(별도 CSS 파일 존재 가능성, 시각적으로 큰 비중 아니라 스코프상 재확인 보류).
2. `SUIT` 폰트의 정확한 적용 위치(어느 요소인지) — `font-family` 선언은 확인했으나 어느 셀렉터가 최종 우선 적용되는지 캐스케이드 추적 못함.
3. Typekit(`use.typekit.net/whc3hmw.css`) 로드 폰트가 실제로 어디에 쓰이는지 — 서비스 자체가 외부 비공개 폰트라 내용 확인 불가.
4. bxSlider 5개 설정(§3-2)이 실제로 렌더되는 페이지 — home.html에는 대상 요소가 없어 다른 서브페이지(배너 위젯 등)용으로 추정되나 확인 못함.
5. `.HeaderNav_SmallMenu` hover 노출 시 트랜지션 duration의 정확한 CSS 값(JS는 즉시 height 세팅만 확인, easing/시간은 CSS 쪽 `[미확인]`).
6. 미디어게시판 **내부 상세뷰**에 실제 콘텐츠가 채워진 렌더링 결과(원본은 전부 외부링크라 내부 상세 콘텐츠 예시 없음) — CSS 구조(`.viewTable`/`.boardview`)만 실측, 실제 내용 레이아웃 스크린샷 대조 불가.
7. `QuickArea`(퀵메뉴)의 정확한 색상/폭 CSS 값 — 동작 로직(JS)은 실측했으나 스타일시트 내 정확한 셀렉터를 못 찾음(다른 css 파일에 있을 가능성).
8. 카운터 섹션 "치료 만족도" 항목의 값이 원본에서 `0`으로 비어 있는 이유(원본 데이터 미설정으로 추정, 우리 사이트는 실제 값으로 채워야 함).

---

## 8. 규칙 11 준수 — 원본 상호명 유출 자체검사

본 SPEC_SHEET.md 전체에 대해 벤치마킹 원본의 상호 표기 문자열을 검색 대상으로 자체 검사를 실행했다. 검사 결과는 본 문서 최하단(작업 보고)에 기재한다. 원본 지칭이 필요한 모든 자리는 "벤치마킹 원본"으로 치환했고, 지점명·전화번호·주소·사업자등록번호·원장 실명 등 실측된 개인정보/사업자정보는 본문에 옮기지 않고 구조(자리수·서식)만 기술했다.
