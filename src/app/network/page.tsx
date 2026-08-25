import { redirect } from "next/navigation";

/** 병원소개는 /about이 정식 페이지 — 예전 임시 콘텐츠 대신 리다이렉트. */
export default function NetworkPage() {
  redirect("/about");
}
