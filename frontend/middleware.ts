import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          const response = NextResponse.next();
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  const isAdminSession = async () => {
    if (!user?.email) return false;
    const email = user.email.trim().toLowerCase();
    const { data: adminUser, error } = await supabase
      .from("admin_users")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    return (!!adminUser && !error) || email === "ilimiquestfoundation@gmail.com";
  };

  // Admin routes — require authenticated admin session
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!(await isAdminSession())) {
      return NextResponse.redirect(new URL("/account", req.url));
    }
  }

  // Auth pages — redirect to account or admin dashboard if already logged in
  if (pathname.startsWith("/auth") && user) {
    const redirectTo = (await isAdminSession()) ? "/admin/dashboard" : "/account";
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/auth/:path*"]
};
