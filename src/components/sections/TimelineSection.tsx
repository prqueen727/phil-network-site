import type { TimelineData } from "@/lib/data/pages";

/** kind: "timeline" — 연혁. data: { items: [{ date, event }] } */
export function TimelineSection({ data }: { data: TimelineData }) {
  const items = data.items ?? [];
  return (
    <ul className="history-list">
      {items.map((item, i) => (
        <li key={i}>
          <span className="history-date">{item.date}</span>
          <span className="history-event">{item.event}</span>
        </li>
      ))}
    </ul>
  );
}
