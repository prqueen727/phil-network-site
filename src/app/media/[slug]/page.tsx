import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InternalPage } from "@/components/InternalPage";
import { getPublishedBlogBySlug } from "@/lib/data/blogs";
import { groupCareer } from "@/lib/data/staff";

type Sections = { heading?: string; html?: string }[];

// build.md STEP 5 검증 #3 — 발행 글은 og:image가 SSR로 나와야 한다(공유 미리보기·GEO 봇용).
// 대표 이미지 URL은 R2 공개 도메인이라 이미 절대 URL이다.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogBySlug(slug);
  if (!post) return {};

  const image = post.featured_image;
  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: "article",
      images: image?.storage_path ? [{ url: image.storage_path, alt: image.alt || post.title }] : undefined,
    },
  };
}

export default async function MediaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedBlogBySlug(slug);
  if (!post) notFound();

  const sections = (post.sections_html ?? []) as Sections;
  const authorCareerGroups = groupCareer(post.author?.career);
  const authorPhoto = post.author?.photo_url ?? post.featured_image?.storage_path ?? null;

  return (
    <InternalPage
      eyebrow="PHIL MEDIA"
      title={<>필한방병원<br /><em>의료진 칼럼</em></>}
      intro="필한방병원의 우수한 의료진의 칼럼으로 건강을 지켜보세요"
      heroImageKey="hero_media"
      backHref="/media"
      backLabel="← 다른 칼럼 보기"
    >
      {post.structured_data && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(post.structured_data) }}
        />
      )}
      <article className="article">
        <div className="article-header">
          <h1 className="article-title">{post.title}</h1>
          <p className="article-meta">
            {post.author?.name && <span>{post.author.name}{post.author.job_title ? ` · ${post.author.job_title}` : ""}</span>}
            {post.published_at && <time dateTime={post.published_at}>{new Date(post.published_at).toLocaleDateString("ko-KR")}</time>}
          </p>
        </div>

        <div className="article-body">
          {sections.length === 0 ? (
            <p>본문 콘텐츠가 준비 중입니다.</p>
          ) : (
            sections.map((section, index) => (
              <section key={index}>
                {section.heading && <h2>{section.heading}</h2>}
                {section.html && <div dangerouslySetInnerHTML={{ __html: section.html }} />}
              </section>
            ))
          )}
        </div>

        {post.author && (
          <div className="article-author">
            <div className="article-author-header">
              {authorPhoto && (
                <span
                  className="article-author-photo"
                  style={{ backgroundImage: `url(${authorPhoto})` }}
                  role="img"
                  aria-label={post.author.name}
                />
              )}
              <div>
                <p className="care-label">글쓴이 소개</p>
                <h2>{post.author.name}{post.author.job_title ? ` · ${post.author.job_title}` : ""}</h2>
                {post.author.specialty && <p className="article-author-specialty">전문분야 · {post.author.specialty}</p>}
              </div>
            </div>
            {post.author.bio && <p className="director-bio">{post.author.bio}</p>}
            {authorCareerGroups.length > 0 && (
              <div className="career-groups article-author-career">
                {authorCareerGroups.map((group) => (
                  <div className="career-group" key={group.heading}>
                    <h2>{group.heading}</h2>
                    <ul>
                      {group.lines.map((line, index) => (
                        <li key={index}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </article>
    </InternalPage>
  );
}
