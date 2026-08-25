import { supabasePublic } from "@/lib/supabase/server";

export type HeadlineStat = { label: string; value: number; unit: string };

/** 네트워크 전체 헤드라인 통계(외래환자·입원환자·추나요법 등) — settings_business.headline_stats. */
export async function getHeadlineStats(): Promise<HeadlineStat[]> {
  const supabase = supabasePublic();
  const { data, error } = await supabase
    .from("settings_business")
    .select("headline_stats")
    .eq("id", true)
    .maybeSingle();
  if (error || !data?.headline_stats) return [];
  return data.headline_stats as HeadlineStat[];
}

/** 네트워크 전체 전문 의료진 수(staff 테이블은 지점별 병원장 4명뿐이라 별도 저장) — settings_business.total_staff_count. */
export async function getTotalStaffCount(): Promise<number | null> {
  const supabase = supabasePublic();
  const { data, error } = await supabase
    .from("settings_business")
    .select("total_staff_count")
    .eq("id", true)
    .maybeSingle();
  if (error || data?.total_staff_count == null) return null;
  return data.total_staff_count as number;
}

export type PageImage = { url: string; alt: string } | null;

/** 페이지별 교체 가능 이미지(오버뷰 사진·병원장 사진·서브페이지 상단 사진 등) — page_images.page_key로 조회.
 *  관리자 업로드 전에는 테이블이 비어 있거나 없을 수 있어 항상 null로 안전하게 폴백한다. */
export async function getPageImage(pageKey: string): Promise<PageImage> {
  const supabase = supabasePublic();
  const { data, error } = await supabase
    .from("page_images")
    .select("url, alt")
    .eq("page_key", pageKey)
    .maybeSingle();
  if (error || !data?.url) return null;
  return { url: data.url, alt: data.alt ?? "" };
}
