/**
 * Validation schemas for Categories API
 * Uses Zod for runtime type validation
 */

import { z } from 'zod';

const uuidSchema = z.string().uuid('Invalid UUID format');

export const createCategorySchema = z.object({
  parent_id: uuidSchema.optional().nullable(),
  name: z.string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  image_url: z.string()
    .url('Invalid image URL')
    .optional(),
  sort_order: z.number()
    .int('Sort order must be an integer')
    .min(0, 'Sort order cannot be negative')
    .optional(),
  is_active: z.boolean().optional(),
  meta_title: z.string()
    .max(255, 'Meta title must be less than 255 characters')
    .optional(),
  meta_description: z.string()
    .max(500, 'Meta description must be less than 500 characters')
    .optional()
});

export const updateCategorySchema = z.object({
  parent_id: uuidSchema.optional().nullable(),
  name: z.string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be less than 100 characters')
    .optional(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  image_url: z.string()
    .url('Invalid image URL')
    .optional(),
  sort_order: z.number()
    .int('Sort order must be an integer')
    .min(0, 'Sort order cannot be negative')
    .optional(),
  is_active: z.boolean().optional(),
  meta_title: z.string()
    .max(255, 'Meta title must be less than 255 characters')
    .optional(),
  meta_description: z.string()
    .max(500, 'Meta description must be less than 500 characters')
    .optional()
});

export const reorderCategorySchema = z.object({
  sort_order: z.number()
    .int('Sort order must be an integer')
    .min(0, 'Sort order cannot be negative')
});

export const categoryFiltersSchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(Number)
    .refine(n => n > 0, 'Page must be positive')
    .optional(),
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .refine(n => n > 0 && n <= 500, 'Limit must be between 1 and 500')
    .optional(),
  parent_id: uuidSchema.optional(),
  hierarchy: z.string()
    .transform(val => val === 'true')
    .optional(),
  active_only: z.string()
    .transform(val => val === 'true')
    .optional(),
  sort_by: z.enum(['name', 'sort_order', 'created_at', 'updated_at']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional()
});

export const categoryChildrenSchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(Number)
    .refine(n => n > 0, 'Page must be positive')
    .optional(),
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100')
    .optional()
});

export const categoryProductsSchema = z.object({
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
  sort_by: z.enum([
    'created_at', 'updated_at', 'name', 'regular_price', 
    'popularity', 'avg_rating'
  ]).optional(),
  sort_order: z.enum(['asc', 'desc']).optional()
});