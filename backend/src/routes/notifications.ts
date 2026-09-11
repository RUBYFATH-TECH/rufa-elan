/**
 * Notifications API Routes
 * Handles all notification-related endpoints
 */

import { Router, Request, Response } from 'express';
import NotificationService from '../services/notifications';
import {
  validateCreateNotificationRequest,
  validateUpdateNotificationRequest,
  validateBulkNotificationRequest,
} from '../validation/notifications';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /notifications
 * Get notifications with filters and pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.query.user_id as string;
    const type = req.query.type as string;
    const channel = req.query.channel as string;
    const priority = req.query.priority as string;
    const delivered = req.query.delivered;
    const read = req.query.read;
    const orderId = req.query.order_id as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    // Require user_id for non-admin users
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required',
      });
    }

    const result = await NotificationService.getNotifications({
      user_id: userId,
      type,
      channel,
      priority,
      delivered: delivered ? delivered === 'true' : undefined,
      read: read ? read === 'true' : undefined,
      order_id: orderId,
      page,
      limit,
    });

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
    logger.error('Error getting notifications', { error, query: req.query });
    res.status(500).json({
      success: false,
      error: 'Failed to get notifications',
    });
  }
});

/**
 * GET /notifications/:id
 * Get a single notification by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const notification = await NotificationService.getNotificationById(id);

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    logger.error('Error getting notification', { error, id: req.params.id });
    res.status(404).json({
      success: false,
      error: 'Notification not found',
    });
  }
});

/**
 * POST /notifications
 * Create a new notification
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = validateCreateNotificationRequest(req.body);

    const notification = await NotificationService.createNotification(data);

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    logger.error('Error creating notification', { error, body: req.body });
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'Failed to create notification',
    });
  }
});

/**
 * POST /notifications/bulk
 * Create multiple notifications at once
 */
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const data = validateBulkNotificationRequest(req.body);

    const notifications = await NotificationService.createBulkNotifications(data);

    res.status(201).json({
      success: true,
      data: notifications,
      message: `${notifications.length} notifications created`,
    });
  } catch (error) {
    logger.error('Error creating bulk notifications', { error, body: req.body });
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'Failed to create bulk notifications',
    });
  }
});

/**
 * PATCH /notifications/:id
 * Update a notification
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = validateUpdateNotificationRequest(req.body);

    const notification = await NotificationService.updateNotification(id, data);

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    logger.error('Error updating notification', { error, id: req.params.id });
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'Failed to update notification',
    });
  }
});

/**
 * PUT /notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const notification = await NotificationService.markAsRead(id);

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read',
    });
  } catch (error) {
    logger.error('Error marking notification as read', { error, id: req.params.id });
    res.status(400).json({
      success: false,
      error: 'Failed to mark notification as read',
    });
  }
});

/**
 * PUT /notifications/read/bulk
 * Mark multiple notifications as read
 */
router.put('/read/bulk', async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'ids array is required and must not be empty',
      });
    }

    const notifications = await NotificationService.markMultipleAsRead(ids);

    res.json({
      success: true,
      data: notifications,
      message: `${notifications.length} notifications marked as read`,
    });
  } catch (error) {
    logger.error('Error marking multiple notifications as read', { error, body: req.body });
    res.status(400).json({
      success: false,
      error: 'Failed to mark notifications as read',
    });
  }
});

/**
 * PUT /notifications/user/:userId/read-all
 * Mark all notifications as read for a user
 */
router.put('/user/:userId/read-all', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const count = await NotificationService.markAllAsReadForUser(userId);

    res.json({
      success: true,
      message: `${count} notifications marked as read`,
      count,
    });
  } catch (error) {
    logger.error('Error marking all notifications as read', { error, userId: req.params.userId });
    res.status(400).json({
      success: false,
      error: 'Failed to mark all notifications as read',
    });
  }
});

/**
 * PUT /notifications/:id/delivered
 * Mark notification as delivered
 */
router.put('/:id/delivered', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const notification = await NotificationService.markAsDelivered(id);

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as delivered',
    });
  } catch (error) {
    logger.error('Error marking notification as delivered', { error, id: req.params.id });
    res.status(400).json({
      success: false,
      error: 'Failed to mark notification as delivered',
    });
  }
});

/**
 * DELETE /notifications/:id
 * Delete a notification
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await NotificationService.deleteNotification(id);

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    logger.error('Error deleting notification', { error, id: req.params.id });
    res.status(400).json({
      success: false,
      error: 'Failed to delete notification',
    });
  }
});

/**
 * DELETE /notifications/bulk
 * Delete multiple notifications
 */
router.delete('/bulk', async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'ids array is required and must not be empty',
      });
    }

    const count = await NotificationService.deleteMultiple(ids);

    res.json({
      success: true,
      message: `${count} notifications deleted`,
      count,
    });
  } catch (error) {
    logger.error('Error deleting multiple notifications', { error, body: req.body });
    res.status(400).json({
      success: false,
      error: 'Failed to delete notifications',
    });
  }
});

/**
 * DELETE /notifications/user/:userId
 * Delete all notifications for a user
 */
router.delete('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const count = await NotificationService.deleteAllForUser(userId);

    res.json({
      success: true,
      message: `${count} notifications deleted for user`,
      count,
    });
  } catch (error) {
    logger.error('Error deleting all notifications for user', { error, userId: req.params.userId });
    res.status(400).json({
      success: false,
      error: 'Failed to delete notifications',
    });
  }
});

/**
 * GET /notifications/user/:userId/unread-count
 * Get unread notification count for a user
 */
router.get('/user/:userId/unread-count', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const count = await NotificationService.getUnreadCount(userId);

    res.json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    logger.error('Error getting unread count', { error, userId: req.params.userId });
    res.status(400).json({
      success: false,
      error: 'Failed to get unread count',
    });
  }
});

/**
 * GET /notifications/user/:userId/stats
 * Get notification statistics for a user
 */
router.get('/user/:userId/stats', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const stats = await NotificationService.getUserStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error getting user stats', { error, userId: req.params.userId });
    res.status(400).json({
      success: false,
      error: 'Failed to get notification stats',
    });
  }
});

/**
 * POST /notifications/cleanup-expired
 * Clean up expired notifications (admin only)
 */
router.post('/cleanup-expired', async (req: Request, res: Response) => {
  try {
    const count = await NotificationService.cleanupExpiredNotifications();

    res.json({
      success: true,
      message: `${count} expired notifications cleaned up`,
      count,
    });
  } catch (error) {
    logger.error('Error cleaning up expired notifications', { error });
    res.status(400).json({
      success: false,
      error: 'Failed to clean up expired notifications',
    });
  }
});

export default router;
