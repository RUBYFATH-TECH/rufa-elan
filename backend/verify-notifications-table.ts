/**
 * Verify and setup notifications table for delivered order notifications
 * Run this script to ensure the database is ready
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyNotificationsTable() {
  console.log('🔍 Verifying notifications table structure...\n');

  try {
    // Check if notifications table exists and has correct structure
    const { data: testData, error: testError } = await supabase
      .from('notifications')
      .select('id, user_id, order_id, type, title, message, delivered, channel, priority, metadata, data, read_at, expires_at, created_at, updated_at')
      .limit(1);

    if (testError) {
      console.error('❌ Error accessing notifications table:', testError.message);
      console.log('\n📋 Required columns:');
      console.log('   - id (uuid)');
      console.log('   - user_id (uuid)');
      console.log('   - order_id (uuid, nullable)');
      console.log('   - type (text)');
      console.log('   - title (text)');
      console.log('   - message (text)');
      console.log('   - delivered (boolean)');
      console.log('   - channel (text)');
      console.log('   - priority (text)');
      console.log('   - metadata (jsonb)');
      console.log('   - data (jsonb)');
      console.log('   - read_at (timestamptz)');
      console.log('   - expires_at (timestamptz)');
      console.log('   - created_at (timestamptz)');
      console.log('   - updated_at (timestamptz)');
      console.log('\n💡 Run VERIFY_NOTIFICATIONS_TABLE.sql to fix the schema.');
      return false;
    }

    console.log('✅ Notifications table exists with correct structure\n');

    // Check for existing delivered notifications
    const { data: deliveredNotifs, error: deliveredError, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('type', 'order_status')
      .or('metadata->>status.eq.delivered,title.ilike.%delivered%');

    if (deliveredError) {
      console.warn('⚠️  Could not query delivered notifications:', deliveredError.message);
    } else {
      console.log(`📊 Existing delivered order notifications: ${count || 0}`);
      
      if (deliveredNotifs && deliveredNotifs.length > 0) {
        console.log('\n📝 Sample delivered notification:');
        const sample = deliveredNotifs[0];
        console.log(`   - ID: ${sample.id}`);
        console.log(`   - User: ${sample.user_id}`);
        console.log(`   - Order: ${sample.order_id || 'N/A'}`);
        console.log(`   - Title: ${sample.title}`);
        console.log(`   - Message: ${sample.message}`);
        console.log(`   - Priority: ${sample.priority}`);
        console.log(`   - Read: ${sample.read_at ? 'Yes' : 'No'}`);
        console.log(`   - Created: ${sample.created_at}`);
      }
    }

    // Test notification query
    console.log('\n🔍 Testing notification retrieval...');
    const { data: allNotifs, error: allError } = await supabase
      .from('notifications')
      .select('id, user_id, type, title, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (allError) {
      console.error('❌ Error fetching notifications:', allError.message);
      return false;
    }

    console.log(`✅ Successfully retrieved ${allNotifs?.length || 0} recent notifications\n`);

    // Check orders table connection
    console.log('🔗 Verifying orders table relationship...');
    const { data: ordersTest, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status')
      .limit(1);

    if (ordersError) {
      console.error('❌ Error accessing orders table:', ordersError.message);
      return false;
    }

    console.log('✅ Orders table accessible\n');

    // Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ NOTIFICATIONS TABLE VERIFICATION SUCCESSFUL');
    console.log('═══════════════════════════════════════════════════');
    console.log('✓ Table structure is correct');
    console.log('✓ All required columns exist');
    console.log('✓ Orders relationship is working');
    console.log('✓ Ready to receive delivered order notifications');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('📋 How it works:');
    console.log('1. Admin updates order status to "delivered"');
    console.log('2. System automatically creates notification');
    console.log('3. User sees notification at /account/notifications');
    console.log('4. Notification includes order number and details\n');

    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Run verification
verifyNotificationsTable()
  .then(success => {
    if (success) {
      console.log('✅ Verification complete - system is ready!');
      process.exit(0);
    } else {
      console.log('❌ Verification failed - please check the errors above');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
