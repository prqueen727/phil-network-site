import { BranchDetail } from "./DetailPage";
import type { Branch } from "@/lib/data/branches";
import type { SitePage } from "@/lib/data/pages";

export function BranchPage({ branch, page }: { branch: Branch; page: SitePage | null }) {
  return <BranchDetail branch={branch} page={page} />;
}
