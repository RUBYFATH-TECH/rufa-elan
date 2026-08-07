import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/admin-server";

export async function GET() {
  const adminResult = await getAdminSupabase();
  if ("error" in adminResult) {
    const status = adminResult.error === "unauthorized" ? 401 : 403;
    return NextResponse.json({ message: "Unauthorized" }, { status });
  }

  const { serviceSupabase } = adminResult;
  const { data, error } = await serviceSupabase
    .from("profiles")
    .select("id, full_name, phone, avatar_url, created_at, orders(order_number)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(
    (data ?? []).map((customer: any) => ({
      ...customer,
      order_count: customer.orders?.length ?? 0
    }))
  );
}
