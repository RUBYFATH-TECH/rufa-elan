import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerAdminSupabase } from "@/lib/supabase-admin";
import { createServerSupabase } from "@/lib/supabase-server";

const checkoutSchema = z.object({
  orderId: z.string().min(6),
  reference: z.string().min(5),
  email: z.string().email(),
  amount: z.number().positive(),
  subtotal: z.number().nonnegative(),
  shipping_fee: z.number().nonnegative(),
  discount_amount: z.number().nonnegative(),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number().int().positive(),
    image: z.string(),
    variant: z.string().optional(),
    sku: z.string().optional()
  })),
  shipping_address: z.object({
    full_name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    deliveryOption: z.string()
  }),
  payment_reference: z.string().min(5)
});

export async function POST(request: Request) {
  const body = await request.json();
  const result = checkoutSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ message: "Invalid checkout payload." }, { status: 400 });
  }

  const { orderId, reference, email, amount, subtotal, shipping_fee, discount_amount, items, shipping_address, payment_reference } = result.data;

  const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY ?? ""}`
    }
  });
  const verifyData = await verifyResponse.json();

  if (!verifyResponse.ok || verifyData.data?.status !== "success") {
    return NextResponse.json({ message: "Payment verification failed." }, { status: 402 });
  }

  const supabase = await createServerSupabase();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  const userId = user?.id ?? null;

  const serviceSupabase = await createServerAdminSupabase();

  const orderPayload = {
    user_id: userId,
    order_number: orderId,
    status: "processing",
    currency: "GHS",
    subtotal,
    shipping_fee,
    discount_amount,
    total_amount: amount,
    shipping_address,
    billing_address: null,
    items,
    payment_status: "paid",
    payment_reference,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const orderInsert = await serviceSupabase.from("orders").insert(orderPayload).select("id").single();
  if (orderInsert.error || !orderInsert.data?.id) {
    return NextResponse.json({ message: orderInsert.error?.message || "Unable to save order." }, { status: 500 });
  }

  const orderIdUuid = orderInsert.data.id;
  const paymentInsert = await serviceSupabase.from("payments").insert({
    order_id: orderIdUuid,
    provider: "Paystack",
    reference: payment_reference,
    status: "success",
    amount,
    currency: "GHS",
    metadata: verifyData.data
  });

  if (paymentInsert.error) {
    return NextResponse.json({ message: paymentInsert.error.message || "Unable to save payment record." }, { status: 500 });
  }

  return NextResponse.json({ success: true, order: { orderId, amount, status: "processing" } });
}
