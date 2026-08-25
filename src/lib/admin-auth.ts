import { NextResponse } from "next/server";
import { supabaseServerSession } from "@/lib/supabase/server";

/**
 * API 라우트 공용 관리자 인증 확인. 로그인 + profiles.is_admin을 확인하고,
 * 실패 시 그대로 반환할 수 있는 NextResponse를 돌려준다.
 * 사용법: const { response } = await requireAdminApi(); if (response) return response;
 */
export async function requireAdminApi(): Promise<{ response: NextResponse | null; userId?: string }> {
  const session = await supabaseServerSession();
  const { data: { user } } = await session.auth.getUser();
  if (!user) {
    return { response: NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 }) };
  }
  const { data: profile } = await session.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) {
    return { response: NextResponse.json({ ok: false, error: "관리자만 가능합니다." }, { status: 403 }) };
  }
  return { response: null, userId: user.id };
}
