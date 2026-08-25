import type { TextData } from "@/lib/data/pages";

/** kind: "text" — 일반 본문 단락들. data: { paragraphs: string[] } */
export function TextSection({ data }: { data: TextData }) {
  const paragraphs = data.paragraphs ?? [];
  return (
    <>
      {paragraphs.map((p, i) => (
        <p className="body-copy" key={i}>{p}</p>
      ))}
    </>
  );
}
