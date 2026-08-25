import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdminApi } from "@/lib/admin-auth";

/**
 * 섹션 수정. 두 가지 용도를 겸한다:
 *  - { action: "move", direction: "up"|"down" } → 인접 섹션과 sort_order를 맞바꿔 순서 변경.
 *  - { heading?, data?, is_visible? } → 내용/표시여부 수정(주어진 필드만 반영).
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const { slug, id } = await params;
  const body = await request.json();
  const admin = supabaseAdmin();

  if (body.action === "move") {
    const direction = body.direction === "up" ? "up" : "down";

    const { data: page, error: pageError } = await admin
      .from("site_pages")
      .select("id")
      .eq("slug", slug)
      .single();
    if (pageError || !page) {
      return NextResponse.json({ ok: false, error: "페이지를 찾을 수 없습니다." }, { status: 404 });
    }

    const { data: sections, error } = await admin
      .from("page_sections")
      .select("id, sort_order")
      .eq("page_id", page.id)
      .order("sort_order", { ascending: true });
    if (error || !sections) {
      return NextResponse.json({ ok: false, error: error?.message ?? "조회 실패" }, { status: 500 });
    }

    const index = sections.findIndex((s) => s.id === id);
    if (index === -1) {
      return NextResponse.json({ ok: false, error: "섹션을 찾을 수 없습니다." }, { status: 404 });
    }
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sections.length) {
      return NextResponse.json({ ok: false, error: "더 이상 이동할 수 없습니다." }, { status: 400 });
    }

    const a = sections[index];
    const b = sections[swapIndex];
    const [{ error: err1 }, { error: err2 }] = await Promise.all([
      admin.from("page_sections").update({ sort_order: b.sort_order }).eq("id", a.id),
      admin.from("page_sections").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    if (err1 || err2) {
      return NextResponse.json({ ok: false, error: (err1 ?? err2)?.message }, { status: 500 });
    }

    const { data: refreshed } = await admin
      .from("page_sections")
      .select("*")
      .eq("page_id", page.id)
      .order("sort_order", { ascending: true });

    return NextResponse.json({ ok: true, sections: refreshed ?? [] });
  }

  const updates: Record<string, unknown> = {};
  if ("heading" in body) updates.heading = body.heading;
  if ("data" in body) updates.data = body.data;
  if ("is_visible" in body) updates.is_visible = body.is_visible;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "변경할 값이 없습니다." }, { status: 400 });
  }

  const { error } = await admin.from("page_sections").update(updates).eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

/** 섹션 삭제. 관리자 UI에서 "삭제 확인" 체크박스를 거친 뒤에만 호출된다. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const { id } = await params;
  const admin = supabaseAdmin();
  const { error } = await admin.from("page_sections").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
