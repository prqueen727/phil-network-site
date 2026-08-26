import { InternalPage } from "@/components/InternalPage";
import { getStaffBySlug, groupCareer } from "@/lib/data/staff";
import { Reveal } from "@/components/Reveal";
import { getSitePage } from "@/lib/data/pages";
import { SectionBody } from "@/components/sections/SectionRenderer";
import { heroTitleNodes } from "@/components/HeroTitle";

const FALLBACK_EYEBROW = "FOUNDER & DIRECTOR";
const FALLBACK_HERO_TITLE = "윤제필\n병원장";
const FALLBACK_INTRO = "필한방병원 네트워크를 시작한 대표자의 설립 철학과 진료에 대한 생각을 소개합니다.";

// 관리자페이지 저장이 재배포 없이 바로 반영되도록 매 요청마다 재생성한다.
export const revalidate = 0;

export default async function DirectorPage() {
  const [director, page] = await Promise.all([
    getStaffBySlug("yoon-jepil"),
    getSitePage("director"),
  ]);
  const groups = groupCareer(director?.career);

  // site_pages/page_sections가 아직 없거나(SQL 미실행) 비어 있어도 500 없이 기본값으로 폴백한다.
  const eyebrow = page?.eyebrow ?? FALLBACK_EYEBROW;
  const heroTitle = page?.hero_title ?? FALLBACK_HERO_TITLE;
  const intro = page?.hero_intro ?? FALLBACK_INTRO;
  const sections = (page?.sections ?? []).filter((s) => s.is_visible);

  // 기존 레이아웃대로: 맨 위 quote 섹션 1개는 .page-section 래핑 없이 이미지와 나란히,
  // 그 외 관리자가 추가한 섹션은 번호가 매겨진 .page-section으로 뒤에 이어 붙인다.
  const quoteSection = sections.find((s) => s.kind === "quote");
  const otherSections = sections.filter((s) => s.id !== quoteSection?.id);

  return (
    <InternalPage
      eyebrow={eyebrow}
      title={heroTitleNodes(heroTitle)}
      intro={intro}
      heroImageKey="hero_director"
    >
      {quoteSection ? (
        <SectionBody
          section={quoteSection}
          quoteImage={{
            src: director?.photo_url,
            alt: director ? `${director.name} 병원장` : "윤제필 병원장",
            placeholderLabel: "윤제필 병원장 사진",
          }}
        />
      ) : (
        !director && sections.length === 0 && (
          <div className="content-placeholder">페이지 콘텐츠가 준비 중입니다.</div>
        )
      )}

      {otherSections.map((section, index) => (
        <div className="page-section" key={section.id}>
          <div className="page-section-heading">
            <span>{String(index + 1).padStart(2, "0")}</span>
            {section.heading && <h2>{section.heading}</h2>}
          </div>
          <SectionBody section={section} />
        </div>
      ))}

      {director && (
        <div className="director-profile">
          <dl className="director-facts">
            {director.specialty && (
              <>
                <dt>전문분야</dt>
                <dd>{director.specialty}</dd>
              </>
            )}
            {director.alumni_of && (
              <>
                <dt>학력</dt>
                <dd>{director.alumni_of}</dd>
              </>
            )}
          </dl>
          {director.bio && <p className="director-bio">{director.bio}</p>}

          <div className="career-groups">
            {groups.map((group, groupIndex) => (
              <Reveal as="section" className="career-group" delay={groupIndex * 100} key={group.heading}>
                <h2>{group.heading}</h2>
                <ul>
                  {group.lines.map((line, lineIndex) => (
                    <li key={lineIndex}>{line}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </InternalPage>
  );
}
