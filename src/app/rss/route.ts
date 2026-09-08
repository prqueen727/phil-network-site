import { getPublishedBlogs } from "@/lib/data/blogs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET() {
  const posts = await getPublishedBlogs(50);

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/media/${post.slug}`;
      // pubDate는 RFC-822여야 한다 — ISO 문자열을 넣으면 봇이 날짜를 못 읽는다 (build.md 9-A-2).
      const pubDate = (post.published_at ? new Date(post.published_at) : new Date()).toUTCString();
      const description = post.excerpt ? `<description>${escapeXml(post.excerpt)}</description>` : "";
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      ${description}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>필한방병원 네트워크 의료진 칼럼</title>
    <link>${SITE_URL}/media</link>
    <description>대전, 청주, 성동구, 충무로를 연결하는 필한방병원 네트워크의 의료진 칼럼</description>
    <language>ko</language>
    <atom:link href="${SITE_URL}/rss" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
