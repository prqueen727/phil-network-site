/**
 * supabase.ts — 클라이언트 2종 (anon = 프론트/읽기, service_role = 서버/쓰기)
 * ------------------------------------------------------------------
 * ★ service_role 키는 절대 브라우저 번들에 넣지 마라 (NEXT_PUBLIC_ 접두어 금지).
 *   06 §1 규칙 3: service_role은 서버 전용. RLS를 우회하므로 노출 시 데이터 전체 유출.
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!

/** 프론트/공개 읽기용 — RLS 적용됨 (published만 보임) */
export function anonClient() {
  return createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

/** 서버 전용 — RLS 우회. 스케줄러/저장 라우트에서만 import. */
export function serviceClient() {
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })
}
