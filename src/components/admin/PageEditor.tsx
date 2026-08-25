"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SectionData, SectionKind } from "@/lib/data/pages";
import { SectionFields } from "./SectionFields";

type PageMeta = {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  eyebrow: string | null;
  hero_title: string | null;
  hero_intro: string | null;
  is_published: boolean;
};

type Section = {
  id: string;
  kind: SectionKind;
  heading: string | null;
  data: SectionData;
  sort_order: number;
  is_visible: boolean;
};

const KIND_LABELS: Record<SectionKind, string> = {
  text: "본문 (text)",
  quote: "인용구 (quote)",
  cards: "카드 그룹 (cards)",
  timeline: "연혁 (timeline)",
  facts: "키-값 정보 (facts)",
};

const KIND_ORDER: SectionKind[] = ["text", "quote", "cards", "timeline", "facts"];

function emptyData(kind: SectionKind): SectionData {
  switch (kind) {
    case "text":
      return { paragraphs: [""] };
    case "quote":
      return { quote: "", attribution: "", body: "" };
    case "cards":
      return { columns: 2, items: [{ key: "", title: "", body: "" }] };
    case "timeline":
      return { items: [{ date: "", event: "" }] };
    case "facts":
      return { items: [{ label: "", value: "" }] };
  }
}

export function PageEditor({ page, sections }: { page: PageMeta; sections: Section[] }) {
  const router = useRouter();

  const [meta, setMeta] = useState(page);
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaMsg, setMetaMsg] = useState<string | null>(null);

  const [list, setList] = useState<Section[]>([...sections].sort((a, b) => a.sort_order - b.sort_order));
  const [newKind, setNewKind] = useState<SectionKind>("text");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});
  const [confirmMap, setConfirmMap] = useState<Record<string, boolean>>({});
  const [moveBusy, setMoveBusy] = useState<string | null>(null);

  function updateLocal(id: string, patch: Partial<Section>) {
    setList((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function saveMeta(e: React.FormEvent) {
    e.preventDefault();
    setMetaSaving(true);
    setMetaMsg(null);
    const res = await fetch(`/api/admin/pages/${page.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: meta.title,
        meta_description: meta.meta_description,
        eyebrow: meta.eyebrow,
        hero_title: meta.hero_title,
        hero_intro: meta.hero_intro,
        is_published: meta.is_published,
      }),
    });
    const json = await res.json();
    setMetaSaving(false);
    setMetaMsg(json.ok ? "저장되었습니다." : json.error ?? "저장에 실패했습니다.");
    if (json.ok) router.refresh();
  }

  async function addSection() {
    setAdding(true);
    setAddError(null);
    const res = await fetch(`/api/admin/pages/${page.slug}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: newKind, heading: "", data: emptyData(newKind) }),
    });
    const json = await res.json();
    setAdding(false);
    if (json.ok && json.section) {
      setList((prev) => [...prev, json.section]);
    } else {
      setAddError(json.error ?? "섹션 추가에 실패했습니다.");
    }
  }

  async function saveSection(section: Section) {
    setSavingMap((m) => ({ ...m, [section.id]: true }));
    const res = await fetch(`/api/admin/pages/${page.slug}/sections/${section.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heading: section.heading, data: section.data, is_visible: section.is_visible }),
    });
    const json = await res.json();
    setSavingMap((m) => ({ ...m, [section.id]: false }));
    if (!json.ok) alert(json.error ?? "저장에 실패했습니다.");
    else router.refresh();
  }

  async function toggleVisible(section: Section) {
    const next = !section.is_visible;
    updateLocal(section.id, { is_visible: next });
    const res = await fetch(`/api/admin/pages/${page.slug}/sections/${section.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_visible: next }),
    });
    const json = await res.json();
    if (!json.ok) {
      updateLocal(section.id, { is_visible: !next });
      alert(json.error ?? "변경에 실패했습니다.");
    } else {
      router.refresh();
    }
  }

  async function moveSection(id: string, direction: "up" | "down") {
    setMoveBusy(id);
    const res = await fetch(`/api/admin/pages/${page.slug}/sections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "move", direction }),
    });
    const json = await res.json();
    setMoveBusy(null);
    if (json.ok && json.sections) {
      setList([...json.sections].sort((a: Section, b: Section) => a.sort_order - b.sort_order));
      router.refresh();
    } else {
      alert(json.error ?? "순서 변경에 실패했습니다.");
    }
  }

  async function deleteSection(id: string) {
    const res = await fetch(`/api/admin/pages/${page.slug}/sections/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.ok) {
      setList((prev) => prev.filter((s) => s.id !== id));
      router.refresh();
    } else {
      alert(json.error ?? "삭제에 실패했습니다.");
    }
  }

  return (
    <div style={{ marginTop: 30 }}>
      <form className="admin-form" onSubmit={saveMeta}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>기본 정보</h2>
        <label>
          공개 여부
          <select
            value={meta.is_published ? "1" : "0"}
            onChange={(e) => setMeta((m) => ({ ...m, is_published: e.target.value === "1" }))}
          >
            <option value="1">공개</option>
            <option value="0">비공개</option>
          </select>
        </label>
        <label>
          내부 관리용 제목
          <input value={meta.title} onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))} />
        </label>
        <label>
          eyebrow (상단 작은 라벨)
          <input value={meta.eyebrow ?? ""} onChange={(e) => setMeta((m) => ({ ...m, eyebrow: e.target.value }))} />
        </label>
        <label>
          hero_title (h1, 줄바꿈은 그대로 Enter — 마지막 줄이 강조색으로 표시됩니다)
          <textarea rows={2} value={meta.hero_title ?? ""} onChange={(e) => setMeta((m) => ({ ...m, hero_title: e.target.value }))} />
        </label>
        <label>
          hero_intro (히어로 밑 한 줄 소개)
          <textarea rows={2} value={meta.hero_intro ?? ""} onChange={(e) => setMeta((m) => ({ ...m, hero_intro: e.target.value }))} />
        </label>
        <label>
          meta_description (검색엔진 노출용, 선택)
          <textarea rows={2} value={meta.meta_description ?? ""} onChange={(e) => setMeta((m) => ({ ...m, meta_description: e.target.value }))} />
        </label>
        {metaMsg && <p style={{ color: metaMsg === "저장되었습니다." ? "#2f6b4f" : "#b3273f", fontSize: 13 }}>{metaMsg}</p>}
        <button className="button button-dark" type="submit" disabled={metaSaving}>
          {metaSaving ? "저장 중…" : "기본 정보 저장"}
        </button>
      </form>

      <h2 style={{ fontSize: 18, margin: "44px 0 16px" }}>섹션 ({list.length}개)</h2>

      {list.length === 0 && <p style={{ fontSize: 13, color: "#756b6d" }}>아직 섹션이 없습니다. 아래에서 추가해주세요.</p>}

      {list.map((section, idx) => (
        <div className="admin-form admin-section-card" key={section.id}>
          <div className="admin-section-card-head">
            <b>{KIND_LABELS[section.kind]}</b>
            <div className="admin-section-card-actions">
              <button type="button" className="admin-mini-button" disabled={idx === 0 || moveBusy === section.id} onClick={() => moveSection(section.id, "up")}>
                ↑ 위로
              </button>
              <button type="button" className="admin-mini-button" disabled={idx === list.length - 1 || moveBusy === section.id} onClick={() => moveSection(section.id, "down")}>
                ↓ 아래로
              </button>
              <button type="button" className="admin-mini-button" onClick={() => toggleVisible(section)}>
                {section.is_visible ? "숨기기" : "표시하기"}
              </button>
            </div>
          </div>
          {!section.is_visible && <p style={{ fontSize: 12, color: "#b3273f" }}>현재 사이트에 숨겨져 있습니다.</p>}

          <label>
            소제목(선택)
            <input value={section.heading ?? ""} onChange={(e) => updateLocal(section.id, { heading: e.target.value })} />
          </label>

          <SectionFields kind={section.kind} data={section.data} onChange={(d) => updateLocal(section.id, { data: d })} />

          <div className="admin-section-card-foot">
            <button className="button button-dark" type="button" disabled={!!savingMap[section.id]} onClick={() => saveSection(section)}>
              {savingMap[section.id] ? "저장 중…" : "이 섹션 저장"}
            </button>
            <div className="admin-section-delete">
              <label style={{ fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 0 }}>
                <input
                  type="checkbox"
                  checked={!!confirmMap[section.id]}
                  onChange={(e) => setConfirmMap((m) => ({ ...m, [section.id]: e.target.checked }))}
                />
                삭제를 확인합니다
              </label>
              <button type="button" className="admin-mini-button admin-mini-button-danger" disabled={!confirmMap[section.id]} onClick={() => deleteSection(section.id)}>
                섹션 삭제
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="admin-form admin-section-card">
        <b>섹션 추가</b>
        <label>
          섹션 종류
          <select value={newKind} onChange={(e) => setNewKind(e.target.value as SectionKind)}>
            {KIND_ORDER.map((k) => (
              <option key={k} value={k}>
                {KIND_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
        {addError && <p style={{ color: "#b3273f", fontSize: 13 }}>{addError}</p>}
        <button className="button button-dark" type="button" disabled={adding} onClick={addSection}>
          {adding ? "추가 중…" : "+ 섹션 추가"}
        </button>
      </div>
    </div>
  );
}
