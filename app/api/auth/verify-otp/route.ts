import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email, otp, newPassword } = body;
  if (!email || !otp || !newPassword) {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ message: "Server not configured." }, { status: 500 });
  }

  try {
    // find user
    const usersRes = await fetch(`${supabaseUrl.replace(/\/$/,"")}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${serviceKey}` }
    });
    if (!usersRes.ok) return NextResponse.json({ message: "Invalid request." }, { status: 400 });
    const users = await usersRes.json();
    const user = Array.isArray(users) ? users[0] : users;
    if (!user || !user.id) return NextResponse.json({ message: "Invalid request." }, { status: 400 });

    // fetch latest OTP notification
    const notifRes = await fetch(`${supabaseUrl.replace(/\/$/,"")}/rest/v1/notifications?user_id=eq.${user.id}&type=eq.password_otp&select=*&order=created_at.desc&limit=1`, {
      headers: { Authorization: `Bearer ${serviceKey}` }
    });

    if (!notifRes.ok) return NextResponse.json({ message: "Invalid or expired code." }, { status: 400 });
    const notifs = await notifRes.json();
    const notif = Array.isArray(notifs) ? notifs[0] : notifs;
    if (!notif || !notif.metadata || notif.metadata.otp !== otp) {
      return NextResponse.json({ message: "Invalid or expired code." }, { status: 400 });
    }

    const expiresAt = new Date(notif.metadata.expires_at);
    if (isNaN(expiresAt.getTime()) || expiresAt < new Date()) {
      return NextResponse.json({ message: "Invalid or expired code." }, { status: 400 });
    }

    // update user password via admin endpoint
    const updateRes = await fetch(`${supabaseUrl.replace(/\/$/,"")}/auth/v1/admin/users/${user.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password: newPassword })
    });

    if (!updateRes.ok) {
      const err = await updateRes.text().catch(() => "");
      return NextResponse.json({ message: `Unable to reset password. ${err}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Password updated." });
  } catch (err) {
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}
