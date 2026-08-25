import { Fragment, type ReactNode } from "react";

/**
 * site_pages.hero_title은 "필한방병원\n네트워크 소개"처럼 \n으로 줄바꿈을 저장한다.
 * 마지막 줄만 <em>으로 강조하고 나머지는 <br/>로 이어붙여 기존 하드코딩 마크업
 * (예: 필한방병원<br /><em>네트워크 소개</em>)과 동일하게 렌더링한다.
 */
export function heroTitleNodes(text: string): ReactNode {
  const lines = text.split("\n");
  if (lines.length <= 1) return text;
  const last = lines[lines.length - 1];
  const rest = lines.slice(0, -1);
  return (
    <>
      {rest.map((line, i) => (
        <Fragment key={i}>
          {line}
          <br />
        </Fragment>
      ))}
      <em>{last}</em>
    </>
  );
}
