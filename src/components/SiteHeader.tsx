import Image from "next/image";
import { getBranches } from "@/lib/data/branches";
import { shortLocality } from "@/lib/branch-utils";

/** 지점 전화번호·링크는 Supabase branches 테이블에서 SSR로 조회한다(하드코딩 금지 — build.md STEP3). */
export async function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const branches = await getBranches();
  return <>
    {!overlay && <div className="branch-strip"><div className="branch-strip-inner"><span>필한방병원 네트워크</span><div className="branch-strip-links">{branches.map((branch) => <a href={`/branches/${branch.slug}`} key={branch.slug}>{shortLocality(branch)} <small>{branch.telephone}</small></a>)}</div></div></div>}
    <header className={`site-header benchmark-header${overlay ? " overlay-header" : ""}`}>
      <a className="brand" href="/" aria-label="필한방병원 네트워크 홈"><Image className="brand-logo" src="/hi_phil_03-제일많이씀-[변환됨].png" alt="필한방병원" width={300} height={91} priority /></a>
      <nav className="main-nav" aria-label="주 메뉴">
        <div className="nav-group"><a href="/about">병원소개</a><div className="mega-menu"><a href="/about">필한방병원 소개</a><a href="/network/director">윤제필 병원장</a></div></div>
        <a href="/branches">지점 안내</a>
        <a href="/media">미디어게시판</a>
      </nav>
    </header>
  </>;
}

export async function SiteFooter() {
  const branches = await getBranches();
  return <><div className="quick-bar">
    <span>필한방병원 네트워크</span>
    {branches.map((branch) => <span key={branch.slug}>{shortLocality(branch)} {branch.telephone}</span>)}
  </div><footer className="site-footer">
    <div className="footer-branches">
      {branches.map((branch) => (
        <div className="footer-branch" key={branch.slug}>
          <strong>{branch.name}</strong>
          <p>{branch.street_address}</p>
          <p>TEL {branch.telephone}{branch.fax && ` · FAX ${branch.fax}`}</p>
          <p>
            {branch.business_registration_number && `사업자등록번호 ${branch.business_registration_number}`}
            {branch.representative_name && ` · 대표자명 ${branch.representative_name}`}
          </p>
        </div>
      ))}
    </div>
    <div className="footer-bottom">
      <a className="brand" href="/"><Image className="brand-logo" src="/hi_phil_03-제일많이씀-[변환됨].png" alt="필한방병원" width={300} height={91} /></a>
      <p>필한방병원 네트워크<br />{branches.map(shortLocality).join(" · ")}</p>
      <a href="/admin/login">관리자 로그인</a>
    </div>
  </footer></>;
}
