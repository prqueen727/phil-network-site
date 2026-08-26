/**
 * blog-save.ts — 블로그(미디어게시판) 저장 단일 진입점(서버 전용)
 * ------------------------------------------------------------------
 * 04_supabase_참고구현/lib/saveBlogWithJsonLd.ts를 우리 스키마·라우트 구조에 맞게 이식.
 * "저장의 모든 경로"(생성 POST, 수정 PATCH)가 buildBlogRow() 하나만 거치게 해서
 * JSON-LD 조립·발행 가드·alt 가드를 빠짐없이 강제한다.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildBlogJsonLd, type BizInfo, type StaffInfo } from "@/lib/jsonld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

/** 발행 가드(대표 이미지 누락) / alt 가드가 던지는 에러 — 호출자가 400으로 구분해 응답한다. */
export class MissingFeaturedImageError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "MissingFeaturedImageError";
  }
}

export type SectionInput = { heading?: string; body: string };

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** 이스케이프된 텍스트 안의 **굵게** 표시만 <strong>으로 바꾼다. escapeHtml 이후에만 호출할 것(이스케이프 전이면 임의 HTML이 섞여 들어온다). */
function applyBold(escapedText: string): string {
  return escapedText.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

/** 관리자가 입력한 plain text(줄바꿈으로 문단 구분, **굵게** 지원)를 이스케이프 후 <p> 묶음 html로 변환 */
export function sectionsToHtml(sections: SectionInput[]): { heading: string; html: string }[] {
  return sections.map((s) => {
    const html = (s.body ?? "")
      .split(/\r?\n/)
      // "## 소제목" 같은 마크다운 헤더 기호가 섹션 자동분리 없이 그대로 붙여넣어진 경우,
      // 화면에 "##"가 글자 그대로 노출되지 않도록 앞머리 기호만 제거하고 일반 문단으로 표시한다.
      .map((line) => line.trim().replace(/^#{1,4}\s*/, "").trim())
      .filter(Boolean)
      .map((line) => `<p>${applyBold(escapeHtml(line))}</p>`)
      .join("");
    return { heading: (s.heading ?? "").trim(), html };
  });
}

const HANGUL_PATTERN = /[가-힣]/;

/** slug 자동 생성. 05 부록 D-3 원칙대로 한글 slug는 금지 — 한글 제목은 로마자 변환 없이 타임스탬프 폴백. */
export function autoSlug(title: string): string {
  if (!HANGUL_PATTERN.test(title)) {
    const ascii = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (ascii) return ascii;
  }
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `post-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

export interface BuildBlogRowInput {
  title: string;
  slug?: string;
  excerpt?: string;
  sections: SectionInput[];
  authorId: string;
  featuredImageId?: string | null;
  /** 목록 카드용 대표 이미지와 별개로, 본문 안에 노출되는 이미지 1장(선택). */
  bodyImageId?: string | null;
  publish: boolean;
  /** 수정 시: 기존 published_at. 이미 발행된 글을 다시 저장할 때 발행 시각을 유지하기 위함(매 저장마다 갱신되지 않게). */
  existingPublishedAt?: string | null;
}

export interface BlogRow {
  title: string;
  slug: string;
  excerpt: string;
  sections_html: { heading: string; html: string }[];
  structured_data: unknown;
  featured_image_id: string | null;
  body_image_id: string | null;
  author_id: string;
  status: "draft" | "published";
  published_at: string | null;
}

/**
 * 발행 가드(대표 이미지 필수) + alt 가드 + JSON-LD 자동 조립을 거쳐 blogs 테이블에 넣을 row를 만든다.
 * @param sb service_role 클라이언트(RLS 우회 — 서버에서만)
 */
export async function buildBlogRow(sb: SupabaseClient, input: BuildBlogRowInput): Promise<BlogRow> {
  if (!input.title?.trim()) throw new Error("제목을 입력해주세요.");
  if (!input.authorId) throw new Error("작성자를 선택해주세요.");

  // ★발행 가드: 발행하려는 글은 대표 이미지가 반드시 있어야 한다.
  //   대표 이미지가 없으면 og:image·JSON-LD image·목록 썸네일이 전부 빈다. draft는 허용한다.
  if (input.publish && !input.featuredImageId) {
    throw new MissingFeaturedImageError(
      "대표 이미지가 필요합니다. 임시저장(초안)으로 저장한 뒤 대표 이미지를 업로드하고 발행하세요.",
    );
  }

  const [{ data: biz }, { data: staff, error: staffError }, mediaResult, bodyMediaResult] = await Promise.all([
    sb.from("settings_business").select("*").maybeSingle(),
    sb.from("staff").select("*").eq("id", input.authorId).single(),
    input.featuredImageId
      ? sb.from("media").select("id, storage_path, alt, width, height").eq("id", input.featuredImageId).single()
      : Promise.resolve({ data: null, error: null } as { data: null; error: null }),
    input.bodyImageId
      ? sb.from("media").select("id, storage_path, alt").eq("id", input.bodyImageId).single()
      : Promise.resolve({ data: null, error: null } as { data: null; error: null }),
  ]);

  if (staffError || !staff) {
    throw new Error("지정한 작성자를 찾을 수 없습니다.");
  }

  const mediaRow = mediaResult.data as { id: string; storage_path: string | null; alt: string | null; width: number | null; height: number | null } | null;
  if (input.featuredImageId) {
    if (!mediaRow) throw new Error("지정한 대표 이미지를 찾을 수 없습니다.");
    // ★alt 가드: 대표 이미지에 alt가 비어 있으면 이미지 SEO·접근성이 죽는다.
    if (!String(mediaRow.alt ?? "").trim()) {
      throw new MissingFeaturedImageError(
        "대표 이미지에 대체텍스트(alt)가 없습니다. 미디어를 다시 업로드하며 alt를 채운 뒤 저장하세요.",
      );
    }
  }

  const bodyMediaRow = bodyMediaResult.data as { id: string; storage_path: string | null; alt: string | null } | null;
  if (input.bodyImageId && !bodyMediaRow) {
    throw new Error("지정한 본문 이미지를 찾을 수 없습니다.");
  }

  const sectionsHtml = sectionsToHtml(input.sections);
  const slug = input.slug?.trim() || autoSlug(input.title);
  const excerpt = input.excerpt?.trim() || (input.sections[0]?.body ?? "").trim().slice(0, 120);

  const featuredImage = mediaRow?.storage_path
    ? {
        url: mediaRow.storage_path,
        alt: mediaRow.alt ?? undefined,
        width: mediaRow.width ?? undefined,
        height: mediaRow.height ?? undefined,
      }
    : null;

  // 발행 시점: 새로 발행되는 경우만 now(), 이미 발행된 글을 재저장하면 기존 시각 유지.
  const publishedAt = input.publish ? input.existingPublishedAt ?? new Date().toISOString() : null;

  const structuredData = buildBlogJsonLd(
    { title: input.title.trim(), slug, excerpt, published_at: publishedAt ?? undefined, faqs: [], featured_image: featuredImage },
    staff as StaffInfo,
    biz as BizInfo | null,
    SITE_URL,
  );

  return {
    title: input.title.trim(),
    slug,
    excerpt,
    sections_html: sectionsHtml,
    structured_data: structuredData,
    featured_image_id: input.featuredImageId ?? null,
    body_image_id: input.bodyImageId ?? null,
    author_id: input.authorId,
    status: input.publish ? "published" : "draft",
    published_at: publishedAt,
  };
}
