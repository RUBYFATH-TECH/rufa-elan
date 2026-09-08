/**
 * Product Images API routes for RUFA ELAN e-commerce application
 * Handles CRUD operations for product images
 */

import express from 'express';
import { Request, Response } from 'express';
import { db, dbUtils } from '../utils/database';
import { requireAdmin, rateLimitMiddleware } from '../middleware/database';
import { logger } from '../utils/logger';
import { ProductImage, ApiResponse } from '../types/database';

const router = express.Router();

// Rate limiting for product images API
const imagesRateLimit = rateLimitMiddleware({
  maxRequests: 30,
  windowMs: 15 * 60 * 1000 // 15 minutes
});

router.use(imagesRateLimit);

/**
 * GET /api/products/:productId/images
 * Get all images for a product
 */
router.get('/:productId/images', async (req: Request, res: Response) => {
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

    // Get product images
    const result = await db.productImages.find({
      filters: { product_id: productId },
      orderBy: [
        { column: 'is_primary', ascending: false },
        { column: 'position', ascending: true },
        { column: 'created_at', ascending: true }
      ]
    });

    if (result.error) {
      logger.error('Failed to fetch product images:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch images',
        message: result.error
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: result.data || []
    } as ApiResponse<ProductImage[]>);

  } catch (error) {
    logger.error('Error fetching product images:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch images'
    } as ApiResponse);
  }
});

/**
 * POST /api/products/:productId/images
 * Add new image to product (Admin only)
 */
router.post('/:productId/images', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const imageData = req.body;

    if (!dbUtils.isValidUUID(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
        message: 'Product ID must be a valid UUID'
      } as ApiResponse);
    }

    // Validate required fields
    if (!imageData.url) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Image URL is required'
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

    // Get current images count for positioning
    const existingImages = await db.productImages.find({
      filters: { product_id: productId }
    });

    const imageCount = existingImages.data?.length || 0;

    // If this is set as primary, unset other primary images
    if (imageData.is_primary) {
      await db.productImages.updateWhere(
        { product_id: productId, is_primary: true },
        { is_primary: false }
      );
    }

    // Create image
    const result = await db.productImages.create({
      ...imageData,
      product_id: productId,
      position: imageData.position !== undefined ? imageData.position : imageCount,
      is_primary: imageCount === 0 ? true : (imageData.is_primary || false)
    });

    if (result.error || !result.data) {
      logger.error('Failed to create product image:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to add image',
        message: result.error
      } as ApiResponse);
    }

    logger.info(`Added image to product: ${productId}`, { 
      userId: req.userId, 
      imageId: result.data.id 
    });

    res.status(201).json({
      success: true,
      data: result.data,
      message: 'Image added successfully'
    } as ApiResponse<ProductImage>);

  } catch (error) {
    logger.error('Error adding product image:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to add image'
    } as ApiResponse);
  }
});

/**
 * PUT /api/products/:productId/images/:imageId
 * Update product image (Admin only)
 */
router.put('/:productId/images/:imageId', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { productId, imageId } = req.params;
    const updateData = req.body;

    if (!dbUtils.isValidUUID(productId) || !dbUtils.isValidUUID(imageId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Product ID and Image ID must be valid UUIDs'
      } as ApiResponse);
    }

    // Check if image exists and belongs to the product
    const existingImage = await db.productImages.findById(imageId);
    if (existingImage.error || !existingImage.data || existingImage.data.product_id !== productId) {
      return res.status(404).json({
        success: false,
        error: 'Image not found',
        message: 'The requested image does not exist'
      } as ApiResponse);
    }

    // If setting as primary, unset other primary images
    if (updateData.is_primary && !existingImage.data.is_primary) {
      await db.productImages.updateWhere(
        { product_id: productId, is_primary: true },
        { is_primary: false }
      );
    }

    // Update image
    const result = await db.productImages.updateById(imageId, updateData);

    if (result.error || !result.data) {
      logger.error('Failed to update product image:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update image',
        message: result.error
      } as ApiResponse);
    }

    logger.info(`Updated product image: ${imageId}`, { userId: req.userId });

    res.json({
      success: true,
      data: result.data,
      message: 'Image updated successfully'
    } as ApiResponse<ProductImage>);

  } catch (error) {
    logger.error('Error updating product image:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update image'
    } as ApiResponse);
  }
});

/**
 * DELETE /api/products/:productId/images/:imageId
 * Delete product image (Admin only)
 */
router.delete('/:productId/images/:imageId', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { productId, imageId } = req.params;

    if (!dbUtils.isValidUUID(productId) || !dbUtils.isValidUUID(imageId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Product ID and Image ID must be valid UUIDs'
      } as ApiResponse);
    }

    // Check if image exists and belongs to the product
    const existingImage = await db.productImages.findById(imageId);
    if (existingImage.error || !existingImage.data || existingImage.data.product_id !== productId) {
      return res.status(404).json({
        success: false,
        error: 'Image not found',
        message: 'The requested image does not exist'
      } as ApiResponse);
    }

    const wasPrimary = existingImage.data.is_primary;

    // Delete image
    const result = await db.productImages.deleteById(imageId);

    if (result.error) {
      logger.error('Failed to delete product image:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete image',
        message: result.error
      } as ApiResponse);
    }

    // If deleted image was primary, set another image as primary
    if (wasPrimary) {
      const remainingImages = await db.productImages.find({
        filters: { product_id: productId },
        orderBy: [{ column: 'position', ascending: true }],
        limit: 1
      });

      if (remainingImages.data && remainingImages.data.length > 0) {
        await db.productImages.updateById(remainingImages.data[0].id, {
          is_primary: true
        });
      }
    }

    logger.info(`Deleted product image: ${imageId}`, { userId: req.userId });

    res.json({
      success: true,
      message: 'Image deleted successfully'
    } as ApiResponse);

  } catch (error) {
    logger.error('Error deleting product image:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete image'
    } as ApiResponse);
  }
});

/**
 * PUT /api/products/:productId/images/:imageId/primary
 * Set image as primary (Admin only)
 */
router.put('/:productId/images/:imageId/primary', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { productId, imageId } = req.params;

    if (!dbUtils.isValidUUID(productId) || !dbUtils.isValidUUID(imageId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'Product ID and Image ID must be valid UUIDs'
      } as ApiResponse);
    }

    // Check if image exists and belongs to the product
    const existingImage = await db.productImages.findById(imageId);
    if (existingImage.error || !existingImage.data || existingImage.data.product_id !== productId) {
      return res.status(404).json({
        success: false,
        error: 'Image not found',
        message: 'The requested image does not exist'
      } as ApiResponse);
    }

    if (existingImage.data.is_primary) {
      return res.json({
        success: true,
        data: existingImage.data,
        message: 'Image is already primary'
      } as ApiResponse<ProductImage>);
    }

    // Unset current primary image
    await db.productImages.updateWhere(
      { product_id: productId, is_primary: true },
      { is_primary: false }
    );

    // Set new primary image
    const result = await db.productImages.updateById(imageId, {
      is_primary: true
    });

    if (result.error || !result.data) {
      logger.error('Failed to set primary image:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to set primary image',
        message: result.error
      } as ApiResponse);
    }

    logger.info(`Set primary image: ${imageId} for product: ${productId}`, { 
      userId: req.userId 
    });

    res.json({
      success: true,
      data: result.data,
      message: 'Primary image updated successfully'
    } as ApiResponse<ProductImage>);

  } catch (error) {
    logger.error('Error setting primary image:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to set primary image'
    } as ApiResponse);
  }
});

/**
 * PUT /api/products/:productId/images/reorder
 * Reorder product images (Admin only)
 */
router.put('/:productId/images/reorder', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { imageIds } = req.body; // Array of image IDs in new order

    if (!dbUtils.isValidUUID(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
        message: 'Product ID must be a valid UUID'
      } as ApiResponse);
    }

    if (!Array.isArray(imageIds)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data',
        message: 'imageIds must be an array'
      } as ApiResponse);
    }

    // Validate all image IDs belong to the product
    const existingImages = await db.productImages.find({
      filters: { product_id: productId }
    });

    if (existingImages.error || !existingImages.data) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'The requested product does not exist'
      } as ApiResponse);
    }

    const existingImageIds = existingImages.data.map(img => img.id);
    const invalidIds = imageIds.filter(id => !existingImageIds.includes(id));

    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image IDs',
        message: 'Some image IDs do not belong to this product'
      } as ApiResponse);
    }

    // Update positions
    const updatePromises = imageIds.map((imageId: string, index: number) =>
      db.productImages.updateById(imageId, { position: index })
    );

    await Promise.all(updatePromises);

    // Fetch updated images
    const updatedImages = await db.productImages.find({
      filters: { product_id: productId },
      orderBy: [{ column: 'position', ascending: true }]
    });

    logger.info(`Reordered images for product: ${productId}`, { userId: req.userId });

    res.json({
      success: true,
      data: updatedImages.data || [],
      message: 'Images reordered successfully'
    } as ApiResponse<ProductImage[]>);

  } catch (error) {
    logger.error('Error reordering images:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to reorder images'
    } as ApiResponse);
  }
});

export default router;