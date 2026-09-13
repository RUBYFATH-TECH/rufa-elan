/**
 * Test script for order creation from payment verification
 * This script simulates the payment verification flow to verify order creation
 */

import { supabase } from './src/utils/database';
import { logger } from './src/utils/logger';

const TEST_USER_ID = 'test-user-' + Date.now();
const TEST_ORDER_ID = 'test-order-' + Date.now();
const TEST_REFERENCE = 'test-ref-' + Date.now();

async function runTests() {
  try {
    logger.info('=== Starting Order Creation Tests ===');

    // Step 1: Create test address
    logger.info('Step 1: Creating test address...');
    const { data: addressData, error: addressError } = await supabase
      .from('addresses')
      .insert({
        user_id: TEST_USER_ID,
        full_name: 'Test User',
        email: 'test@example.com',
        phone: '+233000000000',
        address: '123 Test Street',
        city: 'Accra',
        is_default: true
      })
      .select()
      .single();

    if (addressError) {
      logger.error('Failed to create test address:', addressError);
      return;
    }

    logger.info('✓ Test address created:', addressData);
    const addressId = addressData.id;

    // Step 2: Create test payment with metadata
    logger.info('Step 2: Creating test payment with metadata...');
    const metadata = {
      order_id: TEST_ORDER_ID,
      user_id: TEST_USER_ID,
      delivery_option: 'delivery',
      address_id: addressId,
      subtotal_amount: 95.00,
      shipping_fee: 5.00,
      discount_amount: 0,
      items: [
        {
          product_variant_id: 'var-1',
          quantity: 2,
          price: 47.50
        }
      ]
    };

    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: 'temp-' + TEST_REFERENCE,
        user_id: TEST_USER_ID,
        provider: 'paystack',
        reference: TEST_REFERENCE,
        amount: 100.00,
        currency: 'GHS',
        status: 'completed',
        transaction_id: 'mock-txn-' + Date.now(),
        metadata: metadata
      })
      .select()
      .single();

    if (paymentError) {
      logger.error('Failed to create test payment:', paymentError);
      return;
    }

    logger.info('✓ Test payment created:', paymentData);

    // Step 3: Simulate order creation from payment metadata
    logger.info('Step 3: Simulating order creation from payment metadata...');
    
    try {
      const orderMetadata = paymentData.metadata as any;
      const deliveryOption = orderMetadata.delivery_option || 'delivery';
      const items = orderMetadata.items || [];
      const addressIdMeta = orderMetadata.address_id;

      if (!items || items.length === 0) {
        logger.error('No items in payment metadata - cannot create order');
        return;
      }

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Get shipping address
      const { data: addressDataForOrder, error: addressErrorForOrder } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', addressIdMeta)
        .eq('user_id', TEST_USER_ID)
        .single();

      if (addressErrorForOrder || !addressDataForOrder) {
        logger.error('Address not found for order creation:', addressErrorForOrder);
        return;
      }

      logger.info('✓ Address found for order creation');

      // Calculate totals
      const subtotal = orderMetadata.subtotal_amount || (paymentData.amount - (orderMetadata.shipping_fee || 0));
      const shippingFee = orderMetadata.shipping_fee || 0;
      const discountAmount = orderMetadata.discount_amount || 0;

      logger.info('Order totals:', { subtotal, shippingFee, discountAmount, total: paymentData.amount });

      // Create the order
      const { data: newOrder, error: createOrderError } = await supabase
        .from('orders')
        .insert({
          user_id: TEST_USER_ID,
          order_number: orderNumber,
          status: 'processing',
          payment_status: 'paid',
          currency: 'GHS',
          subtotal,
          shipping_fee: shippingFee,
          discount_amount: discountAmount,
          total_amount: paymentData.amount,
          shipping_address: {
            full_name: addressDataForOrder.full_name,
            email: addressDataForOrder.email,
            phone: addressDataForOrder.phone,
            address: addressDataForOrder.address,
            city: addressDataForOrder.city,
            delivery_option: deliveryOption
          }
        })
        .select()
        .single();

      if (createOrderError) {
        logger.error('Failed to create order:', createOrderError);
        return;
      }

      if (!newOrder) {
        logger.error('Order creation returned no data');
        return;
      }

      logger.info('✓ Order created successfully:', newOrder);

      // Create order items
      logger.info('Step 4: Creating order items...');
      let itemsCreated = 0;
      for (const item of items) {
        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: newOrder.id,
            product_variant_id: item.product_variant_id,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity
          });

        if (itemError) {
          logger.error('Failed to create order item:', itemError);
          return;
        }
        itemsCreated++;
      }

      logger.info(`✓ ${itemsCreated} order items created successfully`);

      // Step 5: Verify order exists
      logger.info('Step 5: Verifying order in database...');
      const { data: verifyOrder, error: verifyError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', newOrder.id)
        .single();

      if (verifyError || !verifyOrder) {
        logger.error('Failed to verify order:', verifyError);
        return;
      }

      logger.info('✓ Order verified in database:', verifyOrder);

      logger.info('=== All tests passed! ===');
      logger.info('Order successfully created and can be fetched with items');

    } catch (err) {
      logger.error('Error during order creation simulation:', err);
    }

  } catch (error) {
    logger.error('Test error:', error);
  }
}

runTests();
