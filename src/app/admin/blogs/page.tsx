import { redirect } from "next/navigation";
import { supabaseServerSession } from "@/lib/supabase/server";
import { DeleteBlogButton } from "@/components/admin/DeleteBlogButton";

type BlogListRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
  author: { name: string } | { name: string }[] | null;
};

function authorName(author: BlogListRow["author"]): string {
  if (!author) return "작성자 미지정";
  if (Array.isArray(author)) return author[0]?.name ?? "작성자 미지정";
  return author.name;
}

export default async function AdminBlogsListPage() {
  const supabase = await supabaseServerSession();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/admin/login");

  const { data: posts, error } = await supabase
    .from("blogs")
    .select("id, title, slug, status, published_at, author:staff(name)")
    .order("created_at", { ascending: false });

  return (
    <main className="admin-page" style={{ alignItems: "flex-start", minHeight: "100vh" }}>
      <div className="admin-panel" style={{ maxWidth: 860 }}>
        <p className="eyebrow">ADMIN BLOGS</p>
        <h1 style={{ fontSize: 36 }}>칼럼 관리</h1>
        <p>의료진 칼럼(미디어게시판) 글을 작성·수정·발행합니다.</p>

        <p style={{ marginTop: 20 }}>
          <a className="button button-dark" href="/admin/blogs/new" style={{ display: "inline-flex" }}>
            + 새 글 작성
          </a>
        </p>

        {error ? (
          <p style={{ color: "#b3273f", fontSize: 13, marginTop: 24, lineHeight: 1.7 }}>{error.message}</p>
        ) : (
          <ul className="media-status-list" style={{ marginTop: 24 }}>
            {(posts as BlogListRow[] | null ?? []).map((p) => (
              <li key={p.id} style={{ gap: 14 }}>
                <span style={{ flex: 1 }}>
                  <b style={{ display: "block", fontWeight: 600, color: "var(--ink)", fontSize: 14 }}>{p.title}</b>
                  <span style={{ fontSize: 12, color: "#756b6d" }}>
                    {authorName(p.author)} ·{" "}
                    {p.published_at ? new Date(p.published_at).toLocaleDateString("ko-KR") : "미발행"}
                  </span>
                </span>
                <b style={{ color: p.status === "published" ? "#2f6b4f" : "#a3a3a3" }}>
                  {p.status === "published" ? "발행됨" : "초안"}
                </b>
                {p.status === "published" && (
                  <a className="text-link" href={`/media/${p.slug}`} target="_blank" rel="noopener noreferrer">
                    사이트에서 보기 ↗
                  </a>
                )}
                <a className="text-link" href={`/admin/blogs/${p.id}/edit`}>
                  편집 →
                </a>
                <DeleteBlogButton id={p.id} title={p.title} />
              </li>
            ))}
            {posts && posts.length === 0 && <li>아직 작성된 글이 없습니다.</li>}
          </ul>
        )}

        <a className="back-link" href="/admin" style={{ marginTop: 40 }}>
          ← 관리자 대시보드
        </a>
      </div>
    </main>
  );
}
