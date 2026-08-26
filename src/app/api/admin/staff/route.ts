import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdminApi } from "@/lib/admin-auth";

/** 새 의료진 등록. body: { name, slug?, jobTitle?, bio?, specialty?, alumniOf?, profileUrl?, photoUrl?, career, sameAs } */
export async function POST(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ ok: false, error: "이름을 입력해주세요." }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("staff")
    .insert({
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
    .select("id")
    .single();

  if (error || !data) {
    const message = error?.code === "23505" ? "이미 사용 중인 슬러그입니다." : `저장 실패: ${error?.message}`;
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
  return NextResponse.json({ ok: true, id: data.id });
}
