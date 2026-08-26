type CountUpProps = {
  value: number;
  suffix?: string;
  /** 연도처럼 천단위 콤마를 넣으면 안 되는 값에는 false로 (기본 true = "444,328"처럼 콤마 표기). */
  comma?: boolean;
};

/**
 * 항상 최종값을 그대로 출력한다 — 이전엔 0→value로 카운트업하는 애니메이션이 있었으나,
 * 구글 크롤러가 애니메이션 도중(진행률 4% 시점 등)의 중간값을 그대로 검색 설명문구에
 * 가져다 쓰는 실측 사고가 있어 제거했다. 스크롤 진입 시각 효과는 부모의 Reveal이 담당한다.
 */
export function CountUp({ value, suffix = "", comma = true }: CountUpProps) {
  return <span>{comma ? value.toLocaleString("ko-KR") : value}{suffix}</span>;
}
