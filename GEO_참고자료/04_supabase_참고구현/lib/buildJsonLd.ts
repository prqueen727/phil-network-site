/**
 * buildJsonLd.ts — JSON-LD(@graph) 조립 순수함수 (Payload 04 generateBlogJsonLd + buildAuthor 이식)
 * ------------------------------------------------------------------
 * ★ 이 파일은 DB/스택에 전혀 의존하지 않는다. 데이터를 인자로 받아 JSON-LD만 만든다.
 *   Payload 훅에서는 req.payload로 DB를 직접 읽었지만, 여기서는 호출자(saveBlogWithJsonLd)가
 *   Supabase에서 읽어온 데이터를 넘겨준다. → 스택이 바뀌어도 이 조립 로직은 재사용.
 *
 * @graph = [ BlogPosting, [업종]Business, FAQPage ]  (02 §2.2)
 */

export interface BizInfo {
  name?: string; business_type?: string; telephone?: string; url?: string;
  street_address?: string; address_locality?: string; address_region?: string;
  postal_code?: string; address_country?: string; latitude?: number; longitude?: number;
  same_as?: { url: string }[]; opening_hours?: string[]; logo_url?: string;
}
export interface StaffInfo {
  name: string; job_title?: string; bio?: string; slug?: string;
  profile_url?: string; alumni_of?: string; same_as?: { url: string }[];
}
export interface BlogForJsonLd {
  title: string; slug: string; excerpt?: string; published_at?: string;
  faqs?: { question: string; answer: string }[];
  /** 대표 이미지 (media 테이블 조인 결과) — BlogPosting.image + og:image 소스 */
  featured_image?: FeaturedImage | null;
}

/** media 행 → 대표 이미지. url은 절대 URL(R2 공개 도메인) */
export interface FeaturedImage {
  url: string; alt?: string; width?: number; height?: number;
}

/**
 * 대표 이미지 → schema.org ImageObject
 * 근거(3소스 교차검증): Google Search Central "Article structured data" —
 *  image는 required가 아니라 recommended이나 headline·datePublished·author와 함께
 *  가장 영향도 높은 4개 필드. 최소 50K픽셀(w×h), 16:9·4:3·1:1 권장.
 *  URL 문자열도 되지만 ImageObject가 width/height를 함께 줄 수 있어 우선.
 */
export function buildImageObject(img: FeaturedImage | null | undefined) {
  if (!img?.url) return undefined;
  return {
    '@type': 'ImageObject',
    url: img.url,
    contentUrl: img.url,
    width: img.width || undefined,
    height: img.height || undefined,
    // alt 텍스트는 schema.org에서 caption/description으로 표현한다
    caption: img.alt || undefined,
  };
}

/** staff → schema.org Person (E-E-A-T) */
export function buildAuthor(staff: StaffInfo | null, biz: BizInfo | null, siteUrl: string) {
  if (!staff) return undefined;
  const sameAs = (staff.same_as ?? []).map((s) => s.url).filter(Boolean);
  return {
    '@type': 'Person',
    name: staff.name,
    jobTitle: staff.job_title || undefined,
    description: staff.bio || undefined,
    url: staff.profile_url || (staff.slug ? `${siteUrl}/doctors/${staff.slug}` : undefined),
    sameAs: sameAs.length ? sameAs : undefined,
    alumniOf: staff.alumni_of || undefined,
    worksFor: biz?.name
      ? { '@type': biz.business_type || 'LocalBusiness', name: biz.name, url: siteUrl }
      : undefined,
  };
}

/** settings_business → [업종]Business */
export function buildBusinessSchema(biz: BizInfo | null, siteUrl: string) {
  return {
    '@type': biz?.business_type || 'LocalBusiness',
    name: biz?.name,
    telephone: biz?.telephone,
    url: siteUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: biz?.street_address,
      addressLocality: biz?.address_locality,
      addressRegion: biz?.address_region,
      postalCode: biz?.postal_code || undefined,
      addressCountry: biz?.address_country || 'KR',
    },
    geo: biz?.latitude && biz?.longitude
      ? { '@type': 'GeoCoordinates', latitude: biz.latitude, longitude: biz.longitude }
      : undefined,
    sameAs: (biz?.same_as ?? []).map((s) => s.url).filter(Boolean),
    openingHours: biz?.opening_hours ?? [],
  };
}

/** faqs → FAQPage */
export function faqSchema(faqs: { question: string; answer: string }[] | undefined) {
  if (!Array.isArray(faqs) || faqs.length === 0) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

/** 최종 @graph 조립 (generateBlogJsonLd 훅 본체) */
export function buildBlogJsonLd(
  blog: BlogForJsonLd,
  staff: StaffInfo | null,
  biz: BizInfo | null,
  siteUrl: string,
) {
  const pageUrl = `${siteUrl}/blog/${blog.slug || ''}`;
  const graph: any[] = [
    {
      '@type': 'BlogPosting',
      headline: blog.title,
      description: blog.excerpt || '',
      inLanguage: 'ko',
      datePublished: blog.published_at || new Date().toISOString(),
      author: buildAuthor(staff, biz, siteUrl),
      image: buildImageObject(blog.featured_image),  // ★대표 이미지 (없으면 undefined로 빠짐)
      mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
      url: pageUrl,
    },
    buildBusinessSchema(biz, siteUrl),
  ];
  const faq = faqSchema(blog.faqs);
  if (faq) graph.push(faq);
  return { '@context': 'https://schema.org', '@graph': graph };
}
