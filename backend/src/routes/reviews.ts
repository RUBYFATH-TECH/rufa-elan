/**
 * Reviews API Routes
 * Handles product reviews and ratings
 */

import { Router, Request, Response } from 'express';
import { db, dbUtils } from '../utils/database';
import { requireAuth, requireAdmin } from '../middleware/database';
import { logger } from '../utils/logger';
import {
  ApiResponse,
  PaginatedResponse,
} from '../types/database';

const router = Router();

/**
 * GET /reviews
 * Get all reviews with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      product_id,
      user_id,
      order_id,
      status = 'published',
      rating,
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = req.query as any;

    const filters: Record<string, any> = {};
    
    if (product_id) filters.product_id = product_id;
    if (user_id) filters.user_id = user_id;
    if (order_id) filters.order_id = order_id;
    if (status) filters.status = status;
    if (rating) filters.rating = parseInt(rating);

    // Use the view for better performance and user data
    const { data, error, count } = await req.db!
      .from('product_reviews_with_users')
      .select('*', { count: 'exact' })
      .match(filters)
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range(
        dbUtils.calculateOffset(parseInt(page), parseInt(limit)),
        dbUtils.calculateOffset(parseInt(page), parseInt(limit)) + parseInt(limit) - 1
      );

    if (error) {
      logger.error('Failed to fetch reviews:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch reviews',
        message: error.message,
      } as ApiResponse);
    }

    const pagination = dbUtils.calculatePagination(
      count || 0,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: data || [],
      pagination,
    });
  } catch (error) {
    logger.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch reviews',
    } as ApiResponse);
  }
});

/**
 * GET /reviews/product/:productId
 * Get all reviews for a specific product with aggregated statistics
 */
router.get('/product/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'recent' } = req.query as any;

    if (!dbUtils.isValidUUID(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
      } as ApiResponse);
    }

    // Get reviews with user information
    let query = req.db!
      .from('product_reviews_with_users')
      .select('*', { count: 'exact' })
      .eq('product_id', productId);

    // Apply sorting
    if (sort === 'recent') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'helpful') {
      query = query.order('helpful_count', { ascending: false });
    } else if (sort === 'rating_high') {
      query = query.order('rating', { ascending: false });
    } else if (sort === 'rating_low') {
      query = query.order('rating', { ascending: true });
    }

    const { data: reviews, error: reviewsError, count } = await query
      .range(
        dbUtils.calculateOffset(parseInt(page), parseInt(limit)),
        dbUtils.calculateOffset(parseInt(page), parseInt(limit)) + parseInt(limit) - 1
      );

    if (reviewsError) {
      logger.error('Failed to fetch product reviews:', reviewsError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch reviews',
      } as ApiResponse);
    }

    // Get rating distribution
    const { data: ratingStats, error: statsError } = await req.db!
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('status', 'published');

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (!statsError && ratingStats) {
      ratingStats.forEach((r: any) => {
        ratingDistribution[r.rating as keyof typeof ratingDistribution]++;
      });
    }

    // Get product rating info
    const { data: product } = await req.db!
      .from('products')
      .select('avg_rating, review_count')
      .eq('id', productId)
      .single();

    const pagination = dbUtils.calculatePagination(
      count || 0,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: {
        reviews: reviews || [],
        statistics: {
          average_rating: product?.avg_rating || 0,
          total_reviews: product?.review_count || 0,
          rating_distribution: ratingDistribution,
        },
      },
      pagination,
    });
  } catch (error) {
    logger.error('Error fetching product reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

/**
 * GET /reviews/order/:orderId/items
 * Get reviewable items from a specific order
 */
router.get('/order/:orderId/items', requireAuth, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!dbUtils.isValidUUID(orderId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID',
      } as ApiResponse);
    }

    // Verify order belongs to user
    const { data: order, error: orderError } = await req.db!
      .from('orders')
      .select('user_id, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      } as ApiResponse);
    }

    if (!req.isAdmin && order.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      } as ApiResponse);
    }

    // Get reviewable items
    const { data: items, error: itemsError } = await req.db!
      .from('reviewable_order_items')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', req.userId);

    if (itemsError) {
      logger.error('Failed to fetch reviewable items:', itemsError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch reviewable items',
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: items || [],
    });
  } catch (error) {
    logger.error('Error fetching reviewable items:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

/**
 * GET /reviews/user/reviewable
 * Get all reviewable items for the authenticated user
 */
router.get('/user/reviewable', requireAuth, async (req: Request, res: Response) => {
  try {
    const { data: items, error } = await req.db!
      .from('reviewable_order_items')
      .select('*')
      .eq('user_id', req.userId)
      .eq('already_reviewed', false)
      .order('delivered_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch reviewable items:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch reviewable items',
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: items || [],
    });
  } catch (error) {
    logger.error('Error fetching reviewable items:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

/**
 * GET /reviews/:id
 * Get a single review by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid review ID',
      } as ApiResponse);
    }

    const { data, error } = await req.db!
      .from('product_reviews_with_users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      } as ApiResponse);
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error fetching review:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

/**
 * POST /reviews
 * Create a new review
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
      const {
        product_id,
        order_id,
        order_item_id,
        rating,
        title,
        comment,
        images,
      } = req.body;

    // Validate required fields
    if (!product_id || !rating) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'product_id and rating are required',
      } as ApiResponse);
    }

    if (!dbUtils.isValidUUID(product_id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
      } as ApiResponse);
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rating',
        message: 'Rating must be between 1 and 5',
      } as ApiResponse);
    }

    // Check if user has already reviewed this product
    const { data: existingReview } = await req.db!
      .from('reviews')
      .select('id')
      .eq('product_id', product_id)
      .eq('user_id', req.userId)
      .single();

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'Review already exists',
        message: 'You have already reviewed this product',
      } as ApiResponse);
    }

    // Verify user purchased this product
    const { data: canReview } = await req.db!
      .rpc('user_can_review_product', {
        p_user_id: req.userId,
        p_product_id: product_id,
      });

    if (!canReview) {
      return res.status(403).json({
        success: false,
        error: 'Cannot review product',
        message: 'You can only review products you have purchased',
      } as ApiResponse);
    }

    // Create review
    const { data: review, error: createError } = await req.db!
      .from('reviews')
      .insert({
        product_id,
        user_id: req.userId,
        order_id: order_id || null,
        order_item_id: order_item_id || null,
        rating,
        title: title || null,
        body: comment || null,  // Map comment to body column
        images: images || null,
        status: 'published',
      })
      .select()
      .single();

    if (createError || !review) {
      logger.error('Failed to create review:', createError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create review',
        message: createError?.message,
      } as ApiResponse);
    }

    logger.info(`Review created: ${review.id}`, {
      userId: req.userId,
      productId: product_id,
      rating,
    });

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review created successfully',
    });
  } catch (error) {
    logger.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

/**
 * PUT /reviews/:id
 * Update a review
 */
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, images } = req.body;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid review ID',
      } as ApiResponse);
    }

    // Verify review exists and belongs to user
    const { data: existingReview, error: fetchError } = await req.db!
      .from('reviews')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingReview) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      } as ApiResponse);
    }

    if (!req.isAdmin && existingReview.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      } as ApiResponse);
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rating',
        message: 'Rating must be between 1 and 5',
      } as ApiResponse);
    }

    // Update review
    const updateData: any = { updated_at: new Date().toISOString() };
    if (rating !== undefined) updateData.rating = rating;
    if (title !== undefined) updateData.title = title;
    if (comment !== undefined) updateData.body = comment;  // Map comment to body column
    if (images !== undefined) updateData.images = images;

    const { data: review, error: updateError } = await req.db!
      .from('reviews')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError || !review) {
      logger.error('Failed to update review:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update review',
      } as ApiResponse);
    }

    logger.info(`Review updated: ${id}`, { userId: req.userId });

    res.json({
      success: true,
      data: review,
      message: 'Review updated successfully',
    });
  } catch (error) {
    logger.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

/**
 * DELETE /reviews/:id
 * Delete a review
 */
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid review ID',
      } as ApiResponse);
    }

    // Verify review exists and belongs to user
    const { data: existingReview, error: fetchError } = await req.db!
      .from('reviews')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingReview) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      } as ApiResponse);
    }

    if (!req.isAdmin && existingReview.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      } as ApiResponse);
    }

    // Delete review
    const { error: deleteError } = await req.db!
      .from('reviews')
      .delete()
      .eq('id', id);

    if (deleteError) {
      logger.error('Failed to delete review:', deleteError);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete review',
      } as ApiResponse);
    }

    logger.info(`Review deleted: ${id}`, { userId: req.userId });

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

/**
 * PUT /reviews/:id/helpful
 * Mark a review as helpful (increment helpful count)
 */
router.put('/:id/helpful', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid review ID',
      } as ApiResponse);
    }

    // Increment helpful count
    const { data: review, error } = await req.db!
      .from('reviews')
      .update({ helpful_count: req.db!.raw('helpful_count + 1') })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to mark review as helpful:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update review',
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: review,
      message: 'Marked as helpful',
    });
  } catch (error) {
    logger.error('Error marking review as helpful:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

/**
 * PUT /reviews/:id/moderate
 * Moderate a review (Admin only)
 */
router.put('/:id/moderate', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid review ID',
      } as ApiResponse);
    }

    if (!status || !['pending', 'published', 'rejected', 'flagged'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        message: 'Status must be one of: pending, published, rejected, flagged',
      } as ApiResponse);
    }

    const { data: review, error } = await req.db!
      .from('reviews')
      .update({
        status,
        moderated_by: req.userId,
        moderated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !review) {
      logger.error('Failed to moderate review:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to moderate review',
      } as ApiResponse);
    }

    logger.info(`Review moderated: ${id}`, {
      userId: req.userId,
      status,
    });

    res.json({
      success: true,
      data: review,
      message: 'Review moderated successfully',
    });
  } catch (error) {
    logger.error('Error moderating review:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

export default router;
