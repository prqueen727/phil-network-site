"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Vercel 서버리스 함수 요청 본문 한도(약 4.5MB)보다 여유를 두고 잡은 클라이언트 사전 검사 값.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export type EditableStaff = {
  id: string;
  name: string;
  slug: string | null;
  job_title: string | null;
  bio: string | null;
  specialty: string | null;
  alumni_of: string | null;
  profile_url: string | null;
  photo_url: string | null;
  career: { line: string }[] | null;
  same_as: { url: string }[] | null;
};

/** career/same_as jsonb 배열 <-> 줄바꿈 구분 텍스트 상호 변환. */
function careerToText(career: EditableStaff["career"]): string {
  return (career ?? []).map((c) => c.line).join("\n");
}
function textToCareer(text: string): { line: string }[] {
  return text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean).map((line) => ({ line }));
}
function sameAsToText(sameAs: EditableStaff["same_as"]): string {
  return (sameAs ?? []).map((s) => s.url).join("\n");
}
function textToSameAs(text: string): { url: string }[] {
  return text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean).map((url) => ({ url }));
}

export function StaffEditor({ staff }: { staff: EditableStaff | null }) {
  const router = useRouter();

  const [name, setName] = useState(staff?.name ?? "");
  const [slug, setSlug] = useState(staff?.slug ?? "");
  const [jobTitle, setJobTitle] = useState(staff?.job_title ?? "");
  const [bio, setBio] = useState(staff?.bio ?? "");
  const [specialty, setSpecialty] = useState(staff?.specialty ?? "");
  const [alumniOf, setAlumniOf] = useState(staff?.alumni_of ?? "");
  const [profileUrl, setProfileUrl] = useState(staff?.profile_url ?? "");
  const [careerText, setCareerText] = useState(careerToText(staff?.career ?? null));
  const [sameAsText, setSameAsText] = useState(sameAsToText(staff?.same_as ?? null));

  const [photoUrl, setPhotoUrl] = useState<string | null>(staff?.photo_url ?? null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoMsg, setPhotoMsg] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function uploadPhoto() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setPhotoMsg("파일을 선택해 주세요.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setPhotoMsg(`파일이 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)}MB). 4MB 이하로 압축한 뒤 다시 시도해 주세요.`);
      return;
    }
    setPhotoUploading(true);
    setPhotoMsg(null);
    const formData = new FormData();
    formData.set("file", file);
    try {
      const res = await fetch("/api/admin/staff/upload-photo", { method: "POST", body: formData });
      const json = await res.json();
      if (!json.ok) {
        setPhotoMsg(json.error ?? "업로드에 실패했습니다.");
        return;
      }
      setPhotoUrl(json.url);
      setPhotoMsg("업로드 완료.");
    } catch {
      setPhotoMsg("업로드에 실패했습니다. 파일 용량이 너무 크거나 네트워크 문제일 수 있습니다.");
    } finally {
      setPhotoUploading(false);
    }
  }

  async function save() {
    if (!name.trim()) {
      setSaveMsg({ ok: false, text: "이름을 입력해 주세요." });
      return;
    }
    setSaving(true);
    setSaveMsg(null);

    const payload = {
      name: name.trim(),
      slug: slug.trim() || null,
      jobTitle: jobTitle.trim() || null,
      bio: bio.trim() || null,
      specialty: specialty.trim() || null,
      alumniOf: alumniOf.trim() || null,
      profileUrl: profileUrl.trim() || null,
      photoUrl,
      career: textToCareer(careerText),
      sameAs: textToSameAs(sameAsText),
    };

    const url = staff ? `/api/admin/staff/${staff.id}` : "/api/admin/staff";
    const method = staff ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setSaving(false);

    if (!json.ok) {
      setSaveMsg({ ok: false, text: json.error ?? "저장에 실패했습니다." });
      return;
    }
    setSaveMsg({ ok: true, text: "저장되었습니다." });
    if (!staff) {
      router.push(`/admin/staff/${json.id}/edit`);
    } else {
      router.refresh();
    }
  }

  return (
    <div style={{ marginTop: 30 }}>
      <div className="admin-form">
        <label>
          이름
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 김철수" />
        </label>
        <label>
          슬러그(URL, 영문/숫자/하이픈만, 선택) — 특정 페이지 연결에만 쓰입니다, 비워둬도 됩니다
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="예: kim-chulsoo" />
        </label>
        <label>
          직책
          <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="예: 청주필한방병원 병원장" />
        </label>
        <label>
          전문분야
          <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="예: 척추·관절 질환" />
        </label>
        <label>
          출신/학력
          <input value={alumniOf} onChange={(e) => setAlumniOf(e.target.value)} placeholder="예: 경희대학교 한의학과" />
        </label>
        <label>
          소개(약력)
          <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
        </label>
        <label>
          경력 — 한 줄에 하나씩. <code>[태그] 내용</code> 형식으로 쓰면 태그별로 묶여 표시됩니다
          <textarea
            rows={5}
            value={careerText}
            onChange={(e) => setCareerText(e.target.value)}
            placeholder={"[학력] 경희대학교 한의학과 졸업\n[경력] 필한방병원 대표원장"}
          />
        </label>
        <label>
          외부 프로필 링크(sameAs) — 한 줄에 하나씩, 본인이 운영하는 링크만(LinkedIn·유튜브 등)
          <textarea rows={2} value={sameAsText} onChange={(e) => setSameAsText(e.target.value)} placeholder="https://..." />
        </label>
        <label>
          대표 프로필 URL(선택)
          <input value={profileUrl} onChange={(e) => setProfileUrl(e.target.value)} placeholder="https://..." />
        </label>
      </div>

      <div className="admin-form admin-section-card">
        <b>사진</b>
        {photoUrl && (
          <div className="admin-image-preview">
            {/* 관리자 미리보기 — 임의 R2 도메인이라 next/image 미사용 */}
            <img src={photoUrl} alt={name || ""} />
          </div>
        )}
        <label>
          사진 파일 (jpg·png·webp)
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" />
        </label>
        {photoMsg && <p style={{ color: photoMsg === "업로드 완료." ? "#2f6b4f" : "#b3273f", fontSize: 13 }}>{photoMsg}</p>}
        <button type="button" className="admin-mini-button" disabled={photoUploading} onClick={uploadPhoto}>
          {photoUploading ? "업로드 중…" : "사진 업로드"}
        </button>
      </div>

      <div className="admin-form" style={{ marginTop: 40 }}>
        {saveMsg && <p style={{ color: saveMsg.ok ? "#2f6b4f" : "#b3273f", fontSize: 13, marginBottom: 12 }}>{saveMsg.text}</p>}
        <button type="button" className="button button-dark" disabled={saving} onClick={save}>
          {saving ? "저장 중…" : "저장"}
        </button>
      </div>
    </div>
  );
}
