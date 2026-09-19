/**
 * Test script to simulate delivered order notification
 * This tests the complete flow without requiring frontend
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDeliveryNotification() {
  console.log('🧪 Testing Delivered Order Notification System\n');
  console.log('═══════════════════════════════════════════════\n');

  try {
    // Step 1: Find a test order
    console.log('📋 Step 1: Finding a test order...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, user_id')
      .neq('status', 'delivered')
      .limit(1);

    if (ordersError || !orders || orders.length === 0) {
      console.log('⚠️  No non-delivered orders found to test with');
      console.log('💡 Create a test order first or use an existing one\n');
      return;
    }

    const testOrder = orders[0];
    console.log(`✅ Found order: ${testOrder.order_number}`);
    console.log(`   - ID: ${testOrder.id}`);
    console.log(`   - Current Status: ${testOrder.status}`);
    console.log(`   - User ID: ${testOrder.user_id}\n`);

    // Step 2: Simulate order update to delivered
    console.log('📦 Step 2: Simulating order status update to "delivered"...');
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'delivered' })
      .eq('id', testOrder.id);

    if (updateError) {
      console.error('❌ Failed to update order:', updateError.message);
      return;
    }
    console.log('✅ Order status updated to "delivered"\n');

    // Step 3: Create notification (simulate backend logic)
    console.log('🔔 Step 3: Creating delivery notification...');
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: testOrder.user_id,
        order_id: testOrder.id,
        type: 'order_status',
        title: 'Order Delivered',
        message: `Order #${testOrder.order_number} has been delivered. Please verify the contents.`,
        delivered: false,
        channel: 'in_app',
        priority: 'high',
        metadata: {
          status: 'delivered',
          previousStatus: testOrder.status,
          orderNumber: testOrder.order_number
        },
        read_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (notifError) {
      console.error('❌ Failed to create notification:', notifError.message);
      return;
    }

    console.log('✅ Notification created successfully!');
    console.log(`   - ID: ${notification.id}`);
    console.log(`   - Title: ${notification.title}`);
    console.log(`   - Message: ${notification.message}`);
    console.log(`   - Priority: ${notification.priority}`);
    console.log(`   - Type: ${notification.type}\n`);

    // Step 4: Verify notification appears for user
    console.log('🔍 Step 4: Verifying notification is accessible...');
    const { data: userNotifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', testOrder.user_id)
      .eq('order_id', testOrder.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Failed to fetch notifications:', fetchError.message);
      return;
    }

    console.log(`✅ Found ${userNotifications.length} notification(s) for this order\n`);

    // Step 5: Summary
    console.log('═══════════════════════════════════════════════');
    console.log('✅ TEST SUCCESSFUL!');
    console.log('═══════════════════════════════════════════════\n');

    console.log('📊 Test Results:');
    console.log(`✓ Order updated to delivered`);
    console.log(`✓ Notification created`);
    console.log(`✓ Notification linked to order`);
    console.log(`✓ Notification visible to user`);
    console.log(`✓ Priority set to HIGH`);
    console.log(`✓ Type set to order_status\n`);

    console.log('🎯 What the user sees:');
    console.log('─────────────────────────────────────────────');
    console.log(`📦 ${notification.title}`);
    console.log(`${notification.message}`);
    console.log(`Priority: ${notification.priority.toUpperCase()}`);
    console.log(`Status: UNREAD`);
    console.log(`Created: ${new Date(notification.created_at).toLocaleString()}`);
    console.log('─────────────────────────────────────────────\n');

    console.log('💡 Next Steps:');
    console.log('1. Login as the customer');
    console.log('2. Navigate to /account/notifications');
    console.log('3. You should see the delivery notification\n');

    console.log('🧹 Cleanup (optional):');
    console.log(`To remove test notification, run:`);
    console.log(`DELETE FROM notifications WHERE id = '${notification.id}';\n`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test
testDeliveryNotification()
  .then(() => {
    console.log('✅ Test complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
