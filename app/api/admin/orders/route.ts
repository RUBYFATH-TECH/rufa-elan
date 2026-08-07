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
    .from("orders")
    .select("id, order_number, status, payment_status, total_amount, created_at, shipping_address")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
