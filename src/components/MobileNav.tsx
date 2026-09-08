"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { Branch } from "@/lib/data/branches";

/** 800px 이하 모바일 전용 햄버거 메뉴 — 데스크톱 .main-nav는 그 폭에서 숨겨지고 이걸로 대체된다.
 *  hover 기반 드롭다운은 터치 기기에서 잘리거나 안 열리는 문제가 있어, 탭하면 항목을 평평하게 펼친다. */
export function MobileNav({ branches }: { branches: Branch[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className="mobile-nav-toggle"
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={26} /> : <Menu size={26} />}
      </button>
      {open && (
        <nav className="mobile-nav-panel" aria-label="모바일 메뉴">
          <a href="/about" onClick={close}>필한방병원 소개</a>
          <a href="/network/director" onClick={close}>윤제필 병원장</a>
          <a href="/branches" onClick={close}>지점 안내</a>
          <p className="mobile-nav-group-label">지점 바로가기</p>
          {branches.map((branch) => branch.website_url && (
            <a href={branch.website_url} target="_blank" rel="noreferrer" key={branch.slug} onClick={close}>
              {branch.name}
            </a>
          ))}
          <a href="/media" onClick={close}>미디어게시판</a>
        </nav>
      )}
    </>
  );
}
