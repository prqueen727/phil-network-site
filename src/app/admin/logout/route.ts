import { NextResponse } from "next/server";
import { supabaseServerSession } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await supabaseServerSession();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
