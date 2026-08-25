import { InternalPage } from "@/components/InternalPage";
import { getPageImage } from "@/lib/data/business";
import { getSitePage } from "@/lib/data/pages";
import { SectionBody } from "@/components/sections/SectionRenderer";
import { heroTitleNodes } from "@/components/HeroTitle";

const FALLBACK_EYEBROW = "ABOUT PHIL";
const FALLBACK_HERO_TITLE = "필한방병원\n네트워크 소개";
const FALLBACK_INTRO = "대전 본원을 중심으로 청주, 성동, 충무로를 연결하며 한·양방 협진의 기준을 이어갑니다.";

export default async function AboutPage() {
  const [overviewImage, page] = await Promise.all([
    getPageImage("about_overview"),
    getSitePage("about"),
  ]);

  // site_pages/page_sections가 아직 없거나(SQL 미실행) 비어 있어도 500 없이 기본값으로 폴백한다.
  const eyebrow = page?.eyebrow ?? FALLBACK_EYEBROW;
  const heroTitle = page?.hero_title ?? FALLBACK_HERO_TITLE;
  const intro = page?.hero_intro ?? FALLBACK_INTRO;
  const sections = (page?.sections ?? []).filter((s) => s.is_visible);

  return (
    <InternalPage
      eyebrow={eyebrow}
      title={heroTitleNodes(heroTitle)}
      intro={intro}
      heroImageKey="hero_about"
    >
      {sections.length === 0 ? (
        <div className="content-placeholder">페이지 콘텐츠가 준비 중입니다.</div>
      ) : (
        sections.map((section, index) => (
          <div className="page-section" key={section.id}>
            <div className="page-section-heading">
              <span>{String(index + 1).padStart(2, "0")}</span>
              {section.heading && <h2>{section.heading}</h2>}
            </div>
            <SectionBody
              section={section}
              quoteImage={
                section.kind === "quote"
                  ? {
                      src: overviewImage?.url,
                      alt: overviewImage?.alt || "필한방병원 네트워크 소개 이미지",
                      placeholderLabel: "OVERVIEW IMAGE",
                    }
                  : undefined
              }
            />
          </div>
        ))
      )}
    </InternalPage>
  );
}
