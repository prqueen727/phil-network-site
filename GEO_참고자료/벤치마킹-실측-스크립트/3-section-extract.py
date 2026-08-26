# -*- coding: utf-8 -*-
# [3] 섹션별 내부 구조 실측 — 클래스 순서/텍스트/이미지/레이아웃 CSS
# 사용법:  py 3-section-extract.py <home.html> <all.css>
# ⚠️ python3 아님 → py 또는 python.
# ★ SECTIONS 리스트는 [1]의 "섹션 DOM 순서" 출력을 보고 대상 사이트에 맞게 교체할 것.
import re, sys
sys.stdout.reconfigure(encoding="utf-8")
HTML = open(sys.argv[1], encoding="utf-8", errors="ignore").read()
CSS  = open(sys.argv[2], encoding="utf-8", errors="ignore").read()

# ↓ [1] 출력의 섹션 순서로 교체 (아래는 vos 예시)
SECTIONS = ["n_signature_section","n_rules_section","n_view_section","n_marquee_section",
            "n_point_section","n_youtube_section","n_history_section","n_info_section"]

def slice_section(name, nxt):
    s = HTML.find(name)
    e = HTML.find(nxt) if nxt else s+4000
    if e < 0: e = s+4000
    return HTML[s:e]

def css_rule(sel):
    out=[]
    for b in re.findall(r'\.'+re.escape(sel)+r'\b[^{}]*\{([^}]*)\}', CSS):
        out.append(b.strip())
    return out

for i, name in enumerate(SECTIONS):
    nxt = SECTIONS[i+1] if i+1 < len(SECTIONS) else "site-footer"
    sec = slice_section(name, nxt)
    print("\n" + "="*72)
    print(f"[{i+3}] {name}  (len={len(sec)})")
    print("="*72)
    # 내부 클래스 순서 (중복 제거, 최대 30)
    cls=[]
    for c in re.findall(r'class="([^"]*)"', sec):
        key=c.split()[0] if c.split() else c
        if key not in cls: cls.append(key)
    print("  구조(클래스 순서):")
    for c in cls[:26]:
        print("    -", c)
    # 텍스트
    txts=[]
    for m in re.findall(r'>([^<>]{2,50})<', sec):
        t=re.sub(r'&nbsp;|&middot;',' ',m).strip()
        if t and not t.startswith('http') and t not in txts:
            txts.append(t)
    print("  텍스트:", " | ".join(txts[:12]))
    # 이미지
    imgs=re.findall(r'([a-z0-9_./-]+\.(?:jpg|png|webp|svg))', sec)
    if imgs: print("  이미지:", list(dict.fromkeys(imgs))[:6])
    # 이 섹션 최상위 컨테이너 CSS (레이아웃 핵심)
    for key in cls[:6]:
        for r in css_rule(key):
            if any(k in r for k in ["display:flex","display:grid","grid-template","width","gap","padding","aspect"]):
                print(f"    .{key}: {r[:100]}")
                break
