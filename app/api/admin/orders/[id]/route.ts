import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSupabase } from "@/lib/admin-server";

const updateOrderSchema = z.object({
  status: z.enum(["pending_payment", "processing", "shipped", "delivered", "cancelled"]).optional(),
  payment_status: z.enum(["unpaid", "paid", "refunded"]).optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field is required to update an order."
});

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await context.params;
  if (!orderId) {
    return NextResponse.json({ message: "Order ID is required." }, { status: 400 });
  }

  const adminResult = await getAdminSupabase();
  if ("error" in adminResult) {
    const status = adminResult.error === "unauthorized" ? 401 : 403;
    return NextResponse.json({ message: "Unauthorized" }, { status });
  }

  const { serviceSupabase } = adminResult;
  const { data, error } = await serviceSupabase
    .from("orders")
    .select("id, order_number, status, payment_status, total_amount, subtotal, shipping_fee, discount_amount, shipping_address, items, payment_reference, created_at, user_id, profiles!inner(id, full_name, email)")
    .eq("id", orderId)
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await context.params;
  if (!orderId) {
    return NextResponse.json({ message: "Order ID is required." }, { status: 400 });
  }

  const adminResult = await getAdminSupabase();
  if ("error" in adminResult) {
    const status = adminResult.error === "unauthorized" ? 401 : 403;
    return NextResponse.json({ message: "Unauthorized" }, { status });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.errors[0].message }, { status: 400 });
  }

  const { serviceSupabase } = adminResult;
  const { data, error } = await serviceSupabase
    .from("orders")
    .update(parsed.data)
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
