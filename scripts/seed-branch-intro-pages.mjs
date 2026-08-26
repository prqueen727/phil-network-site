// 지점 상세페이지(/branches/[slug])에 "지점 소개" 자유 텍스트 섹션을 추가하기 위한
// site_pages 행 4개(branch-daejeon 등)를 새로 만드는 일회성 스크립트.
//
// ⚠️ seed-page-sections.mjs와 분리한 이유: 그 스크립트의 seedPage()는 실행할 때마다
// 기존 섹션을 전부 지우고 다시 넣는다. home/about/director는 이미 관리자페이지에서
//실제로 편집된 상태라, 그 스크립트를 다시 돌리면 지금까지의 편집 내용이 지워진다.
// 이 스크립트는 새 지점 페이지 4개만 건드리고 기존 페이지는 전혀 손대지 않는다.
//
// 실행: node scripts/seed-branch-intro-pages.mjs
// (.env.local의 NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY를 사용해 접속한다.)

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

const BRANCHES = [
  { slug: "daejeon", name: "대전필한방병원(본원)" },
  { slug: "cheongju", name: "청주필한방병원" },
  { slug: "seongdong", name: "성동필한방병원" },
  { slug: "chungmuro", name: "충무로필한의원" },
];

async function main() {
  for (const branch of BRANCHES) {
    const pageSlug = `branch-${branch.slug}`;

    // 이미 있으면 건드리지 않는다(관리자가 이미 채워둔 내용을 실수로 지우지 않기 위해).
    const { data: existing } = await admin.from("site_pages").select("id").eq("slug", pageSlug).maybeSingle();
    if (existing) {
      console.log(`[${pageSlug}] 이미 존재해 건너뜀`);
      continue;
    }

    const { data: page, error: pageError } = await admin
      .from("site_pages")
      .insert({ slug: pageSlug, title: `${branch.name} 소개`, is_published: true })
      .select("id")
      .single();
    if (pageError || !page) {
      throw new Error(`[${pageSlug}] site_pages insert 실패: ${pageError?.message ?? "알 수 없는 오류"}`);
    }

    const { error: sectionError } = await admin
      .from("page_sections")
      .insert({ page_id: page.id, kind: "text", heading: null, data: { paragraphs: [""] }, sort_order: 0, is_visible: true });
    if (sectionError) {
      throw new Error(`[${pageSlug}] page_sections insert 실패: ${sectionError.message}`);
    }

    console.log(`[${pageSlug}] site_pages 1행 + page_sections 1행 생성 완료`);
  }

  console.log("완료.");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
