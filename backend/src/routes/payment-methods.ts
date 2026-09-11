/**
 * Payment Methods API routes for RUFA ELAN e-commerce application
 * Handles user payment methods CRUD operations
 */

import express from 'express';
import { Request, Response } from 'express';
import { db, dbUtils } from '../utils/database';
import { requireAuth, rateLimitMiddleware } from '../middleware/database';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/database';

const router = express.Router();

// Payment method type definition
export interface PaymentMethod {
  id: string;
  user_id: string;
  provider: string;
  method_type: string;
  label: string;
  account_name: string;
  account_number: string;
  phone_number?: string;
  card_last_four?: string;
  card_brand?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  is_default: boolean;
  is_active: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentMethodInput {
  provider: string;
  method_type: string;
  label: string;
  account_name: string;
  account_number: string;
  phone_number?: string;
  card_last_four?: string;
  card_brand?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  is_default?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdatePaymentMethodInput extends Partial<CreatePaymentMethodInput> {}

// Rate limiting for payment methods API
const paymentMethodsRateLimit = rateLimitMiddleware({
  maxRequests: 30,
  windowMs: 15 * 60 * 1000 // 15 minutes
});

router.use(paymentMethodsRateLimit);

/**
 * GET /api/payment-methods
 * Get all user payment methods
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { data, error } = await req.db!
      .from('payment_methods')
      .select('*')
      .eq('user_id', req.userId)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch payment methods:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch payment methods',
        message: error.message
      } as ApiResponse);
    }

    logger.info(`Fetched ${data?.length || 0} payment methods`, { userId: req.userId });

    res.json({
      success: true,
      data: data || []
    } as ApiResponse<PaymentMethod[]>);

  } catch (error) {
    logger.error('Error fetching payment methods:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch payment methods'
    } as ApiResponse);
  }
});

/**
 * GET /api/payment-methods/:id
 * Get single payment method by ID
 */
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment method ID',
        message: 'Payment method ID must be a valid UUID'
      } as ApiResponse);
    }

    const { data, error } = await req.db!
      .from('payment_methods')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Payment method not found',
        message: 'The requested payment method does not exist'
      } as ApiResponse);
    }

    logger.info(`Fetched payment method: ${id}`, { userId: req.userId });

    res.json({
      success: true,
      data
    } as ApiResponse<PaymentMethod>);

  } catch (error) {
    logger.error('Error fetching payment method:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch payment method'
    } as ApiResponse);
  }
});

/**
 * POST /api/payment-methods
 * Create new payment method
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      provider,
      method_type,
      label,
      account_name,
      account_number,
      phone_number,
      card_last_four,
      card_brand,
      card_exp_month,
      card_exp_year,
      is_default,
      metadata
    } = req.body as CreatePaymentMethodInput;

    // Validate required fields
    if (!provider || !method_type || !label || !account_name || !account_number) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'provider, method_type, label, account_name, and account_number are required'
      } as ApiResponse);
    }

    // Log user ID for debugging
    logger.info(`Creating payment method for user: ${req.userId}`, { userId: req.userId });

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User ID not found in request'
      } as ApiResponse);
    }

    // If setting as default, unset other defaults
    if (is_default) {
      await req.db!
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', req.userId);
    }

    // Ensure user profile exists
    const { data: userExists, error: checkError } = await req.db!
      .from('profiles')
      .select('id')
      .eq('id', req.userId)
      .single();

    logger.info(`User profile check: ${req.userId}`, { userExists: !!userExists, checkError });

    if (!userExists) {
      // Create profile if it doesn't exist
      const { error: createProfileError } = await req.db!
        .from('profiles')
        .insert({
          id: req.userId,
          full_name: null,
          phone: null,
          avatar_url: null
        });
      
      logger.info(`Created profile for user: ${req.userId}`, { error: createProfileError });
      
      if (createProfileError) {
        logger.error('Failed to create profile:', createProfileError);
        // Continue anyway, the payment method insert might still work
      }
    }

    const { data, error } = await req.db!
      .from('payment_methods')
      .insert({
        user_id: req.userId,
        provider,
        method_type,
        label,
        account_name,
        account_number,
        phone_number: phone_number || null,
        card_last_four: card_last_four || null,
        card_brand: card_brand || null,
        card_exp_month: card_exp_month || null,
        card_exp_year: card_exp_year || null,
        is_default: is_default || false,
        is_active: true,
        metadata: metadata || null
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create payment method:', error, { userId: req.userId });
      return res.status(500).json({
        success: false,
        error: 'Failed to create payment method',
        message: error.message
      } as ApiResponse);
    }

    logger.info(`Created payment method: ${data?.id}`, {
      userId: req.userId,
      label
    });

    res.status(201).json({
      success: true,
      data,
      message: 'Payment method created successfully'
    } as ApiResponse<PaymentMethod>);

  } catch (error) {
    logger.error('Error creating payment method:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create payment method'
    } as ApiResponse);
  }
});

/**
 * PUT /api/payment-methods/:id
 * Update payment method
 */
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateInput = req.body as UpdatePaymentMethodInput;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment method ID',
        message: 'Payment method ID must be a valid UUID'
      } as ApiResponse);
    }

    // Check if payment method exists and belongs to user
    const { data: existingMethod, error: fetchError } = await req.db!
      .from('payment_methods')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId)
      .single();

    if (fetchError || !existingMethod) {
      return res.status(404).json({
        success: false,
        error: 'Payment method not found',
        message: 'The requested payment method does not exist'
      } as ApiResponse);
    }

    // If setting as default, unset other defaults
    if (updateInput.is_default && !existingMethod.is_default) {
      await req.db!
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', req.userId)
        .neq('id', id);
    }

    const updateData: Partial<PaymentMethod> = {
      ...(updateInput.provider && { provider: updateInput.provider }),
      ...(updateInput.method_type && { method_type: updateInput.method_type }),
      ...(updateInput.label && { label: updateInput.label }),
      ...(updateInput.account_name && { account_name: updateInput.account_name }),
      ...(updateInput.account_number && { account_number: updateInput.account_number }),
      ...(updateInput.phone_number !== undefined && { phone_number: updateInput.phone_number || null }),
      ...(updateInput.card_last_four !== undefined && { card_last_four: updateInput.card_last_four || null }),
      ...(updateInput.card_brand !== undefined && { card_brand: updateInput.card_brand || null }),
      ...(updateInput.card_exp_month !== undefined && { card_exp_month: updateInput.card_exp_month || null }),
      ...(updateInput.card_exp_year !== undefined && { card_exp_year: updateInput.card_exp_year || null }),
      ...(updateInput.is_default !== undefined && { is_default: updateInput.is_default }),
      ...(updateInput.metadata !== undefined && { metadata: updateInput.metadata || null })
    };

    const { data, error } = await req.db!
      .from('payment_methods')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update payment method:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update payment method',
        message: error.message
      } as ApiResponse);
    }

    logger.info(`Updated payment method: ${id}`, { userId: req.userId });

    res.json({
      success: true,
      data,
      message: 'Payment method updated successfully'
    } as ApiResponse<PaymentMethod>);

  } catch (error) {
    logger.error('Error updating payment method:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update payment method'
    } as ApiResponse);
  }
});

/**
 * DELETE /api/payment-methods/:id
 * Delete payment method
 */
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment method ID',
        message: 'Payment method ID must be a valid UUID'
      } as ApiResponse);
    }

    // Check if payment method exists and belongs to user
    const { data: existingMethod, error: fetchError } = await req.db!
      .from('payment_methods')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId)
      .single();

    if (fetchError || !existingMethod) {
      return res.status(404).json({
        success: false,
        error: 'Payment method not found',
        message: 'The requested payment method does not exist'
      } as ApiResponse);
    }

    // Don't allow deleting the last default payment method
    const { count: methodCount } = await req.db!
      .from('payment_methods')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.userId)
      .eq('is_active', true);

    if (methodCount === 1 && existingMethod.is_default) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete',
        message: 'You must have at least one default payment method'
      } as ApiResponse);
    }

    // If deleting a default payment method, set another as default
    if (existingMethod.is_default && methodCount! > 1) {
      const { data: nextMethod } = await req.db!
        .from('payment_methods')
        .select('id')
        .eq('user_id', req.userId)
        .eq('is_active', true)
        .neq('id', id)
        .limit(1)
        .single();

      if (nextMethod) {
        await req.db!
          .from('payment_methods')
          .update({ is_default: true })
          .eq('id', nextMethod.id);
      }
    }

    // Soft delete by setting is_active to false
    const { error } = await req.db!
      .from('payment_methods')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', req.userId);

    if (error) {
      logger.error('Failed to delete payment method:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete payment method',
        message: error.message
      } as ApiResponse);
    }

    logger.info(`Deleted payment method: ${id}`, { userId: req.userId });

    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    } as ApiResponse);

  } catch (error) {
    logger.error('Error deleting payment method:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete payment method'
    } as ApiResponse);
  }
});

/**
 * POST /api/payment-methods/:id/set-default
 * Set payment method as default
 */
router.post('/:id/set-default', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment method ID',
        message: 'Payment method ID must be a valid UUID'
      } as ApiResponse);
    }

    // Check if payment method exists and belongs to user
    const { data: existingMethod, error: fetchError } = await req.db!
      .from('payment_methods')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId)
      .single();

    if (fetchError || !existingMethod) {
      return res.status(404).json({
        success: false,
        error: 'Payment method not found',
        message: 'The requested payment method does not exist'
      } as ApiResponse);
    }

    // Unset all other defaults
    await req.db!
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', req.userId)
      .neq('id', id);

    // Set this as default
    const { data, error } = await req.db!
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to set default payment method:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to set default payment method',
        message: error.message
      } as ApiResponse);
    }

    logger.info(`Set default payment method: ${id}`, { userId: req.userId });

    res.json({
      success: true,
      data,
      message: 'Payment method set as default successfully'
    } as ApiResponse<PaymentMethod>);

  } catch (error) {
    logger.error('Error setting default payment method:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to set default payment method'
    } as ApiResponse);
  }
});

export default router;
