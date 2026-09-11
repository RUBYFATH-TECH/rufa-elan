/**
 * Notification API Tests
 * Comprehensive test suite for notification endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// Mock configuration
const API_BASE_URL = 'http://localhost:3001/api';
const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440001';
const TEST_ORDER_ID = '550e8400-e29b-41d4-a716-446655440002';

interface TestContext {
  createdNotificationId?: string;
  createdNotificationIds?: string[];
}

const context: TestContext = {};

/**
 * Helper function to make API requests
 */
async function apiRequest(
  method: string,
  endpoint: string,
  data?: any
): Promise<{ status: number; body: any }> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const body = await response.json();

    return { status: response.status, body };
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

describe('Notification API Tests', () => {
  beforeAll(async () => {
    console.log('Setting up notification tests...');
    // Wait for API to be ready
    let ready = false;
    for (let i = 0; i < 10; i++) {
      try {
        const { status } = await apiRequest('GET', '/health');
        if (status === 200) {
          ready = true;
          break;
        }
      } catch (e) {
        // Wait and retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!ready) {
      throw new Error('API is not ready');
    }
    console.log('API is ready for testing');
  });

  afterAll(async () => {
    console.log('Cleaning up notification tests...');
    // Clean up test data if needed
    if (context.createdNotificationIds && context.createdNotificationIds.length > 0) {
      try {
        await apiRequest('DELETE', '/notifications/bulk', {
          ids: context.createdNotificationIds,
        });
      } catch (e) {
        console.error('Cleanup failed:', e);
      }
    }
  });

  describe('POST /notifications', () => {
    it('should create a single notification', async () => {
      const { status, body } = await apiRequest('POST', '/notifications', {
        user_id: TEST_USER_ID,
        type: 'order_status',
        title: 'Test Notification',
        message: 'This is a test notification',
        channel: 'in_app',
        priority: 'normal',
      });

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.id).toBeDefined();
      expect(body.data.title).toBe('Test Notification');
      expect(body.data.message).toBe('This is a test notification');
      expect(body.data.user_id).toBe(TEST_USER_ID);

      context.createdNotificationId = body.data.id;
      if (!context.createdNotificationIds) context.createdNotificationIds = [];
      context.createdNotificationIds.push(body.data.id);
    });

    it('should fail with missing user_id', async () => {
      const { status, body } = await apiRequest('POST', '/notifications', {
        type: 'order_status',
        title: 'Test Notification',
        message: 'This is a test notification',
      });

      expect(status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
    });

    it('should fail with missing title', async () => {
      const { status, body } = await apiRequest('POST', '/notifications', {
        user_id: TEST_USER_ID,
        type: 'order_status',
        message: 'This is a test notification',
      });

      expect(status).toBe(400);
      expect(body.success).toBe(false);
    });

    it('should fail with invalid type', async () => {
      const { status, body } = await apiRequest('POST', '/notifications', {
        user_id: TEST_USER_ID,
        type: 'invalid_type',
        title: 'Test',
        message: 'Test message',
      });

      expect(status).toBe(400);
      expect(body.success).toBe(false);
    });

    it('should create notification with order_id', async () => {
      const { status, body } = await apiRequest('POST', '/notifications', {
        user_id: TEST_USER_ID,
        order_id: TEST_ORDER_ID,
        type: 'payment',
        title: 'Payment Received',
        message: 'Payment confirmed',
        priority: 'high',
      });

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.order_id).toBe(TEST_ORDER_ID);

      if (!context.createdNotificationIds) context.createdNotificationIds = [];
      context.createdNotificationIds.push(body.data.id);
    });

    it('should create notification with metadata', async () => {
      const { status, body } = await apiRequest('POST', '/notifications', {
        user_id: TEST_USER_ID,
        type: 'order_status',
        title: 'Order Update',
        message: 'Your order is ready',
        metadata: {
          orderNumber: '12345',
          trackingNumber: 'TRACK123',
          estimatedDelivery: '2025-01-15',
        },
      });

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.metadata).toBeDefined();
      expect(body.data.metadata.orderNumber).toBe('12345');

      if (!context.createdNotificationIds) context.createdNotificationIds = [];
      context.createdNotificationIds.push(body.data.id);
    });

    it('should create notification with expiration', async () => {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { status, body } = await apiRequest('POST', '/notifications', {
        user_id: TEST_USER_ID,
        type: 'promotion',
        title: 'Limited Time Offer',
        message: 'Get 20% off today only',
        expires_at: expiresAt,
      });

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.expires_at).toBe(expiresAt);

      if (!context.createdNotificationIds) context.createdNotificationIds = [];
      context.createdNotificationIds.push(body.data.id);
    });
  });

  describe('POST /notifications/bulk', () => {
    it('should create multiple notifications', async () => {
      const userIds = [
        '550e8400-e29b-41d4-a716-446655440011',
        '550e8400-e29b-41d4-a716-446655440012',
        '550e8400-e29b-41d4-a716-446655440013',
      ];

      const { status, body } = await apiRequest('POST', '/notifications/bulk', {
        user_ids: userIds,
        type: 'promotion',
        title: 'Flash Sale',
        message: 'Everything 50% off for the next 24 hours',
        priority: 'high',
      });

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(userIds.length);

      if (!context.createdNotificationIds) context.createdNotificationIds = [];
      body.data.forEach((n: any) => context.createdNotificationIds!.push(n.id));
    });

    it('should fail with empty user_ids', async () => {
      const { status, body } = await apiRequest('POST', '/notifications/bulk', {
        user_ids: [],
        type: 'promotion',
        title: 'Flash Sale',
        message: 'Test message',
      });

      expect(status).toBe(400);
      expect(body.success).toBe(false);
    });
  });

  describe('GET /notifications', () => {
    it('should list notifications with pagination', async () => {
      const { status, body } = await apiRequest(
        'GET',
        `/notifications?user_id=${TEST_USER_ID}&page=1&limit=10`
      );

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.pagination).toBeDefined();
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(10);
    });

    it('should filter by type', async () => {
      const { status, body } = await apiRequest(
        'GET',
        `/notifications?user_id=${TEST_USER_ID}&type=order_status`
      );

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      if (body.data.length > 0) {
        body.data.forEach((n: any) => {
          expect(n.type).toBe('order_status');
        });
      }
    });

    it('should filter by priority', async () => {
      const { status, body } = await apiRequest(
        'GET',
        `/notifications?user_id=${TEST_USER_ID}&priority=high`
      );

      expect(status).toBe(200);
      expect(body.success).toBe(true);
    });

    it('should filter by delivered status', async () => {
      const { status, body } = await apiRequest(
        'GET',
        `/notifications?user_id=${TEST_USER_ID}&delivered=false`
      );

      expect(status).toBe(200);
      expect(body.success).toBe(true);
    });

    it('should filter by read status', async () => {
      const { status, body } = await apiRequest(
        'GET',
        `/notifications?user_id=${TEST_USER_ID}&read=false`
      );

      expect(status).toBe(200);
      expect(body.success).toBe(true);
    });

    it('should fail without user_id', async () => {
      const { status, body } = await apiRequest('GET', '/notifications?page=1&limit=10');

      expect(status).toBe(400);
      expect(body.success).toBe(false);
    });
  });

  describe('GET /notifications/:id', () => {
    it('should get a single notification', async () => {
      if (!context.createdNotificationId) {
        console.log('Skipping: no notification created');
        return;
      }

      const { status, body } = await apiRequest('GET', `/notifications/${context.createdNotificationId}`);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(context.createdNotificationId);
    });

    it('should fail with invalid notification id', async () => {
      const { status, body } = await apiRequest(
        'GET',
        '/notifications/550e8400-e29b-41d4-a716-446655440099'
      );

      expect(status).toBe(404);
      expect(body.success).toBe(false);
    });
  });

  describe('PUT /notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      if (!context.createdNotificationId) {
        console.log('Skipping: no notification created');
        return;
      }

      const { status, body } = await apiRequest('PUT', `/notifications/${context.createdNotificationId}/read`);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.read_at).toBeDefined();
      expect(body.data.read_at).not.toBeNull();
    });
  });

  describe('PUT /notifications/read/bulk', () => {
    it('should mark multiple notifications as read', async () => {
      if (!context.createdNotificationIds || context.createdNotificationIds.length < 2) {
        console.log('Skipping: not enough notifications created');
        return;
      }

      const idsToMark = context.createdNotificationIds.slice(0, 2);

      const { status, body } = await apiRequest('PUT', '/notifications/read/bulk', {
        ids: idsToMark,
      });

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /notifications/:id/delivered', () => {
    it('should mark notification as delivered', async () => {
      // Create a new notification for this test
      const { body: createBody } = await apiRequest('POST', '/notifications', {
        user_id: TEST_USER_ID,
        type: 'system',
        title: 'Delivery Test',
        message: 'Test message',
      });

      const notificationId = createBody.data.id;
      if (!context.createdNotificationIds) context.createdNotificationIds = [];
      context.createdNotificationIds.push(notificationId);

      const { status, body } = await apiRequest('PUT', `/notifications/${notificationId}/delivered`);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.delivered).toBe(true);
    });
  });

  describe('PATCH /notifications/:id', () => {
    it('should update notification', async () => {
      if (!context.createdNotificationId) {
        console.log('Skipping: no notification created');
        return;
      }

      const { status, body } = await apiRequest('PATCH', `/notifications/${context.createdNotificationId}`, {
        message: 'Updated message',
        metadata: { updated: true },
      });

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.message).toBe('Updated message');
      expect(body.data.metadata.updated).toBe(true);
    });
  });

  describe('GET /notifications/user/:userId/unread-count', () => {
    it('should get unread notification count', async () => {
      const { status, body } = await apiRequest('GET', `/notifications/user/${TEST_USER_ID}/unread-count`);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(typeof body.unreadCount).toBe('number');
      expect(body.unreadCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /notifications/user/:userId/stats', () => {
    it('should get user notification stats', async () => {
      const { status, body } = await apiRequest('GET', `/notifications/user/${TEST_USER_ID}/stats`);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(typeof body.data.total).toBe('number');
      expect(typeof body.data.unread).toBe('number');
      expect(typeof body.data.undelivered).toBe('number');
    });
  });

  describe('PUT /notifications/user/:userId/read-all', () => {
    it('should mark all notifications as read for user', async () => {
      const { status, body } = await apiRequest('PUT', `/notifications/user/${TEST_USER_ID}/read-all`);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(typeof body.count).toBe('number');
    });
  });

  describe('DELETE /notifications/:id', () => {
    it('should delete a notification', async () => {
      // Create a new notification for deletion
      const { body: createBody } = await apiRequest('POST', '/notifications', {
        user_id: TEST_USER_ID,
        type: 'system',
        title: 'Delete Test',
        message: 'This will be deleted',
      });

      const notificationId = createBody.data.id;

      const { status, body } = await apiRequest('DELETE', `/notifications/${notificationId}`);

      expect(status).toBe(200);
      expect(body.success).toBe(true);

      // Verify it's deleted
      const { status: getStatus } = await apiRequest('GET', `/notifications/${notificationId}`);
      expect(getStatus).toBe(404);
    });
  });

  describe('DELETE /notifications/bulk', () => {
    it('should delete multiple notifications', async () => {
      // Create new notifications for deletion
      const ids = [];
      for (let i = 0; i < 2; i++) {
        const { body } = await apiRequest('POST', '/notifications', {
          user_id: TEST_USER_ID,
          type: 'system',
          title: `Bulk Delete Test ${i}`,
          message: 'These will be deleted',
        });
        ids.push(body.data.id);
      }

      const { status, body } = await apiRequest('DELETE', '/notifications/bulk', { ids });

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.count).toBe(ids.length);
    });
  });

  describe('DELETE /notifications/user/:userId', () => {
    it('should delete all notifications for a user', async () => {
      // Create a temporary test user ID
      const tempUserId = '550e8400-e29b-41d4-a716-446655440099';

      // Create notifications for this user
      for (let i = 0; i < 3; i++) {
        await apiRequest('POST', '/notifications', {
          user_id: tempUserId,
          type: 'system',
          title: `Temp Notification ${i}`,
          message: 'Temporary notification',
        });
      }

      const { status, body } = await apiRequest('DELETE', `/notifications/user/${tempUserId}`);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('POST /notifications/cleanup-expired', () => {
    it('should clean up expired notifications', async () => {
      // Create an expired notification
      const expiredDate = new Date(Date.now() - 1000).toISOString();

      await apiRequest('POST', '/notifications', {
        user_id: TEST_USER_ID,
        type: 'promotion',
        title: 'Expired Notification',
        message: 'This notification has expired',
        expires_at: expiredDate,
      });

      const { status, body } = await apiRequest('POST', '/notifications/cleanup-expired');

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(typeof body.count).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Try to create notification with invalid user_id format
      const { status, body } = await apiRequest('POST', '/notifications', {
        user_id: 'invalid-uuid',
        type: 'system',
        title: 'Test',
        message: 'Test message',
      });

      expect(status).toBeGreaterThanOrEqual(400);
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
    });
  });
});
