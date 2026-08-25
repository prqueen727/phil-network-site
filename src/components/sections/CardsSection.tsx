import type { CardsData } from "@/lib/data/pages";

/**
 * kind: "cards" — columns(2~4)에 따라 기존 CSS 그리드를 재사용한다.
 * data: { columns: 2~4, items: [{ key?, title, body }] }
 *  - columns 4 → .philosophy-grid (key를 philosophy-key로 표시, 예: Brand Philosophy)
 *  - columns 3 → .feature-grid (key를 상단 라벨로 표시)
 *  - columns 2(기본) → .system-grid (title/body만, 예: Network System)
 */
export function CardsSection({ data }: { data: CardsData }) {
  const items = data.items ?? [];
  const columns = data.columns ?? 2;

  if (columns >= 4) {
    return (
      <div className="philosophy-grid">
        {items.map((item, i) => (
          <article key={i}>
            {item.key && <span className="philosophy-key">{item.key}</span>}
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    );
  }

  if (columns === 3) {
    return (
      <div className="feature-grid">
        {items.map((item, i) => (
          <article key={i}>
            {item.key && <span>{item.key}</span>}
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="system-grid">
      {items.map((item, i) => (
        <article key={i}>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </article>
      ))}
    </div>
  );
}
