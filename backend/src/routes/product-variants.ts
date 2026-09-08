/**
 * Product Variants API routes for RUFA ELAN e-commerce application
 * Handles CRUD operations for product variants and inventory
 */

import express from 'express';
import { Request, Response } from 'express';
import { db, dbUtils } from '../utils/database';
import { requireAdmin, rateLimitMiddleware } from '../middleware/database';
import { logger } from '../utils/logger';
import { ProductVariant, ApiResponse } from '../types/database';

const router = express.Router();

// Rate limiting for product variants API
const variantsRateLimit = rateLimitMiddleware({
  maxRequests: 30,
  windowMs: 15 * 60 * 1000 // 15 minutes
});

router.use(variantsRateLimit);

/**
 * GET /api/products/:productId/variants
 * Get all variants for a product
 */
router.get('/:productId/variants', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    if (!dbUtils.isValidUUID(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
        message: 'Product ID must be a valid UUID'
      } as ApiResponse);
    }

    // Check if product exists and is accessible
    const product = await db.products.findById(productId);
    if (product.error || !product.data) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'The requested product does not exist'
      } as ApiResponse);
    }

    if (product.data.status !== 'active' && !req.isAdmin) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'The requested product does not exist'
      } as ApiResponse);
    }

    // Get product variants with inventory information
    const { data, error } = await req.db!
      .from('product_variants')
      .select(`
        *,
        inventory(quantity, reserved)
      `)
      .eq('product_id', productId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('Failed to fetch product variants:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch variants',
        message: error.message
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: data || []
    } as ApiResponse<ProductVariant[]>);

  } catch (error) {
    logger.error('Error fetching product variants:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch variants'
    } as ApiResponse);
  }
});

/**
 * GET /api/products/:productId/variants/:variantId
 * Get specific product variant
 */
router.get('/:productId/variants/:variantId', async (req: Request, res: Response) => {
  try {
    const { productId, variantId } = req.params;

    if (!dbUtils.isValidUUID(productId) || !dbUtils.isValidUUID(variantId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Product ID and Variant ID must be valid UUIDs'
      } as ApiResponse);
    }

    // Check if product exists and is accessible
    const product = await db.products.findById(productId);
    if (product.error || !product.data) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'The requested product does not exist'
      } as ApiResponse);
    }

    if (product.data.status !== 'active' && !req.isAdmin) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'The requested product does not exist'
      } as ApiResponse);
    }

    // Get variant with inventory information
    const { data, error } = await req.db!
      .from('product_variants')
      .select(`
        *,
        inventory(quantity, reserved)
      `)
      .eq('id', variantId)
      .eq('product_id', productId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Variant not found',
        message: 'The requested variant does not exist'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data
    } as ApiResponse<ProductVariant>);

  } catch (error) {
    logger.error('Error fetching product variant:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch variant'
    } as ApiResponse);
  }
});

/**
 * POST /api/products/:productId/variants
 * Add new variant to product (Admin only)
 */
router.post('/:productId/variants', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const variantData = req.body;

    if (!dbUtils.isValidUUID(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
        message: 'Product ID must be a valid UUID'
      } as ApiResponse);
    }

    // Validate required fields
    if (!variantData.name || !variantData.value || !variantData.sku) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Name, value, and sku are required'
      } as ApiResponse);
    }

    // Check if product exists
    const product = await db.products.findById(productId);
    if (product.error || !product.data) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'The requested product does not exist'
      } as ApiResponse);
    }

    // Check if SKU already exists
    const existingSku = await db.productVariants.find({
      filters: { sku: variantData.sku }
    });

    if (existingSku.data && existingSku.data.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'SKU already exists',
        message: 'A variant with this SKU already exists'
      } as ApiResponse);
    }

    // If this is set as default, unset other default variants
    if (variantData.is_default) {
      await db.productVariants.updateWhere(
        { product_id: productId, is_default: true },
        { is_default: false }
      );
    }

    // Create variant
    const result = await db.productVariants.create({
      ...variantData,
      product_id: productId,
      stock_quantity: variantData.stock_quantity || 0,
      is_default: variantData.is_default || false,
      variant_type: variantData.variant_type || 'standard',
      attributes: variantData.attributes || {}
    });

    if (result.error || !result.data) {
      logger.error('Failed to create variant:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create variant',
        message: result.error
      } as ApiResponse);
    }

    // Create inventory record for the variant
    await db.inventory.create({
      product_variant_id: result.data.id,
      quantity: variantData.stock_quantity || 0,
      reserved: 0
    });

    logger.info(`Created variant for product: ${productId}`, { 
      userId: req.userId, 
      variantId: result.data.id 
    });

    res.status(201).json({
      success: true,
      data: result.data,
      message: 'Variant created successfully'
    } as ApiResponse<ProductVariant>);

  } catch (error) {
    logger.error('Error creating variant:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create variant'
    } as ApiResponse);
  }
});

/**
 * PUT /api/products/:productId/variants/:variantId
 * Update product variant (Admin only)
 */
router.put('/:productId/variants/:variantId', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { productId, variantId } = req.params;
    const updateData = req.body;

    if (!dbUtils.isValidUUID(productId) || !dbUtils.isValidUUID(variantId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Product ID and Variant ID must be valid UUIDs'
      } as ApiResponse);
    }

    // Check if variant exists and belongs to the product
    const existingVariant = await db.productVariants.findById(variantId);
    if (existingVariant.error || !existingVariant.data || existingVariant.data.product_id !== productId) {
      return res.status(404).json({
        success: false,
        error: 'Variant not found',
        message: 'The requested variant does not exist'
      } as ApiResponse);
    }

    // Check SKU uniqueness if being updated
    if (updateData.sku && updateData.sku !== existingVariant.data.sku) {
      const existingSku = await db.productVariants.find({
        filters: { sku: updateData.sku }
      });

      if (existingSku.data && existingSku.data.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'SKU already exists',
          message: 'A variant with this SKU already exists'
        } as ApiResponse);
      }
    }

    // If setting as default, unset other default variants
    if (updateData.is_default && !existingVariant.data.is_default) {
      await db.productVariants.updateWhere(
        { product_id: productId, is_default: true },
        { is_default: false }
      );
    }

    // Update variant
    const result = await db.productVariants.updateById(variantId, updateData);

    if (result.error || !result.data) {
      logger.error('Failed to update variant:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update variant',
        message: result.error
      } as ApiResponse);
    }

    // Update inventory if stock quantity changed
    if (updateData.stock_quantity !== undefined) {
      await db.inventory.updateWhere(
        { product_variant_id: variantId },
        { quantity: updateData.stock_quantity }
      );
    }

    logger.info(`Updated variant: ${variantId}`, { userId: req.userId });

    res.json({
      success: true,
      data: result.data,
      message: 'Variant updated successfully'
    } as ApiResponse<ProductVariant>);

  } catch (error) {
    logger.error('Error updating variant:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update variant'
    } as ApiResponse);
  }
});

/**
 * DELETE /api/products/:productId/variants/:variantId
 * Delete product variant (Admin only)
 */
router.delete('/:productId/variants/:variantId', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { productId, variantId } = req.params;

    if (!dbUtils.isValidUUID(productId) || !dbUtils.isValidUUID(variantId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Product ID and Variant ID must be valid UUIDs'
      } as ApiResponse);
    }

    // Check if variant exists and belongs to the product
    const existingVariant = await db.productVariants.findById(variantId);
    if (existingVariant.error || !existingVariant.data || existingVariant.data.product_id !== productId) {
      return res.status(404).json({
        success: false,
        error: 'Variant not found',
        message: 'The requested variant does not exist'
      } as ApiResponse);
    }

    // Check if this is the last variant
    const variants = await db.productVariants.find({
      filters: { product_id: productId }
    });

    if (variants.data && variants.data.length <= 1) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete last variant',
        message: 'A product must have at least one variant'
      } as ApiResponse);
    }

    // Check if variant is referenced in orders or cart items
    const orderItems = await db.orderItems.find({
      filters: { product_variant_id: variantId }
    });

    const cartItems = await db.cartItems.find({
      filters: { product_variant_id: variantId }
    });

    if ((orderItems.data && orderItems.data.length > 0) || (cartItems.data && cartItems.data.length > 0)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete variant',
        message: 'This variant is referenced in orders or cart items'
      } as ApiResponse);
    }

    const wasDefault = existingVariant.data.is_default;

    // Delete variant (inventory will be cascade deleted)
    const result = await db.productVariants.deleteById(variantId);

    if (result.error) {
      logger.error('Failed to delete variant:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete variant',
        message: result.error
      } as ApiResponse);
    }

    // If deleted variant was default, set another variant as default
    if (wasDefault) {
      const remainingVariants = await db.productVariants.find({
        filters: { product_id: productId },
        orderBy: [{ column: 'created_at', ascending: true }],
        limit: 1
      });

      if (remainingVariants.data && remainingVariants.data.length > 0) {
        await db.productVariants.updateById(remainingVariants.data[0].id, {
          is_default: true
        });
      }
    }

    logger.info(`Deleted variant: ${variantId}`, { userId: req.userId });

    res.json({
      success: true,
      message: 'Variant deleted successfully'
    } as ApiResponse);

  } catch (error) {
    logger.error('Error deleting variant:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete variant'
    } as ApiResponse);
  }
});

/**
 * PUT /api/products/:productId/variants/:variantId/stock
 * Update variant stock quantity (Admin only)
 */
router.put('/:productId/variants/:variantId/stock', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { productId, variantId } = req.params;
    const { quantity, reserved = 0 } = req.body;

    if (!dbUtils.isValidUUID(productId) || !dbUtils.isValidUUID(variantId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Product ID and Variant ID must be valid UUIDs'
      } as ApiResponse);
    }

    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quantity',
        message: 'Quantity must be a non-negative number'
      } as ApiResponse);
    }

    if (typeof reserved !== 'number' || reserved < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reserved quantity',
        message: 'Reserved quantity must be a non-negative number'
      } as ApiResponse);
    }

    // Check if variant exists and belongs to the product
    const existingVariant = await db.productVariants.findById(variantId);
    if (existingVariant.error || !existingVariant.data || existingVariant.data.product_id !== productId) {
      return res.status(404).json({
        success: false,
        error: 'Variant not found',
        message: 'The requested variant does not exist'
      } as ApiResponse);
    }

    // Update variant stock quantity
    const variantResult = await db.productVariants.updateById(variantId, {
      stock_quantity: quantity
    });

    if (variantResult.error) {
      logger.error('Failed to update variant stock:', variantResult.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update stock',
        message: variantResult.error
      } as ApiResponse);
    }

    // Update or create inventory record
    const inventoryResult = await db.inventory.updateWhere(
      { product_variant_id: variantId },
      { quantity, reserved }
    );

    // If no inventory record was updated, create one
    if (inventoryResult.data && inventoryResult.data.length === 0) {
      await db.inventory.create({
        product_variant_id: variantId,
        quantity,
        reserved
      });
    }

    logger.info(`Updated stock for variant: ${variantId}`, { 
      userId: req.userId, 
      quantity, 
      reserved 
    });

    res.json({
      success: true,
      data: {
        variant_id: variantId,
        quantity,
        reserved,
        available: quantity - reserved
      },
      message: 'Stock updated successfully'
    } as ApiResponse);

  } catch (error) {
    logger.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update stock'
    } as ApiResponse);
  }
});

/**
 * GET /api/products/:productId/variants/:variantId/stock
 * Get variant stock information
 */
router.get('/:productId/variants/:variantId/stock', async (req: Request, res: Response) => {
  try {
    const { productId, variantId } = req.params;

    if (!dbUtils.isValidUUID(productId) || !dbUtils.isValidUUID(variantId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Product ID and Variant ID must be valid UUIDs'
      } as ApiResponse);
    }

    // Check if variant exists and is accessible
    const variant = await db.productVariants.findById(variantId);
    if (variant.error || !variant.data || variant.data.product_id !== productId) {
      return res.status(404).json({
        success: false,
        error: 'Variant not found',
        message: 'The requested variant does not exist'
      } as ApiResponse);
    }

    // Check product accessibility
    const product = await db.products.findById(productId);
    if (product.data?.status !== 'active' && !req.isAdmin) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'The requested product does not exist'
      } as ApiResponse);
    }

    // Get inventory information
    const inventory = await db.inventory.find({
      filters: { product_variant_id: variantId }
    });

    const inventoryData = inventory.data?.[0] || { quantity: 0, reserved: 0 };

    res.json({
      success: true,
      data: {
        variant_id: variantId,
        quantity: inventoryData.quantity,
        reserved: inventoryData.reserved,
        available: inventoryData.quantity - inventoryData.reserved,
        in_stock: (inventoryData.quantity - inventoryData.reserved) > 0
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error fetching stock:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch stock information'
    } as ApiResponse);
  }
});

export default router;