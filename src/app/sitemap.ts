import type { MetadataRoute } from "next";
import { getBranches } from "@/lib/data/branches";
import { getPublishedBlogs } from "@/lib/data/blogs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

// Supabase 호출은 Next가 "request-time API"로 인식하지 못해 기본값이 정적 프리렌더로 굳는다.
// 새로 발행된 글이 재배포 전까지 사이트맵에서 누락되는 사고를 막기 위해 매 요청마다 재생성한다.
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 지점·발행 글 목록은 목록 페이지가 쓰는 조회 함수를 그대로 재사용한다
  // (따로 쿼리하면 한쪽에만 항목이 빠지는 사고가 난다 — build.md STEP 3·9-A-2).
  const [branches, posts] = await Promise.all([getBranches(), getPublishedBlogs()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/network`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/network/director`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/branches`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/media`, changeFrequency: "daily", priority: 0.7 },
  ];

  const branchRoutes: MetadataRoute.Sitemap = branches.map((branch) => ({
    url: `${SITE_URL}/branches/${branch.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/media/${post.slug}`,
    lastModified: post.published_at ? new Date(post.published_at) : undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...branchRoutes, ...postRoutes];
}
