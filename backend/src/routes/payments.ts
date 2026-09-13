/**
 * Payments API routes for RUFA ELAN e-commerce application
 * Handles Paystack payment initialization, verification, and webhooks
 */

import express from 'express';
import { Request, Response } from 'express';
import { requireAuth, rateLimitMiddleware } from '../middleware/database';
import { logger } from '../utils/logger';
import { paystackService } from '../services/paystack';
import { serviceConfig } from '../config/services';
import { ApiResponse } from '../types/database';

const router = express.Router();

// Rate limiting for payments API
const paymentsRateLimit = rateLimitMiddleware({
  maxRequests: 20,
  windowMs: 15 * 60 * 1000 // 15 minutes
});

router.use(paymentsRateLimit);

/**
 * POST /api/payments/initialize
 * Initialize a payment transaction with Paystack
 * Required: order_id, amount, email
 */
router.post('/initialize', requireAuth, async (req: Request, res: Response) => {
  try {
    const { order_id, amount, email, metadata } = req.body;

    logger.info('Payment initialize request received', {
      userId: req.userId,
      orderId: order_id,
      amount,
      email,
      hasMetadata: !!metadata,
      hasDb: !!req.db
    });

    // Validate required fields
    if (!order_id || !amount || !email) {
      logger.warn('Missing required fields', { order_id, amount, email });
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'order_id, amount, and email are required'
      } as ApiResponse);
    }

    // Validate metadata if provided (needed for order creation after payment)
    if (metadata) {
      if (!metadata.items || !Array.isArray(metadata.items) || metadata.items.length === 0) {
        logger.warn('Invalid metadata: missing items array', { metadata });
        return res.status(400).json({
          success: false,
          error: 'Invalid metadata',
          message: 'metadata.items must be a non-empty array'
        } as ApiResponse);
      }

      if (!metadata.address_id) {
        logger.warn('Invalid metadata: missing address_id', { metadata });
        return res.status(400).json({
          success: false,
          error: 'Invalid metadata',
          message: 'metadata.address_id is required for order creation'
        } as ApiResponse);
      }

      if (typeof metadata.subtotal_amount !== 'number' || metadata.subtotal_amount <= 0) {
        logger.warn('Invalid metadata: invalid subtotal_amount', { metadata });
        return res.status(400).json({
          success: false,
          error: 'Invalid metadata',
          message: 'metadata.subtotal_amount must be a positive number'
        } as ApiResponse);
      }

      logger.info('Metadata validation passed', {
        itemCount: metadata.items.length,
        addressId: metadata.address_id,
        subtotalAmount: metadata.subtotal_amount
      });
    }

    // Validate amount is positive
    if (amount <= 0) {
      logger.warn('Invalid amount', { amount });
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
        message: 'Amount must be greater than 0'
      } as ApiResponse);
    }

    logger.info('Initializing payment', {
      userId: req.userId,
      orderId: order_id,
      amount,
      email
    });

    // Check if order exists and belongs to user
    // If order doesn't exist in DB yet, we'll create it or just validate amount
    let order = null;
    let orderError: any = null;
    
    if (req.db) {
      try {
        const result = await req.db
          .from('orders')
          .select('id, user_id, status, total_amount')
          .eq('id', order_id)
          .single();
        
        order = result.data;
        orderError = result.error;
        
        logger.info('Order lookup result', {
          found: !!order,
          error: orderError?.message
        });
      } catch (dbErr) {
        logger.error('Error querying orders table:', dbErr);
        orderError = dbErr;
      }
    }

    // If order exists, verify it
    if (order) {
      // Verify order belongs to user
      if (order.user_id !== req.userId) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized',
          message: 'You do not have access to this order'
        } as ApiResponse);
      }

      // Verify amount matches order total
      if (Math.round(amount) !== Math.round(order.total_amount)) {
        return res.status(400).json({
          success: false,
          error: 'Amount mismatch',
          message: `Amount must match order total: ${order.total_amount}`
        } as ApiResponse);
      }
    } else {
      // Order doesn't exist in DB - this is OK for initial checkout
      // The order will be created after payment verification
      logger.info('Order not found in DB (will be created after payment)', {
        orderId: order_id,
        userId: req.userId
      });
    }

    // Check if Paystack is configured
    if (!serviceConfig.paystack.publicKey || !serviceConfig.paystack.secretKey) {
      logger.error('Paystack not configured');
      return res.status(503).json({
        success: false,
        error: 'Payment service not configured',
        message: 'Payment service is temporarily unavailable'
      } as ApiResponse);
    }

    // Generate unique reference for this transaction
    const reference = paystackService.generateReference(`ORD_${order_id.substring(0, 8)}`);

    // Get store settings to determine currency
    let storeCurrency = 'GHS'; // Default to GHS
    if (req.db) {
      try {
        const { data: settings } = await req.db
          .from('store_settings')
          .select('currency_code')
          .single();
        
        if (settings?.currency_code) {
          storeCurrency = settings.currency_code;
          logger.info('Using store currency:', { currency: storeCurrency });
        }
      } catch (err) {
        logger.warn('Failed to fetch store currency, using default GHS:', err);
      }
    }

    // Prepare payment data
    const paymentData = {
      amount: paystackService.nairaToKobo(amount), // Convert to smallest unit (kobo for NGN, pesewas for GHS, etc.)
      email,
      reference,
      metadata: {
        order_id,
        user_id: req.userId,
        ...metadata
      },
      callback_url: `${serviceConfig.app.frontendUrl}/payment-callback`,
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
      currency: storeCurrency // Use the store's configured currency
    };

    logger.info('Calling Paystack API', {
      amount: paymentData.amount,
      email,
      reference
    });

    // Initialize payment with Paystack
    const paystackResponse = await paystackService.initializePayment(paymentData);

    if (!paystackResponse.status) {
      logger.error('Paystack initialization failed', {
        orderId: order_id,
        error: paystackResponse.message
      });

      return res.status(400).json({
        success: false,
        error: 'Payment initialization failed',
        message: paystackResponse.message
      } as ApiResponse);
    }

    // Store payment record in database
    let payment = null;
    let paymentError: any = null;
    
    if (req.db) {
      try {
        // For initial checkout (order_id is a temp string), we don't create payment record yet
        // We'll create it after payment verification when we have the real order_id
        // This prevents UUID constraint violations
        
        logger.info('Payment initialization complete - record will be created after verification', {
          reference,
          orderId: order_id
        });
      } catch (dbErr) {
        logger.error('Error with payment record:', dbErr);
        // Don't fail the request - we can still initialize payment
      }
    }

    logger.info('Payment initialized successfully', {
      orderId: order_id,
      reference,
      authorizationUrl: paystackResponse.data?.authorization_url
    });

    const responsePayload = {
      success: true,
      data: {
        reference,
        authorization_url: paystackResponse.data?.authorization_url,
        access_code: paystackResponse.data?.access_code,
        public_key: serviceConfig.paystack.publicKey,
        amount,
        payment_id: payment?.id
      },
      message: 'Payment initialized successfully'
    };
    
    logger.info('Sending payment response:', responsePayload);
    res.json(responsePayload);

  } catch (error) {
    logger.error('Error initializing payment:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: req.userId,
      body: req.body
    });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to initialize payment'
    } as ApiResponse);
  }
});

/**
 * GET /api/payments/verify/:reference
 * Verify a payment transaction with Paystack
 */
router.get('/verify/:reference', requireAuth, async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        error: 'Missing reference',
        message: 'Payment reference is required'
      } as ApiResponse);
    }

    logger.info('Verifying payment', {
      userId: req.userId,
      reference
    });

    // Verify payment with Paystack
    const verifyResponse = await paystackService.verifyPayment(reference);

    if (!verifyResponse.status) {
      logger.warn('Payment verification failed', {
        reference,
        message: verifyResponse.message
      });

      return res.status(400).json({
        success: false,
        error: 'Payment verification failed',
        message: verifyResponse.message
      } as ApiResponse);
    }

    const paymentData = verifyResponse.data;

    // Paystack returns the checkout metadata with the verified transaction.  A
    // new checkout deliberately has no local payment row yet, so this is the
    // authoritative source for creating its order.
    const orderMetadata = paymentData.metadata as any;
    if (orderMetadata?.user_id && orderMetadata.user_id !== req.userId) {
      logger.warn('Payment verification attempted by a different user', {
        reference,
        paymentUserId: orderMetadata.user_id,
        requestUserId: req.userId
      });
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'This payment does not belong to the authenticated user'
      } as ApiResponse);
    }

    // Update payment record in database (or create if it doesn't exist)
    const paymentStatus = paymentData.status === 'success' ? 'completed' : paymentData.status;

    let payment = null;
    let updateError = null;
    
    // Check if payment record exists
    const { data: existingPayment } = await req.db!
      .from('payments')
      .select('*')
      .eq('reference', reference)
      .single();
    
    if (existingPayment) {
      // Update existing payment record
      const result = await req.db!
        .from('payments')
        .update({
          status: paymentStatus,
          metadata: paymentData
        })
        .eq('reference', reference)
        .select()
        .single();
      
      payment = result.data;
      updateError = result.error;
    } else {
      // Payment record doesn't exist yet - this is normal for initial checkout flow
      // We'll create it later when we create the order
      logger.info('Payment record will be created with order', { reference });
    }

    if (updateError) {
      logger.error('Failed to update payment record', {
        reference,
        error: updateError
      });
    }

    // If payment is successful, create or update order
    if (paymentData.status === 'success') {
      let order = null;
      let orderError: any = null;

      // A payment row can point at an order whose item insertion failed during
      // an earlier verification attempt. Treat that as incomplete, so a later
      // verification can repair the order instead of only updating its status.
      let existingOrderHasItems = false;
      if (payment?.order_id && payment.order_id !== `temp-${reference}`) {
        const { count, error: itemCountError } = await req.db!
          .from('order_items')
          .select('id', { count: 'exact', head: true })
          .eq('order_id', payment.order_id);

        if (itemCountError) {
          throw new Error(`Failed to inspect existing order items: ${itemCountError.message}`);
        }
        existingOrderHasItems = (count || 0) > 0;
      }

      // Only skip order creation when the existing order already has products.
      if (payment?.order_id && payment.order_id !== `temp-${reference}` && existingOrderHasItems) {
        // Order already exists, just update its status
        const { error: updateOrderError } = await req.db!
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'processing'
          })
          .eq('id', payment.order_id);

        if (updateOrderError) {
          logger.error('Failed to update order status', {
            orderId: payment.order_id,
            error: updateOrderError
          });
        } else {
          logger.info('Order status updated to processing', {
            orderId: payment.order_id,
            reference
          });
        }
      } else if (orderMetadata) {
        // Order doesn't exist yet - create it from payment metadata
        logger.info('Creating order from payment metadata', {
          reference,
          metadata: orderMetadata
        });

        try {
          // Extract delivery option and items from metadata
          const deliveryOption = orderMetadata.delivery_option || 'delivery';
          const items = orderMetadata.items || [];
          const addressId = orderMetadata.address_id;

          // Validate items exist
          if (!items || items.length === 0) {
            logger.error('No items in payment metadata - cannot create order', { reference });
            throw new Error('No items in payment metadata');
          }

          // A prior item-write failure can leave a paid order with no items.
          // Reuse that order on verification retries instead of duplicating it.
          const { data: existingOrder } = await req.db!
            .from('orders')
            .select('id, order_number')
            .eq('payment_reference', reference)
            .eq('user_id', req.userId)
            .maybeSingle();
          const orderNumber = existingOrder?.order_number || `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

          // Get shipping address from address ID
          const { data: addressData, error: addressError } = await req.db!
            .from('addresses')
            .select('*')
            .eq('id', addressId)
            .eq('user_id', req.userId)
            .single();

          if (addressError || !addressData) {
            logger.error('Address not found for order creation', { addressId, error: addressError });
            throw new Error(`Address not found: ${addressId}`);
          }

          // Calculate totals from payment metadata
          const paidAmount = paystackService.koboToNaira(paymentData.amount);
          const subtotal = orderMetadata.subtotal_amount || (paidAmount - (orderMetadata.shipping_fee || 0));
          const shippingFee = orderMetadata.shipping_fee || 0;
          const discountAmount = orderMetadata.discount_amount || 0;

          logger.info('Creating order from metadata', {
            reference,
            orderNumber,
            itemCount: items.length,
            subtotal,
            shippingFee,
            discountAmount,
            totalAmount: paidAmount
          });

          // Create a new order only when this reference has not already made
          // it to the database. Existing incomplete orders are repaired below.
          let newOrder: any = existingOrder;
          if (!newOrder) {
            const { data, error: createOrderError } = await req.db!
              .from('orders')
              .insert({
              user_id: req.userId,
              order_number: orderNumber,
              status: 'processing',
              payment_status: 'paid',
              currency: 'GHS',
              subtotal,
              shipping_fee: shippingFee,
              discount_amount: discountAmount,
              total_amount: paidAmount,
              payment_reference: reference,
              shipping_address: {
                full_name: addressData.full_name,
                email: addressData.email,
                phone: addressData.phone,
                address: addressData.address,
                city: addressData.city,
                delivery_option: deliveryOption
              }
              })
              .select()
              .single();

            if (createOrderError) {
              logger.error('Failed to create order from payment', {
                reference,
                error: createOrderError
              });
              throw new Error(`Failed to create order: ${createOrderError.message}`);
            }
            newOrder = data;
          }

          if (!newOrder) {
            logger.error('Order creation returned no data', { reference });
            throw new Error('Order creation returned no data');
          }

          logger.info(existingOrder ? 'Recovering incomplete order' : 'Order created successfully', {
            orderId: newOrder.id,
            reference,
            orderNumber
          });

          const { count: existingItemCount, error: existingItemsError } = await req.db!
            .from('order_items')
            .select('id', { count: 'exact', head: true })
            .eq('order_id', newOrder.id);
          if (existingItemsError) throw new Error(`Failed to inspect order items: ${existingItemsError.message}`);

          // Create order items in separate table. A completed retry must not
          // insert duplicates when the earlier attempt already succeeded.
          let itemsCreated = 0;
          for (const item of existingItemCount ? [] : items) {
            // Shop cards currently store the product id in the cart, whereas
            // order_items requires a product variant id.  First accept a real
            // variant id, then resolve legacy/product cart ids to a variant.
            let productVariantId = item.product_variant_id;
            let { data: variant } = await req.db!
              .from('product_variants')
              .select(`
                id, name, value, sku, price, stock_quantity,
                products(
                  id, name, description,
                  product_images(id, url, position)
                )
              `)
              .eq('id', productVariantId)
              .maybeSingle();

            if (!variant) {
              const { data: productVariant } = await req.db!
                .from('product_variants')
                .select(`
                  id, name, value, sku, price, stock_quantity,
                  products(
                    id, name, description,
                    product_images(id, url, position)
                  )
                `)
                .eq('product_id', productVariantId)
                .order('created_at', { ascending: true })
                .limit(1)
                .maybeSingle();
              variant = productVariant;
              productVariantId = productVariant?.id;
            }

            // Older catalog records were created without variants, even though
            // order_items requires one. Preserve those paid checkouts by
            // creating a single default variant for the referenced product.
            if (!variant) {
              const { data: legacyProduct, error: legacyProductError } = await req.db!
                .from('products')
                .select('id, name, sku, regular_price, sale_price')
                .eq('id', item.product_variant_id)
                .maybeSingle();

              if (legacyProductError || !legacyProduct) {
                throw new Error(`No purchasable product found for item ${item.product_variant_id}`);
              }

              const defaultSku = `${legacyProduct.sku}-DEFAULT`;
              const { data: createdVariant, error: createVariantError } = await req.db!
                .from('product_variants')
                .insert({
                  product_id: legacyProduct.id,
                  name: 'Default',
                  value: 'Default',
                  sku: defaultSku,
                  price: legacyProduct.sale_price ?? legacyProduct.regular_price,
                  stock_quantity: 0
                })
                .select(`
                  id, name, value, sku, price, stock_quantity,
                  products(
                    id, name, description,
                    product_images(id, url, position)
                  )
                `)
                .single();

              if (createVariantError || !createdVariant) {
                // A concurrent retry may have just created the default variant.
                const { data: concurrentVariant, error: concurrentVariantError } = await req.db!
                  .from('product_variants')
                  .select(`
                    id, name, value, sku, price, stock_quantity,
                    products(
                      id, name, description,
                      product_images(id, url, position)
                    )
                  `)
                  .eq('product_id', legacyProduct.id)
                  .eq('sku', defaultSku)
                  .maybeSingle();

                if (concurrentVariantError || !concurrentVariant) {
                  throw new Error(`Failed to create a default variant for product ${legacyProduct.id}: ${createVariantError?.message || concurrentVariantError?.message}`);
                }
                variant = concurrentVariant;
              } else {
                variant = createdVariant;
              }
              productVariantId = variant.id;
            }

            if (!variant || !productVariantId) {
              throw new Error(`No purchasable variant found for item ${item.product_variant_id}`);
            }

            const unitPrice = Number(variant.price ?? item.price);
            
            // Create product snapshot for the order item
            const product = (variant as any).products;
            if (!product) {
              logger.error('Product relationship not found in variant', {
                productVariantId,
                variant: (variant as any)
              });
              throw new Error(`Product data missing for variant ${productVariantId}`);
            }

            const images = Array.isArray((product as any)?.product_images) ? (product as any).product_images : [];
            const primaryImage = images.find((img: any) => img.position === 1) || images[0];
            
            const productSnapshot = {
              product_id: (product as any)?.id,
              product_name: (product as any)?.name,
              variant_name: (variant as any).name,
              description: (product as any)?.description,
              sku: (variant as any).sku,
              color: (variant as any).value,
              image_url: primaryImage?.url || null,
              all_images: images.map((img: any) => ({
                url: img.url,
                position: img.position
              }))
            };

            const { error: itemError } = await req.db!
              .from('order_items')
              .insert({
                order_id: newOrder.id,
                product_variant_id: productVariantId,
                quantity: item.quantity,
                unit_price: unitPrice,
                total_price: unitPrice * item.quantity,
                product_snapshot: productSnapshot
              });

            if (itemError) {
              logger.error('Failed to create order item', {
                orderId: newOrder.id,
                item,
                error: itemError
              });
              throw new Error(`Failed to create order item: ${itemError.message}`);
            }
            itemsCreated++;
          }

          logger.info('Order items created successfully', {
            orderId: newOrder.id,
            itemsCreated
          });

          // Link the recovered/new order to its payment only once.
          const { data: paymentForReference } = await req.db!
            .from('payments')
            .select('id')
            .eq('reference', reference)
            .maybeSingle();
          const { error: createPaymentError } = paymentForReference ? { error: null } : await req.db!
            .from('payments')
            .insert({
              order_id: newOrder.id,
              user_id: req.userId,
              provider: 'paystack',
              reference,
              amount: paidAmount,
              currency: 'GHS',
              status: paymentStatus,
              metadata: paymentData
            });

          if (createPaymentError) {
            logger.error('Failed to create payment record', {
              orderId: newOrder.id,
              reference,
              error: createPaymentError
            });
          } else {
            logger.info('Payment record created successfully', {
              orderId: newOrder.id,
              reference
            });
          }

          logger.info('Order creation from payment complete', {
            orderId: newOrder.id,
            reference,
            orderNumber,
            itemsCreated
          });

        } catch (err) {
          logger.error('Error creating order from payment metadata:', {
            reference,
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined
          });
          // A verified charge without a persisted order must not be presented
          // as a completed checkout.  The reference lets support safely retry.
          return res.status(500).json({
            success: false,
            error: 'Order creation failed',
            message: 'Your payment was verified, but we could not create the order. Please contact support with the payment reference.',
            data: { reference }
          } as ApiResponse);
        }
      } else {
        logger.error('Verified payment has no checkout metadata', { reference });
        return res.status(500).json({
          success: false,
          error: 'Order creation failed',
          message: 'The payment was verified but its checkout details are missing. Please contact support with the payment reference.',
          data: { reference }
        } as ApiResponse);
      }
    }

    logger.info('Payment verified successfully', {
      reference,
      status: paymentStatus,
      amount: paymentData.amount
    });

    res.json({
      success: true,
      data: {
        status: paymentStatus,
        reference,
        amount: paystackService.koboToNaira(paymentData.amount),
        currency: paymentData.currency,
        paid_at: paymentData.paid_at,
        transaction_id: paymentData.id,
        customer: {
          email: paymentData.customer?.email,
          first_name: paymentData.customer?.first_name,
          last_name: paymentData.customer?.last_name
        }
      },
      message: 'Payment verified successfully'
    } as ApiResponse);

  } catch (error) {
    logger.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to verify payment'
    } as ApiResponse);
  }
});

/**
 * GET /api/payments
 * Get user's payment history
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query as any;

    let query = req.db!
      .from('payments')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false })
      .range(
        (parseInt(page) - 1) * parseInt(limit),
        parseInt(page) * parseInt(limit) - 1
      );

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error('Failed to fetch payments:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch payments',
        message: error.message
      } as ApiResponse);
    }

    const pagination = {
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil((count || 0) / parseInt(limit))
    };

    logger.info(`Fetched ${data?.length || 0} payments`, {
      userId: req.userId,
      page,
      limit
    });

    res.json({
      success: true,
      data: data || [],
      pagination
    } as ApiResponse);

  } catch (error) {
    logger.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch payments'
    } as ApiResponse);
  }
});

/**
 * GET /api/payments/:id
 * Get payment details
 */
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await req.db!
      .from('payments')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
        message: 'The requested payment does not exist'
      } as ApiResponse);
    }

    logger.info(`Fetched payment: ${id}`, { userId: req.userId });

    res.json({
      success: true,
      data
    } as ApiResponse);

  } catch (error) {
    logger.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch payment'
    } as ApiResponse);
  }
});

/**
 * POST /api/payments/webhook/paystack
 * Paystack webhook handler for payment notifications
 * This endpoint should be configured in your Paystack dashboard
 */
router.post('/webhook/paystack', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    const isValidSignature = paystackService.verifyWebhookSignature(body, signature);

    if (!isValidSignature) {
      logger.warn('Invalid webhook signature received');
      return res.status(400).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    const event = req.body.event;
    const paymentData = req.body.data;

    logger.info('Processing Paystack webhook', {
      event,
      reference: paymentData.reference,
      status: paymentData.status
    });

    if (event === 'charge.success') {
      // Update payment status
      const { data: payment, error: paymentError } = await req.db!
        .from('payments')
        .update({
          status: 'completed',
          metadata: paymentData
        })
        .eq('reference', paymentData.reference)
        .select()
        .single();

      if (paymentError) {
        logger.error('Failed to update payment from webhook:', {
          reference: paymentData.reference,
          error: paymentError
        });
      } else if (payment) {
        // Update order status to processing
        const { error: orderError } = await req.db!
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'processing'
          })
          .eq('id', payment.order_id);

        if (!orderError) {
          logger.info('Order transitioned to processing via webhook', {
            orderId: payment.order_id,
            reference: paymentData.reference
          });
        }

        // Send notification to user
        try {
          await req.db!
            .from('notifications')
            .insert({
              user_id: payment.user_id,
              type: 'payment',
              title: 'Payment Successful',
              message: `Your payment of ₦${paystackService.koboToNaira(paymentData.amount)} has been confirmed. Your order is now being processed.`,
              data: {
                order_id: payment.order_id,
                payment_id: payment.id,
                reference: paymentData.reference
              },
              is_read: false
            });
        } catch (notificationError) {
          logger.error('Failed to create notification:', notificationError);
        }
      }
    } else if (event === 'charge.failed') {
      // Update payment status to failed
      const { data: payment, error: paymentError } = await req.db!
        .from('payments')
        .update({
          status: 'failed',
          metadata: paymentData
        })
        .eq('reference', paymentData.reference)
        .select()
        .single();

      if (!paymentError && payment) {
        // Send failure notification
        try {
          await req.db!
            .from('notifications')
            .insert({
              user_id: payment.user_id,
              type: 'payment_failed',
              title: 'Payment Failed',
              message: `Your payment attempt failed. Please try again or contact support.`,
              data: {
                order_id: payment.order_id,
                payment_id: payment.id,
                reference: paymentData.reference,
                reason: paymentData.gateway_response
              },
              is_read: false
            });
        } catch (notificationError) {
          logger.error('Failed to create failure notification:', notificationError);
        }
      }
    }

    // Acknowledge receipt of webhook
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/payments/retry/:orderId
 * Retry payment for an order
 */
router.post('/retry/:orderId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Missing email',
        message: 'Email is required to retry payment'
      } as ApiResponse);
    }

    // Check if order exists and belongs to user
    const { data: order, error: orderError } = await req.db!
      .from('orders')
      .select('id, user_id, total_amount, payment_status')
      .eq('id', orderId)
      .eq('user_id', req.userId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        message: 'The specified order does not exist'
      } as ApiResponse);
    }

    // Check if payment can be retried (only if unpaid or failed)
    if (!['unpaid', 'failed'].includes(order.payment_status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot retry payment',
        message: `Order payment status is ${order.payment_status}`
      } as ApiResponse);
    }

    logger.info('Retrying payment', {
      userId: req.userId,
      orderId,
      email
    });

    // Get store settings for currency
    let storeCurrency = 'GHS'; // Default
    if (req.db) {
      try {
        const { data: settings } = await req.db
          .from('store_settings')
          .select('currency_code')
          .single();
        
        if (settings?.currency_code) {
          storeCurrency = settings.currency_code;
        }
      } catch (err) {
        logger.warn('Failed to fetch store currency, using default GHS');
      }
    }

    // Reinitialize payment
    const reference = paystackService.generateReference(`RETRY_${orderId.substring(0, 8)}`);

    const paymentData = {
      amount: paystackService.nairaToKobo(order.total_amount),
      email,
      reference,
      metadata: {
        order_id: orderId,
        user_id: req.userId,
        retry: true
      },
      callback_url: `${serviceConfig.app.frontendUrl}/payment-callback`,
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
      currency: storeCurrency
    };

    const paystackResponse = await paystackService.initializePayment(paymentData);

    if (!paystackResponse.status) {
      return res.status(400).json({
        success: false,
        error: 'Payment initialization failed',
        message: paystackResponse.message
      } as ApiResponse);
    }

    // Store retry payment record
    const { data: payment } = await req.db!
      .from('payments')
      .insert({
        order_id: orderId,
        user_id: req.userId,
        provider: 'paystack',
        reference,
        amount: order.total_amount,
        currency: storeCurrency,
        status: 'pending',
        metadata: paymentData.metadata
      })
      .select()
      .single();

    logger.info('Payment retry initialized', {
      orderId,
      reference,
      authorizationUrl: paystackResponse.data?.authorization_url
    });

    res.json({
      success: true,
      data: {
        reference,
        authorization_url: paystackResponse.data?.authorization_url,
        access_code: paystackResponse.data?.access_code,
        public_key: serviceConfig.paystack.publicKey,
        amount: order.total_amount,
        payment_id: payment?.id
      },
      message: 'Payment retry initialized successfully'
    } as ApiResponse);

  } catch (error) {
    logger.error('Error retrying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retry payment'
    } as ApiResponse);
  }
});

export default router;
