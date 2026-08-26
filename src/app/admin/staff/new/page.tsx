import { redirect } from "next/navigation";
import { supabaseServerSession } from "@/lib/supabase/server";
import { StaffEditor } from "@/components/admin/StaffEditor";

export default async function AdminStaffNewPage() {
  const supabase = await supabaseServerSession();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/admin/login");

  return (
    <main className="admin-page" style={{ alignItems: "flex-start", minHeight: "100vh" }}>
      <div className="admin-panel" style={{ maxWidth: 860 }}>
        <p className="eyebrow">ADMIN STAFF</p>
        <h1 style={{ fontSize: 32 }}>새 의료진 추가</h1>
        <StaffEditor staff={null} />
        <a className="back-link" href="/admin/staff" style={{ marginTop: 40 }}>
          ← 의료진 관리
        </a>
      </div>
    </main>
  );
}
