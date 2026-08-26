import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { buildBlogRow, MissingFeaturedImageError } from "@/lib/blog-save";

/** 기존 칼럼 글 수정. body는 POST /api/admin/blogs와 동일 + 동일한 발행/alt 가드 적용. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const admin = supabaseAdmin();

  const { data: existing, error: existingError } = await admin
    .from("blogs")
    .select("id, slug, published_at")
    .eq("id", id)
    .single();
  if (existingError || !existing) {
    return NextResponse.json({ ok: false, error: "글을 찾을 수 없습니다." }, { status: 404 });
  }

  try {
    const row = await buildBlogRow(admin, {
      title: String(body.title ?? ""),
      slug: body.slug ? String(body.slug) : existing.slug,
      excerpt: body.excerpt ? String(body.excerpt) : undefined,
      sections: Array.isArray(body.sectionsHtml) ? body.sectionsHtml : [],
      authorId: String(body.authorId ?? ""),
      featuredImageId: body.featuredImageId ? String(body.featuredImageId) : null,
      bodyImageId: body.bodyImageId ? String(body.bodyImageId) : null,
      publish: !!body.publish,
      existingPublishedAt: existing.published_at,
    });

    if (row.slug !== existing.slug) {
      const { data: dup } = await admin.from("blogs").select("id").eq("slug", row.slug).neq("id", id).maybeSingle();
      if (dup) row.slug = `${row.slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const { data, error } = await admin.from("blogs").update(row).eq("id", id).select("id, slug").single();
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

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const { id } = await params;
  const admin = supabaseAdmin();
  const { error } = await admin.from("blogs").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ ok: false, error: `삭제 실패: ${error.message}` }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
