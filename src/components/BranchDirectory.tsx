"use client";

import { useState } from "react";
import Image from "next/image";
import type { Branch } from "@/lib/branch-utils";
import { branchMapEmbedUrl, formatOpeningHoursLines, shortLocality } from "@/lib/branch-utils";
import { BRANCH_CONTENT } from "@/lib/data/branch-content";

/** 데이터는 서버(getBranches)에서 props로 내려받는다 — 탭 선택 상호작용만 클라이언트에서 처리. */
export function BranchDirectory({ branches }: { branches: Branch[] }) {
  const [selected, setSelected] = useState(0);
  if (branches.length === 0) return null;
  const branch = branches[selected] ?? branches[0];
  const mapUrl = branchMapEmbedUrl(branch);
  const content = BRANCH_CONTENT[branch.slug];

  return (
    <div className="branch-directory-layout">
      <div className="branch-selector">
        {branches.map((item, index) => (
          <button className={selected === index ? "is-selected" : ""} key={item.slug} onClick={() => setSelected(index)} type="button">
            <span>0{index + 1}</span>
            <strong>{shortLocality(item)}</strong>
            <small>{item.name}</small>
            <b>↗</b>
          </button>
        ))}
      </div>
      <div className={`branch-map-panel${content ? " has-photo" : ""}`}>
        <div className="branch-map-copy">
          <p className="care-label">{shortLocality(branch)} / PHIL LOCATION</p>
          <h2>{branch.name}</h2>
          <p>{branch.street_address}</p>
          <a href={`tel:${branch.telephone}`}>{branch.telephone}</a>
          {content && (
            <div className="branch-content-block">
              <h3>소개</h3>
              {content.intro.map((paragraph, i) => (
                <p className="body-copy" key={i}>{paragraph}</p>
              ))}
              <h3>주요 치료</h3>
              <ol>
                {content.services.map((service, i) => (
                  <li key={i}>{service}</li>
                ))}
              </ol>
            </div>
          )}
          <dl>
            <dt>진료시간</dt>
            <dd>
              <ul className="main-branch-hours">
                {formatOpeningHoursLines(branch.opening_hours).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </dd>
            {branch.director && (
              <>
                <dt>병원장</dt>
                <dd>{branch.director.name} {branch.director.job_title ?? ""}</dd>
              </>
            )}
          </dl>
        </div>
        {content && (
          <div className="branch-photo">
            <Image src={content.photo.url} alt={content.photo.alt} fill sizes="(max-width: 800px) 100vw, 35vw" style={{ objectFit: "cover" }} />
          </div>
        )}
        <iframe title={`${branch.name} 지도`} src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>
    </div>
  );
}
