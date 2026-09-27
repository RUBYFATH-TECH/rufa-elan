"use client";

import { useState, useEffect } from "react";
import { Check, X, Loader2, AlertCircle, Wifi, WifiOff } from "lucide-react";

interface DebugResult {
  test: string;
  status: 'pending' | 'success' | 'error' | 'info';
  message: string;
  details?: any;
}

export default function MobileDebugPage() {
  const [results, setResults] = useState<DebugResult[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addResult = (result: DebugResult) => {
    setResults(prev => [...prev, result]);
  };

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    // Test 1: Environment Variables
    addResult({
      test: "Environment Variables",
      status: "info",
      message: "Checking configuration",
      details: {
        NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'NOT SET',
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
      }
    });

    // Test 2: Device Info
    addResult({
      test: "Device Information",
      status: "info",
      message: "Device details",
      details: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        online: navigator.onLine,
        cookieEnabled: navigator.cookieEnabled,
        language: navigator.language,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      }
    });

    // Test 3: Backend URL Resolution
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    addResult({
      test: "Backend URL",
      status: backendUrl.includes('localhost') ? 'error' : 'success',
      message: backendUrl.includes('localhost') 
        ? 'Using localhost - environment variable not set!' 
        : `Using: ${backendUrl}`,
      details: { backendUrl }
    });

    // Test 4: Backend Health Check
    try {
      const healthUrl = `${backendUrl}/health`;
      console.log('[Debug] Testing health endpoint:', healthUrl);
      
      const healthStart = Date.now();
      const healthResponse = await fetch(healthUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
      });
      const healthTime = Date.now() - healthStart;

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        addResult({
          test: "Backend Health",
          status: "success",
          message: `Backend is healthy (${healthTime}ms)`,
          details: healthData
        });
      } else {
        addResult({
          test: "Backend Health",
          status: "error",
          message: `Health check failed: ${healthResponse.status}`,
          details: { 
            status: healthResponse.status, 
            statusText: healthResponse.statusText,
            time: healthTime 
          }
        });
      }
    } catch (error) {
      addResult({
        test: "Backend Health",
        status: "error",
        message: `Cannot reach backend: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { 
          error: error instanceof Error ? error.message : String(error),
          name: error instanceof Error ? error.name : 'Unknown'
        }
      });
    }

    // Test 5: Products API
    try {
      const productsUrl = `${backendUrl}/api/products?limit=5`;
      console.log('[Debug] Testing products endpoint:', productsUrl);
      
      const productsStart = Date.now();
      const productsResponse = await fetch(productsUrl, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
      });
      const productsTime = Date.now() - productsStart;

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        addResult({
          test: "Products API",
          status: "success",
          message: `Fetched ${productsData?.data?.length || 0} products (${productsTime}ms)`,
          details: {
            count: productsData?.data?.length || 0,
            time: productsTime,
            sample: productsData?.data?.slice(0, 2)
          }
        });
      } else {
        const errorText = await productsResponse.text();
        addResult({
          test: "Products API",
          status: "error",
          message: `Products API failed: ${productsResponse.status}`,
          details: { 
            status: productsResponse.status,
            error: errorText,
            time: productsTime
          }
        });
      }
    } catch (error) {
      addResult({
        test: "Products API",
        status: "error",
        message: `Products API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { 
          error: error instanceof Error ? error.message : String(error),
          name: error instanceof Error ? error.name : 'Unknown'
        }
      });
    }

    // Test 6: CORS Test
    try {
      const corsUrl = `${backendUrl}/`;
      const corsResponse = await fetch(corsUrl, {
        method: 'GET',
        credentials: 'include',
        signal: AbortSignal.timeout(10000),
      });
      
      const corsHeaders = {
        'access-control-allow-origin': corsResponse.headers.get('access-control-allow-origin'),
        'access-control-allow-credentials': corsResponse.headers.get('access-control-allow-credentials'),
      };

      addResult({
        test: "CORS Configuration",
        status: corsHeaders['access-control-allow-origin'] ? 'success' : 'error',
        message: corsHeaders['access-control-allow-origin'] 
          ? 'CORS headers present' 
          : 'CORS headers missing',
        details: corsHeaders
      });
    } catch (error) {
      addResult({
        test: "CORS Configuration",
        status: "error",
        message: `CORS test failed: ${error instanceof Error ? error.message : 'Unknown'}`,
        details: { error: String(error) }
      });
    }

    setTesting(false);
  };

  const getStatusIcon = (status: DebugResult['status']) => {
    switch (status) {
      case 'success':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'error':
        return <X className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'info':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: DebugResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-blue-50 border-blue-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Mobile Debugging Tool
              </h3>
              <p className="text-xs text-blue-800 leading-relaxed">
                Use this page to diagnose connectivity issues between your mobile device and the backend. 
                If tests fail, check the deployment guide (MOBILE_DEPLOYMENT_GUIDE.md) for solutions.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mobile Debug Panel</h1>
              <p className="text-sm text-gray-600 mt-1">Test backend connectivity and configuration</p>
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi className="w-5 h-5" />
                  <span className="text-sm font-medium">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <WifiOff className="w-5 h-5" />
                  <span className="text-sm font-medium">Offline</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={runTests}
            disabled={testing || !isOnline}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {testing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run Diagnostic Tests'
            )}
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`rounded-lg border p-4 ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(result.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {result.test}
                    </h3>
                    <p className="text-sm text-gray-700 mt-1">
                      {result.message}
                    </p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-white rounded text-xs overflow-x-auto border border-gray-200">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length === 0 && !testing && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Click "Run Diagnostic Tests" to start debugging</p>
          </div>
        )}
      </div>
    </div>
  );
}
