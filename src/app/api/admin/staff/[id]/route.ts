import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdminApi } from "@/lib/admin-auth";

/** 기존 의료진 정보 수정. body는 POST /api/admin/staff와 동일. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ ok: false, error: "이름을 입력해주세요." }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { error } = await admin
    .from("staff")
    .update({
      name,
      slug: body.slug ? String(body.slug) : null,
      job_title: body.jobTitle ? String(body.jobTitle) : null,
      bio: body.bio ? String(body.bio) : null,
      specialty: body.specialty ? String(body.specialty) : null,
      alumni_of: body.alumniOf ? String(body.alumniOf) : null,
      profile_url: body.profileUrl ? String(body.profileUrl) : null,
      photo_url: body.photoUrl ? String(body.photoUrl) : null,
      career: Array.isArray(body.career) ? body.career : [],
      same_as: Array.isArray(body.sameAs) ? body.sameAs : [],
    })
    .eq("id", id);

  if (error) {
    const message = error.code === "23505" ? "이미 사용 중인 슬러그입니다." : `저장 실패: ${error.message}`;
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

/** 의료진 삭제 — 이 의료진이 작성한 글이나 지점장으로 지정된 곳이 있으면 DB가 삭제를 막는다(FK 보호). */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const { id } = await params;
  const admin = supabaseAdmin();
  const { error } = await admin.from("staff").delete().eq("id", id);
  if (error) {
    const message = error.code === "23503"
      ? "이 의료진이 작성한 글이 있거나 지점장으로 지정되어 있어 삭제할 수 없습니다. 먼저 해당 글/지점의 작성자·지점장을 변경해주세요."
      : `삭제 실패: ${error.message}`;
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
