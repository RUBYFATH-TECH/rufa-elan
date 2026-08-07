const PAYSTACK_BASE = "https://api.paystack.co";

export async function initializePayment(email: string, amount: number, reference: string) {
  const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY ?? ""}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100),
      reference,
      currency: "GHS",
      channels: ["card", "ussd", "mobile_money", "bank"]
    })
  });

  if (!response.ok) {
    throw new Error("Paystack initialization failed");
  }

  return response.json();
}

export async function verifyPayment(reference: string) {
  const response = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY ?? ""}`
    }
  });

  if (!response.ok) {
    throw new Error("Paystack verification failed");
  }

  return response.json();
}
