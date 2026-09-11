/**
 * Admin User Management Routes
 * Admin-only endpoints for viewing and managing user profiles
 * Password information is NOT exposed
 */

import { Router, Request, Response } from 'express';
import { requireAdmin } from '../middleware/database';
import AdminUsersService from '../services/admin-users';
import { logger } from '../utils/logger';

const router = Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

/**
 * GET /admin/users
 * Get all users with pagination and filtering
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const filters = {
      search: req.query.search as string,
      sort_by: (req.query.sort_by as any) || 'created_at',
      sort_order: (req.query.sort_order as any) || 'desc',
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };

    logger.info('Admin: Fetching users list', { filters });

    const result = await AdminUsersService.getAllUsers(filters);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching users', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
    });
  }
});

/**
 * GET /admin/users/:userId
 * Get single user profile with all details (NO PASSWORD)
 */
router.get('/users/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    logger.info(`Admin: Fetching user profile ${userId}`);

    const profile = await AdminUsersService.getUserProfile(userId);

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    logger.error('Error fetching user profile', { error });
    res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }
});

/**
 * GET /admin/users/:userId/activity
 * Get user's activity log
 */
router.get('/users/:userId/activity', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    logger.info(`Admin: Fetching user activity for ${userId}`);

    const activity = await AdminUsersService.getUserActivity(userId, limit);

    res.json({
      success: true,
      data: activity,
      count: activity.length,
    });
  } catch (error) {
    logger.error('Error fetching user activity', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user activity',
    });
  }
});

/**
 * GET /admin/users/:userId/settings
 * Get user's settings (for admin review)
 */
router.get('/users/:userId/settings', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    logger.info(`Admin: Fetching user settings for ${userId}`);

    const settings = await AdminUsersService.getUserSettings(userId);

    if (!settings) {
      return res.status(404).json({
        success: false,
        error: 'Settings not found',
      });
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    logger.error('Error fetching user settings', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user settings',
    });
  }
});

/**
 * GET /admin/users/:userId/orders
 * Get user's orders
 */
router.get('/users/:userId/orders', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    logger.info(`Admin: Fetching user orders for ${userId}`);

    const orders = await AdminUsersService.getUserOrders(userId, limit);

    res.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    logger.error('Error fetching user orders', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user orders',
    });
  }
});

/**
 * GET /admin/users/search
 * Search users by email or name
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        error: 'Search term is required',
      });
    }

    logger.info('Admin: Searching users', { searchTerm });

    const results = await AdminUsersService.searchUsers(searchTerm, limit);

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    logger.error('Error searching users', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to search users',
    });
  }
});

/**
 * GET /admin/users/date-range
 * Get users who signed up in a date range
 */
router.get('/date-range', async (req: Request, res: Response) => {
  try {
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;
    const limit = parseInt(req.query.limit as string) || 100;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'start_date and end_date are required',
      });
    }

    logger.info('Admin: Getting users by date range', { startDate, endDate });

    const users = await AdminUsersService.getUsersByDateRange(startDate, endDate, limit);

    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    logger.error('Error getting users by date range', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get users by date range',
    });
  }
});

/**
 * GET /admin/users/analytics/top-spenders
 * Get top spending users
 */
router.get('/analytics/top-spenders', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    logger.info('Admin: Getting top spenders');

    const users = await AdminUsersService.getTopSpenders(limit);

    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    logger.error('Error getting top spenders', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get top spenders',
    });
  }
});

/**
 * GET /admin/users/analytics/most-active
 * Get most active users
 */
router.get('/analytics/most-active', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    logger.info('Admin: Getting most active users');

    const users = await AdminUsersService.getMostActiveUsers(limit);

    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    logger.error('Error getting most active users', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get most active users',
    });
  }
});

/**
 * GET /admin/users/analytics/statistics
 * Get overall user statistics
 */
router.get('/analytics/statistics', async (req: Request, res: Response) => {
  try {
    logger.info('Admin: Getting user statistics');

    const stats = await AdminUsersService.getUserStatistics();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error getting statistics', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
    });
  }
});

/**
 * GET /admin/users/:userId/export
 * Export user data (for privacy requests)
 */
router.get('/users/:userId/export', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    logger.info(`Admin: Exporting user data for ${userId}`);

    const userData = await AdminUsersService.exportUserData(userId);

    res.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    logger.error('Error exporting user data', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to export user data',
    });
  }
});

/**
 * GET /admin/users/alerts/suspicious-activity
 * Get suspicious activity alerts
 */
router.get('/alerts/suspicious-activity', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    logger.info('Admin: Getting suspicious activity alerts');

    const activities = await AdminUsersService.getSuspiciousActivity(limit);

    res.json({
      success: true,
      data: activities,
      count: activities.length,
    });
  } catch (error) {
    logger.error('Error getting suspicious activity', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get suspicious activity',
    });
  }
});

export default router;
