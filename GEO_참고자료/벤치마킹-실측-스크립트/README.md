# 벤치마킹 실측 스크립트 (재사용)

> 잭피부과(vos.co.kr) 재구현에서 **실제로 성공한** 실측 스크립트 4종. 이대로 실행하면 SPEC SHEET가 채워진다.
> 전체 절차는 [../벤치마킹-실전-해부가이드.md](../벤치마킹-실전-해부가이드.md) 참조.

## 0. ⚠️ 파이썬 실행 주의 (실측 실패의 흔한 원인)

Windows에서 **`python3`는 Microsoft Store 스텁**일 수 있다 — 실행하면 조용히 안내문만 찍고 종료돼 "파이썬 안 된다"고 오판하게 된다. **반드시 `py` 또는 `python`으로 실행**한다.

```bash
py --version        # 3.x 나오면 OK. (which python3 가 WindowsApps/python3 이면 그건 스텁)
```

## 1. 원본 소스 3종 받기 (bash)

```bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0 Safari/537.36"
curl -s -A "$UA" https://{target}/ -o home.html
# CSS 전부 합치기 (WordPress FVM 등은 여러 조각)
grep -oE 'href="[^"]*\.css[^"]*"' home.html | sed 's/href="//;s/"$//' | sort -u > css_urls.txt
rm -f all.css; while read u; do curl -s -A "$UA" "$u" >> all.css; echo >> all.css; done < css_urls.txt
# 테마 커스텀 JS (인터랙션 로직) — HTML의 src에서 theme/main/script.js 찾아서
curl -s -A "$UA" "https://{target}/wp-content/themes/{theme}/js/{custom}.js" -o custom.js
```

## 2. 실측 스크립트 순서

```bash
py 1-spec-extract.py home.html all.css              # 색·폰트·애니속도·섹션순서·타이틀·컨테이너
py 2-interaction-extract.py home.html all.css custom.js   # 리빌 클래스·keyframes·stagger·트리거
# [1] 출력의 섹션 순서로 3번 스크립트의 SECTIONS 리스트를 교체 후:
py 3-section-extract.py home.html all.css           # 섹션별 내부구조·텍스트·이미지·레이아웃
# [3]에서 찾은 클래스로 4번 groups 교체 후:
py 4-detail-css.py all.css                          # 좌우비율·카드 오버레이 등 정밀 CSS
```

## 3. 출력 → SPEC SHEET 채우기 → 구현

각 스크립트 출력을 `design/SPEC_SHEET.md` 표에 옮긴다. **표가 100% 채워지기 전엔 코딩 시작 금지**(규칙 0). 표를 "구현"만 하고 새 값 발상 금지.

## 4. 검증 (Playwright)

- 리빌 실측값 확인: `getComputedStyle(el).transitionDuration/transform`이 실측값과 일치
- 순환 슬라이더: 시간차로 활성 슬라이드 관찰
- 모바일 360/768: `scrollWidth-clientWidth === 0` (리빌 translateX 삐짐은 `html,body,main{overflow-x:hidden}`으로 차단 — vos 실측)
- 원본↔재현 섹션 스크린샷 나란히 대조
