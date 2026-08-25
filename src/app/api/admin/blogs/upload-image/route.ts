import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { uploadToR2 } from "@/lib/r2";
import { readImageDimensions } from "@/lib/image-dimensions";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** 칼럼 대표 이미지 전용 업로드 — alt 필수. media 행만 만들고 { mediaId, url }을 돌려준다(지정 위치 없음). */
export async function POST(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const formData = await request.formData();
  const file = formData.get("file");
  const alt = String(formData.get("alt") ?? "").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "파일이 없습니다." }, { status: 400 });
  }
  if (!alt) {
    return NextResponse.json({ ok: false, error: "대체텍스트(alt)는 필수입니다." }, { status: 400 });
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ ok: false, error: "jpg·png·webp 파일만 업로드할 수 있습니다." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dimensions = readImageDimensions(buffer);
  const key = `uploads/blog/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const publicUrl = await uploadToR2({ key, body: buffer, contentType: file.type });

  const admin = supabaseAdmin();
  const { data: media, error } = await admin
    .from("media")
    .insert({ alt, storage_path: publicUrl, width: dimensions?.width ?? null, height: dimensions?.height ?? null })
    .select("id, storage_path, alt")
    .single();
  if (error || !media) {
    return NextResponse.json({ ok: false, error: `미디어 저장 실패: ${error?.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, mediaId: media.id, url: media.storage_path, alt: media.alt });
}
