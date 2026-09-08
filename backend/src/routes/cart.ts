/**
 * Shopping Cart API routes for RUFA ELAN e-commerce application
 * Handles cart operations for authenticated users and guest sessions
 */

import express from 'express';
import { Request, Response } from 'express';
import { db, dbUtils } from '../utils/database';
import { rateLimitMiddleware } from '../middleware/database';
import { logger } from '../utils/logger';
import { CartItem, ApiResponse } from '../types/database';

const router = express.Router();

// Rate limiting for cart API
const cartRateLimit = rateLimitMiddleware({
  maxRequests: 50,
  windowMs: 15 * 60 * 1000 // 15 minutes
});

router.use(cartRateLimit);

/**
 * Get cart identifier (user_id or session_id)
 */
function getCartIdentifier(req: Request): { user_id?: string; session_id?: string } {
  if (req.userId) {
    return { user_id: req.userId };
  }
  
  const sessionId = req.headers['x-session-id'] as string;
  if (sessionId) {
    return { session_id: sessionId };
  }

  return {};
}

/**
 * GET /api/cart
 * Get current cart items
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const cartIdentifier = getCartIdentifier(req);

    if (!cartIdentifier.user_id && !cartIdentifier.session_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing cart identifier',
        message: 'Either authenticate or provide x-session-id header'
      } as ApiResponse);
    }

    // Get cart items with product details
    const { data, error } = await req.db!
      .from('cart_items')
      .select(`
        *,
        product_variant:product_variant_id(
          id, name, value, price,
          product:product_id(id, name, slug, category_id)
        )
      `)
      .or(`user_id.eq.${cartIdentifier.user_id || 'null'},session_id.eq.${cartIdentifier.session_id || 'null'}`)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch cart items:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch cart',
        message: error.message
      } as ApiResponse);
    }

    // Calculate totals
    let subtotal = 0;
    let itemCount = 0;

    const items = (data || []).map(item => {
      const price = item.product_variant?.price || 0;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      itemCount += item.quantity;

      return {
        ...item,
        item_total: itemTotal
      };
    });

    logger.info(`Fetched cart with ${items.length} items`, {
      userId: req.userId,
      sessionId: cartIdentifier.session_id
    });

    res.json({
      success: true,
      data: items,
      summary: {
        item_count: itemCount,
        subtotal,
        currency: 'GHS'
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch cart'
    } as ApiResponse);
  }
});

/**
 * POST /api/cart/items
 * Add item to cart
 */
router.post('/items', async (req: Request, res: Response) => {
  try {
    const cartIdentifier = getCartIdentifier(req);
    const { product_variant_id, quantity = 1 } = req.body;

    if (!cartIdentifier.user_id && !cartIdentifier.session_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing cart identifier',
        message: 'Either authenticate or provide x-session-id header'
      } as ApiResponse);
    }

    if (!dbUtils.isValidUUID(product_variant_id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product variant ID',
        message: 'Product variant ID must be a valid UUID'
      } as ApiResponse);
    }

    if (typeof quantity !== 'number' || quantity < 1 || quantity > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quantity',
        message: 'Quantity must be between 1 and 1000'
      } as ApiResponse);
    }

    // Verify variant exists and has stock
    const variant = await db.productVariants.findById(product_variant_id);
    if (variant.error || !variant.data) {
      return res.status(404).json({
        success: false,
        error: 'Product variant not found',
        message: 'The requested variant does not exist'
      } as ApiResponse);
    }

    if (variant.data.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock',
        message: `Only ${variant.data.stock_quantity} units available`
      } as ApiResponse);
    }

    // Check if item already in cart
    const existingItem = await db.cartItems.find({
      filters: {
        product_variant_id,
        ...cartIdentifier
      }
    });

    let result;

    if (existingItem.data && existingItem.data.length > 0) {
      // Update quantity
      const newQuantity = existingItem.data[0].quantity + quantity;
      
      if (newQuantity > variant.data.stock_quantity) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient stock',
          message: `Only ${variant.data.stock_quantity} units available`
        } as ApiResponse);
      }

      result = await db.cartItems.updateById(existingItem.data[0].id, {
        quantity: newQuantity
      });
    } else {
      // Create new cart item
      result = await db.cartItems.create({
        ...cartIdentifier,
        product_variant_id,
        quantity
      });
    }

    if (result.error || !result.data) {
      logger.error('Failed to add to cart:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to add item to cart',
        message: result.error
      } as ApiResponse);
    }

    logger.info(`Added to cart: ${product_variant_id}`, {
      userId: req.userId,
      quantity
    });

    res.status(201).json({
      success: true,
      data: result.data,
      message: 'Item added to cart'
    } as ApiResponse<CartItem>);

  } catch (error) {
    logger.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to add item to cart'
    } as ApiResponse);
  }
});

/**
 * PUT /api/cart/items/:itemId
 * Update cart item quantity
 */
router.put('/items/:itemId', async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const cartIdentifier = getCartIdentifier(req);

    if (!dbUtils.isValidUUID(itemId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid item ID',
        message: 'Item ID must be a valid UUID'
      } as ApiResponse);
    }

    if (typeof quantity !== 'number' || quantity < 0 || quantity > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quantity',
        message: 'Quantity must be between 0 and 1000'
      } as ApiResponse);
    }

    // Get cart item
    const cartItem = await db.cartItems.findById(itemId);
    if (cartItem.error || !cartItem.data) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found',
        message: 'The requested cart item does not exist'
      } as ApiResponse);
    }

    // Check cart ownership
    const ownsItem = (cartIdentifier.user_id && cartItem.data.user_id === cartIdentifier.user_id) ||
                     (cartIdentifier.session_id && cartItem.data.session_id === cartIdentifier.session_id);

    if (!ownsItem) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'You do not have access to this cart item'
      } as ApiResponse);
    }

    // If quantity is 0, delete the item
    if (quantity === 0) {
      await db.cartItems.deleteById(itemId);
      logger.info(`Removed from cart: ${itemId}`, { userId: req.userId });
      return res.json({
        success: true,
        message: 'Item removed from cart'
      } as ApiResponse);
    }

    // Verify stock availability
    const variant = await db.productVariants.findById(cartItem.data.product_variant_id);
    if (variant.data && variant.data.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock',
        message: `Only ${variant.data.stock_quantity} units available`
      } as ApiResponse);
    }

    // Update quantity
    const result = await db.cartItems.updateById(itemId, { quantity });

    if (result.error || !result.data) {
      logger.error('Failed to update cart item:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update cart item',
        message: result.error
      } as ApiResponse);
    }

    logger.info(`Updated cart item: ${itemId}`, { userId: req.userId, quantity });

    res.json({
      success: true,
      data: result.data,
      message: 'Cart item updated'
    } as ApiResponse<CartItem>);

  } catch (error) {
    logger.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update cart item'
    } as ApiResponse);
  }
});

/**
 * DELETE /api/cart/items/:itemId
 * Remove item from cart
 */
router.delete('/items/:itemId', async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const cartIdentifier = getCartIdentifier(req);

    if (!dbUtils.isValidUUID(itemId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid item ID',
        message: 'Item ID must be a valid UUID'
      } as ApiResponse);
    }

    // Get cart item
    const cartItem = await db.cartItems.findById(itemId);
    if (cartItem.error || !cartItem.data) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found',
        message: 'The requested cart item does not exist'
      } as ApiResponse);
    }

    // Check cart ownership
    const ownsItem = (cartIdentifier.user_id && cartItem.data.user_id === cartIdentifier.user_id) ||
                     (cartIdentifier.session_id && cartItem.data.session_id === cartIdentifier.session_id);

    if (!ownsItem) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'You do not have access to this cart item'
      } as ApiResponse);
    }

    // Delete item
    const result = await db.cartItems.deleteById(itemId);

    if (result.error) {
      logger.error('Failed to remove from cart:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to remove item from cart',
        message: result.error
      } as ApiResponse);
    }

    logger.info(`Removed from cart: ${itemId}`, { userId: req.userId });

    res.json({
      success: true,
      message: 'Item removed from cart'
    } as ApiResponse);

  } catch (error) {
    logger.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to remove item from cart'
    } as ApiResponse);
  }
});

/**
 * DELETE /api/cart
 * Clear entire cart
 */
router.delete('/', async (req: Request, res: Response) => {
  try {
    const cartIdentifier = getCartIdentifier(req);

    if (!cartIdentifier.user_id && !cartIdentifier.session_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing cart identifier',
        message: 'Either authenticate or provide x-session-id header'
      } as ApiResponse);
    }

    // Delete all cart items for this user/session
    const result = await db.cartItems.deleteWhere(cartIdentifier);

    if (result.error) {
      logger.error('Failed to clear cart:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to clear cart',
        message: result.error
      } as ApiResponse);
    }

    logger.info('Cleared cart', { userId: req.userId });

    res.json({
      success: true,
      message: 'Cart cleared'
    } as ApiResponse);

  } catch (error) {
    logger.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to clear cart'
    } as ApiResponse);
  }
});

export default router;