import { ImageSlot } from "@/components/ImageSlot";
import type { QuoteData } from "@/lib/data/pages";

export type QuoteImage = { src?: string | null; alt: string; placeholderLabel: string };

/**
 * kind: "quote" — 인용구 + 옆에 이미지. data: { quote, attribution?, body? }
 * 이미지는 섹션 데이터에 들어있지 않고, 페이지 컴포넌트가 page_images/staff.photo_url을
 * 조회해 image prop으로 넘겨준다(about → getPageImage, director → staff.photo_url).
 */
export function QuoteSection({ data, image }: { data: QuoteData; image?: QuoteImage }) {
  return (
    <>
      <div className="quote-with-image">
        <div className="quote-block">
          <span>&ldquo;</span>
          <blockquote>{data.quote}</blockquote>
          {data.attribution && <p>{data.attribution}</p>}
        </div>
        <ImageSlot
          src={image?.src}
          alt={image?.alt || "소개 이미지"}
          placeholderLabel={image?.placeholderLabel ?? "IMAGE"}
        />
      </div>
      {data.body && <p className="body-copy">{data.body}</p>}
    </>
  );
}
