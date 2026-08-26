# -*- coding: utf-8 -*-
# [1] 전역 토큰 실측 — 색/폰트/애니속도/섹션순서/섹션타이틀/컨테이너
# 사용법:  py 1-spec-extract.py <home.html> <all.css>
# ⚠️ python3(Windows Store 스텁)가 아니라 반드시 py 또는 python 으로 실행.
import re, sys
sys.stdout.reconfigure(encoding="utf-8")   # cp949 콘솔에서 한글 출력 에러 방지

HTML = open(sys.argv[1], encoding="utf-8", errors="ignore").read()
CSS  = open(sys.argv[2], encoding="utf-8", errors="ignore").read()

def rules(sel):
    return re.findall(r'\.'+re.escape(sel)+r'\b[^{}]*\{([^}]*)\}', CSS)

print("="*70)
print("[1] 디자인 토큰 — 색 (빈도 상위 20)")
print("="*70)
from collections import Counter
cols = Counter(re.findall(r'#[0-9a-fA-F]{6}', CSS))
for c,n in cols.most_common(20):
    print(f"  {n:4}  {c.lower()}")

print()
print("="*70)
print("[2] 폰트")
print("="*70)
fam = Counter(re.findall(r'font-family:([^;}]+)', CSS))
for f,n in fam.most_common(8):
    print(f"  {n:4}  {f.strip()[:50]}")
print("  weights:", sorted(set(re.findall(r'font-weight:\s*(\d{3})', CSS))))

print()
print("="*70)
print("[3] 애니메이션 (이름 + duration)")
print("="*70)
anim = Counter(re.findall(r'animation:\s*([a-zA-Z_]+\s+[0-9.]+m?s)', CSS))
for a,n in anim.most_common(30):
    print(f"  {n:3}  {a}")
dur = re.findall(r'animation-duration:\s*([0-9.]+m?s)', CSS)
if dur: print("  animation-duration 단독:", Counter(dur).most_common())

print()
print("="*70)
print("[4] 메인 섹션 DOM 등장 순서 (전수)")
print("="*70)
# body 안 최상위 섹션들
secs = re.findall(r'class="((?:n_[a-z_]*section|hero_video|main_slider)[^"]*)"', HTML)
seen=set(); order=[]
for s in secs:
    key=s.split()[0]
    if key not in seen:
        seen.add(key); order.append(key)
for i,s in enumerate(order,1):
    print(f"  {i:2}. {s}")

print()
print("="*70)
print("[5] 섹션별 헤더 타이틀 텍스트")
print("="*70)
for m in re.findall(r'_main_title[^>]*>(.*?)</', HTML, re.S):
    t = re.sub(r'<[^>]+>',' ', m)
    t = re.sub(r'&nbsp;|&middot;',' ', t).strip()
    if t: print("  ", t[:60])

print()
print("="*70)
print("[6] 컨테이너/셸 핵심 값 (max-width, 공통 간격)")
print("="*70)
for sel in ["n_inner_1800","n_inner_1600","n_main_container","site-main"]:
    for r in rules(sel):
        print(f"  .{sel}: {r.strip()[:80]}")
