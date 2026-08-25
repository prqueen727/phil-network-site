"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const TARGET_OPTIONS = [
  { group: "병원소개(/about)", options: [
    { value: "page_image:about_overview", label: "Overview 섹션 이미지" },
    { value: "page_image:hero_about", label: "상단(히어로) 배경" },
  ] },
  { group: "윤제필 병원장(/network/director)", options: [
    { value: "page_image:hero_director", label: "상단(히어로) 배경" },
    { value: "staff_photo:yoon-jepil", label: "윤제필 병원장 사진" },
  ] },
  { group: "지점별 병원장 사진", options: [
    { value: "staff_photo:yeom-seongyu", label: "염선규 (청주) 병원장 사진" },
    { value: "staff_photo:an-jihoon", label: "안지훈 (성동) 병원장 사진" },
    { value: "staff_photo:lee-hyunho", label: "이현호 (충무로) 병원장 사진" },
  ] },
  { group: "그 외 서브페이지 상단 배경", options: [
    { value: "page_image:hero_branches", label: "지점안내(/branches) 상단 배경" },
    { value: "page_image:hero_media", label: "미디어게시판(/media) 상단 배경" },
    { value: "page_image:hero_contact", label: "오시는 길(/contact) 상단 배경" },
  ] },
  { group: "메인 — 주요 진료 분야 카드 사진", options: [
    { value: "page_image:care_01", label: "① 비수술 척추·관절 치료" },
    { value: "page_image:care_02", label: "② 통합 면역·암 치료" },
    { value: "page_image:care_03", label: "③ 수술 후 재활치료" },
    { value: "page_image:care_04", label: "④ 교통사고 후유증" },
    { value: "page_image:care_05", label: "⑤ 뇌건강센터" },
    { value: "page_image:care_06", label: "⑥ 산업재해" },
  ] },
  { group: "기타", options: [
    { value: "none", label: "적용 없음 (미디어 라이브러리에만 저장)" },
  ] },
];

export function MediaUploadForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const file = fileRef.current?.files?.[0];
    if (!file) return setMessage({ ok: false, text: "파일을 선택해 주세요." });

    setLoading(true);
    setMessage(null);
    const formData = new FormData(form);
    formData.set("file", file);

    const res = await fetch("/api/admin/media/upload", { method: "POST", body: formData });
    const data = await res.json();
    setLoading(false);

    if (!data.ok) {
      setMessage({ ok: false, text: data.error ?? "업로드에 실패했습니다." });
      return;
    }
    setMessage({ ok: true, text: "업로드 완료. 사이트에 바로 반영됩니다." });
    form.reset();
    router.refresh();
  }

  return (
    <form className="admin-form media-upload-form" onSubmit={handleSubmit}>
      <label>
        이미지 파일 (jpg·png·webp)
        <input ref={fileRef} type="file" name="file" accept="image/jpeg,image/png,image/webp" required />
      </label>
      <label>
        대체텍스트(alt) — 이미지 내용을 설명하는 문구, 필수
        <input type="text" name="alt" placeholder="예: 청주필한방병원 진료 공간" required />
      </label>
      <label>
        적용 위치
        <select name="target" defaultValue="none">
          {TARGET_OPTIONS.map((group) => (
            <optgroup label={group.group} key={group.group}>
              {group.options.map((opt) => (
                <option value={opt.value} key={opt.value}>{opt.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      {message && (
        <p style={{ color: message.ok ? "#2f6b4f" : "#b3273f", fontSize: 13 }}>{message.text}</p>
      )}
      <button className="button button-dark" type="submit" disabled={loading}>
        {loading ? "업로드 중…" : "업로드"}
      </button>
    </form>
  );
}
