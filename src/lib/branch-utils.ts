// 순수 유틸/타입만 — Supabase 클라이언트를 import하지 않는다.
// (클라이언트 컴포넌트에서도 안전하게 import할 수 있게 lib/data/branches.ts에서 분리)

export type OpeningHoursEntry = {
  days: string;
  open?: string;
  close?: string;
  closed?: boolean;
};

export type BranchDirector = {
  id: string;
  name: string;
  slug: string | null;
  job_title: string | null;
};

export type Branch = {
  id: string;
  name: string;
  slug: string;
  is_main: boolean;
  director_id: string | null;
  established_on: string | null;
  bed_info: string | null;
  street_address: string;
  address_locality: string | null;
  address_region: string | null;
  postal_code: string | null;
  address_country: string;
  latitude: number | null;
  longitude: number | null;
  telephone: string;
  fax: string | null;
  business_registration_number: string | null;
  representative_name: string | null;
  opening_hours: OpeningHoursEntry[];
  price_info: string | null;
  naver_place_url: string | null;
  website_url: string | null;
  sort_order: number;
  director: BranchDirector | null;
};

/** 진료시간 jsonb 배열 → 사람이 읽는 한 줄 문자열. */
export function formatOpeningHours(hours: OpeningHoursEntry[] | null | undefined): string {
  if (!hours || hours.length === 0) return "진료시간은 지점으로 문의해 주세요";
  return hours
    .map((entry) => (entry.closed ? `${entry.days} 휴진` : `${entry.days} ${entry.open}~${entry.close}`))
    .join(" · ");
}

/** 진료시간 jsonb 배열 → 요일별 한 줄씩(카드형 레이아웃용). */
export function formatOpeningHoursLines(hours: OpeningHoursEntry[] | null | undefined): string[] {
  if (!hours || hours.length === 0) return ["진료시간은 지점으로 문의해 주세요"];
  return hours.map((entry) =>
    entry.closed ? `${entry.days} 휴진` : `${entry.days}  ${entry.open} ~ ${entry.close}`
  );
}

/** 지역명이 구 단위라 낯선 지점(대전=서구, 청주=청주시 흥덕구)만 도시명으로 축약 표시.
 *  실제 주소(address_locality)는 JSON-LD 등에 그대로 쓰이므로 표시(UI)에서만 오버라이드. */
const SHORT_LOCALITY: Record<string, string> = { daejeon: "대전", cheongju: "청주" };

export function shortLocality(branch: Pick<Branch, "slug" | "address_locality" | "name">): string {
  return SHORT_LOCALITY[branch.slug] ?? branch.address_locality ?? branch.name;
}

// 지점별 고유 브랜드 색상 — 네이버 플레이스·홈페이지 버튼에 사용(대전은 기본 브랜드색 유지).
const BRANCH_ACCENT_CLASS: Record<string, string> = {
  cheongju: "branch-accent-teal",
  seongdong: "branch-accent-teal",
  chungmuro: "branch-accent-orange",
};

export function branchAccentClass(slug: string): string | undefined {
  return BRANCH_ACCENT_CLASS[slug];
}

/** 주소 문자열 기반 지도 임베드 URL (좌표가 있으면 좌표 우선). */
export function branchMapEmbedUrl(branch: Pick<Branch, "street_address" | "latitude" | "longitude">): string {
  const query = branch.latitude != null && branch.longitude != null
    ? `${branch.latitude},${branch.longitude}`
    : branch.street_address;
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed&hl=ko&gl=KR`;
}
