import { redirect } from "next/navigation";
import { supabaseServerSession } from "@/lib/supabase/server";
import { getAllStaff } from "@/lib/data/staff";
import { BlogEditor } from "@/components/admin/BlogEditor";

export default async function AdminBlogNewPage() {
  const supabase = await supabaseServerSession();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/admin/login");

  const staff = await getAllStaff();

  return (
    <main className="admin-page" style={{ alignItems: "flex-start", minHeight: "100vh" }}>
      <div className="admin-panel" style={{ maxWidth: 860 }}>
        <p className="eyebrow">ADMIN BLOGS</p>
        <h1 style={{ fontSize: 32 }}>새 글 작성</h1>
        <BlogEditor staff={staff} post={null} />
        <a className="back-link" href="/admin/blogs" style={{ marginTop: 40 }}>
          ← 칼럼 관리
        </a>
      </div>
    </main>
  );
}
