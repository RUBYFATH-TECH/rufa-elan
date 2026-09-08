'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

export default function DebugAuth() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [testResult, setTestResult] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    const getDebugInfo = async () => {
      // Get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser()

      setDebugInfo({
        session: sessionData.session ? {
          userId: sessionData.session.user?.id,
          email: sessionData.session.user?.email,
          emailConfirmed: sessionData.session.user?.email_confirmed_at,
          lastSignIn: sessionData.session.user?.last_sign_in_at,
          expiresAt: sessionData.session.expires_at
        } : null,
        user: userData.user ? {
          id: userData.user.id,
          email: userData.user.email,
          emailConfirmed: userData.user.email_confirmed_at,
          created: userData.user.created_at
        } : null,
        sessionError,
        userError,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      })
    }

    getDebugInfo()
  }, [supabase])

  const testSignup = async () => {
    setTestResult('Testing signup...')
    
    const testEmail = `test+${Date.now()}@example.com`
    const testPassword = 'testpassword123'
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: { full_name: 'Test User', phone: '1234567890' }
        }
      })
      
      if (error) {
        setTestResult(`❌ Signup failed: ${error.message}`)
      } else if (data.user) {
        setTestResult(`✅ Signup successful! User created: ${data.user.email} (Confirmed: ${!!data.user.email_confirmed_at})`)
        
        // Clean up - delete the test user (this might not work without admin privileges)
        try {
          await supabase.auth.admin.deleteUser(data.user.id)
        } catch (cleanupError) {
          console.log('Could not clean up test user:', cleanupError)
        }
      }
    } catch (err: any) {
      setTestResult(`❌ Signup error: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">🔍 Authentication Debug Panel</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Auth State */}
          <div className="bg-gray-50 p-4 rounded">
            <h2 className="text-lg font-semibold mb-3">Current Auth State</h2>
            <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-64">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          {/* Test Signup */}
          <div className="bg-gray-50 p-4 rounded">
            <h2 className="text-lg font-semibold mb-3">Test Registration</h2>
            <button 
              onClick={testSignup}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 mb-4"
            >
              Test Signup (Creates temp user)
            </button>
            
            <div className="bg-white p-3 rounded border min-h-20">
              <p className="text-sm">{testResult || 'Click test button to check signup functionality'}</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
          <h3 className="font-semibold text-blue-800">Instructions:</h3>
          <p className="text-blue-700 text-sm mt-1">
            If the test signup fails with a 401 error, you need to disable email confirmations in your Supabase dashboard:
            <br />
            <strong>Dashboard → Authentication → Settings → Disable "Enable email confirmations"</strong>
          </p>
        </div>

        {/* Navigation */}
        <div className="mt-6 text-center">
          <a href="/auth/register" className="text-orange-600 hover:text-orange-700 underline">
            ← Back to Registration
          </a>
        </div>
      </div>
    </div>
  )
}