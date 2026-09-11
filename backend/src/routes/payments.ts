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

    // Generate unique reference for this transaction
    const reference = paystackService.generateReference(`ORD_${order_id.substring(0, 8)}`);

    // Prepare payment data
    const paymentData = {
      amount: paystackService.nairaToKobo(amount), // Convert to kobo
      email,
      reference,
      metadata: {
        order_id,
        user_id: req.userId,
        ...metadata
      },
      callback_url: `${serviceConfig.app.frontendUrl}/payment-callback`,
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money']
    };

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
      const result = await req.db
        .from('payments')
        .insert({
          order_id: order_id || 'temp-' + reference, // Use temp ID if order_id is placeholder
          user_id: req.userId,
          provider: 'paystack',
          reference,
          amount,
          currency: 'NGN',
          status: 'pending',
          metadata: paymentData.metadata
        })
        .select()
        .single();
      
      payment = result.data;
      paymentError = result.error;
      
      if (paymentError) {
        logger.error('Failed to store payment record', {
          orderId: order_id,
          error: paymentError.message
        });
        // Don't fail the request - we can still initialize payment
      }
    }

    logger.info('Payment initialized successfully', {
      orderId: order_id,
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
        amount,
        payment_id: payment?.id
      },
      message: 'Payment initialized successfully'
    } as ApiResponse);

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

    // Update payment record in database
    const paymentStatus = paymentData.status === 'success' ? 'completed' : paymentData.status;

    const { data: payment, error: updateError } = await req.db!
      .from('payments')
      .update({
        status: paymentStatus,
        transaction_id: paymentData.id,
        metadata: paymentData
      })
      .eq('reference', reference)
      .select()
      .single();

    if (updateError) {
      logger.error('Failed to update payment record', {
        reference,
        error: updateError
      });
    }

    // If payment is successful, update order status
    if (paymentData.status === 'success' && payment?.order_id) {
      const { error: orderError } = await req.db!
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'processing'
        })
        .eq('id', payment.order_id);

      if (orderError) {
        logger.error('Failed to update order status', {
          orderId: payment.order_id,
          error: orderError
        });
      } else {
        logger.info('Order status updated to processing', {
          orderId: payment.order_id,
          reference
        });
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
          transaction_id: paymentData.id,
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
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money']
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
        currency: 'NGN',
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
