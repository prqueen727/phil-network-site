"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const supabase = supabaseBrowser();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="admin-page">
      <div className="admin-panel">
        <a className="brand" href="/"><span className="brand-mark">必</span><span><strong>PHIL</strong><small>KOREAN MEDICINE HOSPITAL</small></span></a>
        <p className="eyebrow">PRIVATE ADMIN</p>
        <h1>관리자 로그인</h1>
        <p>홈페이지 콘텐츠를 관리하는 운영자 전용 공간입니다.</p>
        <form className="admin-form" onSubmit={handleSubmit}>
          <label>이메일<input type="email" name="email" placeholder="admin@example.com" required /></label>
          <label>비밀번호<input type="password" name="password" placeholder="비밀번호 입력" required /></label>
          {error && <p style={{ color: "#b3273f", fontSize: 13, marginBottom: 18 }}>{error}</p>}
          <button className="button button-dark" type="submit" disabled={loading}>
            {loading ? "로그인 중…" : "로그인"} <span>↗</span>
          </button>
        </form>
        <a className="back-link" href="/">← 홈페이지로 돌아가기</a>
      </div>
    </main>
  );
}
