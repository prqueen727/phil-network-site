import { redirect } from "next/navigation";
import { supabaseServerSession } from "@/lib/supabase/server";
import { DeleteStaffButton } from "@/components/admin/DeleteStaffButton";

export default async function AdminStaffListPage() {
  const supabase = await supabaseServerSession();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/admin/login");

  const { data: staffList, error } = await supabase
    .from("staff")
    .select("id, name, job_title, photo_url")
    .order("name", { ascending: true });

  return (
    <main className="admin-page" style={{ alignItems: "flex-start", minHeight: "100vh" }}>
      <div className="admin-panel" style={{ maxWidth: 760 }}>
        <p className="eyebrow">ADMIN STAFF</p>
        <h1 style={{ fontSize: 36 }}>의료진 관리</h1>
        <p>칼럼 작성자로 선택할 수 있는 의료진을 등록·수정합니다.</p>

        <p style={{ marginTop: 20 }}>
          <a className="button button-dark" href="/admin/staff/new" style={{ display: "inline-flex" }}>
            + 새 의료진 추가
          </a>
        </p>

        {error ? (
          <p style={{ color: "#b3273f", fontSize: 13, marginTop: 24, lineHeight: 1.7 }}>{error.message}</p>
        ) : (
          <ul className="media-status-list" style={{ marginTop: 24 }}>
            {(staffList ?? []).map((s) => (
              <li key={s.id} style={{ gap: 14 }}>
                {s.photo_url && <span className="media-thumb" style={{ backgroundImage: `url(${s.photo_url})`, backgroundSize: "cover" }} />}
                <span style={{ flex: 1 }}>
                  <b style={{ display: "block", fontWeight: 600, color: "var(--ink)", fontSize: 14 }}>{s.name}</b>
                  <span style={{ fontSize: 12, color: "#756b6d" }}>{s.job_title ?? "직책 미지정"}</span>
                </span>
                <a className="text-link" href={`/admin/staff/${s.id}/edit`}>
                  편집 →
                </a>
                <DeleteStaffButton id={s.id} name={s.name} />
              </li>
            ))}
            {staffList && staffList.length === 0 && <li>아직 등록된 의료진이 없습니다.</li>}
          </ul>
        )}

        <a className="back-link" href="/admin" style={{ marginTop: 40 }}>
          ← 관리자 대시보드
        </a>
      </div>
    </main>
  );
}
