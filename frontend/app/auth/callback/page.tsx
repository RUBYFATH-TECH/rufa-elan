"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { isKnownAdminEmail } from "@/lib/admin-common";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentSupabaseClient();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for URL query parameters first (Supabase may use these)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
          setMessage('Processing authentication code...');
          // Exchange code for session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Code exchange error:', error);
            setStatus('error');
            setMessage('Authentication failed. Please try again.');
            setTimeout(() => router.push('/auth/login'), 3000);
            return;
          }
          
          if (data.session) {
            await handleSuccessfulAuth(data.session);
            return;
          }
        }
        
        // Check for URL hash fragments (alternative OAuth flow)
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          if (hashParams.has('access_token')) {
            setMessage('Processing OAuth tokens...');
            
            // Wait a bit for Supabase to process the tokens
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Get session after processing
            const { data: newSessionData, error: newSessionError } = await supabase.auth.getSession();
            
            if (newSessionError) {
              console.error('Session error after token processing:', newSessionError);
              setStatus('error');
              setMessage('Authentication failed. Please try again.');
              setTimeout(() => router.push('/auth/login'), 3000);
              return;
            }
            
            if (newSessionData.session) {
              await handleSuccessfulAuth(newSessionData.session);
              return;
            }
          }
        }
        
        // Fallback: Check current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Auth callback error:', sessionError);
          setStatus('error');
          setMessage('Authentication failed. Please try again.');
          setTimeout(() => router.push('/auth/login'), 3000);
          return;
        }

        const session = sessionData.session;
        
        if (!session) {
          setStatus('error');
          setMessage('No session found. Redirecting to login...');
          setTimeout(() => router.push('/auth/login'), 2000);
          return;
        }

        await handleSuccessfulAuth(session);

      } catch (error) {
        console.error('Callback processing error:', error);
        setStatus('error');
        setMessage('Something went wrong. Redirecting to login...');
        setTimeout(() => router.push('/auth/login'), 3000);
      }
    };

    const handleSuccessfulAuth = async (session: any) => {
      const user = session.user;
      const email = user.email?.trim().toLowerCase();
      
      if (!email) {
        setStatus('error');
        setMessage('Invalid user data. Redirecting to login...');
        setTimeout(() => router.push('/auth/login'), 2000);
        return;
      }

      setStatus('success');
      setMessage('Authentication successful! Redirecting...');

      // Determine destination based on user type
      let destination = '/account'; // Default customer destination
      
      // Check if user is admin
      const isAdmin = isKnownAdminEmail(email);
      let isAdminFromAPI = false;
      
      try {
        const adminCheckResponse = await fetch('/api/admin/check');
        isAdminFromAPI = adminCheckResponse.ok;
      } catch (e) {
        // Admin check failed, continue with default logic
        console.warn('Admin check API failed:', e);
      }

      if (isAdmin || isAdminFromAPI) {
        destination = '/admin/dashboard';
        setMessage('Welcome back, Admin! Redirecting to dashboard...');
      } else {
        // Check if there's a custom redirect parameter
        const redirect = searchParams.get('redirect');
        if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
          destination = redirect;
        } else {
          destination = '/account';
        }
        setMessage('Welcome back! Redirecting to your account...');
      }

      // Small delay for better UX
      setTimeout(() => {
        router.replace(destination);
      }, 1500);
    };

    handleAuthCallback();
  }, [router, searchParams, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img 
              src="/images/logo.png" 
              alt="RUFA ELAN" 
              className="h-16 w-16 rounded-full"
            />
          </div>

          {/* Status Icon */}
          <div className="mb-6">
            {status === 'processing' && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              </div>
            )}
            
            {status === 'success' && (
              <div className="flex justify-center">
                <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
            )}
            
            {status === 'error' && (
              <div className="flex justify-center">
                <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Status Message */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {status === 'processing' && 'Authenticating...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Authentication Failed'}
          </h2>
          
          <p className="text-gray-600 text-sm">
            {message}
          </p>

          {/* Loading indicator for processing state */}
          {status === 'processing' && (
            <div className="mt-4">
              <div className="flex justify-center space-x-1">
                <div className="h-2 w-2 bg-orange-600 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="h-2 w-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}

          {/* Error state: show manual redirect button */}
          {status === 'error' && (
            <div className="mt-6">
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors duration-200"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}