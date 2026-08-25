import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseServerSession } from "@/lib/supabase/server";
import { uploadToR2 } from "@/lib/r2";
import { readImageDimensions } from "@/lib/image-dimensions";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const PAGE_IMAGE_KEYS = new Set([
  "hero_about", "hero_director", "hero_branches", "hero_media", "hero_contact", "about_overview",
  "care_01", "care_02", "care_03", "care_04", "care_05", "care_06",
]);
const STAFF_SLUGS = new Set(["yoon-jepil", "yeom-seongyu", "an-jihoon", "lee-hyunho"]);

export async function POST(request: Request) {
  const session = await supabaseServerSession();
  const { data: { user } } = await session.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
  const { data: profile } = await session.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return NextResponse.json({ ok: false, error: "관리자만 업로드할 수 있습니다." }, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file");
  const alt = String(formData.get("alt") ?? "").trim();
  const target = String(formData.get("target") ?? "none");

  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "파일이 없습니다." }, { status: 400 });
  if (!alt) return NextResponse.json({ ok: false, error: "대체텍스트(alt)는 필수입니다." }, { status: 400 });
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) return NextResponse.json({ ok: false, error: "jpg·png·webp 파일만 업로드할 수 있습니다." }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const dimensions = readImageDimensions(buffer);
  const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const publicUrl = await uploadToR2({ key, body: buffer, contentType: file.type });

  const admin = supabaseAdmin();
  const { data: media, error: mediaError } = await admin
    .from("media")
    .insert({ alt, storage_path: publicUrl, width: dimensions?.width ?? null, height: dimensions?.height ?? null })
    .select("id, storage_path, alt")
    .single();
  if (mediaError || !media) {
    return NextResponse.json({ ok: false, error: `미디어 저장 실패: ${mediaError?.message}` }, { status: 500 });
  }

  if (target.startsWith("page_image:")) {
    const pageKey = target.slice("page_image:".length);
    if (!PAGE_IMAGE_KEYS.has(pageKey)) {
      return NextResponse.json({ ok: false, error: "알 수 없는 페이지 위치입니다." }, { status: 400 });
    }
    const { error } = await admin
      .from("page_images")
      .upsert({ page_key: pageKey, media_id: media.id, url: publicUrl, alt, updated_at: new Date().toISOString() });
    if (error) return NextResponse.json({ ok: false, error: `페이지 이미지 지정 실패: ${error.message}` }, { status: 500 });
  } else if (target.startsWith("staff_photo:")) {
    const slug = target.slice("staff_photo:".length);
    if (!STAFF_SLUGS.has(slug)) {
      return NextResponse.json({ ok: false, error: "알 수 없는 병원장입니다." }, { status: 400 });
    }
    const { error } = await admin.from("staff").update({ photo_url: publicUrl }).eq("slug", slug);
    if (error) return NextResponse.json({ ok: false, error: `병원장 사진 지정 실패: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, url: publicUrl, mediaId: media.id });
}
