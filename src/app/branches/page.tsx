import { InternalPage } from "@/components/InternalPage";
import { BranchDirectory } from "@/components/BranchDirectory";
import { getBranches } from "@/lib/data/branches";

// 관리자페이지에서 올린 상단 배경(hero_branches)이 재배포 없이 바로 반영되도록 매 요청마다 재생성한다.
export const revalidate = 0;

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
