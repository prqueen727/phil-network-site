import { supabasePublic } from "@/lib/supabase/server";

export type SectionKind = "text" | "quote" | "cards" | "timeline" | "facts";

export type TextData = { paragraphs?: string[] };
export type QuoteData = { quote?: string; attribution?: string; body?: string };
// cards/timeline/facts는 모두 items 배열을 쓰므로 같은 아이템 타입을 공유한다(교차 타입에서
// kind별로 다른 items 원소 타입을 선언하면 TS가 셋을 올바르게 합치지 못해 좁혀지는 문제가 있었음).
export type SectionItem = { key?: string; title?: string; body?: string; date?: string; event?: string; label?: string; value?: string };
export type CardsData = { columns?: number; items?: SectionItem[] };
export type TimelineData = { items?: SectionItem[] };
export type FactsData = { items?: SectionItem[] };
export type SectionData = TextData & QuoteData & CardsData & TimelineData & FactsData;

export type PageSection = {
  id: string;
  page_id: string;
  kind: SectionKind;
  heading: string | null;
  data: SectionData;
  sort_order: number;
  is_visible: boolean;
};

export type SitePage = {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  eyebrow: string | null;
  hero_title: string | null;
  hero_intro: string | null;
  is_published: boolean;
  sections: PageSection[];
};

/**
 * 서브페이지(about/director 등) 콘텐츠를 site_pages + page_sections에서 조회.
 * site_pages/page_sections 테이블이 아직 생성되지 않았거나(SQL 미실행), 해당 slug 행이
 * 없거나, 조회 중 오류가 나면 null을 반환한다 — 호출부(about/director 페이지)는 반드시
 * null을 안전하게 처리(폴백 문구 또는 기본값)해야 하며 500 에러를 내면 안 된다.
 */
export async function getSitePage(slug: string): Promise<SitePage | null> {
  const supabase = supabasePublic();

  const { data: page, error: pageError } = await supabase
    .from("site_pages")
    .select("id, slug, title, meta_description, eyebrow, hero_title, hero_intro, is_published")
    .eq("slug", slug)
    .maybeSingle();
  if (pageError || !page) return null;

  const { data: sections, error: sectionsError } = await supabase
    .from("page_sections")
    .select("id, page_id, kind, heading, data, sort_order, is_visible")
    .eq("page_id", page.id)
    .order("sort_order", { ascending: true });

  return {
    ...page,
    sections: sectionsError || !sections ? [] : (sections as PageSection[]),
  } as SitePage;
}
