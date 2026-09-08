import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { MainBranchCards } from "@/components/MainBranchCards";
import { MediaCarousel } from "@/components/MediaCarousel";
import { Reveal } from "@/components/Reveal";
import { getBranches } from "@/lib/data/branches";
import { getPublishedBlogs } from "@/lib/data/blogs";
import { getPageImage } from "@/lib/data/business";

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
  const [branches, posts, careImages] = await Promise.all([
    getBranches(),
    getPublishedBlogs(8),
    Promise.all(CARE_IMAGE_KEYS.map((key) => getPageImage(key))),
  ]);

  return (
    <div className="site-shell">
      <SiteHeader />
      <main>
        <section className="hero-section hero-network">
          <div className="hero-network-bg" role="img" aria-label="필한방병원 네트워크 의료진 단체사진과 대전·청주·성동·충무로를 잇는 네트워크 지도" />
          <div className="hero-network-overlay" />
          <div className="hero-copy">
            <p className="eyebrow">PHIL NETWORK</p>
            <p className="hero-lede hero-tagline">전문의 중심의 글로벌 스탠다드 한·양방 협진시스템</p>
            <h1>필한방병원 건강매거진<br /><em>대전·청주·성동·충무로</em></h1>
            <div className="hero-actions">
              <a className="button button-dark" href="/about">네트워크 알아보기 <span>↗</span></a>
              <a className="text-link" href="/branches">지점 선택 <span>→</span></a>
            </div>
          </div>
          <div className="hero-bottom"><span>SCROLL TO EXPLORE</span><span className="scroll-line" /></div>
        </section>

        <section className="media-section section-wrap">
          <div className="section-heading">
            <div>
              <div className="section-kicker"><span>01</span><span>PHIL MEDIA</span></div>
              <h2>필한방병원<br /><em>의료진 칼럼</em></h2>
            </div>
            <p className="body-copy">필한방병원 의료진이 전하는 건강 이야기</p>
          </div>
          <MediaCarousel posts={posts} />
        </section>

        <section className="care-section section-wrap">
          <div className="section-heading">
            <div>
              <div className="section-kicker"><span>02</span><span>CARE PROGRAM</span></div>
              <h2>주요 <em>진료 분야</em></h2>
            </div>
          </div>
          <div className="care-grid image-care-grid">
            {careCards.map(([number, title, fallbackImage], index) => (
              <Reveal as="div" className="care-card image-care-card" delay={(index + 1) * 100} key={number}>
                <span className="care-image" style={{ backgroundImage: `url(${careImages[index]?.url ?? fallbackImage})` }} />
                <div className="care-card-label"><h3>{title}</h3><b>+</b></div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="branch-section section-wrap">
          <div className="section-heading split-heading">
            <div>
              <div className="section-kicker"><span>03</span><span>PHIL LOCATIONS</span></div>
              <h2>필한방병원<br /><em>지점 안내</em></h2>
            </div>
          </div>
          <MainBranchCards branches={branches} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
