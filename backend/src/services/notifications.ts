/**
 * Notification Service
 * Handles all notification-related business logic
 */

import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';
import {
  CreateNotificationRequest,
  UpdateNotificationRequest,
  NotificationFilters,
  BulkNotificationRequest,
  NOTIFICATION_TEMPLATES,
  NotificationTemplateData,
} from '../validation/notifications';

export interface Notification {
  id: string;
  user_id: string;
  order_id?: string;
  type: string;
  title: string;
  message: string;
  delivered: boolean;
  channel: string;
  priority: string;
  metadata?: Record<string, any>;
  read_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export class NotificationService {
  /**
   * Create a single notification
   */
  static async createNotification(data: CreateNotificationRequest): Promise<Notification> {
    try {
      logger.info(`Creating notification for user ${data.user_id}`, { type: data.type });

      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: data.user_id,
          order_id: data.order_id,
          type: data.type,
          title: data.title,
          message: data.message,
          delivered: false,
          channel: data.channel || 'in_app',
          priority: data.priority || 'normal',
          metadata: data.metadata,
          expires_at: data.expires_at,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      logger.info(`Notification created: ${notification.id}`);
      return notification;
    } catch (error) {
      logger.error('Error creating notification', { error, data });
      throw error;
    }
  }

  /**
   * Create multiple notifications (bulk)
   */
  static async createBulkNotifications(data: BulkNotificationRequest): Promise<Notification[]> {
    try {
      logger.info(`Creating bulk notifications for ${data.user_ids.length} users`);

      const notifications = data.user_ids.map((user_id) => ({
        user_id,
        type: data.type,
        title: data.title,
        message: data.message,
        delivered: false,
        channel: data.channel || 'in_app',
        priority: data.priority || 'normal',
        metadata: data.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data: createdNotifications, error } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();

      if (error) throw error;

      logger.info(`Bulk notifications created: ${createdNotifications.length} notifications`);
      return createdNotifications;
    } catch (error) {
      logger.error('Error creating bulk notifications', { error, data });
      throw error;
    }
  }

  /**
   * Get notifications by filters
   */
  static async getNotifications(filters: NotificationFilters): Promise<{
    data: Notification[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      let query = supabase.from('notifications').select('*', { count: 'exact' });

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.channel) {
        query = query.eq('channel', filters.channel);
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters.delivered !== undefined) {
        query = query.eq('delivered', filters.delivered);
      }

      if (filters.read !== undefined) {
        if (filters.read) {
          query = query.not('read_at', 'is', null);
        } else {
          query = query.is('read_at', null);
        }
      }

      if (filters.order_id) {
        query = query.eq('order_id', filters.order_id);
      }

      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        data,
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error getting notifications', { error, filters });
      throw error;
    }
  }

  /**
   * Get a single notification by ID
   */
  static async getNotificationById(id: string): Promise<Notification> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Notification not found');

      return data;
    } catch (error) {
      logger.error('Error getting notification', { error, id });
      throw error;
    }
  }

  /**
   * Get unread notifications count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('read_at', null)
        .lte('created_at', new Date().toISOString());

      if (error) throw error;

      return count || 0;
    } catch (error) {
      logger.error('Error getting unread count', { error, userId });
      throw error;
    }
  }

  /**
   * Update a notification
   */
  static async updateNotification(id: string, data: UpdateNotificationRequest): Promise<Notification> {
    try {
      logger.info(`Updating notification ${id}`, { data });

      const updateData: any = {
        updated_at: new Date().toISOString(),
        ...data,
      };

      const { data: updated, error } = await supabase
        .from('notifications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!updated) throw new Error('Notification not found');

      logger.info(`Notification updated: ${id}`);
      return updated;
    } catch (error) {
      logger.error('Error updating notification', { error, id });
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(id: string): Promise<Notification> {
    try {
      return await this.updateNotification(id, {
        read_at: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error marking notification as read', { error, id });
      throw error;
    }
  }

  /**
   * Mark multiple notifications as read
   */
  static async markMultipleAsRead(ids: string[]): Promise<Notification[]> {
    try {
      logger.info(`Marking ${ids.length} notifications as read`);

      const { data, error } = await supabase
        .from('notifications')
        .update({
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in('id', ids)
        .select();

      if (error) throw error;

      logger.info(`${data.length} notifications marked as read`);
      return data;
    } catch (error) {
      logger.error('Error marking multiple notifications as read', { error, ids });
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsReadForUser(userId: string): Promise<number> {
    try {
      logger.info(`Marking all notifications as read for user ${userId}`);

      const { error, count } = await supabase
        .from('notifications')
        .update({
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .is('read_at', null);

      if (error) throw error;

      logger.info(`${count} notifications marked as read for user ${userId}`);
      return count || 0;
    } catch (error) {
      logger.error('Error marking all notifications as read', { error, userId });
      throw error;
    }
  }

  /**
   * Mark notification as delivered
   */
  static async markAsDelivered(id: string): Promise<Notification> {
    try {
      return await this.updateNotification(id, {
        delivered: true,
      });
    } catch (error) {
      logger.error('Error marking notification as delivered', { error, id });
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(id: string): Promise<void> {
    try {
      logger.info(`Deleting notification ${id}`);

      const { error } = await supabase.from('notifications').delete().eq('id', id);

      if (error) throw error;

      logger.info(`Notification deleted: ${id}`);
    } catch (error) {
      logger.error('Error deleting notification', { error, id });
      throw error;
    }
  }

  /**
   * Delete multiple notifications
   */
  static async deleteMultiple(ids: string[]): Promise<number> {
    try {
      logger.info(`Deleting ${ids.length} notifications`);

      const { error, count } = await supabase
        .from('notifications')
        .delete()
        .in('id', ids);

      if (error) throw error;

      logger.info(`${count} notifications deleted`);
      return count || 0;
    } catch (error) {
      logger.error('Error deleting multiple notifications', { error, ids });
      throw error;
    }
  }

  /**
   * Delete all notifications for a user
   */
  static async deleteAllForUser(userId: string): Promise<number> {
    try {
      logger.info(`Deleting all notifications for user ${userId}`);

      const { error, count } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      logger.info(`${count} notifications deleted for user ${userId}`);
      return count || 0;
    } catch (error) {
      logger.error('Error deleting all notifications', { error, userId });
      throw error;
    }
  }

  /**
   * Clean up expired notifications
   */
  static async cleanupExpiredNotifications(): Promise<number> {
    try {
      logger.info('Cleaning up expired notifications');

      const { error, count } = await supabase
        .from('notifications')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .not('expires_at', 'is', null);

      if (error) throw error;

      logger.info(`${count} expired notifications cleaned up`);
      return count || 0;
    } catch (error) {
      logger.error('Error cleaning up expired notifications', { error });
      throw error;
    }
  }

  /**
   * Get notification statistics for a user
   */
  static async getUserStats(userId: string): Promise<{
    total: number;
    unread: number;
    undelivered: number;
  }> {
    try {
      const { count: total } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: unread } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('read_at', null);

      const { count: undelivered } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('delivered', false);

      return {
        total: total || 0,
        unread: unread || 0,
        undelivered: undelivered || 0,
      };
    } catch (error) {
      logger.error('Error getting user stats', { error, userId });
      throw error;
    }
  }

  /**
   * Create notification from template
   */
  static async createFromTemplate(
    userId: string,
    templateKey: string,
    data: NotificationTemplateData,
    options?: {
      channel?: string;
      orderId?: string;
      expiresAt?: string;
    }
  ): Promise<Notification> {
    try {
      const template = NOTIFICATION_TEMPLATES[templateKey];
      if (!template) {
        throw new Error(`Template not found: ${templateKey}`);
      }

      // Replace template variables
      let title = template.title;
      let message = template.message;

      Object.entries(data).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        title = title.replace(new RegExp(placeholder, 'g'), String(value));
        message = message.replace(new RegExp(placeholder, 'g'), String(value));
      });

      return await this.createNotification({
        user_id: userId,
        type: templateKey as any,
        title,
        message,
        channel: (options?.channel || 'in_app') as any,
        priority: template.priority as any,
        order_id: options?.orderId,
        expires_at: options?.expiresAt,
      });
    } catch (error) {
      logger.error('Error creating notification from template', { error, templateKey });
      throw error;
    }
  }

  /**
   * Create order status notification
   */
  static async notifyOrderStatus(
    userId: string,
    orderId: string,
    orderNumber: string,
    status: string,
    metadata?: Record<string, any>
  ): Promise<Notification> {
    const templates: Record<string, { title: string; message: string; priority: string }> = {
      pending_payment: {
        title: 'Order Pending Payment',
        message: `Order #${orderNumber} is waiting for payment confirmation.`,
        priority: 'high',
      },
      paid: {
        title: 'Payment Received',
        message: `Payment for order #${orderNumber} has been confirmed.`,
        priority: 'high',
      },
      processing: {
        title: 'Order Processing',
        message: `Order #${orderNumber} is being prepared for shipment.`,
        priority: 'normal',
      },
      shipped: {
        title: 'Order Shipped',
        message: `Order #${orderNumber} has been shipped!`,
        priority: 'high',
      },
      delivered: {
        title: 'Order Delivered',
        message: `Order #${orderNumber} has been delivered. Please verify the contents.`,
        priority: 'high',
      },
      cancelled: {
        title: 'Order Cancelled',
        message: `Order #${orderNumber} has been cancelled.`,
        priority: 'high',
      },
      refunded: {
        title: 'Refund Processed',
        message: `Refund for order #${orderNumber} has been processed.`,
        priority: 'high',
      },
    };

    const template = templates[status] || {
      title: 'Order Status Updated',
      message: `Order #${orderNumber} status has been updated to ${status}.`,
      priority: 'normal',
    };

    return await this.createNotification({
      user_id: userId,
      order_id: orderId,
      type: 'order_status',
      title: template.title,
      message: template.message,
      priority: template.priority as any,
      metadata,
    });
  }

  /**
   * Create payment notification
   */
  static async notifyPayment(
    userId: string,
    orderId: string,
    orderNumber: string,
    status: 'success' | 'failed' | 'pending',
    amount?: number
  ): Promise<Notification> {
    const messages: Record<string, { title: string; message: string; priority: string }> = {
      success: {
        title: 'Payment Successful',
        message: `Payment of ${amount} for order #${orderNumber} has been successfully processed.`,
        priority: 'high',
      },
      failed: {
        title: 'Payment Failed',
        message: `Payment for order #${orderNumber} failed. Please try again or use a different payment method.`,
        priority: 'urgent',
      },
      pending: {
        title: 'Payment Pending',
        message: `Payment for order #${orderNumber} is being processed. This may take a few minutes.`,
        priority: 'normal',
      },
    };

    const message = messages[status];
    return await this.createNotification({
      user_id: userId,
      order_id: orderId,
      type: 'payment',
      title: message.title,
      message: message.message,
      priority: message.priority as any,
      metadata: { status, amount },
    });
  }

  /**
   * Create promotional notification
   */
  static async notifyPromotion(
    userId: string,
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<Notification> {
    return await this.createNotification({
      user_id: userId,
      type: 'promotion',
      title,
      message,
      channel: 'in_app',
      priority: 'normal',
      metadata,
    });
  }

  /**
   * Create system notification (admin/system alerts)
   */
  static async notifySystem(
    userId: string,
    title: string,
    message: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<Notification> {
    return await this.createNotification({
      user_id: userId,
      type: 'system',
      title,
      message,
      priority,
      channel: 'in_app',
    });
  }
}

export default NotificationService;
