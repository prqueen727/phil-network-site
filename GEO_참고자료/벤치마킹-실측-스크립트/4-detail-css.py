# -*- coding: utf-8 -*-
# [4] 특정 요소 그룹의 CSS 룰 정밀 추출 (좌우 레이아웃 비율·카드 오버레이 등)
# 사용법:  py 4-detail-css.py <all.css>
# ⚠️ python3 아님 → py 또는 python.
# ★ groups 딕셔너리를 [3]에서 발견한 클래스명으로 교체해 쓸 것.
import re, sys
sys.stdout.reconfigure(encoding="utf-8")
CSS = open(sys.argv[1], encoding="utf-8", errors="ignore").read()

def show(sel):
    for b in re.findall(r'(\.'+re.escape(sel)+r'\b[^{}]*)\{([^}]*)\}', CSS):
        print(f"  {b[0].strip()} {{ {b[1].strip()[:120]} }}")

groups = {
  "유튜브(좌우 레이아웃)": ["n_yt_content","n_yt_main_video","n_yt_sub_list","n_yt_sub_item","n_yt_sub_img","n_yt_sub_text","n_yt_channel_btn","n_yt_main_title","n_yt_sub_count"],
  "히스토리(좌우)": ["n_history_left","n_history_right","n_history_slider","n_history_card","n_history_img","n_history_main_title","n_history_more"],
  "인포": ["n_info_section","n_info_left","n_info_right","n_info_map","n_info_title","n_info_row"],
  "시그니처/포인트/뷰 카드": ["n_sig_card_inner","n_sig_overlay","n_sig_card_title","n_point_card_inner","n_point_overlay","n_point_text","n_view_card_inner","n_view_overlay","n_view_card_title"],
  "3대원칙 카드": ["n_rule_card","n_rule_img_wrap","n_rule_title_overlay"],
  "타이틀 공통(w_800/w_300)": ["w_800","w_300","n_sig_main_title","n_point_main_title","n_view_main_title"],
  "히어로": ["hero_video","n_hero","n_video_ratio_container"],
}
for g, sels in groups.items():
    print("="*66); print(g); print("="*66)
    for s in sels: show(s)
    print()
