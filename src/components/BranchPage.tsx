import { BranchDetail } from "./DetailPage";
import type { Branch } from "@/lib/data/branches";

export function BranchPage({ branch }: { branch: Branch }) {
  return <BranchDetail branch={branch} />;
}
