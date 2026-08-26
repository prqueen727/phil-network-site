import { redirect } from "next/navigation";
import { supabaseServerSession } from "@/lib/supabase/server";

const SITE_PATHS: Record<string, string> = {
  home: "/",
  about: "/about",
  director: "/network/director",
};

export default async function AdminPagesListPage() {
  const supabase = await supabaseServerSession();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/admin/login");

  const { data: pages, error } = await supabase
    .from("site_pages")
    .select("id, slug, title, is_published, page_sections(count)")
    .order("slug", { ascending: true });

  return (
    <main className="admin-page" style={{ alignItems: "flex-start", minHeight: "100vh" }}>
      <div className="admin-panel" style={{ maxWidth: 760 }}>
        <p className="eyebrow">ADMIN PAGES</p>
        <h1 style={{ fontSize: 36 }}>페이지 관리</h1>
        <p>서브페이지의 섹션을 코드 수정 없이 추가·수정·삭제·순서변경할 수 있습니다.</p>

        {error ? (
          <p style={{ color: "#b3273f", fontSize: 13, marginTop: 24, lineHeight: 1.7 }}>
            site_pages 테이블을 찾을 수 없습니다. <code>supabase/002_page_sections.sql</code>을 Supabase SQL
            Editor에서 먼저 실행해주세요.
            <br />
            ({error.message})
          </p>
        ) : (
          <ul className="media-status-list" style={{ marginTop: 24 }}>
            {(pages ?? []).map((p) => {
              const sectionCount = Array.isArray(p.page_sections) ? p.page_sections[0]?.count ?? 0 : 0;
              return (
                <li key={p.id} style={{ gap: 14 }}>
                  <span style={{ flex: 1 }}>
                    <b style={{ display: "block", fontWeight: 600, color: "var(--ink)", fontSize: 14 }}>{p.title}</b>
                    <span style={{ fontSize: 12, color: "#756b6d" }}>/{p.slug} · 섹션 {sectionCount}개</span>
                  </span>
                  <b>{p.is_published ? "공개" : "비공개"}</b>
                  {SITE_PATHS[p.slug] && (
                    <a className="text-link" href={SITE_PATHS[p.slug]} target="_blank" rel="noopener noreferrer">
                      사이트에서 보기 ↗
                    </a>
                  )}
                  <a className="text-link" href={`/admin/pages/${p.slug}`}>
                    편집 →
                  </a>
                </li>
              );
            })}
            {pages && pages.length === 0 && (
              <li>등록된 페이지가 없습니다. scripts/seed-page-sections.mjs를 실행해주세요.</li>
            )}
          </ul>
        )}

        <a className="back-link" href="/admin" style={{ marginTop: 40 }}>
          ← 관리자 대시보드
        </a>
      </div>
    </main>
  );
}
