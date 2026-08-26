// site_pages / page_sections 시딩 스크립트.
//
// 전제조건: supabase/002_page_sections.sql을 Supabase SQL Editor에서 먼저 실행해야 한다.
// (site_pages/page_sections 테이블이 없으면 이 스크립트는 에러를 내고 종료한다.)
//
// 실행: node scripts/seed-page-sections.mjs
// (.env.local의 NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY를 사용해 접속한다.)
//
// about(/about), director(/network/director) 페이지에 현재 하드코딩되어 있던
// 실제 문구를 그대로 옮긴다 — 요약하거나 새로 짓지 않았다. 이미 같은 slug의
// site_pages 행이 있으면 upsert로 덮어쓰고, 섹션은 전부 지운 뒤 다시 넣는다
// (재실행해도 안전 — idempotent).

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  const text = readFileSync(envPath, "utf8");
  const env = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 .env.local에 없습니다.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

// ── about ────────────────────────────────────────────────────────────────
const philosophy = [
  { key: "Fill", title: "채움", body: "부족한 건강과 면역력, 삶의 활력을 채워드리는 진료" },
  { key: "Feel", title: "편안함", body: "내 집처럼 편안하고 따뜻하게 맞이하는 공간" },
  { key: "心", title: "마음", body: "환자와 마음을 나누는 평생 건강의 벗" },
  { key: "必", title: "필수", body: "지역사회에 없어서는 안 될, 반드시 필요한 의료기관" },
];

const history = [
  { date: "2017. 06", event: "대전 서구에 필한방병원 본원 개원 — 한·양방 협진 진료의 시작" },
  { date: "2020", event: "보건복지부 지정 수련한방병원 지정, 매년 전문의 배출" },
  { date: "2021. 06", event: "청주필한방병원 개원 — 5인 전문의 협진 체제, 자체 개발 척추 치료 프로그램 '3필 치료법' 도입" },
  { date: "2021. 06", event: "충무로필한의원 개원 — 비수술 척추·관절 치료 및 교통사고 협진 진료 특화" },
  { date: "2025. 06", event: "성동필한방병원 개원 — 네트워크 4개 지점 체제 완성" },
];

const system = [
  { title: "전문의 중심 협진 시스템", body: "4년간의 전문 수련을 거쳐 전문의 국가고시에 합격한 한의사 전문의와 신경외과 등 의사가 지점별로 상주하며, 유기적인 한·양방 협진 체계를 운영합니다." },
  { title: "365일, 야간까지 이어지는 진료", body: "전 지점이 연중무휴 진료와 평일 야간진료를 운영해, 주말이나 공휴일에 발생한 통증·사고 환자도 치료 공백 없이 이어갈 수 있습니다." },
  { title: "지점별 특화 인프라", body: "비수술 척추·관절 센터, 도수재활센터, 항암·통합면역 클리닉, 여성전용 면역병동, 아동발달센터 등 질환 특성에 맞춘 전문 진료 공간을 갖추고 있습니다." },
  { title: "스탠딩 진료실", body: "앉아서 진찰받기 어려운 허리 통증 환자를 위해, 의사가 함께 선 채로 진료하는 스탠딩 진료실을 전 지점에 운영합니다." },
];

const aboutIntro = "대전 본원을 중심으로 청주, 성동, 충무로를 연결하며 한·양방 협진의 기준을 이어갑니다.";

const aboutSections = [
  {
    kind: "text",
    heading: "Overview",
    data: {
      paragraphs: [
        "필한방병원은 2017년 대전에서 시작해, 전통 한의학과 현대 의학적 진단 체계를 접목한 한·양방 협진 진료를 선보여 온 한방병원 네트워크입니다.",
        "대전 본원을 중심으로 청주, 서울 성동, 서울 충무로까지 4개 지점을 운영하며, 지역과 지점을 넘어 하나의 진료 철학과 시스템을 공유하고 있습니다. “환자에게 진짜 필요한 치료”를 목표로, 근골격계 질환과 통증 치료 분야에서 전문성을 쌓아왔습니다.",
      ],
    },
  },
  {
    kind: "quote",
    heading: "Brand Story",
    data: {
      quote: "필(必) 필요한 병원이 되겠습니다.",
      attribution: "필한방병원 네트워크",
      body: "필한방병원은 지역 주민의 건강을 채우고(Fill), 집처럼 편안한 공간에서(Feel), 마음을 나누며(心), 반드시 필요한 존재(必)가 되겠다는 다짐에서 출발했습니다. 단순히 아픈 곳을 치료하는 병원을 넘어, 환자의 삶에 꼭 필요한 건강의 동반자가 되겠다는 것 — 그것이 필한방병원이 지금까지 지켜온 진료 철학입니다.",
    },
  },
  {
    kind: "cards",
    heading: "Brand Philosophy",
    data: { columns: 4, items: philosophy },
  },
  {
    kind: "timeline",
    heading: "History",
    data: { items: history },
  },
  {
    kind: "cards",
    heading: "Network System",
    data: { columns: 2, items: system },
  },
];

// ── director ─────────────────────────────────────────────────────────────
const directorIntro = "필한방병원 네트워크를 시작한 대표자의 설립 철학과 진료에 대한 생각을 소개합니다.";

async function buildDirectorSections() {
  const { data: director } = await admin
    .from("staff")
    .select("job_title")
    .eq("slug", "yoon-jepil")
    .maybeSingle();
  const attribution = `윤제필 · ${director?.job_title ?? "필한방병원 네트워크 병원장"}`;

  return [
    {
      kind: "quote",
      heading: null,
      data: {
        quote: "환자의 부족함을 채우고, 내 집 같은 편안함을 느끼며, 마음을 나누는 평생 건강의 벗이 되겠습니다.",
        attribution,
      },
    },
  ];
}

async function seedPage({ slug, title, eyebrow, heroTitle, heroIntro, sections }) {
  const { data: page, error: pageError } = await admin
    .from("site_pages")
    .upsert(
      {
        slug,
        title,
        meta_description: heroIntro,
        eyebrow,
        hero_title: heroTitle,
        hero_intro: heroIntro,
        is_published: true,
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();

  if (pageError || !page) {
    throw new Error(`[${slug}] site_pages upsert 실패: ${pageError?.message ?? "알 수 없는 오류"}`);
  }

  const { error: deleteError } = await admin.from("page_sections").delete().eq("page_id", page.id);
  if (deleteError) {
    throw new Error(`[${slug}] 기존 섹션 삭제 실패: ${deleteError.message}`);
  }

  const rows = sections.map((s, i) => ({
    page_id: page.id,
    kind: s.kind,
    heading: s.heading ?? null,
    data: s.data,
    sort_order: i,
    is_visible: true,
  }));

  const { error: insertError } = await admin.from("page_sections").insert(rows);
  if (insertError) {
    throw new Error(`[${slug}] 섹션 insert 실패: ${insertError.message}`);
  }

  console.log(`[${slug}] site_pages 1행 + page_sections ${rows.length}행 시딩 완료`);
}

// ── home ─────────────────────────────────────────────────────────────────
// 홈은 섹션마다 레이아웃이 전부 달라(히어로/트러스트/진료/지점/미디어) about처럼
// 자유형 섹션 나열로 렌더링하지 않는다. src/app/page.tsx가 kind로 골라 텍스트만
// 뽑아 쓰고, 마크업·이미지·카드 개수는 그대로 코드에 둔다.
const homeSections = [
  {
    kind: "cards",
    heading: null,
    data: {
      columns: 3,
      items: [
        { title: "비수술 척추·관절 치료" },
        { title: "통합 면역·암 치료" },
        { title: "수술 후 재활치료" },
        { title: "교통사고 후유증" },
        { title: "뇌건강센터" },
        { title: "산업재해" },
      ],
    },
  },
  {
    kind: "text",
    heading: "필한방병원\n지점 안내",
    data: { paragraphs: [] },
  },
  {
    kind: "text",
    heading: "필한방병원\n의료진 칼럼",
    data: { paragraphs: ["필한방병원 의료진이 전하는 건강 이야기"] },
  },
  {
    kind: "text",
    heading: null,
    data: { paragraphs: ["2026년 8월 기준 · 필한방병원 네트워크 공식 데이터"] },
  },
];

async function main() {
  const directorSections = await buildDirectorSections();

  await seedPage({
    slug: "about",
    title: "병원소개",
    eyebrow: "ABOUT PHIL",
    heroTitle: "필한방병원\n네트워크 소개",
    heroIntro: aboutIntro,
    sections: aboutSections,
  });

  await seedPage({
    slug: "director",
    title: "윤제필 병원장",
    eyebrow: "FOUNDER & DIRECTOR",
    heroTitle: "윤제필\n병원장",
    heroIntro: directorIntro,
    sections: directorSections,
  });

  await seedPage({
    slug: "home",
    title: "메인 홈",
    eyebrow: "PHIL NETWORK",
    heroTitle: "필한방병원 네트워크\n대전·청주·성동·충무로",
    heroIntro: "전문의 중심의 글로벌 스탠다드 한·양방 협진시스템",
    sections: homeSections,
  });

  console.log("완료.");
}

main().catch((err) => {
  console.error(err.message ?? err);
  console.error("\n※ site_pages/page_sections 테이블이 없다는 오류라면, 먼저 supabase/002_page_sections.sql을 Supabase SQL Editor에서 실행하세요.");
  process.exit(1);
});
