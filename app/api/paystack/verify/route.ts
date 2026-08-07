import { NextResponse } from "next/server";
import { z } from "zod";

const verifySchema = z.object({ reference: z.string().min(5) });

export async function POST(request: Request) {
  const body = await request.json();
  const result = verifySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ message: "Invalid reference." }, { status: 400 });
  }

  const paystackKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackKey || paystackKey.trim() === "" || paystackKey.includes("your-paystack")) {
    return NextResponse.json({ message: "Paystack secret key is not configured or is invalid. Set PAYSTACK_SECRET_KEY in .env.local." }, { status: 500 });
  }

  const reference = encodeURIComponent(result.data.reference);
  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${paystackKey}`
    }
  });

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ message: data.message ?? "Verification failed." }, { status: response.status });
  }

  if (data.data.status !== "success") {
    return NextResponse.json({ message: "Payment not successful." }, { status: 402 });
  }

  return NextResponse.json({ success: true, payment: data.data });
}
