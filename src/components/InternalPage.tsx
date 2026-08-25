import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "./SiteHeader";
import { getPageImage } from "@/lib/data/business";

type Props = { eyebrow: string; title: ReactNode; intro: string; children?: ReactNode; heroImageKey?: string; backHref?: string; backLabel?: string };

/** heroImageKey를 주면 관리자가 올린 page_images 사진으로, 없으면(또는 미업로드) 기본 이미지로 상단 배경을 채운다. */
export async function InternalPage({ eyebrow, title, intro, children, heroImageKey, backHref = "/", backLabel = "← 필한방병원 네트워크" }: Props) {
  const heroImage = heroImageKey ? await getPageImage(heroImageKey) : null;
  return <div className="site-shell"><SiteHeader overlay /><main className="internal-page"><section className="subpage-hero" style={heroImage ? { backgroundImage: `url(${heroImage.url})` } : undefined}><div className="subpage-hero-overlay" /><div className="subpage-hero-content"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="internal-lede">{intro}</p></div></section><div className="internal-inner"><Link className="back-link" href={backHref}>{backLabel}</Link><div className="internal-content">{children ?? <div className="content-placeholder">페이지 콘텐츠가 준비 중입니다.</div>}</div></div></main><SiteFooter /></div>;
}
