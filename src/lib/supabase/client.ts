"use client";

import { createBrowserClient } from "@supabase/ssr";

/** 브라우저 전용 — 관리자 로그인 세션 관리에 사용. */
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
