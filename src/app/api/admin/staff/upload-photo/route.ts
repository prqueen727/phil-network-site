import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { uploadToR2 } from "@/lib/r2";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** 의료진 사진 업로드 — staff.photo_url은 media 테이블을 거치지 않는 단순 URL 컬럼이라 R2 업로드만 하고 URL을 돌려준다. */
export async function POST(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "파일이 없습니다." }, { status: 400 });
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ ok: false, error: "jpg·png·webp 파일만 업로드할 수 있습니다." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `uploads/staff/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const publicUrl = await uploadToR2({ key, body: buffer, contentType: file.type });

  return NextResponse.json({ ok: true, url: publicUrl });
}
