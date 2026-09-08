// Simple test script to verify auth configuration
// Run with: node test-auth.js

const https = require('https');

function testSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('🔍 Testing Supabase Configuration...');
  console.log('Supabase URL:', url ? '✅ Set' : '❌ Missing');
  console.log('Anon Key:', anonKey ? '✅ Set' : '❌ Missing');
  
  if (!url || !anonKey) {
    console.log('\n❌ Configuration incomplete. Please check your .env.local file.');
    return;
  }
  
  // Test basic connectivity
  const testUrl = `${url}/rest/v1/`;
  console.log(`\n📡 Testing connectivity to: ${testUrl}`);
  
  https.get(testUrl, { 
    headers: { 
      'apikey': anonKey,
      'User-Agent': 'test-auth-script'
    }
  }, (res) => {
    console.log('Status Code:', res.statusCode);
    if (res.statusCode === 200 || res.statusCode === 401) {
      console.log('✅ Supabase endpoint is reachable');
    } else {
      console.log('⚠️  Unexpected status code:', res.statusCode);
    }
  }).on('error', (err) => {
    console.log('❌ Connection failed:', err.message);
  });
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });
testSupabaseConfig();