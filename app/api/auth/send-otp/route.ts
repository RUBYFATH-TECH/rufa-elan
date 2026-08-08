import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({}));
  if (!email || typeof email !== "string") {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ message: "Server not configured." }, { status: 500 });
  }

  try {
    // Check user existence via Supabase admin users endpoint
    const usersRes = await fetch(`${supabaseUrl.replace(/\/$/,"")}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (!usersRes.ok) {
      // Don't reveal details to caller
      return NextResponse.json({ message: "If an account exists, an email will be sent." });
    }

    const users = await usersRes.json();
    const user = Array.isArray(users) ? users[0] : users;

    if (!user || !user.id) {
      // Always respond same to avoid account enumeration
      return NextResponse.json({ message: "If an account exists, an email will be sent." });
    }

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // store OTP in notifications table
    const notifRes = await fetch(`${supabaseUrl.replace(/\/$/,"")}/rest/v1/notifications`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify([{ user_id: user.id, type: "password_otp", message: "Password reset OTP", channel: "email", metadata: { otp, expires_at: expiresAt } }])
    });

    // send email with Resend if configured
    if (resendKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "no-reply@rufaelan.com",
            to: [email],
            subject: "Your password reset code",
            html: `<p>Your password reset code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`
          })
        });
      } catch (e) {
        // ignore email errors
      }
    }

    return NextResponse.json({ message: "If an account exists, an email will be sent." });
  } catch (err) {
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}
