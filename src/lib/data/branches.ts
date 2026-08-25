import { supabasePublic } from "@/lib/supabase/server";
import type { Branch } from "@/lib/branch-utils";

export type { Branch, BranchDirector, OpeningHoursEntry } from "@/lib/branch-utils";
export { branchMapEmbedUrl, formatOpeningHours, formatOpeningHoursLines } from "@/lib/branch-utils";

const BRANCH_SELECT = "*, director:staff(id, name, slug, job_title)";

/** 전 지점 목록 — 공개 페이지 SSR 조회용 (anon, RLS 적용). */
export async function getBranches(): Promise<Branch[]> {
  const supabase = supabasePublic();
  const { data, error } = await supabase
    .from("branches")
    .select(BRANCH_SELECT)
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data as unknown as Branch[];
}

/** 지점 상세 — /branches/[slug] 용. */
export async function getBranchBySlug(slug: string): Promise<Branch | null> {
  const supabase = supabasePublic();
  const { data, error } = await supabase
    .from("branches")
    .select(BRANCH_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as Branch;
}
