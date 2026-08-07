import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/admin-server";

export async function GET() {
  const adminResult = await getAdminSupabase();
  if ("error" in adminResult) {
    const status = adminResult.error === "unauthorized" ? 401 : 403;
    return NextResponse.json({ admin: false }, { status });
  }

  const { supabase } = adminResult;
  const { data, error } = await supabase.from("categories").select("id, name, slug").order("name");
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
