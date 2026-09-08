/**
 * Validation schemas for Products API
 * Uses Zod for runtime type validation
 */

import { z } from 'zod';

// Base schemas
const uuidSchema = z.string().uuid('Invalid UUID format');

const productStatusSchema = z.enum(['draft', 'active', 'inactive', 'discontinued']);

const variantTypeSchema = z.enum(['standard', 'size', 'color', 'material', 'style']);

// Product schemas
export const createProductSchema = z.object({
  category_id: uuidSchema,
  name: z.string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must be less than 255 characters'),
  sku: z.string()
    .min(1, 'SKU is required')
    .max(100, 'SKU must be less than 100 characters')
    .regex(/^[A-Z0-9-_]+$/i, 'SKU can only contain letters, numbers, hyphens, and underscores'),
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  brand: z.string()
    .max(100, 'Brand must be less than 100 characters')
    .optional(),
  regular_price: z.number()
    .positive('Regular price must be positive')
    .max(999999.99, 'Price too high'),
  sale_price: z.number()
    .positive('Sale price must be positive')
    .max(999999.99, 'Price too high')
    .optional(),
  weight: z.number()
    .positive('Weight must be positive')
    .optional(),
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    unit: z.enum(['cm', 'in', 'm', 'ft']).optional()
  }).optional(),
  tags: z.array(z.string().max(50))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  featured: z.boolean().optional(),
  status: productStatusSchema.optional(),
  meta_title: z.string()
    .max(255, 'Meta title must be less than 255 characters')
    .optional(),
  meta_description: z.string()
    .max(500, 'Meta description must be less than 500 characters')
    .optional(),
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    alt_text: z.string().max(255).optional(),
    is_primary: z.boolean().optional(),
    position: z.number().int().min(0).optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    size_bytes: z.number().int().positive().optional()
  })).optional(),
  variants: z.array(z.object({
    name: z.string()
      .min(1, 'Variant name is required')
      .max(100, 'Variant name must be less than 100 characters'),
    value: z.string()
      .min(1, 'Variant value is required')
      .max(100, 'Variant value must be less than 100 characters'),
    sku: z.string()
      .min(1, 'Variant SKU is required')
      .max(100, 'Variant SKU must be less than 100 characters')
      .regex(/^[A-Z0-9-_]+$/i, 'SKU can only contain letters, numbers, hyphens, and underscores'),
    price: z.number()
      .positive('Variant price must be positive')
      .max(999999.99, 'Price too high')
      .optional(),
    stock_quantity: z.number()
      .int('Stock quantity must be an integer')
      .min(0, 'Stock quantity cannot be negative')
      .optional(),
    is_default: z.boolean().optional(),
    variant_type: variantTypeSchema.optional(),
    attributes: z.record(z.any()).optional()
  })).optional()
}).refine((data) => {
  // Sale price should not be higher than regular price
  if (data.sale_price && data.sale_price >= data.regular_price) {
    return false;
  }
  return true;
}, {
  message: 'Sale price must be lower than regular price',
  path: ['sale_price']
});

export const updateProductSchema = z.object({
  category_id: uuidSchema.optional(),
  name: z.string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must be less than 255 characters')
    .optional(),
  sku: z.string()
    .min(1, 'SKU is required')
    .max(100, 'SKU must be less than 100 characters')
    .regex(/^[A-Z0-9-_]+$/i, 'SKU can only contain letters, numbers, hyphens, and underscores')
    .optional(),
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  brand: z.string()
    .max(100, 'Brand must be less than 100 characters')
    .optional(),
  regular_price: z.number()
    .positive('Regular price must be positive')
    .max(999999.99, 'Price too high')
    .optional(),
  sale_price: z.number()
    .positive('Sale price must be positive')
    .max(999999.99, 'Price too high')
    .optional(),
  weight: z.number()
    .positive('Weight must be positive')
    .optional(),
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    unit: z.enum(['cm', 'in', 'm', 'ft']).optional()
  }).optional(),
  tags: z.array(z.string().max(50))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  featured: z.boolean().optional(),
  status: productStatusSchema.optional(),
  meta_title: z.string()
    .max(255, 'Meta title must be less than 255 characters')
    .optional(),
  meta_description: z.string()
    .max(500, 'Meta description must be less than 500 characters')
    .optional()
}).refine((data) => {
  // Sale price should not be higher than regular price
  if (data.sale_price && data.regular_price && data.sale_price >= data.regular_price) {
    return false;
  }
  return true;
}, {
  message: 'Sale price must be lower than regular price',
  path: ['sale_price']
});

// Product Image schemas
export const createProductImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  alt_text: z.string()
    .max(255, 'Alt text must be less than 255 characters')
    .optional(),
  is_primary: z.boolean().optional(),
  position: z.number()
    .int('Position must be an integer')
    .min(0, 'Position cannot be negative')
    .optional(),
  width: z.number()
    .int('Width must be an integer')
    .positive('Width must be positive')
    .optional(),
  height: z.number()
    .int('Height must be an integer')
    .positive('Height must be positive')
    .optional(),
  size_bytes: z.number()
    .int('Size must be an integer')
    .positive('Size must be positive')
    .optional()
});

export const updateProductImageSchema = z.object({
  url: z.string().url('Invalid image URL').optional(),
  alt_text: z.string()
    .max(255, 'Alt text must be less than 255 characters')
    .optional(),
  is_primary: z.boolean().optional(),
  position: z.number()
    .int('Position must be an integer')
    .min(0, 'Position cannot be negative')
    .optional(),
  width: z.number()
    .int('Width must be an integer')
    .positive('Width must be positive')
    .optional(),
  height: z.number()
    .int('Height must be an integer')
    .positive('Height must be positive')
    .optional(),
  size_bytes: z.number()
    .int('Size must be an integer')
    .positive('Size must be positive')
    .optional()
});

export const reorderImagesSchema = z.object({
  imageIds: z.array(uuidSchema)
    .min(1, 'At least one image ID is required')
});

// Product Variant schemas
export const createProductVariantSchema = z.object({
  name: z.string()
    .min(1, 'Variant name is required')
    .max(100, 'Variant name must be less than 100 characters'),
  value: z.string()
    .min(1, 'Variant value is required')
    .max(100, 'Variant value must be less than 100 characters'),
  sku: z.string()
    .min(1, 'Variant SKU is required')
    .max(100, 'Variant SKU must be less than 100 characters')
    .regex(/^[A-Z0-9-_]+$/i, 'SKU can only contain letters, numbers, hyphens, and underscores'),
  price: z.number()
    .positive('Variant price must be positive')
    .max(999999.99, 'Price too high')
    .optional(),
  stock_quantity: z.number()
    .int('Stock quantity must be an integer')
    .min(0, 'Stock quantity cannot be negative')
    .optional(),
  is_default: z.boolean().optional(),
  variant_type: variantTypeSchema.optional(),
  attributes: z.record(z.any()).optional()
});

export const updateProductVariantSchema = z.object({
  name: z.string()
    .min(1, 'Variant name is required')
    .max(100, 'Variant name must be less than 100 characters')
    .optional(),
  value: z.string()
    .min(1, 'Variant value is required')
    .max(100, 'Variant value must be less than 100 characters')
    .optional(),
  sku: z.string()
    .min(1, 'Variant SKU is required')
    .max(100, 'Variant SKU must be less than 100 characters')
    .regex(/^[A-Z0-9-_]+$/i, 'SKU can only contain letters, numbers, hyphens, and underscores')
    .optional(),
  price: z.number()
    .positive('Variant price must be positive')
    .max(999999.99, 'Price too high')
    .optional(),
  stock_quantity: z.number()
    .int('Stock quantity must be an integer')
    .min(0, 'Stock quantity cannot be negative')
    .optional(),
  is_default: z.boolean().optional(),
  variant_type: variantTypeSchema.optional(),
  attributes: z.record(z.any()).optional()
});

// Stock management schema
export const updateStockSchema = z.object({
  quantity: z.number()
    .int('Quantity must be an integer')
    .min(0, 'Quantity cannot be negative'),
  reserved: z.number()
    .int('Reserved quantity must be an integer')
    .min(0, 'Reserved quantity cannot be negative')
    .optional()
}).refine((data) => {
  // Reserved quantity cannot exceed total quantity
  if (data.reserved !== undefined && data.reserved > data.quantity) {
    return false;
  }
  return true;
}, {
  message: 'Reserved quantity cannot exceed total quantity',
  path: ['reserved']
});

// Query parameter schemas
export const productFiltersSchema = z.object({
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
  category_id: uuidSchema.optional(),
  status: productStatusSchema.optional(),
  featured: z.string()
    .transform(val => val === 'true')
    .optional(),
  min_price: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format')
    .transform(Number)
    .optional(),
  max_price: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format')
    .transform(Number)
    .optional(),
  brand: z.string()
    .max(100, 'Brand filter too long')
    .optional(),
  tags: z.union([
    z.string(),
    z.array(z.string())
  ]).optional(),
  search: z.string()
    .max(200, 'Search query too long')
    .optional(),
  in_stock: z.string()
    .transform(val => val === 'true')
    .optional(),
  sort_by: z.enum([
    'created_at', 'updated_at', 'name', 'regular_price', 
    'sale_price', 'popularity', 'avg_rating', 'view_count'
  ]).optional(),
  sort_order: z.enum(['asc', 'desc']).optional()
});

export const searchSchema = z.object({
  q: z.string()
    .min(1, 'Search query is required')
    .max(200, 'Search query too long'),
  category: uuidSchema.optional(),
  min_price: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format')
    .transform(Number)
    .optional(),
  max_price: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format')
    .transform(Number)
    .optional(),
  rating: z.string()
    .regex(/^\d(\.\d)?$/, 'Rating must be between 0 and 5')
    .transform(Number)
    .refine(n => n >= 0 && n <= 5, 'Rating must be between 0 and 5')
    .optional(),
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

// Export validation middleware creator
export const validateSchema = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid request data',
          details: errors
        });
      }
      
      req.body = result.data;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Validation processing failed'
      });
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid query parameters',
          details: errors
        });
      }
      
      req.query = result.data;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Query validation processing failed'
      });
    }
  };
};