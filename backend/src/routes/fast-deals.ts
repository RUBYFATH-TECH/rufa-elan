/**
 * Fast Deals API routes for RUFA ELAN e-commerce application
 * Handles CRUD operations for flash sales and limited-time deals
 */

import express from 'express';
import { Request, Response } from 'express';
import { db, dbUtils } from '../utils/database';
import { requireAdmin } from '../middleware/database';
import { logger } from '../utils/logger';

const router = express.Router();

interface FastDeal {
  id: string;
  product_id: string;
  deal_price: number;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  stock_quantity: number;
  sold_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FastDealRequest {
  product_id: string;
  deal_price: number;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  stock_quantity: number;
}

/**
 * POST /api/fast-deals
 * Create a new fast deal (admin only)
 */
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { product_id, deal_price, start_date, start_time, end_date, end_time, stock_quantity } = req.body as FastDealRequest;

    // Validate required fields
    if (!product_id || !deal_price || !start_date || !start_time || !end_date || !end_time || !stock_quantity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'All fields (product_id, deal_price, start_date, start_time, end_date, end_time, stock_quantity) are required'
      });
    }

    // Validate that product exists
    const productResult = await db.products.findById(product_id, 'id, name, regular_price');
    if (!productResult.data) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: `Product with ID ${product_id} does not exist`
      });
    }

    const product = productResult.data as any;

    // Validate deal price is less than regular price
    if (deal_price >= product.regular_price) {
      return res.status(400).json({
        success: false,
        error: 'Invalid deal price',
        message: 'Deal price must be less than the regular price'
      });
    }

    // Validate stock quantity
    if (stock_quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid stock quantity',
        message: 'Stock quantity must be at least 1'
      });
    }

    // Validate dates - end must be after start
    const startDateTime = new Date(`${start_date}T${start_time}`);
    const endDateTime = new Date(`${end_date}T${end_time}`);
    
    if (endDateTime <= startDateTime) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date range',
        message: 'End date/time must be after start date/time'
      });
    }

    // Create the fast deal
    const createResult = await db.fastDeals.create({
      product_id,
      deal_price,
      start_date,
      start_time,
      end_date,
      end_time,
      stock_quantity,
      sold_quantity: 0,
      is_active: true
    } as FastDeal);

    if (createResult.error) {
      logger.error('Fast deal creation error:', createResult.error);
      throw new Error(createResult.error);
    }

    logger.info(`Fast deal created for product ${product_id}:`, createResult.data);

    res.status(201).json({
      success: true,
      data: createResult.data,
      message: `Fast deal created successfully for ${product.name}`
    });
  } catch (error) {
    logger.error('Error creating fast deal:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to create fast deal'
    });
  }
});

/**
 * GET /api/fast-deals
 * Get list of active fast deals with pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, active_only = true } = req.query as any;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    // First, try to fetch with nested products and is_in_stock
    const { data: deals, error: dealsError, count } = await db.supabase
      .from('fast_deals')
      .select('*, products(id, name, slug, regular_price, is_in_stock, avg_rating, review_count, product_images(url))', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (dealsError) {
      logger.error('Error fetching fast deals:', dealsError);
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: dealsError.message
      });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: deals || [],
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    logger.error('Error fetching fast deals:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to fetch fast deals'
    });
  }
});

/**
 * GET /api/fast-deals/:id
 * Get a single fast deal by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: deal, error } = await db.supabase
      .from('fast_deals')
      .select('*, products(id, name, slug, regular_price, is_in_stock, description, product_images(url))')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Error fetching fast deal:', error);
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: error.message
      });
    }

    if (!deal) {
      logger.error('Fast deal not found:', id);
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Fast deal not found'
      });
    }

    res.json({
      success: true,
      data: deal
    });
  } catch (error) {
    logger.error('Error fetching fast deal:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to fetch fast deal'
    });
  }
});

/**
 * PUT /api/fast-deals/:id
 * Update a fast deal (admin only)
 */
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body as Partial<FastDealRequest>;

    // Validate that deal exists
    const existing = await db.fastDeals.findById(id);
    if (!existing.data) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Fast deal not found'
      });
    }

    // Update the fast deal
    const result = await db.fastDeals.updateById(id, updateData);

    if (result.error) {
      logger.error('Error updating fast deal:', result.error);
      throw new Error(result.error);
    }

    logger.info(`Fast deal ${id} updated:`, result.data);

    res.json({
      success: true,
      data: result.data,
      message: 'Fast deal updated successfully'
    });
  } catch (error) {
    logger.error('Error updating fast deal:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to update fast deal'
    });
  }
});

/**
 * DELETE /api/fast-deals/:id
 * Delete a fast deal (admin only)
 */
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate that deal exists
    const existing = await db.fastDeals.findById(id);
    if (!existing.data) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Fast deal not found'
      });
    }

    // Delete the fast deal
    const result = await db.fastDeals.deleteById(id);

    if (result.error) {
      logger.error('Error deleting fast deal:', result.error);
      throw new Error(result.error);
    }

    logger.info(`Fast deal ${id} deleted`);

    res.json({
      success: true,
      message: 'Fast deal deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting fast deal:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to delete fast deal'
    });
  }
});

export default router;
