/**
 * Store Settings API Routes
 * Allows admins to manage store-wide configuration in real-time
 */

import express, { Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * Store Settings Interface
 */
export interface StoreSettings {
  id: string;
  store_name: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  store_city: string;
  store_country: string;
  store_postal_code?: string;
  currency_code: string;
  tax_rate: number;
  default_shipping_cost: number;
  store_status: string;
  store_description?: string;
  store_logo_url?: string;
  store_banner_url?: string;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

/**
 * Ensure store_settings table exists and has default data
 */
async function ensureStoreSettingsTable() {
  try {
    // Try to fetch from store_settings to see if table exists
    const { data, error } = await supabaseAdmin
      .from('store_settings')
      .select('*', { count: 'exact' })
      .limit(1);

    // If we get PGRST205, table doesn't exist
    if (error && error.code === 'PGRST205') {
      logger.warn('store_settings table not found - using default values');
      logger.info('To create the table, run the SQL from supabase/migrations/003_store_settings.sql in Supabase SQL Editor');
      return false;
    }

    // If table exists and has data, we're good
    if (!error && data && data.length > 0) {
      logger.info('store_settings table exists with data');
      return true; 
    }

    // Table exists but is empty, insert default
    if (!error && (!data || data.length === 0)) {
      logger.info('store_settings table is empty, inserting defaults...');
      const { error: insertError } = await supabaseAdmin
        .from('store_settings')
        .insert({
          store_name: 'RUFA ELAN',
          store_email: 'hello@rufaelan.com',
          store_phone: '+233 24 123 4567',
          store_address: '123 Fashion Avenue',
          store_city: 'Accra',
          store_country: 'Ghana',
          currency_code: 'GHS',
          tax_rate: 5.00,
          default_shipping_cost: 25.00,
          store_status: 'active',
        });

      if (!insertError) {
        logger.info('Default store settings inserted');
        return true;
      } else {
        logger.warn('Could not insert defaults:', insertError.message);
      }
    }

    return false;
  } catch (error: any) {
    logger.warn('Error checking store_settings table:', error.message);
    return false;
  }
}

// Ensure table exists on route load
ensureStoreSettingsTable().catch(error => {
  logger.error('Failed to ensure store_settings table:', error);
});

/**
 * GET /api/store-settings
 * Get current store settings (public endpoint - no auth required)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('store_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116' || error.code === 'PGRST205') {
        // No settings found or table not found, return defaults
        return res.json({
          success: true,
          data: {
            store_name: 'RUFA ELAN',
            store_email: 'hello@rufaelan.com',
            store_phone: '+233 24 123 4567',
            store_address: '123 Fashion Avenue',
            store_city: 'Accra',
            store_country: 'Ghana',
            store_postal_code: null,
            currency_code: 'GHS',
            tax_rate: 5,
            default_shipping_cost: 25,
            store_status: 'active',
            store_description: null,
            store_logo_url: null,
            store_banner_url: null,
          },
        });
      }
      logger.error('Error fetching store settings:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch store settings',
      });
    }

    res.json({ success: true, data });
  } catch (error: any) {
    logger.error('Error in GET store-settings:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch store settings',
    });
  }
});

/**
 * PUT /api/store-settings
 * Update store settings (admin only)
 * Requires authentication and admin privileges
 */
router.put('/', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    // Check if user is authenticated
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - authentication required',
      });
    }

    // Check if user is admin
    if (!req.isAdmin) {
      logger.warn(`Non-admin user ${userId} attempted to update store settings`);
      return res.status(403).json({
        success: false,
        error: 'Forbidden - admin privileges required',
      });
    }

    const {
      store_name,
      store_email,
      store_phone,
      store_address,
      store_city,
      store_country,
      store_postal_code,
      currency_code,
      tax_rate,
      default_shipping_cost,
      store_status,
      store_description,
      store_logo_url,
      store_banner_url,
    } = req.body;

    // Validation
    const errors: string[] = [];

    if (store_name !== undefined && (!store_name || typeof store_name !== 'string')) {
      errors.push('store_name must be a non-empty string');
    }

    if (store_email !== undefined && (!store_email || typeof store_email !== 'string')) {
      errors.push('store_email must be a valid email');
    }

    if (store_phone !== undefined && (!store_phone || typeof store_phone !== 'string')) {
      errors.push('store_phone must be a non-empty string');
    }

    if (currency_code !== undefined && (!currency_code || typeof currency_code !== 'string')) {
      errors.push('currency_code must be a non-empty string');
    }

    if (tax_rate !== undefined) {
      const rate = parseFloat(tax_rate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        errors.push('tax_rate must be a number between 0 and 100');
      }
    }

    if (default_shipping_cost !== undefined) {
      const cost = parseFloat(default_shipping_cost);
      if (isNaN(cost) || cost < 0) {
        errors.push('default_shipping_cost must be a non-negative number');
      }
    }

    if (store_status !== undefined && !['active', 'maintenance', 'closed'].includes(store_status)) {
      errors.push('store_status must be one of: active, maintenance, closed');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
      });
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_by: userId,
    };

    if (store_name !== undefined) updateData.store_name = store_name;
    if (store_email !== undefined) updateData.store_email = store_email;
    if (store_phone !== undefined) updateData.store_phone = store_phone;
    if (store_address !== undefined) updateData.store_address = store_address;
    if (store_city !== undefined) updateData.store_city = store_city;
    if (store_country !== undefined) updateData.store_country = store_country;
    if (store_postal_code !== undefined) updateData.store_postal_code = store_postal_code;
    if (currency_code !== undefined) updateData.currency_code = currency_code;
    if (tax_rate !== undefined) updateData.tax_rate = parseFloat(tax_rate);
    if (default_shipping_cost !== undefined) updateData.default_shipping_cost = parseFloat(default_shipping_cost);
    if (store_status !== undefined) updateData.store_status = store_status;
    if (store_description !== undefined) updateData.store_description = store_description;
    if (store_logo_url !== undefined) updateData.store_logo_url = store_logo_url;
    if (store_banner_url !== undefined) updateData.store_banner_url = store_banner_url;

    // Fetch current settings to get the ID
    const { data: currentSettings, error: fetchError } = await supabaseAdmin
      .from('store_settings')
      .select('id')
      .limit(1)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116' || fetchError.code === 'PGRST205') {
        // No settings exist, create one
        const { data: newSettings, error: createError } = await supabaseAdmin
          .from('store_settings')
          .insert(updateData)
          .select()
          .single();

        if (createError) {
          logger.error('Error creating store settings:', createError);
          return res.status(500).json({
            success: false,
            error: 'Failed to create store settings',
          });
        }

        logger.info(`Store settings created by admin ${userId}`);
        return res.json({
          success: true,
          data: newSettings,
          message: 'Store settings created successfully',
        });
      }

      logger.error('Error fetching current store settings:', fetchError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch current settings',
      });
    }

    // Update store settings
    const { data: updatedSettings, error: updateError } = await supabaseAdmin
      .from('store_settings')
      .update(updateData)
      .eq('id', currentSettings.id)
      .select()
      .single();

    if (updateError) {
      logger.error('Error updating store settings:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update store settings',
      });
    }

    logger.info(`Store settings updated by admin ${userId}`, {
      fields: Object.keys(updateData).filter(k => k !== 'updated_by'),
    });

    res.json({
      success: true,
      data: updatedSettings,
      message: 'Store settings updated successfully',
    });
  } catch (error: any) {
    logger.error('Error in PUT store-settings:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update store settings',
    });
  }
});

/**
 * GET /api/store-settings/history
 * Get store settings update history (admin only)
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId || !req.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden - admin privileges required',
      });
    }

    const { limit = 10, offset = 0 } = req.query;
    const limitNum = Math.min(parseInt(limit as string) || 10, 100);
    const offsetNum = Math.max(parseInt(offset as string) || 0, 0);

    const { data, error, count } = await supabaseAdmin
      .from('store_settings')
      .select('id, store_name, updated_at, updated_by', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(offsetNum, offsetNum + limitNum - 1);

    if (error) {
      if (error.code === 'PGRST205') {
        return res.json({
          success: true,
          data: [],
          pagination: { total: 0, limit: limitNum, offset: offsetNum },
        });
      }

      logger.error('Error fetching store settings history:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch history',
      });
    }

    res.json({
      success: true,
      data,
      pagination: {
        total: count || 0,
        limit: limitNum,
        offset: offsetNum,
      },
    });
  } catch (error: any) {
    logger.error('Error in GET store-settings/history:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch history',
    });
  }
});

export default router;
