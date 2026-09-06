import { NextResponse } from "next/server";
import { paystackInitSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json();
  const result = paystackInitSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ message: "Invalid payment request." }, { status: 400 });
  }

  const paystackKey = process.env.PAYSTACK_SECRET_KEY?.trim();
  const hasValidKey = Boolean(paystackKey && /^sk_(test|live)_[A-Za-z0-9]+$/.test(paystackKey));

  if (!hasValidKey) {
    return NextResponse.json(
      {
        message: "Paystack secret key is missing or invalid. Add a real Paystack secret key from your dashboard to PAYSTACK_SECRET_KEY."
      },
      { status: 500 }
    );
  }

  const { email, amount, orderId } = result.data;
  const payload = {
    email,
    amount: Math.round(amount * 100),
    reference: orderId,
    currency: "GHS",
    channels: ["card", "bank", "ussd", "mobile_money"]
  };

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const rawBody = await response.text();
  let data: Record<string, any> = {};

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = { message: rawBody };
    }
  }

  if (!response.ok) {
    return NextResponse.json(
      {
        message: data.message || `Paystack initialization failed (${response.status} ${response.statusText}).`
      },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}
