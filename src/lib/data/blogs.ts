import { supabasePublic } from "@/lib/supabase/server";

export type MediaFeaturedImage = {
  storage_path: string | null;
  alt: string | null;
};

export type MediaListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string | null;
  featured_image: MediaFeaturedImage | null;
};

/** 발행(published)된 글만 조회 — anon RLS로 draft는 자동 차단됨.
 *  메인 캐러셀·미디어 목록이 같은 함수를 써야 한쪽만 누락되는 사고를 막는다. */
export async function getPublishedBlogs(limit?: number): Promise<MediaListItem[]> {
  const supabase = supabasePublic();
  let query = supabase
    .from("blogs")
    .select("id, title, slug, excerpt, published_at, featured_image:media(storage_path, alt)")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error || !data) return [];
  return data as unknown as MediaListItem[];
}

/** 목록 페이지네이션용 — 페이지당 pageSize개 + 전체 개수(total pages 계산용). */
export async function getPublishedBlogsPage(page: number, pageSize: number): Promise<{ posts: MediaListItem[]; total: number }> {
  const supabase = supabasePublic();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await supabase
    .from("blogs")
    .select("id, title, slug, excerpt, published_at, featured_image:media(storage_path, alt)", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(from, to);
  if (error || !data) return { posts: [], total: 0 };
  return { posts: data as unknown as MediaListItem[], total: count ?? 0 };
}

export async function getPublishedBlogBySlug(slug: string) {
  const supabase = supabasePublic();
  const { data, error } = await supabase
    .from("blogs")
    .select("*, featured_image:media(storage_path, alt), author:staff(name, job_title, slug, bio, specialty, alumni_of, career, photo_url)")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}
