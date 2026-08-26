"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Staff } from "@/lib/data/staff";

type MediaRef = { id: string; storage_path: string | null; alt: string | null } | null;

// Vercel 서버리스 함수 요청 본문 한도(약 4.5MB)보다 여유를 두고 잡은 클라이언트 사전 검사 값.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export type EditableBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  sections_html: { heading?: string; html?: string }[] | null;
  author_id: string | null;
  featured_image_id: string | null;
  featured_image: MediaRef;
  body_image_id: string | null;
  body_image: MediaRef;
};

type SectionBlock = { heading: string; body: string };

/** 저장 시 만든 <p>...</p> html을 편집용 plain text로 되돌린다(우리 저장 로직의 역변환). */
function htmlToPlainText(html: string): string {
  return html
    .split(/<\/p>/gi)
    .map((s) => s.replace(/<p[^>]*>/gi, "").trim())
    .filter(Boolean)
    .map((s) => s.replace(/<\/?strong>/gi, "**"))
    .map((s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"))
    .join("\n");
}

function initialSections(post: EditableBlogPost | null): SectionBlock[] {
  if (post?.sections_html && post.sections_html.length > 0) {
    return post.sections_html.map((s) => ({
      heading: s.heading ?? "",
      body: htmlToPlainText(s.html ?? ""),
    }));
  }
  return [{ heading: "", body: "" }];
}

/** "## 소제목" 줄을 기준으로 붙여넣은 글 전체를 섹션 배열로 나눈다. 그런 줄이 없으면 통째로 섹션 1개. */
function parseDraftIntoSections(text: string): SectionBlock[] {
  const lines = text.split(/\r?\n/);
  const sections: SectionBlock[] = [];
  let heading = "";
  let bodyLines: string[] = [];

  function flush() {
    const body = bodyLines.join("\n").trim();
    if (heading || body) sections.push({ heading, body });
  }

  for (const line of lines) {
    const match = line.match(/^#{1,4}\s*(.+)$/);
    if (match) {
      flush();
      heading = match[1].trim();
      bodyLines = [];
    } else {
      bodyLines.push(line);
    }
  }
  flush();

  return sections.length > 0 ? sections : [{ heading: "", body: text.trim() }];
}

export function BlogEditor({ staff, post }: { staff: Staff[]; post: EditableBlogPost | null }) {
  const router = useRouter();

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [authorId, setAuthorId] = useState(post?.author_id ?? staff[0]?.id ?? "");
  const [sections, setSections] = useState<SectionBlock[]>(initialSections(post));
  const [draftText, setDraftText] = useState("");

  const [imageMediaId, setImageMediaId] = useState<string | null>(post?.featured_image_id ?? null);
  const [imageUrl, setImageUrl] = useState<string | null>(post?.featured_image?.storage_path ?? null);
  const [imageAlt, setImageAlt] = useState(post?.featured_image?.alt ?? "");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageMsg, setImageMsg] = useState<string | null>(null);

  const [bodyImageMediaId, setBodyImageMediaId] = useState<string | null>(post?.body_image_id ?? null);
  const [bodyImageUrl, setBodyImageUrl] = useState<string | null>(post?.body_image?.storage_path ?? null);
  const [bodyImageAlt, setBodyImageAlt] = useState(post?.body_image?.alt ?? "");
  const bodyFileRef = useRef<HTMLInputElement | null>(null);
  const [bodyImageUploading, setBodyImageUploading] = useState(false);
  const [bodyImageMsg, setBodyImageMsg] = useState<string | null>(null);

  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [publishBlocked, setPublishBlocked] = useState<string | null>(null);

  function updateSection(index: number, patch: Partial<SectionBlock>) {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }
  function addSection() {
    setSections((prev) => [...prev, { heading: "", body: "" }]);
  }
  function removeSection(index: number) {
    setSections((prev) => prev.filter((_, i) => i !== index));
  }
  function importDraft() {
    if (!draftText.trim()) return;
    const hasExistingContent = sections.some((s) => s.heading.trim() || s.body.trim());
    if (hasExistingContent && !window.confirm("기존 섹션 내용을 지우고 붙여넣은 글로 바꿀까요?")) {
      return;
    }
    setSections(parseDraftIntoSections(draftText));
    setDraftText("");
  }

  function moveSection(index: number, direction: "up" | "down") {
    setSections((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function uploadImage() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setImageMsg("파일을 선택해 주세요.");
      return;
    }
    const altValue = imageAlt.trim();
    if (!altValue) {
      setImageMsg("대체텍스트(alt)를 입력해 주세요.");
      return;
    }
    // Vercel 서버리스 함수는 요청 본문이 약 4.5MB를 넘으면 거부한다 — 미리 걸러서
    // "업로드 중…"에 멈춰있는 대신 바로 알려준다.
    if (file.size > MAX_UPLOAD_BYTES) {
      setImageMsg(`파일이 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)}MB). 4MB 이하로 압축한 뒤 다시 시도해 주세요.`);
      return;
    }
    setImageUploading(true);
    setImageMsg(null);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("alt", altValue);
    try {
      const res = await fetch("/api/admin/blogs/upload-image", { method: "POST", body: formData });
      const json = await res.json();
      if (!json.ok) {
        setImageMsg(json.error ?? "업로드에 실패했습니다.");
        return;
      }
      setImageMediaId(json.mediaId);
      setImageUrl(json.url);
      setPublishBlocked(null);
      setImageMsg("업로드 완료.");
    } catch {
      setImageMsg("업로드에 실패했습니다. 파일 용량이 너무 크거나 네트워크 문제일 수 있습니다.");
    } finally {
      setImageUploading(false);
    }
  }

  async function uploadBodyImage() {
    const file = bodyFileRef.current?.files?.[0];
    if (!file) {
      setBodyImageMsg("파일을 선택해 주세요.");
      return;
    }
    const altValue = bodyImageAlt.trim();
    if (!altValue) {
      setBodyImageMsg("대체텍스트(alt)를 입력해 주세요.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setBodyImageMsg(`파일이 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)}MB). 4MB 이하로 압축한 뒤 다시 시도해 주세요.`);
      return;
    }
    setBodyImageUploading(true);
    setBodyImageMsg(null);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("alt", altValue);
    try {
      const res = await fetch("/api/admin/blogs/upload-image", { method: "POST", body: formData });
      const json = await res.json();
      if (!json.ok) {
        setBodyImageMsg(json.error ?? "업로드에 실패했습니다.");
        return;
      }
      setBodyImageMediaId(json.mediaId);
      setBodyImageUrl(json.url);
      setBodyImageMsg("업로드 완료.");
    } catch {
      setBodyImageMsg("업로드에 실패했습니다. 파일 용량이 너무 크거나 네트워크 문제일 수 있습니다.");
    } finally {
      setBodyImageUploading(false);
    }
  }

  function removeBodyImage() {
    setBodyImageMediaId(null);
    setBodyImageUrl(null);
    setBodyImageAlt("");
    setBodyImageMsg(null);
  }

  async function save(publish: boolean) {
    if (!title.trim()) {
      setSaveMsg({ ok: false, text: "제목을 입력해 주세요." });
      return;
    }
    if (!authorId) {
      setSaveMsg({ ok: false, text: "작성자를 선택해 주세요." });
      return;
    }
    // 02 설계서 운영원칙: 에러를 그대로 노출하지 말고 UI에서 먼저 막는다.
    if (publish && !imageMediaId) {
      setPublishBlocked("발행하려면 대표 이미지가 필요합니다. 위에서 이미지를 업로드한 뒤 다시 시도해 주세요.");
      return;
    }
    setPublishBlocked(null);
    setSaving(publish ? "publish" : "draft");
    setSaveMsg(null);

    const payload = {
      title,
      slug: slug.trim() || undefined,
      excerpt: excerpt.trim() || undefined,
      sectionsHtml: sections.map((s) => ({ heading: s.heading, body: s.body })),
      authorId,
      featuredImageId: imageMediaId,
      bodyImageId: bodyImageMediaId,
      publish,
    };

    const url = post ? `/api/admin/blogs/${post.id}` : "/api/admin/blogs";
    const method = post ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setSaving(null);

    if (!json.ok) {
      setSaveMsg({ ok: false, text: json.error ?? "저장에 실패했습니다." });
      return;
    }
    setSaveMsg({ ok: true, text: publish ? "발행되었습니다." : "임시저장(초안)으로 저장되었습니다." });
    if (!post) {
      router.push(`/admin/blogs/${json.id}/edit`);
    } else {
      if (json.slug) setSlug(json.slug);
      router.refresh();
    }
  }

  return (
    <div style={{ marginTop: 30 }}>
      <div className="admin-form">
        <label>
          제목
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="글 제목" />
        </label>
        <label>
          슬러그(URL, 영문/숫자/하이픈만) — 비워두면 저장 시 자동 생성됩니다
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="예: spine-care-tips (한글 slug는 사용할 수 없습니다)" />
        </label>
        <label>
          요약(excerpt) — 비워두면 본문 첫 섹션 앞부분으로 자동 생성됩니다
          <textarea rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </label>
        <label>
          작성자
          <select value={authorId} onChange={(e) => setAuthorId(e.target.value)}>
            {staff.length === 0 && <option value="">등록된 병원장이 없습니다</option>}
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.job_title ? ` · ${s.job_title}` : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="admin-form admin-section-card">
        <b>대표 이미지</b>
        {imageUrl && (
          <div className="admin-image-preview">
            {/* 관리자 미리보기 — 임의 R2 도메인이라 next/image 미사용 */}
            <img src={imageUrl} alt={imageAlt || ""} />
          </div>
        )}
        <label>
          이미지 파일 (jpg·png·webp)
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" />
        </label>
        <label>
          대체텍스트(alt) — 이미지 내용을 설명하는 문구, 필수
          <input value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder="예: 척추 통증 진료 상담 장면" />
        </label>
        {imageMsg && <p style={{ color: imageMsg === "업로드 완료." ? "#2f6b4f" : "#b3273f", fontSize: 13 }}>{imageMsg}</p>}
        <button type="button" className="admin-mini-button" disabled={imageUploading} onClick={uploadImage}>
          {imageUploading ? "업로드 중…" : "이미지 업로드"}
        </button>
      </div>

      <div className="admin-form admin-section-card">
        <b>본문 이미지 (선택)</b>
        <p style={{ fontSize: 13, color: "#756b6d", margin: "4px 0 12px" }}>
          대표 이미지(카드용)와 별개로, 글 본문 안에 1장 삽입됩니다. 네이버 등 외부 노출 시 글이 텍스트로만 안 보이게 도와줍니다.
        </p>
        {bodyImageUrl && (
          <div className="admin-image-preview">
            {/* 관리자 미리보기 — 임의 R2 도메인이라 next/image 미사용 */}
            <img src={bodyImageUrl} alt={bodyImageAlt || ""} />
          </div>
        )}
        <label>
          이미지 파일 (jpg·png·webp)
          <input ref={bodyFileRef} type="file" accept="image/jpeg,image/png,image/webp" />
        </label>
        <label>
          대체텍스트(alt) — 이미지 내용을 설명하는 문구, 필수
          <input value={bodyImageAlt} onChange={(e) => setBodyImageAlt(e.target.value)} placeholder="예: 침 치료 과정" />
        </label>
        {bodyImageMsg && <p style={{ color: bodyImageMsg === "업로드 완료." ? "#2f6b4f" : "#b3273f", fontSize: 13 }}>{bodyImageMsg}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="admin-mini-button" disabled={bodyImageUploading} onClick={uploadBodyImage}>
            {bodyImageUploading ? "업로드 중…" : "이미지 업로드"}
          </button>
          {bodyImageUrl && (
            <button type="button" className="admin-mini-button admin-mini-button-danger" onClick={removeBodyImage}>
              이미지 제거
            </button>
          )}
        </div>
      </div>

      <div className="admin-form admin-section-card">
        <b>AI 초안 붙여넣기</b>
        <p style={{ fontSize: 13, color: "#756b6d", margin: "4px 0 12px" }}>
          AI가 만든 글 전체를 통째로 붙여넣으세요. <code>## 소제목</code>처럼 쓴 줄은 자동으로 섹션 소제목이 되고, 빈 줄로
          구분된 문단은 그대로 유지됩니다. 아래 섹션에서 <code>**이렇게**</code> 쓰면 굵은 글씨로 표시됩니다.
        </p>
        <textarea
          rows={8}
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          placeholder={"## 원인\n허리디스크는...\n\n## 치료법\n..."}
        />
        <button type="button" className="admin-mini-button" disabled={!draftText.trim()} onClick={importDraft}>
          섹션으로 나누기
        </button>
      </div>

      <h2 style={{ fontSize: 18, margin: "40px 0 16px" }}>본문 섹션 ({sections.length}개)</h2>

      {sections.map((section, idx) => (
        <div className="admin-form admin-section-card" key={idx}>
          <div className="admin-section-card-head">
            <b>섹션 {idx + 1}</b>
            <div className="admin-section-card-actions">
              <button type="button" className="admin-mini-button" disabled={idx === 0} onClick={() => moveSection(idx, "up")}>
                ↑ 위로
              </button>
              <button type="button" className="admin-mini-button" disabled={idx === sections.length - 1} onClick={() => moveSection(idx, "down")}>
                ↓ 아래로
              </button>
            </div>
          </div>
          <label>
            소제목(선택)
            <input value={section.heading} onChange={(e) => updateSection(idx, { heading: e.target.value })} />
          </label>
          <label>
            본문 (Enter로 줄바꿈하면 문단이 나뉩니다, <code>**텍스트**</code>는 굵게 표시됩니다)
            <textarea rows={6} value={section.body} onChange={(e) => updateSection(idx, { body: e.target.value })} />
          </label>
          <div className="admin-section-card-foot">
            <button
              type="button"
              className="admin-mini-button admin-mini-button-danger"
              disabled={sections.length <= 1}
              onClick={() => removeSection(idx)}
            >
              섹션 삭제
            </button>
          </div>
        </div>
      ))}

      <button type="button" className="admin-mini-button" onClick={addSection}>
        + 섹션 추가
      </button>

      <div className="admin-form" style={{ marginTop: 40 }}>
        {publishBlocked && <p style={{ color: "#b3273f", fontSize: 13, marginBottom: 12 }}>{publishBlocked}</p>}
        {saveMsg && <p style={{ color: saveMsg.ok ? "#2f6b4f" : "#b3273f", fontSize: 13, marginBottom: 12 }}>{saveMsg.text}</p>}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button type="button" className="button" disabled={saving !== null} onClick={() => save(false)}>
            {saving === "draft" ? "저장 중…" : "임시저장(초안)"}
          </button>
          <button type="button" className="button button-dark" disabled={saving !== null} onClick={() => save(true)}>
            {saving === "publish" ? "저장 중…" : "발행"}
          </button>
        </div>
      </div>
    </div>
  );
}
