import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/admin-server";

export async function GET() {
  const adminResult = await getAdminSupabase();
  if ("error" in adminResult) {
    const status = adminResult.error === "unauthorized" ? 401 : 403;
    return NextResponse.json({ message: "Unauthorized" }, { status });
  }

  const { serviceSupabase } = adminResult;

  const [productsCountRes, ordersRes, customersCountRes, pendingPaymentsRes, pendingShipmentsRes, recentOrdersRes] = await Promise.all([
    serviceSupabase.from("products").select("id", { count: "exact", head: true }),
    serviceSupabase.from("orders").select("id, total_amount", { count: "exact", head: false }),
    serviceSupabase.from("profiles").select("id", { count: "exact", head: true }),
    serviceSupabase.from("orders").select("id", { count: "exact", head: true }).eq("payment_status", "unpaid"),
    serviceSupabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["processing", "shipped"]),
    serviceSupabase
      .from("orders")
      .select("id, order_number, status, total_amount, payment_status, created_at")
      .order("created_at", { ascending: false })
      .limit(5)
  ]);

  if (productsCountRes.error || ordersRes.error || customersCountRes.error || recentOrdersRes.error) {
    return NextResponse.json({ message: "Unable to load dashboard stats." }, { status: 500 });
  }

  const totalSales = ordersRes.data?.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0) ?? 0;

  return NextResponse.json({
    productsCount: productsCountRes.count ?? 0,
    ordersCount: ordersRes.count ?? 0,
    customersCount: customersCountRes.count ?? 0,
    totalSales,
    pendingPaymentsCount: pendingPaymentsRes.count ?? 0,
    pendingShipmentsCount: pendingShipmentsRes.count ?? 0,
    recentOrders: recentOrdersRes.data ?? []
  });
}
