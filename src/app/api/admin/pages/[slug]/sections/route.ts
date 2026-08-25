import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdminApi } from "@/lib/admin-auth";

const VALID_KINDS = new Set(["text", "quote", "cards", "timeline", "facts"]);

/** 새 섹션 추가 — 맨 뒤(sort_order 최대값+1)에 붙인다. */
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const { slug } = await params;
  const body = await request.json();
  const kind = String(body.kind ?? "");
  if (!VALID_KINDS.has(kind)) {
    return NextResponse.json({ ok: false, error: "알 수 없는 섹션 종류입니다." }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { data: page, error: pageError } = await admin
    .from("site_pages")
    .select("id")
    .eq("slug", slug)
    .single();
  if (pageError || !page) {
    return NextResponse.json({ ok: false, error: "페이지를 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: maxRow } = await admin
    .from("page_sections")
    .select("sort_order")
    .eq("page_id", page.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSortOrder = (maxRow?.sort_order ?? -1) + 1;

  const { data: section, error } = await admin
    .from("page_sections")
    .insert({
      page_id: page.id,
      kind,
      heading: body.heading ?? null,
      data: body.data ?? {},
      sort_order: nextSortOrder,
      is_visible: true,
    })
    .select("*")
    .single();

  if (error || !section) {
    return NextResponse.json({ ok: false, error: error?.message ?? "생성 실패" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, section });
}
