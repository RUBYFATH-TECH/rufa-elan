/**
 * Validation schemas for Orders API
 * Uses Zod for runtime type validation
 */

import { z } from 'zod';

const uuidSchema = z.string().uuid('Invalid UUID format');

const orderStatusSchema = z.enum([
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'returned'
]);

const paymentStatusSchema = z.enum([
  'unpaid',
  'paid',
  'partially_paid',
  'refunded',
  'failed'
]);

// Address schema for shipping/billing
const addressSchema = z.object({
  full_name: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Full name too long'),
  phone: z.string()
    .min(1, 'Phone is required')
    .max(20, 'Phone too long'),
  email: z.string()
    .email('Invalid email address'),
  address: z.string()
    .min(1, 'Address is required')
    .max(255, 'Address too long'),
  city: z.string()
    .min(1, 'City is required')
    .max(100, 'City too long'),
  region: z.string()
    .max(100, 'Region too long')
    .optional(),
  postal_code: z.string()
    .max(20, 'Postal code too long')
    .optional(),
  country: z.string()
    .max(100, 'Country too long')
    .optional(),
  shipping_fee: z.number()
    .min(0, 'Shipping fee cannot be negative')
    .optional(),
  delivery_instructions: z.string()
    .max(500, 'Delivery instructions too long')
    .optional()
});

// Order item schema
const orderItemSchema = z.object({
  product_variant_id: uuidSchema,
  quantity: z.number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(1000, 'Quantity too high')
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema)
    .min(1, 'At least one item is required'),
  shipping_address: addressSchema,
  billing_address: addressSchema.optional(),
  coupon_code: z.string()
    .max(50, 'Coupon code too long')
    .optional(),
  notes: z.string()
    .max(500, 'Notes too long')
    .optional()
});

export const updateOrderSchema = z.object({
  status: orderStatusSchema.optional(),
  payment_status: paymentStatusSchema.optional(),
  notes: z.string()
    .max(500, 'Notes too long')
    .optional(),
  estimated_delivery_date: z.string()
    .datetime()
    .optional(),
  cancellation_reason: z.string()
    .max(500, 'Cancellation reason too long')
    .optional()
});

// Tracking schemas
const trackingStatusSchema = z.enum([
  'pending_payment',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned',
  'failed'
]);

export const createTrackingUpdateSchema = z.object({
  status: trackingStatusSchema,
  note: z.string()
    .max(500, 'Note too long')
    .optional()
});

export const updateTrackingSchema = z.object({
  courier_name: z.string()
    .max(100, 'Courier name too long')
    .optional(),
  tracking_number: z.string()
    .max(100, 'Tracking number too long')
    .optional(),
  estimated_delivery_date: z.string()
    .datetime()
    .optional(),
  current_status: trackingStatusSchema.optional()
});

// Query parameter schemas
export const orderFiltersSchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(Number)
    .refine(n => n > 0, 'Page must be positive')
    .optional(),
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100')
    .optional(),
  status: orderStatusSchema.optional(),
  payment_status: paymentStatusSchema.optional(),
  start_date: z.string()
    .datetime()
    .optional(),
  end_date: z.string()
    .datetime()
    .optional(),
  min_amount: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format')
    .transform(Number)
    .optional(),
  max_amount: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format')
    .transform(Number)
    .optional(),
  sort_by: z.enum([
    'created_at',
    'updated_at',
    'order_number',
    'total_amount',
    'status',
    'payment_status'
  ]).optional(),
  sort_order: z.enum(['asc', 'desc']).optional()
});

export const paymentSchema = z.object({
  provider: z.string()
    .min(1, 'Provider is required')
    .max(50, 'Provider too long'),
  reference: z.string()
    .min(1, 'Payment reference is required')
    .max(100, 'Payment reference too long'),
  status: z.enum(['pending', 'success', 'failed', 'cancelled'])
    .optional(),
  amount: z.number()
    .positive('Amount must be positive'),
  metadata: z.record(z.any()).optional()
});

// Coupon application schema
export const applyCouponSchema = z.object({
  code: z.string()
    .min(1, 'Coupon code is required')
    .max(50, 'Coupon code too long')
});

// Order refund schema
export const refundOrderSchema = z.object({
  reason: z.string()
    .min(1, 'Refund reason is required')
    .max(500, 'Refund reason too long'),
  amount: z.number()
    .positive('Refund amount must be positive')
    .optional()
});

// Return request schema
export const returnRequestSchema = z.object({
  item_id: uuidSchema,
  reason: z.string()
    .min(1, 'Return reason is required')
    .max(500, 'Return reason too long'),
  comments: z.string()
    .max(500, 'Comments too long')
    .optional()
});