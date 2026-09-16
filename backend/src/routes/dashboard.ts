/**
 * Dashboard API routes for RUFA ELAN e-commerce application
 * Provides aggregated statistics and analytics for admin dashboard
 */

import express from 'express';
import { Request, Response } from 'express';
import { requireAdmin } from '../middleware/database';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/database';

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics (Admin only)
 */
router.get('/stats', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { period = '30' } = req.query; // days
    const periodDays = parseInt(period as string);
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - periodDays);

    // Get total revenue
    const { data: revenueData, error: revenueError } = await req.db!
      .from('orders')
      .select('total_amount, created_at')
      .gte('created_at', periodStart.toISOString())
      .eq('payment_status', 'paid');

    const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    // Get revenue growth (compare with previous period)
    const previousPeriodStart = new Date(periodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - periodDays);

    const { data: previousRevenueData } = await req.db!
      .from('orders')
      .select('total_amount')
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', periodStart.toISOString())
      .eq('payment_status', 'paid');

    const previousRevenue = previousRevenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Get total orders count
    const { count: totalOrders } = await req.db!
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', periodStart.toISOString());

    // Get previous orders count for growth calculation
    const { count: previousOrders } = await req.db!
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', periodStart.toISOString());

    const ordersGrowth = previousOrders && previousOrders > 0 
      ? ((totalOrders || 0) - previousOrders) / previousOrders * 100 
      : 0;

    // Get total products count
    const { count: totalProducts } = await req.db!
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get total customers count (from auth.users)
    const { count: totalCustomers } = await req.db!.auth.admin.listUsers();

    // Get pending orders count
    const { count: pendingOrders } = await req.db!
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending_payment', 'processing']);

    // Get completed orders count
    const { count: completedOrders } = await req.db!
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'delivered');

    const stats = {
      totalRevenue: totalRevenue,
      totalOrders: totalOrders || 0,
      totalProducts: totalProducts || 0,
      totalCustomers: totalCustomers || 0,
      pendingOrders: pendingOrders || 0,
      completedOrders: completedOrders || 0,
      revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
      ordersGrowth: parseFloat(ordersGrowth.toFixed(2))
    };

    logger.info('Fetched dashboard stats', { stats, period: periodDays });

    res.json({
      success: true,
      data: stats
    } as ApiResponse);

  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch dashboard statistics'
    } as ApiResponse);
  }
});

/**
 * GET /api/dashboard/recent-orders
 * Get recent orders for dashboard (Admin only)
 */
router.get('/recent-orders', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { limit = 5 } = req.query;

    const { data: orders, error } = await req.db!
      .from('orders')
      .select('id, order_number, total_amount, status, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit as string));

    if (error) {
      logger.error('Failed to fetch recent orders:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch recent orders',
        message: error.message
      } as ApiResponse);
    }

    // Enrich with user data
    const enrichedOrders = await Promise.all((orders || []).map(async (order) => {
      let customerName = 'Guest';
      
      if (order.user_id) {
        try {
          const { data: { user } } = await req.db!.auth.admin.getUserById(order.user_id);
          if (user) {
            customerName = user.user_metadata?.full_name || user.email || 'Customer';
          }
        } catch (err) {
          logger.warn(`Failed to fetch user data for order ${order.id}`);
        }
      }

      return {
        id: order.id,
        order_number: order.order_number,
        customer_name: customerName,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at
      };
    }));

    res.json({
      success: true,
      data: enrichedOrders
    } as ApiResponse);

  } catch (error) {
    logger.error('Error fetching recent orders:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch recent orders'
    } as ApiResponse);
  }
});

/**
 * GET /api/dashboard/top-products
 * Get best selling products (Admin only)
 */
router.get('/top-products', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { limit = 5, period = '30' } = req.query;
    const periodDays = parseInt(period as string);
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - periodDays);

    // Get order items with product details
    const { data: orderItems, error } = await req.db!
      .from('order_items')
      .select(`
        product_variant_id,
        quantity,
        total_price,
        product_variants(
          id,
          products(id, name)
        ),
        orders!inner(created_at, payment_status)
      `)
      .gte('orders.created_at', periodStart.toISOString())
      .eq('orders.payment_status', 'paid');

    if (error) {
      logger.error('Failed to fetch top products:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch top products',
        message: error.message
      } as ApiResponse);
    }

    // Aggregate by product
    const productStats = new Map<string, { id: string; name: string; sales: number; revenue: number }>();

    orderItems?.forEach((item: any) => {
      const product = item.product_variants?.products;
      if (!product) return;

      const existing = productStats.get(product.id) || {
        id: product.id,
        name: product.name,
        sales: 0,
        revenue: 0
      };

      existing.sales += item.quantity;
      existing.revenue += item.total_price;
      productStats.set(product.id, existing);
    });

    // Convert to array and sort by revenue
    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, parseInt(limit as string));

    res.json({
      success: true,
      data: topProducts
    } as ApiResponse);

  } catch (error) {
    logger.error('Error fetching top products:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch top products'
    } as ApiResponse);
  }
});

/**
 * GET /api/dashboard/fast-deals
 * Get active fast deals for dashboard (Admin only)
 */
router.get('/fast-deals', requireAdmin, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

    const { data: deals, error } = await req.db!
      .from('fast_deals')
      .select(`
        id,
        deal_price,
        start_date,
        start_time,
        end_date,
        end_time,
        stock_quantity,
        sold_quantity,
        is_active,
        products(id, name, regular_price)
      `)
      .eq('is_active', true)
      .gte('end_date', currentDate)
      .order('end_date', { ascending: true })
      .order('end_time', { ascending: true })
      .limit(5);

    if (error) {
      logger.error('Failed to fetch fast deals:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch fast deals',
        message: error.message
      } as ApiResponse);
    }

    const formattedDeals = (deals || []).map((deal: any) => {
      const regularPrice = deal.products?.regular_price || 0;
      const dealPrice = deal.deal_price || 0;
      const discountPercentage = regularPrice > 0 
        ? Math.round(((regularPrice - dealPrice) / regularPrice) * 100)
        : 0;

      // Combine date and time to create ISO string
      const endDateTime = `${deal.end_date}T${deal.end_time}:00`;

      return {
        id: deal.id,
        product_name: deal.products?.name || 'Unknown Product',
        deal_price: dealPrice,
        discount_percentage: discountPercentage,
        end_time: endDateTime,
        status: deal.is_active ? 'active' : 'inactive'
      };
    });

    res.json({
      success: true,
      data: formattedDeals
    } as ApiResponse);

  } catch (error) {
    logger.error('Error fetching fast deals:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch fast deals'
    } as ApiResponse);
  }
});

export default router;
