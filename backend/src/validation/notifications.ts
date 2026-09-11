/**
 * Validation schemas for notifications
 */

export interface CreateNotificationRequest {
  user_id: string;
  order_id?: string;
  type: 'order_status' | 'payment' | 'shipping' | 'promotion' | 'system' | 'review' | 'wishlist';
  title: string;
  message: string;
  channel?: 'email' | 'sms' | 'push' | 'in_app';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  expires_at?: string;
}

export interface UpdateNotificationRequest {
  title?: string;
  message?: string;
  read_at?: string | null;
  delivered?: boolean;
  metadata?: Record<string, any>;
}

export interface NotificationFilters {
  user_id?: string;
  type?: string;
  channel?: string;
  priority?: string;
  delivered?: boolean;
  read?: boolean;
  order_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface BulkNotificationRequest {
  user_ids: string[];
  type: string;
  title: string;
  message: string;
  channel?: 'email' | 'sms' | 'push' | 'in_app';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

export interface NotificationTemplateData {
  [key: string]: any;
}

// Notification types and templates
export const NOTIFICATION_TYPES = {
  ORDER_STATUS: 'order_status',
  PAYMENT: 'payment',
  SHIPPING: 'shipping',
  PROMOTION: 'promotion',
  SYSTEM: 'system',
  REVIEW: 'review',
  WISHLIST: 'wishlist',
} as const;

export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app',
} as const;

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Notification templates
export const NOTIFICATION_TEMPLATES: Record<string, { title: string; message: string; priority: string }> = {
  order_placed: {
    title: 'Order Placed Successfully',
    message: 'Your order #{{orderNumber}} has been received. We\'ll keep you updated on the status.',
    priority: 'high',
  },
  payment_received: {
    title: 'Payment Confirmed',
    message: 'Payment for order #{{orderNumber}} has been received and confirmed.',
    priority: 'high',
  },
  order_confirmed: {
    title: 'Order Confirmed',
    message: 'Your order #{{orderNumber}} is confirmed and being prepared for shipment.',
    priority: 'normal',
  },
  order_shipped: {
    title: 'Order Shipped',
    message: 'Your order #{{orderNumber}} has been shipped. Tracking number: {{trackingNumber}}',
    priority: 'high',
  },
  order_delivered: {
    title: 'Order Delivered',
    message: 'Your order #{{orderNumber}} has been delivered. Please verify the contents.',
    priority: 'high',
  },
  payment_failed: {
    title: 'Payment Failed',
    message: 'Payment for order #{{orderNumber}} failed. Please try again or use a different payment method.',
    priority: 'urgent',
  },
  order_cancelled: {
    title: 'Order Cancelled',
    message: 'Your order #{{orderNumber}} has been cancelled. {{refundInfo}}',
    priority: 'high',
  },
  review_request: {
    title: 'Share Your Feedback',
    message: 'How did you like your purchase? Leave a review and help others make great choices.',
    priority: 'normal',
  },
  item_back_in_stock: {
    title: 'Item Back in Stock',
    message: '{{productName}} from your wishlist is back in stock!',
    priority: 'high',
  },
  promotional_offer: {
    title: 'Special Offer for You',
    message: '{{offerDescription}} Use code {{couponCode}} to save {{discountValue}}%',
    priority: 'normal',
  },
  new_product: {
    title: 'New Product Alert',
    message: 'Check out {{productName}} - a new item you might like!',
    priority: 'normal',
  },
  price_drop: {
    title: 'Price Drop Alert',
    message: '{{productName}} price dropped to {{newPrice}}. Was {{oldPrice}}.',
    priority: 'high',
  },
  system_maintenance: {
    title: 'System Maintenance',
    message: 'We\'ll be performing maintenance {{maintenanceTime}}. Services may be temporarily unavailable.',
    priority: 'normal',
  },
  account_security: {
    title: 'Account Security Alert',
    message: '{{securityMessage}} If this wasn\'t you, please secure your account immediately.',
    priority: 'urgent',
  },
};

// Validate notification request
export function validateCreateNotificationRequest(data: any): CreateNotificationRequest {
  if (!data.user_id || typeof data.user_id !== 'string') {
    throw new Error('Invalid or missing user_id');
  }

  if (!data.type || !Object.values(NOTIFICATION_TYPES).includes(data.type)) {
    throw new Error('Invalid or missing notification type');
  }

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    throw new Error('Invalid or missing title');
  }

  if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
    throw new Error('Invalid or missing message');
  }

  if (data.channel && !Object.values(NOTIFICATION_CHANNELS).includes(data.channel)) {
    throw new Error('Invalid channel');
  }

  if (data.priority && !Object.values(NOTIFICATION_PRIORITIES).includes(data.priority)) {
    throw new Error('Invalid priority');
  }

  if (data.expires_at) {
    const expiresAt = new Date(data.expires_at);
    if (isNaN(expiresAt.getTime())) {
      throw new Error('Invalid expires_at date');
    }
  }

  return {
    user_id: data.user_id,
    order_id: data.order_id,
    type: data.type,
    title: data.title.trim(),
    message: data.message.trim(),
    channel: data.channel || 'in_app',
    priority: data.priority || 'normal',
    metadata: data.metadata,
    expires_at: data.expires_at,
  };
}

// Validate update notification request
export function validateUpdateNotificationRequest(data: any): UpdateNotificationRequest {
  const update: UpdateNotificationRequest = {};

  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim().length === 0) {
      throw new Error('Invalid title');
    }
    update.title = data.title.trim();
  }

  if (data.message !== undefined) {
    if (typeof data.message !== 'string' || data.message.trim().length === 0) {
      throw new Error('Invalid message');
    }
    update.message = data.message.trim();
  }

  if (data.read_at !== undefined) {
    if (data.read_at !== null && typeof data.read_at !== 'string') {
      throw new Error('Invalid read_at');
    }
    update.read_at = data.read_at;
  }

  if (data.delivered !== undefined) {
    if (typeof data.delivered !== 'boolean') {
      throw new Error('Invalid delivered status');
    }
    update.delivered = data.delivered;
  }

  if (data.metadata !== undefined && data.metadata !== null) {
    if (typeof data.metadata !== 'object' || Array.isArray(data.metadata)) {
      throw new Error('Invalid metadata');
    }
    update.metadata = data.metadata;
  }

  return update;
}

// Validate bulk notification request
export function validateBulkNotificationRequest(data: any): BulkNotificationRequest {
  if (!Array.isArray(data.user_ids) || data.user_ids.length === 0) {
    throw new Error('Invalid or missing user_ids array');
  }

  if (!data.user_ids.every((id: any) => typeof id === 'string')) {
    throw new Error('All user_ids must be strings');
  }

  if (!data.type || typeof data.type !== 'string') {
    throw new Error('Invalid or missing type');
  }

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    throw new Error('Invalid or missing title');
  }

  if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
    throw new Error('Invalid or missing message');
  }

  if (data.channel && !Object.values(NOTIFICATION_CHANNELS).includes(data.channel)) {
    throw new Error('Invalid channel');
  }

  if (data.priority && !Object.values(NOTIFICATION_PRIORITIES).includes(data.priority)) {
    throw new Error('Invalid priority');
  }

  return {
    user_ids: data.user_ids,
    type: data.type,
    title: data.title.trim(),
    message: data.message.trim(),
    channel: data.channel || 'in_app',
    priority: data.priority || 'normal',
    metadata: data.metadata,
  };
}
