import type { PageSection } from "@/lib/data/pages";
import { TextSection } from "./TextSection";
import { QuoteSection, type QuoteImage } from "./QuoteSection";
import { CardsSection } from "./CardsSection";
import { TimelineSection } from "./TimelineSection";
import { FactsSection } from "./FactsSection";

export type { QuoteImage };

/** kind에 따라 알맞은 섹션 렌더러로 위임한다. 래핑(.page-section 등)은 호출부 페이지가 담당. */
export function SectionBody({ section, quoteImage }: { section: PageSection; quoteImage?: QuoteImage }) {
  switch (section.kind) {
    case "text":
      return <TextSection data={section.data} />;
    case "quote":
      return <QuoteSection data={section.data} image={quoteImage} />;
    case "cards":
      return <CardsSection data={section.data} />;
    case "timeline":
      return <TimelineSection data={section.data} />;
    case "facts":
      return <FactsSection data={section.data} />;
    default:
      return null;
  }
}
