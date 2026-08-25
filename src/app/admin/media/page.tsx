import { redirect } from "next/navigation";
import Image from "next/image";
import { supabaseServerSession } from "@/lib/supabase/server";
import { MediaUploadForm } from "@/components/MediaUploadForm";

const PAGE_IMAGE_LABELS: Record<string, string> = {
  about_overview: "병원소개 — Overview 이미지",
  hero_about: "병원소개 — 상단 배경",
  hero_director: "윤제필 병원장 — 상단 배경",
  hero_branches: "지점안내 — 상단 배경",
  hero_media: "미디어게시판 — 상단 배경",
  hero_contact: "오시는 길 — 상단 배경",
  care_01: "메인 진료분야 ① 비수술 척추·관절",
  care_02: "메인 진료분야 ② 통합 면역·암",
  care_03: "메인 진료분야 ③ 수술 후 재활",
  care_04: "메인 진료분야 ④ 교통사고 후유증",
  care_05: "메인 진료분야 ⑤ 뇌건강센터",
  care_06: "메인 진료분야 ⑥ 산업재해",
};

const STAFF_LABELS: Record<string, string> = {
  "yoon-jepil": "윤제필 (대전) 병원장 사진",
  "yeom-seongyu": "염선규 (청주) 병원장 사진",
  "an-jihoon": "안지훈 (성동) 병원장 사진",
  "lee-hyunho": "이현호 (충무로) 병원장 사진",
};

export default async function AdminMediaPage() {
  const supabase = await supabaseServerSession();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/admin/login");

  const [{ data: pageImages }, { data: staff }] = await Promise.all([
    supabase.from("page_images").select("page_key, url, alt"),
    supabase.from("staff").select("slug, name, photo_url"),
  ]);

  const pageImageMap = new Map((pageImages ?? []).map((row) => [row.page_key, row]));

  return (
    <main className="admin-page" style={{ alignItems: "flex-start", minHeight: "100vh" }}>
      <div className="admin-panel" style={{ maxWidth: 760 }}>
        <p className="eyebrow">ADMIN MEDIA</p>
        <h1 style={{ fontSize: 36 }}>이미지 관리</h1>
        <p>업로드한 이미지는 지정한 위치에 바로 반영됩니다.</p>

        <MediaUploadForm />

        <h2 style={{ marginTop: 50, fontSize: 18 }}>현재 적용 상태</h2>
        <ul className="media-status-list">
          {Object.entries(PAGE_IMAGE_LABELS).map(([key, label]) => {
            const current = pageImageMap.get(key);
            return (
              <li key={key}>
                {current?.url && (
                  <span className="media-thumb"><Image src={current.url} alt={current.alt ?? ""} fill sizes="64px" style={{ objectFit: "cover" }} /></span>
                )}
                <span>{label}</span>
                <b>{current?.url ? "설정됨" : "미설정"}</b>
              </li>
            );
          })}
          {(staff ?? []).map((s) => (
            <li key={s.slug}>
              {s.photo_url && (
                <span className="media-thumb"><Image src={s.photo_url} alt={s.name} fill sizes="64px" style={{ objectFit: "cover" }} /></span>
              )}
              <span>{STAFF_LABELS[s.slug ?? ""] ?? s.name}</span>
              <b>{s.photo_url ? "설정됨" : "미설정"}</b>
            </li>
          ))}
        </ul>

        <a className="back-link" href="/admin">← 관리자 대시보드</a>
      </div>
    </main>
  );
}
