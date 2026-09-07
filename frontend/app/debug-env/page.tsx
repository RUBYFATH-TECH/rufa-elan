"use client";

import { useState } from "react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";

export default function DebugEnvPage() {
  const [oauthUrl, setOauthUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testOAuthUrl = async () => {
    setLoading(true);
    const supabase = createClientComponentSupabaseClient();
    
    // Test what URL Supabase will actually generate
    const callbackUrl = `${window.location.origin}/auth/callback`;
    console.log('🔍 Testing callback URL:', callbackUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { 
        redirectTo: callbackUrl,
        queryParams: {
          // Force immediate return without actually signing in
          prompt: 'none'
        }
      }
    });
    
    if (data?.url) {
      setOauthUrl(data.url);
      console.log('🔍 Generated OAuth URL:', data.url);
    }
    
    if (error) {
      console.error('OAuth URL generation error:', error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold mb-6">🔍 OAuth Debug Center</h1>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Current Environment Variables:</h3>
            <div className="text-sm font-mono space-y-1">
              <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</p>
              <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Not set'}</p>
              <p><strong>NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY:</strong> {process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ? 'Set (hidden)' : 'Not set'}</p>
              <p><strong>GOOGLE_CLIENT_ID:</strong> {process.env.GOOGLE_CLIENT_ID || 'Not set'}</p>
              <p><strong>NEXTAUTH_URL:</strong> {process.env.NEXTAUTH_URL || 'Not set'}</p>
              <p><strong>NEXT_PUBLIC_BACKEND_URL:</strong> {process.env.NEXT_PUBLIC_BACKEND_URL || 'Not set'}</p>
              <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'Not set'}</p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Window Location Info:</h3>
            <div className="text-sm font-mono space-y-1">
              <p><strong>Current Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Loading...'}</p>
              <p><strong>Current Hostname:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'Loading...'}</p>
              <p><strong>Current Port:</strong> {typeof window !== 'undefined' ? window.location.port : 'Loading...'}</p>
              <p><strong>Current Protocol:</strong> {typeof window !== 'undefined' ? window.location.protocol : 'Loading...'}</p>
              <p><strong>Full URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Expected OAuth Callback URL:</h3>
            <p className="text-sm font-mono">
              {typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'Loading...'}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Test OAuth URL Generation:</h3>
            <p className="text-sm text-gray-600 mb-3">
              This will show what URL Supabase actually generates for Google OAuth
            </p>
            <button 
              onClick={testOAuthUrl}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Test OAuth URL Generation'}
            </button>
            
            {oauthUrl && (
              <div className="mt-4 p-3 bg-white border rounded-lg">
                <p className="text-sm font-semibold mb-2">Generated OAuth URL:</p>
                <p className="text-xs font-mono break-all text-blue-600">{oauthUrl}</p>
                <div className="mt-2 text-xs">
                  <p><strong>Contains the expected callback?</strong> {oauthUrl.includes(encodeURIComponent(`${window.location.origin}/auth/callback`)) ? '✅ Yes' : '❌ No'}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Cache Clear Steps:</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>✅ <strong>.next folder deleted</strong> (cache cleared)</li>
              <li>Stop the Next.js development server (Ctrl+C)</li>
              <li>Restart the server: <code>npm run dev</code></li>
              <li>Clear browser cache or try incognito mode</li>
              <li>Test the OAuth URL generation above</li>
              <li>If the generated URL does not contain the expected callback, check Supabase URL Configuration</li>
            </ol>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">⚠️ Potential Issues:</h3>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li><strong>Supabase Project Settings:</strong> Redirect URLs might be hardcoded in Supabase dashboard</li>
              <li><strong>Google Cloud Console:</strong> OAuth redirect URIs might not include localhost</li>
              <li><strong>Browser Cache:</strong> Old OAuth URLs might be cached</li>
              <li><strong>Environment Loading:</strong> Variables might not be loaded properly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
