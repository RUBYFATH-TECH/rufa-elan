require('dotenv').config();
const { supabase } = require('./dist/utils/database');

(async () => {
  console.log('=== Payment & Order Status ===\n');
  
  // Check payments
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
    
  console.log('Recent Payments:', payments?.length || 0);
  if (payments?.length > 0) {
    payments.forEach((p, i) => {
      console.log(`  ${i+1}. Ref: ${p.reference} | Status: ${p.status} | Amount: ${p.amount} | Order ID: ${p.order_id}`);
    });
  }
  
  // Check orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
    
  console.log('\nRecent Orders:', orders?.length || 0);
  if (orders?.length > 0) {
    orders.forEach((o, i) => {
      console.log(`  ${i+1}. Order#: ${o.order_number} | Status: ${o.status} | Amount: ${o.total_amount}`);
    });
  }
  
  // Check order_items
  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
    
  console.log('\nRecent Order Items:', items?.length || 0);
  
  // Summary
  console.log('\n=== Summary ===');
  console.log('Payments: ', payments?.length || 0);
  console.log('Orders: ', orders?.length || 0);
  console.log('Order Items: ', items?.length || 0);
  
  if (payments?.length > 0 && orders?.length === 0) {
    console.log('\nWARNING: Payments exist but NO orders created!');
    console.log('This means payment verification is not creating orders.');
  }
})();
