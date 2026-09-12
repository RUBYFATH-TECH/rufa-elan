/**
 * Customers API routes for RUFA ELAN e-commerce application
 * Handles retrieving customer information and statistics
 */

import express, { Request, Response } from 'express';
import { supabase } from '../utils/database';
import { requireAdmin } from '../middleware/database';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * GET /api/customers/stats
 * Get global customer statistics (admin only)
 * MUST be BEFORE /:id route to avoid being interpreted as /:id="stats"!
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Get customer statistics using native supabase queries
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, is_admin')
      .eq('is_admin', false);

    if (profilesError) {
      logger.error('Error fetching profiles:', profilesError);
      return res.json({
        data: {
          total_customers: 0,
          active_customers: 0,
          total_revenue: 0,
          avg_order_value: 0,
        },
      });
    }

    const totalCustomers = profiles?.length || 0;

    // Get total revenue from orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('total_amount');

    if (ordersError) {
      logger.error('Error fetching orders:', ordersError);
    }

    const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
    const avgOrderValue = orders && orders.length > 0 ? totalRevenue / orders.length : 0;

    logger.info('Fetched global customer statistics');

    res.json({
      data: {
        total_customers: totalCustomers,
        active_customers: totalCustomers,
        total_revenue: totalRevenue,
        avg_order_value: avgOrderValue,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching customer stats:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch customer stats',
    });
  }
});

/**
 * GET /api/customers/sync-profiles
 * Sync auth users to profiles table (one-time fix for existing users)
 * This endpoint manually creates profile records for all auth users that don't have profiles yet
 */
router.get('/sync-profiles', async (req: Request, res: Response) => {
  try {
    logger.info('Starting profile sync operation');

    // Get all auth users using service role
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError || !users) {
      logger.error('Error fetching auth users:', usersError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch auth users',
        details: usersError?.message
      });
    }

    logger.info(`Found ${users.length} auth users`);

    // Get all existing profiles
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id');

    if (profilesError) {
      logger.error('Error fetching existing profiles:', profilesError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch existing profiles',
        details: profilesError.message
      });
    }

    const existingProfileIds = new Set(existingProfiles?.map(p => p.id) || []);
    logger.info(`Found ${existingProfileIds.size} existing profiles`);

    // Create profiles for users that don't have them
    const usersToCreate = users.filter(u => !existingProfileIds.has(u.id));
    logger.info(`Creating ${usersToCreate.length} missing profiles`);

    if (usersToCreate.length === 0) {
      return res.json({
        success: true,
        message: 'All auth users already have profiles',
        stats: {
          total_auth_users: users.length,
          existing_profiles: existingProfileIds.size,
          new_profiles_created: 0
        }
      });
    }

    // Prepare profile data from auth users (only use id field as starting point)
    // We'll update them with metadata in a second step
    const profilesData = usersToCreate.map(user => ({
      id: user.id
    }));

    // Use service role to bypass RLS
    const { data: createdProfiles, error: createError } = await supabase
      .from('profiles')
      .insert(profilesData)
      .select();

    if (createError) {
      logger.error('Error creating profiles:', createError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create profiles',
        details: createError.message,
        code: createError.code
      });
    }

    logger.info(`Successfully created ${createdProfiles?.length || 0} profiles`);

    // Now update profiles with metadata from auth users
    const updates = usersToCreate.map(user => ({
      id: user.id,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      is_admin: false
    }));

    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: update.full_name,
          email: update.email,
          is_admin: update.is_admin
        })
        .eq('id', update.id);

      if (updateError) {
        logger.warn(`Failed to update profile ${update.id} with metadata:`, updateError.message);
      }
    }

    res.json({
      success: true,
      message: `Synced ${createdProfiles?.length || 0} profiles`,
      stats: {
        total_auth_users: users.length,
        existing_profiles: existingProfileIds.size,
        new_profiles_created: createdProfiles?.length || 0,
        total_profiles_now: existingProfileIds.size + (createdProfiles?.length || 0)
      }
    });
  } catch (error: any) {
    logger.error('Error in sync-profiles endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error during profile sync',
      details: error.toString()
    });
  }
});

/**
 * POST /api/customers/resync-all
 * Force resync all profiles with fresh data from auth users
 */
router.post('/resync-all', async (req: Request, res: Response) => {
  try {
    logger.info('Starting full profile resync operation');

    // Get all auth users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError || !users) {
      logger.error('Error fetching auth users:', usersError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch auth users',
        details: usersError?.message
      });
    }

    logger.info(`Found ${users.length} auth users for resync`);

    // Delete all existing profiles
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('id');

    if (allProfiles && allProfiles.length > 0) {
      const profileIds = allProfiles.map(p => p.id);
      
      // Delete in batches if there are many
      for (const id of profileIds) {
        await supabase
          .from('profiles')
          .delete()
          .eq('id', id);
      }
    }

    logger.info('Deleted all existing profiles');

    // Create new profiles with just ID (schema only has id, role, created_at)
    const profilesData = users.map(user => ({
      id: user.id
    }));

    const { data: createdProfiles, error: createError } = await supabase
      .from('profiles')
      .insert(profilesData)
      .select();

    if (createError) {
      logger.error('Error creating profiles:', createError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create profiles',
        details: createError.message,
        code: createError.code
      });
    }

    logger.info(`Successfully created ${createdProfiles?.length || 0} profiles`);

    res.json({
      success: true,
      message: `Resynced all ${createdProfiles?.length || 0} profiles`,
      stats: {
        total_auth_users: users.length,
        profiles_created: createdProfiles?.length || 0
      }
    });
  } catch (error: any) {
    logger.error('Error in resync-all endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error during profile resync',
      details: error.toString()
    });
  }
});

/**
 * GET /api/customers
 * Get all customers
 * Query params: page, limit, search
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Try a simple query first to test connectivity
    try {
      const testQuery = await supabase.from('profiles').select('id', { count: 'exact' }).limit(1);
      if (testQuery.error) {
        return res.status(500).json({
          success: false,
          error: `Test query failed: ${testQuery.error.message}`,
          code: testQuery.error.code,
        });
      }
    } catch (testErr: any) {
      return res.status(500).json({
        success: false,
        error: `Test query exception: ${testErr.message}`,
      });
    }

    // Now try the real query
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .range(offset, offset + limitNum - 1)
      .order('created_at', { ascending: false });

    const { data: customers, error, count } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        error: `Database error: ${error.message}`,
        code: error.code,
      });
    }

    const total = count || 0;

    // Enrich profile data with auth user info (email, full_name)
    const enrichedCustomers = await Promise.all(
      (customers || []).map(async (profile) => {
        try {
          // Get the auth user for this profile
          const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(profile.id);
          
          if (!userError && user) {
            return {
              ...profile,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              phone: user.user_metadata?.phone || '',
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null
            };
          }
          return profile;
        } catch (err) {
          logger.warn(`Failed to enrich profile ${profile.id} with auth data:`, err);
          return profile;
        }
      })
    );

    res.json({
      data: enrichedCustomers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error',
      details: error.toString(),
    });
  }
});

/**
 * GET /api/customers/:id
 * Get single customer by ID (admin only)
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: customer, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    // Fetch order stats
    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('user_id', id);

    const totalOrders = orders?.length || 0;
    const totalSpent = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

    // Enrich with auth user data
    let enrichedCustomer = customer;
    try {
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(id);
      
      if (!userError && user) {
        enrichedCustomer = {
          ...customer,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          phone: user.user_metadata?.phone || '',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null
        };
      }
    } catch (err) {
      logger.warn(`Failed to enrich customer ${id} with auth data:`, err);
    }

    const customerWithStats = {
      ...enrichedCustomer,
      total_orders: totalOrders,
      total_spent: totalSpent,
    };

    logger.info(`Fetched customer: ${id}`);

    res.json({ data: customerWithStats });
  } catch (error: any) {
    logger.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch customer',
    });
  }
});

/**
 * GET /api/customers/:id/profile
 * Get customer profile with detailed statistics (admin only)
 */
router.get('/:id/profile', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get customer profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    // Get order stats
    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('user_id', id);

    const totalOrders = orders?.length || 0;
    const totalSpent = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

    // Get review count
    const { count: reviewCount } = await supabase
      .from('reviews')
      .select('id', { count: 'exact' })
      .eq('user_id', id);

    // Get wishlist count
    const { count: wishlistCount } = await supabase
      .from('wishlist')
      .select('id', { count: 'exact' })
      .eq('user_id', id);

    const customer = {
      ...profile,
      total_orders: totalOrders,
      total_spent: totalSpent,
      review_count: reviewCount || 0,
      wishlist_count: wishlistCount || 0,
    };

    logger.info(`Fetched customer profile: ${id}`);

    res.json({ data: customer });
  } catch (error: any) {
    logger.error('Error fetching customer profile:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch customer profile',
    });
  }
});

/**
 * GET /api/customers/:id/orders
 * Get customer's orders (admin only)
 */
router.get('/:id/orders', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const offset = (pageNum - 1) * limitNum;

    // Get total count
    const { count: total } = await supabase
      .from('orders')
      .select('id', { count: 'exact' })
      .eq('user_id', id);

    // Get orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) {
      logger.error('Error fetching customer orders:', error);
    }

    const data = orders || [];

    logger.info(`Fetched ${data.length} orders for customer: ${id}`);

    res.json({
      data,
      pagination: {
        total: total || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((total || 0) / limitNum),
        hasNextPage: offset + limitNum < (total || 0),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch customer orders',
    });
  }
});

/**
 * GET /api/customers/:id/addresses
 * Get customer's saved addresses (admin only)
 */
router.get('/:id/addresses', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching customer addresses:', error);
    }

    const data = addresses || [];

    logger.info(`Fetched ${data.length} addresses for customer: ${id}`);

    res.json({
      data,
    });
  } catch (error: any) {
    logger.error('Error fetching customer addresses:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch customer addresses',
    });
  }
});

/**
 * PUT /api/customers/:id
 * Update customer details (admin only)
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { full_name, phone, email, preferences } = req.body;

    const updates: any = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (preferences !== undefined) updates.preferences = preferences;
    updates.updated_at = new Date().toISOString();

    if (Object.keys(updates).length === 1) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    logger.info(`Updated customer: ${id}`);

    res.json({
      data,
      message: 'Customer updated successfully',
    });
  } catch (error: any) {
    logger.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update customer',
    });
  }
});

export default router;
