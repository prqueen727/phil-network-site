import type { Metadata } from "next";
import "./globals.css";

// STEP 9 — 구글/네이버 소유확인. 콘솔에서 코드를 받기 전에는 env가 없어 자리만 비어있고, 태그는 안 나간다.
const GOOGLE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const NAVER_VERIFICATION = process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
const SITE_TITLE = "필한방병원 네트워크 | 한·양방 협진 진료";
const SITE_DESCRIPTION = "대전, 청주, 성동구, 충무로를 연결하는 필한방병원 네트워크";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  // og:image 미지정 시 카카오톡 등이 페이지 내 아무 이미지나 정사각형으로 잘라 미리보기에 쓰는 문제 방지.
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "필한방병원 네트워크",
    type: "website",
    images: [{ url: "/hi_phil_03-제일많이씀-[변환됨].png", width: 960, height: 400, alt: "필한방병원 네트워크" }],
  },
  verification: {
    ...(GOOGLE_VERIFICATION ? { google: GOOGLE_VERIFICATION } : {}),
    // 네이버는 verification 필드에 전용 지원이 없어 other로 넣는다 — <meta name="naver-site-verification">로 출력됨.
    ...(NAVER_VERIFICATION ? { other: { "naver-site-verification": NAVER_VERIFICATION } } : {}),
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="ko"><body>{children}</body></html>;
}
