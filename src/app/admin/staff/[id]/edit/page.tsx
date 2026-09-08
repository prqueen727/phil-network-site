import { redirect, notFound } from "next/navigation";
import { supabaseServerSession } from "@/lib/supabase/server";
import { StaffEditor, type EditableStaff } from "@/components/admin/StaffEditor";

export default async function AdminStaffEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServerSession();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/admin/login");

  const { data: staff, error } = await supabase
    .from("staff")
    .select("id, name, slug, job_title, bio, specialty, alumni_of, profile_url, photo_url, career, same_as")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <main className="admin-page" style={{ alignItems: "flex-start", minHeight: "100vh" }}>
        <div className="admin-panel" style={{ maxWidth: 760 }}>
          <p className="eyebrow">ADMIN STAFF</p>
          <h1 style={{ fontSize: 32 }}>의료진 정보를 불러올 수 없습니다</h1>
          <p style={{ color: "#b3273f", fontSize: 13 }}>{error.message}</p>
          <a className="back-link" href="/admin/staff">← 의료진 관리</a>
        </div>
      </main>
    );
  }
  if (!staff) notFound();

  return (
    <main className="admin-page" style={{ alignItems: "flex-start", minHeight: "100vh" }}>
      <div className="admin-panel" style={{ maxWidth: 860 }}>
        <p className="eyebrow">ADMIN STAFF</p>
        <h1 style={{ fontSize: 32 }}>{staff.name} 편집</h1>
        <StaffEditor staff={staff as EditableStaff} />
        <a className="back-link" href="/admin/staff" style={{ marginTop: 40 }}>
          ← 의료진 관리
        </a>
      </div>
    </main>
  );
}
