"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteStaffButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`"${name}" 의료진을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!data.ok) {
      window.alert(data.error ?? "삭제에 실패했습니다.");
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      className="text-link"
      onClick={handleDelete}
      disabled={loading}
      style={{ background: "none", border: 0, color: "#b3273f", cursor: "pointer", padding: 0 }}
    >
      {loading ? "삭제 중…" : "삭제"}
    </button>
  );
}
