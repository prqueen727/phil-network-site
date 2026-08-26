import type { Metadata } from "next";
import "./globals.css";

// STEP 9 — 구글/네이버 소유확인. 콘솔에서 코드를 받기 전에는 env가 없어 자리만 비어있고, 태그는 안 나간다.
const GOOGLE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const NAVER_VERIFICATION = process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION;

export const metadata: Metadata = {
  title: "필한방병원 네트워크 | 한·양방 협진 진료",
  description: "대전, 청주, 성동구, 충무로를 연결하는 필한방병원 네트워크",
  verification: {
    ...(GOOGLE_VERIFICATION ? { google: GOOGLE_VERIFICATION } : {}),
    // 네이버는 verification 필드에 전용 지원이 없어 other로 넣는다 — <meta name="naver-site-verification">로 출력됨.
    ...(NAVER_VERIFICATION ? { other: { "naver-site-verification": NAVER_VERIFICATION } } : {}),
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="ko"><body>{children}</body></html>;
}
