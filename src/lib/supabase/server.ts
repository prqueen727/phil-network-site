import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

/** 공개 콘텐츠 조회용(SSR) — anon 키, RLS 적용됨(published만 보임). */
export function supabasePublic() {
  return createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
}

/** 서버 전용 — RLS 우회. 관리자 라우트·자동발행 스케줄러에서만 사용. */
export function supabaseAdmin() {
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

/** 서버 컴포넌트/라우트 핸들러 전용 — 쿠키 세션으로 "지금 로그인한 사람이 누구인지" 판별(관리자 로그인 체크용). */
export async function supabaseServerSession() {
  const cookieStore = await cookies();
  return createServerClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component에서 호출 시 무시 가능 — middleware가 세션 갱신을 담당.
        }
      },
    },
  });
}
