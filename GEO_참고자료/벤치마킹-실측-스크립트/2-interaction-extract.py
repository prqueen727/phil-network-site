# -*- coding: utf-8 -*-
# [2] 스크롤 인터랙션 실측 — 리빌 클래스/keyframes/stagger/트리거 방식(JS)
# 사용법:  py 2-interaction-extract.py <home.html> <all.css> <custom.js>
# ⚠️ python3 아님 → py 또는 python. custom.js = 테마 커스텀 스크립트(예: n_script.js)
import re, sys
from collections import Counter
sys.stdout.reconfigure(encoding="utf-8")

HTML = open(sys.argv[1], encoding="utf-8", errors="ignore").read()
CSS  = open(sys.argv[2], encoding="utf-8", errors="ignore").read()
JS   = open(sys.argv[3], encoding="utf-8", errors="ignore").read()

print("="*70); print("[A] 리빌/애니 관련 클래스 전수 (HTML에서 쓰이는 것)"); print("="*70)
cls = re.findall(r'(n_reveal[a-z_]*|n_ani[a-z_]*|delay_\d+|[a-z_]*reveal[a-z_]*|slide_(?:left|right|up|down)|fade[a-z_]*)', HTML)
for c,n in Counter(cls).most_common(40):
    print(f"  {n:4}  {c}")

print(); print("="*70); print("[B] 각 리빌 클래스의 CSS (initial 상태 + transition)"); print("="*70)
targets = sorted(set(c for c in cls if not c.startswith("delay")))
for sel in targets:
    for body in re.findall(r'\.'+re.escape(sel)+r'\b[^{}]*\{([^}]*)\}', CSS):
        b = body.strip()
        if any(k in b for k in ["transform","opacity","transition","animation"]):
            print(f"  .{sel} {{ {b[:110]} }}")

print(); print("="*70); print("[C] delay_N 클래스들의 값 (stagger)"); print("="*70)
for sel in sorted(set(c for c in cls if c.startswith("delay")), key=lambda x:int(x.split('_')[1])):
    for body in re.findall(r'\.'+re.escape(sel)+r'\b[^{}]*\{([^}]*)\}', CSS):
        print(f"  .{sel} {{ {body.strip()[:90]} }}")

print(); print("="*70); print("[D] @keyframes 전문 (움직임 정의)"); print("="*70)
for name, body in re.findall(r'@keyframes\s+([a-zA-Z_]+)\s*\{(.*?)\}\s*(?=@|\.|\Z)', CSS, re.S):
    body = re.sub(r'\s+',' ', body).strip()
    print(f"  @keyframes {name} {{ {body[:160]} }}")

print(); print("="*70); print("[E] 인터랙션 로직 (n_script.js — 트리거 방식)"); print("="*70)
for pat,label in [
    (r'IntersectionObserver','IntersectionObserver 사용'),
    (r'ScrollMagic','ScrollMagic 사용'),
    (r'addEventListener\([\'"]scroll','scroll 이벤트'),
    (r'addEventListener\([\'"]wheel','wheel 이벤트(스냅 의심)'),
    (r'classList\.add\([\'"]([a-z_]*(?:on|active|show|reveal)[a-z_]*)','리빌 클래스 토글'),
    (r'threshold[:\s]*([0-9.]+)','IO threshold'),
    (r'rootMargin[:\s]*[\'"]([^\'"]+)','IO rootMargin'),
    (r'setInterval\([^,]*,\s*(\d+)','setInterval(ms)'),
    (r'scrollIntoView|scrollTo','프로그램 스크롤'),
]:
    found = re.findall(pat, JS)
    if found:
        uniq = list(dict.fromkeys(found))[:6] if isinstance(found[0], str) and found[0] else []
        print(f"  [O] {label}" + (f"  → {uniq}" if uniq else f"  ({len(found)}회)"))
    else:
        print(f"  [ ] {label} — 없음")
