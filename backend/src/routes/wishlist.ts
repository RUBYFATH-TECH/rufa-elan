/**
 * Wishlist API routes for RUFA ELAN e-commerce application
 * Handles user wishlist operations
 */

import express from 'express';
import { Request, Response } from 'express';
import { db, dbUtils } from '../utils/database';
import { requireAuth, rateLimitMiddleware } from '../middleware/database';
import { logger } from '../utils/logger';
import { Wishlist, ApiResponse } from '../types/database';

const router = express.Router();

// Rate limiting for wishlist API
const wishlistRateLimit = rateLimitMiddleware({
  maxRequests: 50,
  windowMs: 15 * 60 * 1000 // 15 minutes
});

router.use(wishlistRateLimit);

/**
 * GET /api/wishlist
 * Get user's wishlist
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query as any;

    // Get wishlist items with product details
    const { data, error } = await req.db!
      .from('wishlists')
      .select(`
        *,
        product:product_id(
          id, name, slug, description, regular_price, sale_price,
          category_id, avg_rating, review_count,
          product_images(id, url, alt_text, is_primary, position),
          product_variants(id, name, value, price, stock_quantity, is_default)
        )
      `)
      .eq('user_id', req.userId)
      .order(sort_by === 'name' ? 'product.name' : sort_by, { 
        ascending: sort_order === 'asc' 
      })
      .range(
        dbUtils.calculateOffset(parseInt(page), parseInt(limit)),
        dbUtils.calculateOffset(parseInt(page), parseInt(limit)) + parseInt(limit) - 1
      );

    if (error) {
      logger.error('Failed to fetch wishlist:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch wishlist',
        message: error.message
      } as ApiResponse);
    }

    // Get total count
    const { count } = await req.db!
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.userId);

    const pagination = dbUtils.calculatePagination(
      count || 0,
      parseInt(page),
      parseInt(limit)
    );

    logger.info(`Fetched wishlist with ${data?.length || 0} items`, {
      userId: req.userId
    });

    res.json({
      success: true,
      data: data || [],
      pagination
    } as ApiResponse);

  } catch (error) {
    logger.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch wishlist'
    } as ApiResponse);
  }
});

/**
 * GET /api/wishlist/check/:productId
 * Check if product is in wishlist
 */
router.get('/check/:productId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    if (!dbUtils.isValidUUID(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
        message: 'Product ID must be a valid UUID'
      } as ApiResponse);
    }

    // Check if product is in wishlist
    const result = await db.wishlists.find({
      filters: {
        user_id: req.userId,
        product_id: productId
      }
    });

    const isInWishlist = result.data && result.data.length > 0;

    res.json({
      success: true,
      data: {
        product_id: productId,
        in_wishlist: isInWishlist,
        wishlist_id: isInWishlist ? result.data![0].id : null
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error checking wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to check wishlist'
    } as ApiResponse);
  }
});

/**
 * POST /api/wishlist/:productId
 * Add product to wishlist
 */
router.post('/:productId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    if (!dbUtils.isValidUUID(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
        message: 'Product ID must be a valid UUID'
      } as ApiResponse);
    }

    // Check if product exists and is active
    const product = await db.products.findById(productId);
    if (product.error || !product.data) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'The requested product does not exist'
      } as ApiResponse);
    }

    if (product.data.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Product unavailable',
        message: 'This product is not currently available'
      } as ApiResponse);
    }

    // Check if already in wishlist
    const existingWishlist = await db.wishlists.find({
      filters: {
        user_id: req.userId,
        product_id: productId
      }
    });

    if (existingWishlist.data && existingWishlist.data.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Already in wishlist',
        message: 'This product is already in your wishlist'
      } as ApiResponse);
    }

    // Add to wishlist
    const result = await db.wishlists.create({
      user_id: req.userId,
      product_id: productId
    });

    if (result.error || !result.data) {
      logger.error('Failed to add to wishlist:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to add to wishlist',
        message: result.error
      } as ApiResponse);
    }

    logger.info(`Added to wishlist: ${productId}`, { userId: req.userId });

    res.status(201).json({
      success: true,
      data: result.data,
      message: 'Product added to wishlist'
    } as ApiResponse<Wishlist>);

  } catch (error) {
    logger.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to add to wishlist'
    } as ApiResponse);
  }
});

/**
 * DELETE /api/wishlist/:productId
 * Remove product from wishlist
 */
router.delete('/:productId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    if (!dbUtils.isValidUUID(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
        message: 'Product ID must be a valid UUID'
      } as ApiResponse);
    }

    // Find wishlist item
    const wishlistItem = await db.wishlists.find({
      filters: {
        user_id: req.userId,
        product_id: productId
      }
    });

    if (!wishlistItem.data || wishlistItem.data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not in wishlist',
        message: 'This product is not in your wishlist'
      } as ApiResponse);
    }

    // Delete from wishlist
    const result = await db.wishlists.deleteById(wishlistItem.data[0].id);

    if (result.error) {
      logger.error('Failed to remove from wishlist:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to remove from wishlist',
        message: result.error
      } as ApiResponse);
    }

    logger.info(`Removed from wishlist: ${productId}`, { userId: req.userId });

    res.json({
      success: true,
      message: 'Product removed from wishlist'
    } as ApiResponse);

  } catch (error) {
    logger.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to remove from wishlist'
    } as ApiResponse);
  }
});

/**
 * GET /api/wishlist/stats
 * Get wishlist statistics
 */
router.get('/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    // Get wishlist count
    const { count } = await req.db!
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.userId);

    res.json({
      success: true,
      data: {
        total_items: count || 0
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error fetching wishlist stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch wishlist statistics'
    } as ApiResponse);
  }
});

export default router;