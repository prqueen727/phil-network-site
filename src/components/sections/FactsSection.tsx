import { Fragment } from "react";
import type { FactsData } from "@/lib/data/pages";

/** kind: "facts" — 키-값 정보(예: 전문분야/학력). data: { items: [{ label, value }] } */
export function FactsSection({ data }: { data: FactsData }) {
  const items = data.items ?? [];
  return (
    <dl className="director-facts">
      {items.map((item, i) => (
        <Fragment key={i}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
