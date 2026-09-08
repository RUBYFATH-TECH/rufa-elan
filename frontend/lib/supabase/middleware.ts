import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Skip middleware for debug page
  if (request.nextUrl.pathname === '/debug-auth') {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Handle auth callback routes - let them process without middleware interference
  if (request.nextUrl.pathname === '/auth/callback') {
    return response;
  }

  // Refresh the session to ensure it's up to date
  let user = null;
  try {
    const { data: { user: sessionUser }, error } = await supabase.auth.getUser();
    if (!error) {
      user = sessionUser;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    // Continue without user
  }

  // Handle admin routes protection
  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
    if (!user) {
      // Not authenticated, redirect to login
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Handle account routes protection
  if (request.nextUrl.pathname.startsWith('/account')) {
    if (!user) {
      // Not authenticated, redirect to login
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Redirect logged-in users away from auth pages (except callback)
  if (user && request.nextUrl.pathname.startsWith('/auth/') && !request.nextUrl.pathname.includes('callback')) {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  return response;
}