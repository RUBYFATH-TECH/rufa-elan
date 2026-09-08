import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { isKnownAdminEmail } from '@/lib/admin-common';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/account';
  
  console.log('Auth callback received:', { code: !!code, next, origin });
  
  if (code) {
    // Create response first
    let response = NextResponse.next();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              console.log('Setting cookie:', { name, hasValue: !!value });
              // Set cookie on response object
              response.cookies.set(name, value, {
                ...options,
                path: '/',
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7 // 7 days
              });
            });
          }
        }
      }
    );
    
    try {
      console.log('Attempting code exchange...');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Code exchange error:', error);
        return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message)}`);
      }
      
      if (data.session) {
        console.log('Session created successfully:', {
          userId: data.session.user?.id,
          email: data.session.user?.email,
          expiresAt: data.session.expires_at
        });
        
        const user = data.session.user;
        const email = user.email?.trim().toLowerCase();
        
        if (email) {
          // Determine redirect destination
          let destination = next;
          
          // Check if user is admin
          if (isKnownAdminEmail(email)) {
            destination = '/admin/dashboard';
            console.log('Admin user detected, redirecting to:', destination);
          } else if (!next.startsWith('/') || next.startsWith('//')) {
            destination = '/account'; // Default safe destination
            console.log('Using default destination:', destination);
          } else {
            console.log('Using provided destination:', destination);
          }
          
          // Create redirect response with cookies already set
          const redirectResponse = NextResponse.redirect(`${origin}${destination}`);
          
          // Copy cookies from response to redirect response
          response.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value, {
              path: '/',
              httpOnly: false,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7
            });
          });
          
          console.log('Redirecting to:', `${origin}${destination}`);
          return redirectResponse;
        } else {
          console.error('No email found in user data');
          return NextResponse.redirect(`${origin}/auth/login?error=No email found`);
        }
      } else {
        console.error('No session in response data');
        return NextResponse.redirect(`${origin}/auth/login?error=No session created`);
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed`);
    }
  } else {
    console.log('No code parameter found in callback');
  }

  // If no code or session, redirect to login
  console.log('Redirecting to login due to invalid callback');
  return NextResponse.redirect(`${origin}/auth/login?error=Invalid authentication callback`);
}