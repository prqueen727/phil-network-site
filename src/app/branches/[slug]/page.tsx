import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BranchPage } from "@/components/BranchPage";
import { getBranches, getBranchBySlug } from "@/lib/data/branches";
import { getSitePage } from "@/lib/data/pages";

// branches.website_url 등 DB 값이 바뀌어도 재배포 전까지 반영 안 되는 걸 막기 위해 매 요청마다 재생성한다.
export const revalidate = 0;

export async function generateStaticParams() {
  const branches = await getBranches();
  return branches.map((branch) => ({ slug: branch.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const branch = await getBranchBySlug(slug);
  if (!branch) return {};
  return {
    title: `${branch.name} | 필한방병원 네트워크`,
    description: `${branch.name} — ${branch.street_address}, ${branch.telephone}`,
  };
}

export default async function BranchDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [branch, page] = await Promise.all([getBranchBySlug(slug), getSitePage(`branch-${slug}`)]);
  if (!branch) notFound();
  return <BranchPage branch={branch} page={page} />;
}
