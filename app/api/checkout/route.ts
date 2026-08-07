import { NextResponse } from "next/server";
import { z } from "zod";

const checkoutSchema = z.object({
  reference: z.string().min(5),
  orderId: z.string().min(6),
  email: z.string().email(),
  amount: z.number().positive()
});

export async function POST(request: Request) {
  const body = await request.json();
  const result = checkoutSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ message: "Invalid checkout payload." }, { status: 400 });
  }

  const { reference } = result.data;
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY ?? ""}`
    }
  });
  const data = await response.json();

  if (!response.ok || data.data?.status !== "success") {
    return NextResponse.json({ message: "Payment verification failed." }, { status: 402 });
  }

  // TODO: Persist the order record in Supabase or PostgreSQL.
  const order = {
    orderId: result.data.orderId,
    reference,
    email: result.data.email,
    amount: result.data.amount,
    status: "Payment confirmed",
    paymentProvider: "Paystack"
  };

  return NextResponse.json({ success: true, order });
}
