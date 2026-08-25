import { InternalPage } from "@/components/InternalPage";
import { BranchDirectory } from "@/components/BranchDirectory";
import { getBranches } from "@/lib/data/branches";

export default async function BranchesPage() {
  const branches = await getBranches();
  return (
    <InternalPage
      eyebrow="PHIL LOCATIONS"
      title={<>가까운 곳에서<br /><em>이어지는 진료</em></>}
      intro="네 곳의 지점에서 필한방병원의 진료 기준을 만납니다."
      heroImageKey="hero_branches"
    >
      <BranchDirectory branches={branches} />
    </InternalPage>
  );
}
