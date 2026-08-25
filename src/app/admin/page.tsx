import { redirect } from "next/navigation";
import { supabaseServerSession } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await supabaseServerSession();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/admin/login");

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("id, name, service_type, status, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <main className="admin-page" style={{ alignItems: "flex-start", minHeight: "100vh" }}>
      <div className="admin-panel" style={{ maxWidth: 720 }}>
        <p className="eyebrow">ADMIN DASHBOARD</p>
        <h1 style={{ fontSize: 40 }}>관리자 대시보드</h1>
        <p>{user.email} 님으로 로그인됨</p>
        <p style={{ marginTop: 16 }}><a className="text-link" href="/admin/media">이미지 관리 <span>→</span></a></p>
        <p style={{ marginTop: 10 }}><a className="text-link" href="/admin/pages">페이지 관리 <span>→</span></a></p>
        <p style={{ marginTop: 10 }}><a className="text-link" href="/admin/blogs">칼럼 관리 <span>→</span></a></p>

        <h2 style={{ marginTop: 40, fontSize: 20 }}>문의 내역 ({inquiries?.length ?? 0}건)</h2>
        <ul style={{ marginTop: 12 }}>
          {inquiries && inquiries.length > 0
            ? inquiries.map((i) => (
                <li key={i.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                  {i.name} · {i.service_type ?? "-"} · {i.status}
                </li>
              ))
            : <li>아직 접수된 문의가 없습니다.</li>}
        </ul>

        <form action="/admin/logout" method="post" style={{ marginTop: 40 }}>
          <button className="button" type="submit">로그아웃</button>
        </form>
        <a className="back-link" href="/">← 홈페이지로 돌아가기</a>
      </div>
    </main>
  );
}
