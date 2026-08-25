import Link from "next/link";
import { InternalPage } from "@/components/InternalPage";
import { getPublishedBlogsPage } from "@/lib/data/blogs";

const PAGE_SIZE = 8;

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const { posts, total } = await getPublishedBlogsPage(page, PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <InternalPage
      eyebrow="PHIL MEDIA"
      title={<>필한방병원<br /><em>의료진 칼럼</em></>}
      intro="필한방병원의 우수한 의료진의 칼럼으로 건강을 지켜보세요"
      heroImageKey="hero_media"
    >
      {posts.length === 0 ? (
        <div className="board-empty">
          <span>MEDIA BOARD</span>
          <h2>첫 번째 소식을 준비하고 있습니다</h2>
          <p>관리자 페이지에서 게시글을 작성하면 이 공간에 공개됩니다.</p>
        </div>
      ) : (
        <>
          <div className="board-list">
            {posts.map((post) => (
              <Link className="board-list-item" href={`/media/${post.slug}`} key={post.id}>
                <span
                  className="board-list-thumb"
                  style={post.featured_image?.storage_path ? { backgroundImage: `url(${post.featured_image.storage_path})` } : undefined}
                />
                <div>
                  <h3>{post.title}</h3>
                  {post.excerpt && <p>{post.excerpt}</p>}
                  {post.published_at && <time dateTime={post.published_at}>{new Date(post.published_at).toLocaleDateString("ko-KR")}</time>}
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="board-pagination" aria-label="칼럼 목록 페이지 네비게이션">
              {page > 1 ? (
                <Link className="board-pagination-link" href={`/media?page=${page - 1}`}>← 이전</Link>
              ) : (
                <span className="board-pagination-link is-disabled">← 이전</span>
              )}
              <span className="board-pagination-current">{page} / {totalPages}</span>
              {page < totalPages ? (
                <Link className="board-pagination-link" href={`/media?page=${page + 1}`}>다음 →</Link>
              ) : (
                <span className="board-pagination-link is-disabled">다음 →</span>
              )}
            </nav>
          )}
        </>
      )}
    </InternalPage>
  );
}
