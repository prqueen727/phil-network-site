import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "필한방병원 네트워크 | 한·양방 협진 진료",
  description: "대전, 청주, 성동구, 충무로를 연결하는 필한방병원 네트워크",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="ko"><body>{children}</body></html>;
}
