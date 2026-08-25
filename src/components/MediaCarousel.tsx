import Link from "next/link";
import type { MediaListItem } from "@/lib/data/blogs";

/** 최신 발행 글 최대 4건을 카드로 나란히 보여준다(서버 컴포넌트 — SSR 그대로, JS 불필요).
 *  글이 0건이면 빈 상태를 보여주되 마크업 구조는 그대로라 글이 생기면 즉시 카드로 채워진다. */
export function MediaCarousel({ posts }: { posts: MediaListItem[] }) {
  if (posts.length === 0) {
    return (
      <div className="media-carousel-empty">
        <span>MEDIA BOARD</span>
        <h3>첫 소식을 준비 중입니다</h3>
        <p>관리자 페이지에서 글을 발행하면 이 자리에 카드로 노출됩니다.</p>
      </div>
    );
  }

  return (
    <div className="media-grid">
      {posts.map((post) => (
        <Link className="media-card" href={`/media/${post.slug}`} key={post.id}>
          <span
            className="media-card-image"
            style={post.featured_image?.storage_path ? { backgroundImage: `url(${post.featured_image.storage_path})` } : undefined}
            role={post.featured_image ? "img" : undefined}
            aria-label={post.featured_image?.alt ?? undefined}
          />
          <div className="media-card-copy">
            <small>필한방병원 의료진 칼럼</small>
            <h3>{post.title}</h3>
            {post.excerpt && <p>{post.excerpt}</p>}
          </div>
        </Link>
      ))}
    </div>
  );
}
