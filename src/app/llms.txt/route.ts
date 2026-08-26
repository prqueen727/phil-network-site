import { supabasePublic } from "@/lib/supabase/server";
import { getBranches, formatOpeningHours } from "@/lib/data/branches";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export async function GET() {
  const supabase = supabasePublic();
  const [{ data: biz }, branches] = await Promise.all([
    supabase
      .from("settings_business")
      .select("name, telephone, street_address, opening_hours")
      .maybeSingle(),
    getBranches(),
  ]);

  const name = biz?.name ?? "필한방병원 네트워크";
  const lines: string[] = [
    `# ${name}`,
    `> ${biz?.street_address ?? ""} · 대표전화 ${biz?.telephone ?? ""} · ${formatOpeningHours(biz?.opening_hours)}`,
    "",
    "## 지점",
    ...branches.map(
      (branch) => `- [${branch.name}](${SITE_URL}/branches/${branch.slug}): ${branch.street_address} · ${branch.telephone}`,
    ),
    "",
    "## 페이지",
    `- [병원 소개](${SITE_URL}/about)`,
    `- [네트워크 소개](${SITE_URL}/network)`,
    `- [대표원장](${SITE_URL}/network/director)`,
    `- [오시는 길](${SITE_URL}/contact)`,
    `- [의료진 칼럼](${SITE_URL}/media): 최신 글은 ${SITE_URL}/rss 참고`,
  ];

  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
