import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdminApi } from "@/lib/admin-auth";

const EDITABLE_FIELDS = ["title", "meta_description", "eyebrow", "hero_title", "hero_intro", "is_published"] as const;

/** 페이지 기본정보(eyebrow/hero_title/hero_intro 등) 수정. */
export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const { slug } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  for (const key of EDITABLE_FIELDS) {
    if (key in body) updates[key] = body[key];
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "변경할 값이 없습니다." }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { error } = await admin.from("site_pages").update(updates).eq("slug", slug);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
