"use client";

import type { SectionKind, SectionData } from "@/lib/data/pages";

type Props = { kind: SectionKind; data: SectionData; onChange: (data: SectionData) => void };

/** kind별 섹션 데이터 입력 폼. 섹션 추가/수정 카드 안에서 재사용된다. */
export function SectionFields({ kind, data, onChange }: Props) {
  if (kind === "text") {
    const paragraphs = data.paragraphs ?? [];
    return (
      <div>
        {paragraphs.map((p, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <textarea
              value={p}
              rows={3}
              placeholder={`문단 ${i + 1}`}
              onChange={(e) => {
                const next = [...paragraphs];
                next[i] = e.target.value;
                onChange({ ...data, paragraphs: next });
              }}
            />
            <button
              type="button"
              className="admin-mini-button"
              onClick={() => onChange({ ...data, paragraphs: paragraphs.filter((_, idx) => idx !== i) })}
            >
              문단 삭제
            </button>
          </div>
        ))}
        <button type="button" className="admin-mini-button" onClick={() => onChange({ ...data, paragraphs: [...paragraphs, ""] })}>
          + 문단 추가
        </button>
      </div>
    );
  }

  if (kind === "quote") {
    return (
      <div>
        <label>
          인용문
          <textarea rows={2} value={data.quote ?? ""} onChange={(e) => onChange({ ...data, quote: e.target.value })} />
        </label>
        <label>
          출처/이름
          <input value={data.attribution ?? ""} onChange={(e) => onChange({ ...data, attribution: e.target.value })} />
        </label>
        <label>
          보충 설명(선택)
          <textarea rows={2} value={data.body ?? ""} onChange={(e) => onChange({ ...data, body: e.target.value })} />
        </label>
      </div>
    );
  }

  if (kind === "cards") {
    const items = data.items ?? [];
    return (
      <div>
        <label style={{ maxWidth: 160 }}>
          컬럼 수 (2~4)
          <input
            type="number"
            min={2}
            max={4}
            value={data.columns ?? 2}
            onChange={(e) => onChange({ ...data, columns: Math.min(4, Math.max(2, Number(e.target.value) || 2)) })}
          />
        </label>
        {items.map((item, i) => (
          <div className="admin-mini-card" key={i}>
            <input
              placeholder="key (선택, 예: Fill)"
              value={item.key ?? ""}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, key: e.target.value };
                onChange({ ...data, items: next });
              }}
            />
            <input
              placeholder="제목"
              value={item.title ?? ""}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, title: e.target.value };
                onChange({ ...data, items: next });
              }}
            />
            <textarea
              placeholder="본문"
              rows={2}
              value={item.body ?? ""}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, body: e.target.value };
                onChange({ ...data, items: next });
              }}
            />
            <button
              type="button"
              className="admin-mini-button"
              onClick={() => onChange({ ...data, items: items.filter((_, idx) => idx !== i) })}
            >
              카드 삭제
            </button>
          </div>
        ))}
        <button
          type="button"
          className="admin-mini-button"
          onClick={() => onChange({ ...data, items: [...items, { key: "", title: "", body: "" }] })}
        >
          + 카드 추가
        </button>
      </div>
    );
  }

  if (kind === "timeline") {
    const items = data.items ?? [];
    return (
      <div>
        {items.map((item, i) => (
          <div className="admin-mini-row" key={i}>
            <input
              placeholder="날짜 (예: 2017. 06)"
              value={item.date ?? ""}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, date: e.target.value };
                onChange({ ...data, items: next });
              }}
              style={{ width: 150 }}
            />
            <input
              placeholder="내용"
              value={item.event ?? ""}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, event: e.target.value };
                onChange({ ...data, items: next });
              }}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="admin-mini-button"
              onClick={() => onChange({ ...data, items: items.filter((_, idx) => idx !== i) })}
            >
              삭제
            </button>
          </div>
        ))}
        <button type="button" className="admin-mini-button" onClick={() => onChange({ ...data, items: [...items, { date: "", event: "" }] })}>
          + 연혁 추가
        </button>
      </div>
    );
  }

  // facts
  const items = data.items ?? [];
  return (
    <div>
      {items.map((item, i) => (
        <div className="admin-mini-row" key={i}>
          <input
            placeholder="항목명 (예: 전문분야)"
            value={item.label ?? ""}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...item, label: e.target.value };
              onChange({ ...data, items: next });
            }}
            style={{ width: 150 }}
          />
          <input
            placeholder="내용"
            value={item.value ?? ""}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...item, value: e.target.value };
              onChange({ ...data, items: next });
            }}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="admin-mini-button"
            onClick={() => onChange({ ...data, items: items.filter((_, idx) => idx !== i) })}
          >
            삭제
          </button>
        </div>
      ))}
      <button type="button" className="admin-mini-button" onClick={() => onChange({ ...data, items: [...items, { label: "", value: "" }] })}>
        + 항목 추가
      </button>
    </div>
  );
}
