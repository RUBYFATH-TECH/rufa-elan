import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/admin-server";

export async function GET() {
  const adminResult = await getAdminSupabase();
  if ("error" in adminResult) {
    const status = adminResult.error === "unauthorized" ? 401 : 403;
    return NextResponse.json({ admin: false }, { status });
  }

  return NextResponse.json({
    admin: true,
    role: adminResult.adminUser.role,
    email: adminResult.adminUser.email
  });
}
