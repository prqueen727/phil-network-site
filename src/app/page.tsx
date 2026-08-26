import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { MainBranchCards } from "@/components/MainBranchCards";
import { MediaCarousel } from "@/components/MediaCarousel";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { getBranches } from "@/lib/data/branches";
import { getPublishedBlogs } from "@/lib/data/blogs";
import { getHeadlineStats, getPageImage } from "@/lib/data/business";
import { getSitePage } from "@/lib/data/pages";
import { heroTitleNodes } from "@/components/HeroTitle";
import { BedDouble, Hand, PhoneCall, Stethoscope } from "lucide-react";

// site_pages/page_sections("home")가 아직 시딩되지 않았을 때의 폴백 — scripts/seed-page-sections.mjs 참고.
const FALLBACK_EYEBROW = "PHIL NETWORK";
const FALLBACK_HERO_TITLE = "필한방병원 네트워크\n대전·청주·성동·충무로";
const FALLBACK_TAGLINE = "전문의 중심의 글로벌 스탠다드 한·양방 협진시스템";
const FALLBACK_BRANCH_HEADING = "필한방병원\n지점 안내";
const FALLBACK_MEDIA_HEADING = "필한방병원\n의료진 칼럼";
const FALLBACK_MEDIA_SUBCOPY = "필한방병원 의료진이 전하는 건강 이야기";
const FALLBACK_TRUST_NOTE = "2026년 8월 기준 · 필한방병원 네트워크 공식 데이터";

// 관리자페이지에서 콘텐츠를 저장해도 재배포 전까지 반영이 안 되는 걸 막기 위해 매 요청마다 재생성한다
// (Supabase 호출은 Next가 request-time API로 인식하지 못해 기본값이 정적 프리렌더로 굳는다).
export const revalidate = 0;

const metricIcons: Record<string, typeof Stethoscope> = {
  외래환자: Stethoscope,
  입원환자: BedDouble,
  추나요법: Hand,
  "진료 만족도": PhoneCall,
};

const careCards: [string, string, string][] = [
  ["01", "비수술 척추·관절 치료", "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=700&q=82"],
  ["02", "통합 면역·암 치료", "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=700&q=82"],
  ["03", "수술 후 재활치료", "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=700&q=82"],
  ["04", "교통사고 후유증", "https://images.unsplash.com/photo-1502740479091-6358875202764?auto=format&fit=crop&w=700&q=82"],
  ["05", "뇌건강센터", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=700&q=82"],
  ["06", "산업재해", "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=700&q=82"],
];
const CARE_IMAGE_KEYS = ["care_01", "care_02", "care_03", "care_04", "care_05", "care_06"];

export default async function Home() {
  const [branches, posts, headlineStats, careImages, page] = await Promise.all([
    getBranches(),
    getPublishedBlogs(4),
    getHeadlineStats(),
    Promise.all(CARE_IMAGE_KEYS.map((key) => getPageImage(key))),
    getSitePage("home"),
  ]);

  const sections = (page?.sections ?? []).filter((s) => s.is_visible);
  const cardTitles = sections.find((s) => s.kind === "cards")?.data.items?.map((item) => item.title) ?? [];
  const textSections = sections.filter((s) => s.kind === "text");
  const branchHeading = textSections[0]?.heading || FALLBACK_BRANCH_HEADING;
  const mediaHeading = textSections[1]?.heading || FALLBACK_MEDIA_HEADING;
  const mediaSubcopy = textSections[1]?.data.paragraphs?.[0] || FALLBACK_MEDIA_SUBCOPY;
  const trustNote = textSections[2]?.data.paragraphs?.[0] || FALLBACK_TRUST_NOTE;

  return (
    <div className="site-shell">
      <SiteHeader />
      <main>
        <section className="hero-section hero-network">
          <div className="hero-network-bg" role="img" aria-label="필한방병원 네트워크 의료진 단체사진과 대전·청주·성동·충무로를 잇는 네트워크 지도" />
          <div className="hero-network-overlay" />
          <div className="hero-copy">
            <p className="eyebrow">{page?.eyebrow || FALLBACK_EYEBROW}</p>
            <p className="hero-lede hero-tagline">{page?.hero_intro || FALLBACK_TAGLINE}</p>
            <h1>{heroTitleNodes(page?.hero_title || FALLBACK_HERO_TITLE)}</h1>
            <div className="hero-actions">
              <a className="button button-dark" href="/about">네트워크 알아보기 <span>↗</span></a>
              <a className="text-link" href="/branches">지점 선택 <span>→</span></a>
            </div>
          </div>
          <div className="hero-bottom"><span>SCROLL TO EXPLORE</span><span className="scroll-line" /></div>
        </section>

        <section className="trust-section section-wrap">
          <div className="section-kicker"><span>01</span><span>NETWORK TRUST</span></div>
          <div className="trust-metrics">
            {headlineStats.map((stat, index) => {
              const Icon = metricIcons[stat.label] ?? Stethoscope;
              return (
                <Reveal as="div" className="trust-metric" delay={index * 100} key={stat.label}>
                  <span className="metric-icon"><Icon aria-hidden="true" size={50} strokeWidth={1.8} /></span>
                  <span className="metric-label">{stat.label}</span>
                  <strong><CountUp value={stat.value} suffix={stat.unit} comma={stat.unit === "명"} /></strong>
                </Reveal>
              );
            })}
          </div>
          <p className="metric-note">{trustNote}</p>
        </section>

        <section className="care-section section-wrap">
          <div className="section-heading">
            <div>
              <div className="section-kicker"><span>02</span><span>MAIN CLINIC</span></div>
              <h2>주요 <em>클리닉</em></h2>
            </div>
          </div>
          <div className="care-grid image-care-grid">
            {careCards.map(([number, fallbackTitle, fallbackImage], index) => (
              <Reveal as="div" className="care-card image-care-card" delay={(index + 1) * 100} key={number}>
                <span className="care-image" style={{ backgroundImage: `url(${careImages[index]?.url ?? fallbackImage})` }} />
                <div className="care-card-label"><h3>{cardTitles[index] || fallbackTitle}</h3><b>+</b></div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="branch-section section-wrap">
          <div className="section-heading split-heading">
            <div>
              <div className="section-kicker"><span>03</span><span>PHIL LOCATIONS</span></div>
              <h2>{heroTitleNodes(branchHeading)}</h2>
            </div>
          </div>
          <MainBranchCards branches={branches} />
        </section>

        <section className="media-section section-wrap">
          <div className="section-heading">
            <div>
              <div className="section-kicker"><span>04</span><span>PHIL MEDIA</span></div>
              <h2>{heroTitleNodes(mediaHeading)}</h2>
            </div>
            <p className="body-copy">{mediaSubcopy}</p>
          </div>
          <MediaCarousel posts={posts} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
