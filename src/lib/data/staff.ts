import { supabasePublic } from "@/lib/supabase/server";

export type CareerLine = { line: string };
export type SameAsLink = { url: string };

export type Staff = {
  id: string;
  name: string;
  slug: string | null;
  job_title: string | null;
  bio: string | null;
  specialty: string | null;
  alumni_of: string | null;
  profile_url: string | null;
  photo_url: string | null;
  career: CareerLine[];
  same_as: SameAsLink[];
};

/** 이력 표시용 그룹: career.line이 "[태그] 내용" 형식이면 태그별로 묶는다. 없으면 "주요 이력" 단일 그룹. */
export type CareerGroup = { heading: string; lines: string[] };

export async function getStaffBySlug(slug: string): Promise<Staff | null> {
  const supabase = supabasePublic();
  const { data, error } = await supabase.from("staff").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  return data as Staff;
}

export async function getAllStaff(): Promise<Staff[]> {
  const supabase = supabasePublic();
  const { data, error } = await supabase.from("staff").select("*").order("name", { ascending: true });
  if (error || !data) return [];
  return data as Staff[];
}

const TAG_PATTERN = /^\[(.+?)\]\s*(.*)$/;

export function groupCareer(career: CareerLine[] | null | undefined): CareerGroup[] {
  if (!career || career.length === 0) return [];
  const groups: CareerGroup[] = [];
  const indexByHeading = new Map<string, number>();
  for (const { line } of career) {
    const match = line.match(TAG_PATTERN);
    const heading = match ? match[1] : "주요 이력";
    const text = match ? match[2] : line;
    if (!indexByHeading.has(heading)) {
      indexByHeading.set(heading, groups.length);
      groups.push({ heading, lines: [] });
    }
    groups[indexByHeading.get(heading)!].lines.push(text);
  }
  return groups;
}
