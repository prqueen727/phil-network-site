import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BranchPage } from "@/components/BranchPage";
import { getBranches, getBranchBySlug } from "@/lib/data/branches";

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
  const branch = await getBranchBySlug(slug);
  if (!branch) notFound();
  return <BranchPage branch={branch} />;
}
