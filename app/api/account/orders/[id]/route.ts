import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await context.params;
  if (!orderId) {
    return NextResponse.json({ message: "Order ID is required." }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, total_amount, subtotal, shipping_fee, discount_amount, status, payment_status, payment_reference, shipping_address, items, created_at")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }

  return NextResponse.json(data);
}
