import Link from "next/link";
import { InternalPage } from "./InternalPage";
import type { Branch } from "@/lib/data/branches";
import { branchMapEmbedUrl, formatOpeningHours } from "@/lib/data/branches";
import type { SitePage } from "@/lib/data/pages";

export function CareDetail({ title, intro, steps }: { title: string; intro: string; steps: string[] }) {
  const treatmentCards = [
    ["추나요법", "근육과 인대의 기능을 회복시키고 움직임을 편안하게 돕습니다.", "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=82"],
    ["견인요법", "척추 관절에 가해지는 압력을 조절해 긴장된 부위를 이완합니다.", "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=82"],
    ["봉침치료", "필요한 부위의 염증과 통증을 살피는 한방 치료입니다.", "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=800&q=82"],
    ["한약치료", "개인의 상태를 고려해 회복 과정과 몸의 균형을 함께 관리합니다.", "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=82"],
    ["약침치료", "정제된 한약재를 통증 부위에 적용해 회복을 돕습니다.", "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=82"],
    ["도수치료", "굳어진 근육과 관절의 움직임을 물리치료사가 직접 살핍니다.", "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=82"],
  ];
  return <InternalPage eyebrow="PHIL CARE GUIDE" title={<>{title}<br /><em>필 치료안내</em></>} intro={intro}>
    <div className="care-breadcrumb">홈　›　필 치료안내　›　{title}</div>
    <nav className="care-tabs" aria-label="진료 분야 바로가기"><a href="/care/spine-joint">허리·척추</a><a href="/care/traffic">교통사고 후유증</a><a href="/care/rehabilitation">수술 후 재활</a><a href="/care/immunity">통합면역</a><a href="/care/brain">뇌건강센터</a><a href="/care/industrial">산업재해</a></nav>
    <section className="care-info-block"><p className="care-label">01 / ABOUT THE CONDITION</p><h2>{title},<br /><em>이런 불편이 있다면</em></h2><p>몸의 변화를 가볍게 넘기지 않고 현재의 상태와 생활 속 불편을 함께 살펴봅니다. 필한방병원은 필요한 검사를 바탕으로 한·양방 협진 치료 방향을 안내합니다.</p></section>
    <section className="care-info-block"><p className="care-label">02 / CHECK POINT</p><h2>주요 원인과<br /><em>확인해야 할 증상</em></h2><div className="symptom-grid"><div><h3>원인</h3><ul><li>잘못된 자세와 반복되는 움직임</li><li>외부 충격 또는 수술 후 변화</li><li>과도한 긴장과 회복 부족</li></ul></div><div><h3>증상</h3><ul><li>통증과 움직임의 제한</li><li>저림, 무거움, 피로감</li><li>일상생활에서 반복되는 불편</li></ul></div></div></section>
    <section className="care-info-block"><p className="care-label">03 / PHIL TREATMENT</p><h2>필한방병원의<br /><em>치료방법</em></h2><div className="treatment-grid">{treatmentCards.map(([name, description, image], index) => <article key={name}><div className="treatment-image" role="img" aria-label={`${name} 치료 이미지`} style={{ backgroundImage: `url(${image})` }} /><div className="treatment-copy"><span>0{index + 1}</span><h3>{name}</h3><p>{description}</p></div></article>)}</div></section>
  </InternalPage>;
}

export function BranchDetail({ branch, page }: { branch: Branch; page: SitePage | null }) {
  const introParagraphs = (page?.sections ?? [])
    .filter((s) => s.is_visible && s.kind === "text")
    .flatMap((s) => s.data.paragraphs ?? [])
    .filter((p) => p.trim());

  return (
    <InternalPage
      eyebrow="PHIL LOCATIONS"
      title={<>{branch.name}<br /><em>진료 안내</em></>}
      intro="필한방병원 네트워크의 진료 기준을 가까운 지점에서 만납니다."
    >
      <div className="branch-profile">
        <div>
          <span>LOCATION</span>
          <h2>{branch.street_address}</h2>
          <a href={`tel:${branch.telephone}`}>{branch.telephone}</a>
          {branch.naver_place_url && (
            <p><a className="text-link" href={branch.naver_place_url} target="_blank" rel="noreferrer">네이버플레이스에서 보기 →</a></p>
          )}
          {branch.website_url && (
            <p><a className="text-link" href={branch.website_url} target="_blank" rel="noreferrer">{branch.name} 홈페이지 →</a></p>
          )}
        </div>
        <div>
          <span>HOURS</span>
          <p>{formatOpeningHours(branch.opening_hours)}</p>
          {branch.bed_info && <p>병상 안내: {branch.bed_info}</p>}
          <p>{branch.price_info ?? "비급여 항목은 전화 문의"}</p>
        </div>
      </div>

      {introParagraphs.length > 0 && (
        <div className="branch-intro">
          <span className="care-label">지점 소개</span>
          {introParagraphs.map((p, i) => (
            <p className="body-copy" key={i}>{p}</p>
          ))}
        </div>
      )}

      {branch.director && (
        <div className="branch-director-card">
          <span className="care-label">DIRECTOR</span>
          <h2>{branch.director.name}</h2>
          <p>{branch.director.job_title}</p>
          {branch.director.slug === "yoon-jepil" && (
            <Link className="text-link" href="/network/director">병원장 상세 소개 보기 <span>→</span></Link>
          )}
        </div>
      )}

      <div className="branch-detail-map">
        <iframe title={`${branch.name} 지도`} src={branchMapEmbedUrl(branch)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>
    </InternalPage>
  );
}
