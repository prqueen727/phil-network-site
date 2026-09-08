import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { buildBlogRow, MissingFeaturedImageError } from "@/lib/blog-save";

/** 새 칼럼(blogs) 글 생성. body: { title, slug?, excerpt?, sectionsHtml: {heading?,body}[], authorId, featuredImageId?, publish } */
export async function POST(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const body = await request.json().catch(() => ({}));
  const admin = supabaseAdmin();

  try {
    const row = await buildBlogRow(admin, {
      title: String(body.title ?? ""),
      slug: body.slug ? String(body.slug) : undefined,
      excerpt: body.excerpt ? String(body.excerpt) : undefined,
      sections: Array.isArray(body.sectionsHtml) ? body.sectionsHtml : [],
      authorId: String(body.authorId ?? ""),
      featuredImageId: body.featuredImageId ? String(body.featuredImageId) : null,
      bodyImageId: body.bodyImageId ? String(body.bodyImageId) : null,
      publish: !!body.publish,
    });

    // slug 유일성 보정(자동생성/수동입력 모두 중복 가능) — 중복이면 짧은 랜덤 접미사를 붙인다.
    const { data: existing } = await admin.from("blogs").select("id").eq("slug", row.slug).maybeSingle();
    if (existing) {
      row.slug = `${row.slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const { data, error } = await admin.from("blogs").insert(row).select("id, slug").single();
    if (error || !data) {
      return NextResponse.json({ ok: false, error: `저장 실패: ${error?.message}` }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
  } catch (e) {
    if (e instanceof MissingFeaturedImageError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    }
    const message = e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
