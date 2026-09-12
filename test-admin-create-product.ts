/**
 * Test Admin Product Creation
 * This script tests if admin product creation works
 * 
 * Run with: npx ts-node test-admin-create-product.ts
 * 
 * Note: You need to have an active Supabase session token
 * Get it from: Browser DevTools > Application > Local Storage > sb-*-auth-token
 */

import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rxvpxsoadadbodfskhky.supabase.co';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

async function testAdminProductCreation(authToken: string) {
  console.log('\n🧪 Testing Admin Product Creation\n');
  console.log('═'.repeat(60));

  try {
    // Test data
    const productData = {
      name: 'Test Product ' + Date.now(),
      description: 'This is a test product',
      category_id: 'handbags',
      regular_price: 99.99,
      sale_price: 79.99,
      sku: 'TEST-' + Date.now(),
      featured: false,
      images: [
        {
          url: 'https://via.placeholder.com/500x500?text=Test+Product',
          alt_text: 'Test Product Image',
          is_primary: true,
          position: 0
        }
      ]
    };

    console.log('📦 Creating product with data:');
    console.log(JSON.stringify(productData, null, 2));
    console.log('\n' + '─'.repeat(60));

    // Make request
    const response = await fetch(`${BACKEND_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(productData)
    });

    const data = await response.json();

    console.log(`\n📊 Response Status: ${response.status}`);
    console.log('📊 Response Body:');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCCESS! Product created!');
      console.log(`   Product ID: ${data.data?.id}`);
      console.log(`   Name: ${data.data?.name}`);
      console.log(`   SKU: ${data.data?.sku}`);
      return true;
    } else if (response.status === 403) {
      console.log('\n❌ FAILED: Admin access denied (403)');
      console.log('   This means the auth token is valid but user is not admin');
      console.log('   Check if your email is in the admin_users table');
      return false;
    } else if (response.status === 401) {
      console.log('\n❌ FAILED: Not authenticated (401)');
      console.log('   Your token is invalid or expired');
      console.log('   Log in again and get a fresh token');
      return false;
    } else {
      console.log('\n❌ FAILED: Server error');
      return false;
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    return false;
  } finally {
    console.log('\n' + '═'.repeat(60) + '\n');
  }
}

// Main
async function main() {
  if (process.argv.length < 3) {
    console.log('Usage: npx ts-node test-admin-create-product.ts <auth-token>');
    console.log('\nHow to get your auth token:');
    console.log('1. Open your app in browser');
    console.log('2. Open DevTools (F12)');
    console.log('3. Go to Application > Local Storage');
    console.log('4. Find key starting with "sb-" and ending with "-auth-token"');
    console.log('5. Copy the value and paste it as an argument');
    console.log('\nExample:');
    console.log('  npx ts-node test-admin-create-product.ts "eyJhbGciOi..."');
    process.exit(1);
  }

  const token = process.argv[2];
  
  console.log('🔐 Auth Token: ' + token.substring(0, 50) + '...');
  
  const success = await testAdminProductCreation(token);
  
  process.exit(success ? 0 : 1);
}

main();
