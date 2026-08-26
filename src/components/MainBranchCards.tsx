import type { Branch } from "@/lib/data/branches";
import { branchMapEmbedUrl, formatOpeningHoursLines } from "@/lib/data/branches";
import { Reveal } from "@/components/Reveal";

export function MainBranchCards({ branches }: { branches: Branch[] }) {
  return (
    <div className="main-branch-grid">
      {branches.map((branch, index) => (
        <Reveal as="article" className="main-branch-card" delay={index * 100} key={branch.slug}>
          <div className="main-branch-copy">
            <span className="main-branch-ci" aria-hidden="true">必</span>
            <p className="branch-number">0{index + 1} / PHIL LOCATION</p>
            <h3>{branch.name}</h3>

            <div className="main-branch-field">
              <span>주소</span>
              <p>{branch.street_address}</p>
            </div>

            <div className="main-branch-field">
              <span>전화</span>
              <a className="main-branch-phone" href={`tel:${branch.telephone}`}>{branch.telephone}</a>
            </div>

            <div className="main-branch-field">
              <span>진료시간</span>
              <ul className="main-branch-hours">
                {formatOpeningHoursLines(branch.opening_hours).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            <div className="main-branch-actions">
              <a href={`tel:${branch.telephone}`}>전화 연결</a>
              {branch.naver_place_url && (
                <a href={branch.naver_place_url} target="_blank" rel="noreferrer">네이버 플레이스</a>
              )}
              {branch.website_url && (
                <a href={branch.website_url} target="_blank" rel="noreferrer">홈페이지</a>
              )}
            </div>
          </div>
          <div className="main-branch-map">
            <iframe title={`${branch.name} 지도`} src={branchMapEmbedUrl(branch)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </Reveal>
      ))}
    </div>
  );
}
