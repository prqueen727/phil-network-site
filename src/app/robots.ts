import type { MetadataRoute } from "next";
import { supabasePublic } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

// settings_geo 토글이 재배포 없이도 바로 반영되도록 매 요청마다 재생성한다 (sitemap.ts와 동일한 이유).
export const revalidate = 0;

// AI 크롤러 9종 + 네이버 Yeti — GEO_참고자료/build.md STEP 3·9-A
const AI_CRAWLER_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "PerplexityBot",
  "Applebot-Extended",
  "CCBot",
  "Yeti",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const supabase = supabasePublic();
  const { data: geo } = await supabase
    .from("settings_geo")
    .select("allow_ai_crawlers, extra_robots_rules")
    .maybeSingle();

  // 테이블에 행이 아직 없으면 컬럼 기본값(true)과 동일하게 취급한다.
  const allowAiCrawlers = geo?.allow_ai_crawlers ?? true;
  const extraDisallow = (geo?.extra_robots_rules ?? "")
    .split("\n")
    .map((line: string) => line.trim())
    .filter(Boolean);

  const rules: MetadataRoute.Robots["rules"] = [
    { userAgent: "*", allow: "/", disallow: extraDisallow.length ? extraDisallow : undefined },
  ];
  if (allowAiCrawlers) {
    rules.push({ userAgent: AI_CRAWLER_AGENTS, allow: "/" });
  }

  return {
    rules,
    // rss도 함께 적어야 봇이 사이트맵 없이도 새 글을 스스로 찾아간다 (build.md 9-A-2).
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/rss`],
  };
}
