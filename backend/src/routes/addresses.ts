/**
 * Addresses API routes for RUFA ELAN e-commerce application
 * Handles user delivery addresses CRUD operations
 */

import express from 'express';
import { Request, Response } from 'express';
import { db, dbUtils } from '../utils/database';
import { requireAuth, rateLimitMiddleware } from '../middleware/database';
import { logger } from '../utils/logger';
import { Address, ApiResponse } from '../types/database';

const router = express.Router();

// Rate limiting for addresses API
const addressesRateLimit = rateLimitMiddleware({
  maxRequests: 30,
  windowMs: 15 * 60 * 1000 // 15 minutes
});

router.use(addressesRateLimit);

/**
 * GET /api/addresses
 * Get all user addresses
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { data, error } = await req.db!
      .from('addresses')
      .select('*')
      .eq('user_id', req.userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch addresses:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch addresses',
        message: error.message
      } as ApiResponse);
    }

    logger.info(`Fetched ${data?.length || 0} addresses`, { userId: req.userId });

    res.json({
      success: true,
      data: data || []
    } as ApiResponse<Address[]>);

  } catch (error) {
    logger.error('Error fetching addresses:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch addresses'
    } as ApiResponse);
  }
});

/**
 * GET /api/addresses/:id
 * Get single address by ID
 */
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address ID',
        message: 'Address ID must be a valid UUID'
      } as ApiResponse);
    }

    const { data, error } = await req.db!
      .from('addresses')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Address not found',
        message: 'The requested address does not exist'
      } as ApiResponse);
    }

    logger.info(`Fetched address: ${id}`, { userId: req.userId });

    res.json({
      success: true,
      data
    } as ApiResponse<Address>);

  } catch (error) {
    logger.error('Error fetching address:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch address'
    } as ApiResponse);
  }
});

/**
 * POST /api/addresses
 * Create new address
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      label,
      full_name,
      phone,
      email,
      address,
      city,
      region,
      postal_code,
      country,
      delivery_instructions,
      is_default
    } = req.body;

    // Validate required fields
    if (!label || !full_name || !phone || !address || !city || !country) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'label, full_name, phone, address, city, and country are required'
      } as ApiResponse);
    }

    // If setting as default, unset other defaults
    if (is_default) {
      await req.db!
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', req.userId);
    }

    const { data, error } = await req.db!
      .from('addresses')
      .insert({
        user_id: req.userId,
        label,
        full_name,
        phone,
        email: email || null,
        address,
        city,
        region: region || null,
        postal_code: postal_code || null,
        country,
        delivery_instructions: delivery_instructions || null,
        is_default: is_default || false
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create address:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create address',
        message: error.message
      } as ApiResponse);
    }

    logger.info(`Created address: ${data?.id}`, {
      userId: req.userId,
      label
    });

    res.status(201).json({
      success: true,
      data,
      message: 'Address created successfully'
    } as ApiResponse<Address>);

  } catch (error) {
    logger.error('Error creating address:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create address'
    } as ApiResponse);
  }
});

/**
 * PUT /api/addresses/:id
 * Update address
 */
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      label,
      full_name,
      phone,
      email,
      address,
      city,
      region,
      postal_code,
      country,
      delivery_instructions,
      is_default
    } = req.body;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address ID',
        message: 'Address ID must be a valid UUID'
      } as ApiResponse);
    }

    // Check if address exists and belongs to user
    const { data: existingAddress, error: fetchError } = await req.db!
      .from('addresses')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId)
      .single();

    if (fetchError || !existingAddress) {
      return res.status(404).json({
        success: false,
        error: 'Address not found',
        message: 'The requested address does not exist'
      } as ApiResponse);
    }

    // If setting as default, unset other defaults
    if (is_default && !existingAddress.is_default) {
      await req.db!
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', req.userId)
        .neq('id', id);
    }

    const updateData: Partial<Address> = {
      ...(label && { label }),
      ...(full_name && { full_name }),
      ...(phone && { phone }),
      ...(email !== undefined && { email: email || null }),
      ...(address && { address }),
      ...(city && { city }),
      ...(region !== undefined && { region: region || null }),
      ...(postal_code !== undefined && { postal_code: postal_code || null }),
      ...(country && { country }),
      ...(delivery_instructions !== undefined && { delivery_instructions: delivery_instructions || null }),
      ...(is_default !== undefined && { is_default })
    };

    const { data, error } = await req.db!
      .from('addresses')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update address:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update address',
        message: error.message
      } as ApiResponse);
    }

    logger.info(`Updated address: ${id}`, { userId: req.userId });

    res.json({
      success: true,
      data,
      message: 'Address updated successfully'
    } as ApiResponse<Address>);

  } catch (error) {
    logger.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update address'
    } as ApiResponse);
  }
});

/**
 * DELETE /api/addresses/:id
 * Delete address
 */
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address ID',
        message: 'Address ID must be a valid UUID'
      } as ApiResponse);
    }

    // Check if address exists and belongs to user
    const { data: existingAddress, error: fetchError } = await req.db!
      .from('addresses')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId)
      .single();

    if (fetchError || !existingAddress) {
      return res.status(404).json({
        success: false,
        error: 'Address not found',
        message: 'The requested address does not exist'
      } as ApiResponse);
    }

    // Don't allow deleting the last address if it's default
    const { count: addressCount } = await req.db!
      .from('addresses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.userId);

    if (addressCount === 1 && existingAddress.is_default) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete',
        message: 'You must have at least one default address'
      } as ApiResponse);
    }

    // If deleting a default address, set another as default
    if (existingAddress.is_default && addressCount! > 1) {
      const { data: nextAddress } = await req.db!
        .from('addresses')
        .select('id')
        .eq('user_id', req.userId)
        .neq('id', id)
        .limit(1)
        .single();

      if (nextAddress) {
        await req.db!
          .from('addresses')
          .update({ is_default: true })
          .eq('id', nextAddress.id);
      }
    }

    const { error } = await req.db!
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', req.userId);

    if (error) {
      logger.error('Failed to delete address:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete address',
        message: error.message
      } as ApiResponse);
    }

    logger.info(`Deleted address: ${id}`, { userId: req.userId });

    res.json({
      success: true,
      message: 'Address deleted successfully'
    } as ApiResponse);

  } catch (error) {
    logger.error('Error deleting address:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete address'
    } as ApiResponse);
  }
});

/**
 * POST /api/addresses/:id/set-default
 * Set address as default
 */
router.post('/:id/set-default', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address ID',
        message: 'Address ID must be a valid UUID'
      } as ApiResponse);
    }

    // Check if address exists and belongs to user
    const { data: existingAddress, error: fetchError } = await req.db!
      .from('addresses')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId)
      .single();

    if (fetchError || !existingAddress) {
      return res.status(404).json({
        success: false,
        error: 'Address not found',
        message: 'The requested address does not exist'
      } as ApiResponse);
    }

    // Unset all other defaults
    await req.db!
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', req.userId)
      .neq('id', id);

    // Set this as default
    const { data, error } = await req.db!
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to set default address:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to set default address',
        message: error.message
      } as ApiResponse);
    }

    logger.info(`Set default address: ${id}`, { userId: req.userId });

    res.json({
      success: true,
      data,
      message: 'Address set as default successfully'
    } as ApiResponse<Address>);

  } catch (error) {
    logger.error('Error setting default address:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to set default address'
    } as ApiResponse);
  }
});

export default router;
