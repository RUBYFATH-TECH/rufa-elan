import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSupabase } from "@/lib/admin-server";

const secretSchema = z.object({
  secretCode: z.string().min(1, "Admin secret code is required")
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = secretSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.errors[0].message }, { status: 400 });
  }

  const adminResult = await getAdminSupabase();
  if ("error" in adminResult) {
    const status = adminResult.error === "unauthorized" ? 401 : 403;
    return NextResponse.json({ message: adminResult.error === "unauthorized" ? "Unauthorized" : "Forbidden" }, { status });
  }

  const expectedSecret = process.env.ADMIN_SECRET_CODE?.trim();
  const providedSecret = parsed.data.secretCode.trim();

  if (!expectedSecret) {
    return NextResponse.json({ message: "Admin secret is not configured." }, { status: 500 });
  }

  if (expectedSecret !== providedSecret) {
    return NextResponse.json({ message: "Invalid admin secret code." }, { status: 401 });
  }

  return NextResponse.json({ valid: true });
}
