/**
 * saveBlogWithJsonLd.ts — ★저장 단일 진입점 (Payload beforeChange 훅 대체)
 * ═══════════════════════════════════════════════════════════════════════════
 *  Design R1: "저장의 모든 경로"가 이 함수 하나만 호출한다.
 *  → save 라우트도, 자동발행 스케줄러도, 관리자 수동저장도 전부 이 함수 경유.
 *  → JSON-LD 생성을 빼먹을 방법이 없다 (훅 없이도 "빠짐없이" 보장).
 *
 *  Payload 훅과의 차이:
 *   - Payload: 저장 시 프레임워크가 자동으로 훅 발동 → req.payload로 DB 읽음
 *   - 여기:   호출자가 이 함수를 부르면, 이 함수가 Supabase에서 biz/staff를 읽고
 *            JSON-LD를 조립해 insert. "자동 발동" 대신 "단일 함수 강제"로 누락 방지.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { buildBlogJsonLd } from './buildJsonLd'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
/** R2 공개 도메인 (STEP 6에서 발급) — media.storage_path가 키일 때 절대 URL 조립용 */
const R2_PUBLIC_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE || '').replace(/\/$/, '')

/** 05 geo 모드가 만드는 GeoArticle 구조 (네이버 리라이팅 결과) */
export interface GeoArticleInput {
  title: string
  slug: string
  excerpt?: string
  lede?: string
  keyAnswer?: string
  tldr?: string[]
  quoteReady?: Record<string, string> | { line: string }[]
  sections?: { heading: string; html: string }[]
  faq?: { q: string; a: string }[]
}

export interface SaveOptions {
  authorId: string           // staff.id (필수 — E-E-A-T)
  categoryId?: string
  publish?: boolean          // true=published, false=draft
  sourceUrl?: string
  sourceLogNo?: string       // "blogId:logNo" 중복방지
  /**
   * ★대표 이미지 = media.id (OG image + JSON-LD BlogPosting.image 소스)
   * draft는 없어도 되지만 publish:true면 필수 — 아래 가드에서 강제한다.
   */
  featuredImageId?: string
}

/** 발행 시 대표 이미지 누락을 막는 가드가 던지는 에러 (호출자가 구분해 잡을 수 있게) */
export class MissingFeaturedImageError extends Error {
  constructor(msg: string) { super(msg); this.name = 'MissingFeaturedImageError' }
}

/**
 * @param sb  service_role 클라이언트 (RLS 우회 — 서버에서만)
 * @returns   { id, slug }
 */
export async function saveBlogWithJsonLd(
  sb: SupabaseClient,
  article: GeoArticleInput,
  opts: SaveOptions,
): Promise<{ id: string; slug: string }> {
  // 0) ★발행 가드: published 글은 대표 이미지가 반드시 있어야 한다.
  //    이유 — 대표 이미지가 없으면 og:image·JSON-LD image·목록 썸네일이 전부 빈다.
  //    draft는 허용한다(검수 단계에서 R2 업로드 후 채우는 흐름 = STEP 4가 STEP 5보다 앞선 이유).
  if (opts.publish && !opts.featuredImageId) {
    throw new MissingFeaturedImageError(
      '발행하려면 대표 이미지(featuredImageId)가 필요합니다. ' +
      'draft로 저장한 뒤 미디어를 업로드해 지정하고 발행하세요.',
    )
  }

  // 1) JSON-LD 조립에 필요한 데이터를 Supabase에서 읽는다 (Payload findGlobal/findByID 대체)
  //    대표 이미지도 여기서 함께 읽는다 (media.alt/url → ImageObject + og:image)
  const [{ data: biz }, { data: staff }, { data: mediaRow }] = await Promise.all([
    sb.from('settings_business').select('*').limit(1).single(),
    sb.from('staff').select('*').eq('id', opts.authorId).single(),
    opts.featuredImageId
      ? sb.from('media').select('storage_path, alt, width, height')
          .eq('id', opts.featuredImageId).single()
      : Promise.resolve({ data: null } as any),
  ])

  // 1-1) ★alt 가드: 대표 이미지에 alt가 비어 있으면 이미지 SEO가 죽는다.
  //      "그릇만 있고 안 채우는" 사고를 저장 시점에 차단한다.
  if (opts.featuredImageId && mediaRow && !String(mediaRow.alt ?? '').trim()) {
    throw new MissingFeaturedImageError(
      `대표 이미지(media ${opts.featuredImageId})에 alt 텍스트가 없습니다. ` +
      '미디어 라이브러리에서 alt를 채운 뒤 다시 저장하세요. (이미지 SEO 필수)',
    )
  }

  // storage_path가 R2 키면 공개 도메인을 붙여 절대 URL로 만든다 (JSON-LD·og:image는 절대 URL 필수)
  const featuredImage = mediaRow
    ? {
        url: /^https?:\/\//.test(mediaRow.storage_path ?? '')
          ? mediaRow.storage_path
          : `${R2_PUBLIC_BASE}/${String(mediaRow.storage_path ?? '').replace(/^\//, '')}`,
        alt: mediaRow.alt ?? undefined,
        width: mediaRow.width ?? undefined,
        height: mediaRow.height ?? undefined,
      }
    : null

  // 2) 순수 조립함수 재사용 (스택 무관)
  const faqs = (article.faq ?? []).map((f) => ({ question: f.q, answer: f.a }))
  const structuredData = buildBlogJsonLd(
    { title: article.title, slug: article.slug, excerpt: article.excerpt, faqs,
      published_at: opts.publish ? new Date().toISOString() : undefined,
      featured_image: featuredImage },
    staff, biz, SITE_URL,
  )

  // 3) GeoArticle → blogs 컬럼 매핑
  const quoteReady = Array.isArray(article.quoteReady)
    ? article.quoteReady
    : Object.values(article.quoteReady ?? {}).filter(Boolean).map((line) => ({ line: String(line) }))

  const row = {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt
      ?? [article.keyAnswer, ...(article.tldr ?? [])].filter(Boolean).join(' ').slice(0, 300),
    lede: article.lede,
    key_answer: article.keyAnswer,
    tldr: (article.tldr ?? []).map((line) => ({ line })),
    quote_ready: quoteReady,
    sections_html: (article.sections ?? []).map((s) => ({ heading: s.heading, html: s.html })),
    faqs,
    structured_data: structuredData,      // ★자동 조립됨 — 누락 불가
    featured_image_id: opts.featuredImageId ?? null,   // ★OG image / JSON-LD image 소스
    author_id: opts.authorId,
    category_id: opts.categoryId ?? null,
    status: opts.publish ? 'published' : 'draft',
    published_at: opts.publish ? new Date().toISOString() : null,
    source_url: opts.sourceUrl ?? null,
    source_log_no: opts.sourceLogNo ?? null,
  }

  const { data, error } = await sb.from('blogs').insert(row).select('id, slug').single()
  if (error) throw new Error(`blogs insert 실패: ${error.message}`)
  return data as { id: string; slug: string }
}
