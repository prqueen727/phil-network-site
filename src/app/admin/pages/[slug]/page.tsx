import { redirect, notFound } from "next/navigation";
import { supabaseServerSession } from "@/lib/supabase/server";
import { PageEditor } from "@/components/admin/PageEditor";

export default async function AdminPageEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await supabaseServerSession();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/admin/login");

  const { data: page, error } = await supabase.from("site_pages").select("*").eq("slug", slug).maybeSingle();

  if (error) {
    return (
      <main className="admin-page" style={{ alignItems: "flex-start", minHeight: "100vh" }}>
        <div className="admin-panel" style={{ maxWidth: 760 }}>
          <p className="eyebrow">ADMIN PAGES</p>
          <h1 style={{ fontSize: 32 }}>페이지를 불러올 수 없습니다</h1>
          <p style={{ color: "#b3273f", fontSize: 13 }}>{error.message}</p>
          <a className="back-link" href="/admin/pages">← 페이지 관리</a>
        </div>
      </main>
    );
  }
  if (!page) notFound();

  const { data: sections } = await supabase
    .from("page_sections")
    .select("*")
    .eq("page_id", page.id)
    .order("sort_order", { ascending: true });

  return (
    <main className="admin-page" style={{ alignItems: "flex-start", minHeight: "100vh" }}>
      <div className="admin-panel" style={{ maxWidth: 860 }}>
        <p className="eyebrow">ADMIN PAGES</p>
        <h1 style={{ fontSize: 32 }}>{page.title} 편집</h1>
        <p style={{ fontSize: 13, color: "#756b6d" }}>/{page.slug}</p>

        <PageEditor page={page} sections={sections ?? []} />

        <a className="back-link" href="/admin/pages" style={{ marginTop: 40 }}>← 페이지 관리</a>
      </div>
    </main>
  );
}
