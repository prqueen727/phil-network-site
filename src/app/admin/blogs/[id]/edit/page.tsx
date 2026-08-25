import { redirect, notFound } from "next/navigation";
import { supabaseServerSession } from "@/lib/supabase/server";
import { getAllStaff } from "@/lib/data/staff";
import { BlogEditor, type EditableBlogPost } from "@/components/admin/BlogEditor";

export default async function AdminBlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServerSession();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/admin/login");

  const [staff, { data: post, error }] = await Promise.all([
    getAllStaff(),
    supabase
      .from("blogs")
      .select("id, title, slug, excerpt, sections_html, author_id, featured_image_id, featured_image:media(id, storage_path, alt)")
      .eq("id", id)
      .maybeSingle(),
  ]);

  if (error) {
    return (
      <main className="admin-page" style={{ alignItems: "flex-start", minHeight: "100vh" }}>
        <div className="admin-panel" style={{ maxWidth: 760 }}>
          <p className="eyebrow">ADMIN BLOGS</p>
          <h1 style={{ fontSize: 32 }}>글을 불러올 수 없습니다</h1>
          <p style={{ color: "#b3273f", fontSize: 13 }}>{error.message}</p>
          <a className="back-link" href="/admin/blogs">← 칼럼 관리</a>
        </div>
      </main>
    );
  }
  if (!post) notFound();

  const featuredImageRaw = post.featured_image as unknown;
  const featuredImage = Array.isArray(featuredImageRaw) ? featuredImageRaw[0] ?? null : featuredImageRaw ?? null;

  const editablePost: EditableBlogPost = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    sections_html: post.sections_html,
    author_id: post.author_id,
    featured_image_id: post.featured_image_id,
    featured_image: featuredImage as EditableBlogPost["featured_image"],
  };

  return (
    <main className="admin-page" style={{ alignItems: "flex-start", minHeight: "100vh" }}>
      <div className="admin-panel" style={{ maxWidth: 860 }}>
        <p className="eyebrow">ADMIN BLOGS</p>
        <h1 style={{ fontSize: 32 }}>{post.title} 편집</h1>
        <BlogEditor staff={staff} post={editablePost} />
        <a className="back-link" href="/admin/blogs" style={{ marginTop: 40 }}>
          ← 칼럼 관리
        </a>
      </div>
    </main>
  );
}
