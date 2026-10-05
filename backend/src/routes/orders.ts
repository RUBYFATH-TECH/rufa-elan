/**
 * Orders API routes for RUFA ELAN e-commerce application
 * Handles CRUD operations for orders, order items, payments, and delivery tracking
 */

import express from 'express';
import { Request, Response } from 'express';
import { db, dbUtils } from '../utils/database';
import { requireAuth, requireAdmin, rateLimitMiddleware } from '../middleware/database';
import { logger } from '../utils/logger';
import { NotificationService } from '../services/notifications';
import {
  Order,
  OrderDetails,
  OrderItem,
  Payment,
  DeliveryTracking,
  PaginatedResponse,
  ApiResponse,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderFilters
} from '../types/database';

const router = express.Router();

// Rate limiting for orders API
const ordersRateLimit = rateLimitMiddleware({
  maxRequests: 30,
  windowMs: 15 * 60 * 1000 // 15 minutes
});

router.use(ordersRateLimit);

/**
 * GET /api/orders
 * Get paginated list of orders (users see their own, admins see all)
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      payment_status,
      start_date,
      end_date,
      min_amount,
      max_amount,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query as any;

    // Build filters based on user role
    const filters: Record<string, any> = {};

    if (!req.isAdmin) {
      // Non-admin users can only see their own orders
      filters.user_id = req.userId;
    }

    if (status) filters.status = status;
    if (payment_status) filters.payment_status = payment_status;

    // Build query options
    const queryOptions = {
      select: `
        *,
        order_items(
          id, product_variant_id, quantity, unit_price, total_price, product_snapshot,
          product_variants(
            id, name, value, sku,
            products(id, name, description, product_images(id, url, position))
          )
        ),
        payments(id, provider, reference, status, amount),
        delivery_tracking(id, courier_name, tracking_number, current_status, estimated_delivery_date)
      `,
      filters,
      orderBy: [{ column: sort_by, ascending: sort_order === 'asc' }],
      limit: Math.min(parseInt(limit), 100),
      offset: dbUtils.calculateOffset(parseInt(page), parseInt(limit))
    };

    const result = await db.orders.find(queryOptions);

    if (result.error) {
      logger.error('Failed to fetch orders:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch orders',
        message: result.error
      } as ApiResponse);
    }

    // Apply date and amount filters (client-side since Supabase doesn't support complex ranges easily)
    let orders = result.data || [];

    if (start_date) {
      const startDateTime = new Date(start_date).getTime();
      orders = orders.filter(o => new Date(o.created_at).getTime() >= startDateTime);
    }

    if (end_date) {
      const endDateTime = new Date(end_date).getTime();
      orders = orders.filter(o => new Date(o.created_at).getTime() <= endDateTime);
    }

    if (min_amount) {
      orders = orders.filter(o => o.total_amount >= parseFloat(min_amount));
    }

    if (max_amount) {
      orders = orders.filter(o => o.total_amount <= parseFloat(max_amount));
    }

    // Transform order_items to items for frontend compatibility and enrich with user data
    const transformedOrders = await Promise.all(orders.map(async (order) => {
      const transformed = {
        ...order,
        items: order.order_items || [],
        order_items: undefined
      };

      // Enrich with user data from auth.users
      if (order.user_id) {
        try {
          const { data: { user }, error } = await req.db!.auth.admin.getUserById(order.user_id);
          if (!error && user) {
            transformed.profiles = {
              id: user.id,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
              email: user.email || '',
              phone: user.user_metadata?.phone || ''
            };
          }
        } catch (err) {
          logger.warn(`Failed to fetch user data for order user ${order.user_id}:`, err);
        }
      }

      return transformed;
    }));

    const pagination = dbUtils.calculatePagination(
      transformedOrders.length,
      parseInt(page),
      parseInt(limit)
    );

    logger.info(`Fetched ${transformedOrders.length} orders`, {
      userId: req.userId,
      isAdmin: req.isAdmin,
      page,
      limit
    });

    res.json({
      success: true,
      data: transformedOrders,
      pagination
    } as any);

  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch orders'
    } as ApiResponse);
  }
});

/**
 * GET /api/orders/:id
 * Get single order by ID with full details
 */
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID',
        message: 'Order ID must be a valid UUID'
      } as ApiResponse);
    }

    // Fetch the order with product information required by the customer detail,
    // tracking, and invoice screens.
    // Include product_variants as fallback for orders that were created before
    // the product_snapshot field was populated.
    const { data, error } = await req.db!
      .from('orders')
      .select(`
        *,
        order_items(
          id, product_variant_id, quantity, unit_price, total_price, product_snapshot,
          product_variants(
            id, name, value, sku,
            products(id, name, description, product_images(id, url, position))
          )
        ),
        payments(id, provider, reference, status, amount),
        delivery_tracking(id, courier_name, tracking_number, current_status, estimated_delivery_date)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      logger.error('Failed to fetch order:', error);
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        message: 'The requested order does not exist'
      } as ApiResponse);
    }

    // Check authorization - users can only see their own orders
    if (!req.isAdmin && data.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'You do not have access to this order'
      } as ApiResponse);
    }

    // Transform order_items to items for frontend compatibility and enrich with user data
    let transformedData: any = {
      ...data,
      items: data.order_items || [],
      order_items: undefined
    };

    // Enrich with user data from auth.users
    if (data.user_id) {
      try {
        const { data: { user }, error } = await req.db!.auth.admin.getUserById(data.user_id);
        if (!error && user) {
          transformedData.profiles = {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            email: user.email || '',
            phone: user.user_metadata?.phone || ''
          };
        }
      } catch (err) {
        logger.warn(`Failed to fetch user data for order user ${data.user_id}:`, err);
      }
    }

    logger.info(`Fetched order: ${id}`, { userId: req.userId });

    res.json({
      success: true,
      data: transformedData
    } as ApiResponse<OrderDetails>);

  } catch (error) {
    logger.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch order'
    } as ApiResponse);
  }
});

/**
 * POST /api/orders
 * Create new order (requires authentication)
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const orderData: CreateOrderRequest = req.body;

    // Validate required fields
    if (!orderData.items || orderData.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'At least one order item is required'
      } as ApiResponse);
    }

    if (!orderData.shipping_address) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Shipping address is required'
      } as ApiResponse);
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate totals
    let subtotal = 0;
    const orderItems: OrderItem[] = [];

    // Fetch product variants and calculate pricing
    for (const item of orderData.items) {
      if (!dbUtils.isValidUUID(item.product_variant_id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid product variant ID',
          message: `Invalid variant ID: ${item.product_variant_id}`
        } as ApiResponse);
      }

      // Fetch variant with full product and image details
      const { data: variant, error: variantError } = await req.db!
        .from('product_variants')
        .select(`
          id, name, value, sku, price, stock_quantity,
          products(
            id, name, description,
            product_images(id, url, position)
          )
        `)
        .eq('id', item.product_variant_id)
        .single();

      if (variantError || !variant) {
        return res.status(400).json({
          success: false,
          error: 'Product variant not found',
          message: `Variant ${item.product_variant_id} does not exist`
        } as ApiResponse);
      }

      // Check stock availability
      if (variant.stock_quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient stock',
          message: `Variant "${variant.name}" has insufficient stock. Available: ${variant.stock_quantity}, Requested: ${item.quantity}`
        } as ApiResponse);
      }

      const unitPrice = variant.price || 0;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      // Store complete product snapshot for the order item
      const product = (variant as any).products;
      if (!product) {
        logger.error('Product relationship not found in variant', {
          productVariantId: item.product_variant_id,
          variant
        });
        return res.status(400).json({
          success: false,
          error: 'Product data missing',
          message: `Product details not found for variant ${item.product_variant_id}`
        } as ApiResponse);
      }

      const images = Array.isArray((product as any)?.product_images) ? (product as any).product_images : [];
      const primaryImage = images.find((img: any) => img.position === 1) || images[0];

      orderItems.push({
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        product_snapshot: {
          product_id: (product as any)?.id,
          product_name: (product as any)?.name,
          variant_name: variant.name,
          description: (product as any)?.description,
          sku: variant.sku,
          color: variant.value, // variant value typically contains color
          image_url: primaryImage?.url || null,
          all_images: images.map((img: any) => ({
            url: img.url,
            position: img.position
          }))
        }
      } as any);
    }

    // Apply coupon discount if provided
    let discountAmount = 0;
    if (orderData.coupon_code) {
      const coupon = await db.coupons.find({
        filters: { code: orderData.coupon_code, active: true }
      });

      if (coupon.data && coupon.data.length > 0) {
        const couponData = coupon.data[0];

        // Check coupon validity
        if (couponData.expires_at && new Date(couponData.expires_at) < new Date()) {
          return res.status(400).json({
            success: false,
            error: 'Invalid coupon',
            message: 'This coupon has expired'
          } as ApiResponse);
        }

        if (subtotal < couponData.min_purchase_amount) {
          return res.status(400).json({
            success: false,
            error: 'Invalid coupon',
            message: `Minimum purchase amount of ${couponData.min_purchase_amount} required`
          } as ApiResponse);
        }

        // Calculate discount
        if (couponData.discount_type === 'percentage') {
          discountAmount = (subtotal * couponData.discount_value) / 100;
        } else if (couponData.discount_type === 'fixed_amount') {
          discountAmount = couponData.discount_value;
        }

        if (couponData.max_discount_amount && discountAmount > couponData.max_discount_amount) {
          discountAmount = couponData.max_discount_amount;
        }
      }
    }

    // Set shipping fee
    const shippingFee = orderData.shipping_address.shipping_fee || 0;

    // Calculate totals
    const totalAmount = subtotal - discountAmount + shippingFee;

    // Create order
    const orderResult = await db.orders.create({
      user_id: req.userId,
      order_number: orderNumber,
      status: 'pending_payment',
      currency: 'GHS',
      subtotal,
      shipping_fee: shippingFee,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      shipping_address: orderData.shipping_address,
      billing_address: orderData.billing_address || orderData.shipping_address,
      items: orderItems,
      payment_status: 'unpaid',
      notes: orderData.notes || null
    });

    if (orderResult.error || !orderResult.data) {
      logger.error('Failed to create order:', orderResult.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create order',
        message: orderResult.error
      } as ApiResponse);
    }

    const orderId = orderResult.data.id;

    // Create order items with product snapshots
    for (const item of orderItems) {
      await db.orderItems.create({
        order_id: orderId,
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        product_snapshot: item.product_snapshot || null
      });

      // Deduct stock quantity for the ordered product variant
      const { data: currentVariant, error: fetchError } = await req.db!
        .from('product_variants')
        .select('stock_quantity')
        .eq('id', item.product_variant_id)
        .single();

      if (fetchError) {
        logger.error(`Failed to fetch variant stock for deduction: ${item.product_variant_id}`, fetchError);
      } else if (currentVariant) {
        const newStockQuantity = currentVariant.stock_quantity - item.quantity;
        
        const { error: updateError } = await req.db!
          .from('product_variants')
          .update({ stock_quantity: newStockQuantity })
          .eq('id', item.product_variant_id);

        if (updateError) {
          logger.error(`Failed to update stock for variant ${item.product_variant_id}:`, updateError);
        } else {
          logger.info(`Stock deducted for variant ${item.product_variant_id}: ${currentVariant.stock_quantity} -> ${newStockQuantity}`);
        }
      }
    }

    // Create delivery tracking record
    await db.deliveryTracking.create({
      order_id: orderId,
      current_status: 'pending_payment',
      estimated_delivery_date: null
    });

    // Record coupon usage if applicable
    if (orderData.coupon_code) {
      const coupon = await db.coupons.find({
        filters: { code: orderData.coupon_code }
      });

      if (coupon.data && coupon.data.length > 0) {
        await db.couponUsage.create({
          coupon_id: coupon.data[0].id,
          user_id: req.userId,
          order_id: orderId,
          discount_amount: discountAmount
        });

        // Increment coupon usage count
        const currentUsage = coupon.data[0].usage_count || 0;
        await db.coupons.updateById(coupon.data[0].id, {
          usage_count: currentUsage + 1
        });
      }
    }

    // Clear the user's cart after successful order creation
    try {
      const { error: clearCartError } = await req.db!
        .from('cart_items')
        .delete()
        .eq('user_id', req.userId);
      
      if (clearCartError) {
        logger.error(`Failed to clear cart for user ${req.userId}:`, clearCartError);
        // Don't fail the order, just log the error
      } else {
        logger.info(`Cart cleared for user ${req.userId} after order ${orderId}`);
      }
    } catch (cartError) {
      logger.error('Error clearing cart:', cartError);
      // Don't fail the order, just log the error
    }

    // Fetch complete order details
    const { data: createdOrder } = await req.db!
      .from('orders')
      .select(`
        *,
        order_items(
          id, product_variant_id, quantity, unit_price, total_price, product_snapshot
        ),
        payments(id, provider, reference, status, amount),
        delivery_tracking(id, courier_name, tracking_number, current_status, estimated_delivery_date)
      `)
      .eq('id', orderId)
      .single();

    // Transform order_items to items for frontend compatibility
    const transformedOrder = createdOrder ? {
      ...createdOrder,
      items: createdOrder.order_items || [],
      order_items: undefined
    } : null;

    logger.info(`Created order: ${orderId}`, {
      userId: req.userId,
      orderNumber,
      total: totalAmount
    });

    res.status(201).json({
      success: true,
      data: transformedOrder,
      message: 'Order created successfully'
    } as ApiResponse<OrderDetails>);

  } catch (error) {
    logger.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create order'
    } as ApiResponse);
  }
});

/**
 * PUT /api/orders/:id
 * Update order status (users can cancel, admins can update any field)
 */
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateOrderRequest = req.body;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID',
        message: 'Order ID must be a valid UUID'
      } as ApiResponse);
    }

    // Check if order exists
    const existingOrder = await db.orders.findById(id);
    if (existingOrder.error || !existingOrder.data) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        message: 'The requested order does not exist'
      } as ApiResponse);
    }

    // Check authorization
    if (!req.isAdmin && existingOrder.data.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'You do not have access to update this order'
      } as ApiResponse);
    }

    // Non-admin users can only cancel pending payment orders
    if (!req.isAdmin) {
      if (updateData.status && updateData.status !== 'cancelled') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized',
          message: 'You can only cancel your orders'
        } as ApiResponse);
      }

      if (existingOrder.data.payment_status !== 'unpaid') {
        return res.status(400).json({
          success: false,
          error: 'Cannot cancel order',
          message: 'You can only cancel orders that have not been paid'
        } as ApiResponse);
      }

      updateData.cancellation_reason = updateData.cancellation_reason || 'User cancelled order';
      (updateData as any).cancelled_at = new Date().toISOString();
    }

    // Update order
    const result = await db.orders.updateById(id, updateData);

    if (result.error || !result.data) {
      logger.error('Failed to update order:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update order',
        message: result.error
      } as ApiResponse);
    }

    // If order is cancelled, restore stock quantities
    if (updateData.status === 'cancelled' && existingOrder.data.status !== 'cancelled') {
      // Fetch order items
      const { data: orderItems, error: itemsError } = await req.db!
        .from('order_items')
        .select('product_variant_id, quantity')
        .eq('order_id', id);

      if (!itemsError && orderItems) {
        for (const item of orderItems) {
          const { data: currentVariant, error: fetchError } = await req.db!
            .from('product_variants')
            .select('stock_quantity')
            .eq('id', item.product_variant_id)
            .single();

          if (fetchError) {
            logger.error(`Failed to fetch variant stock for restoration: ${item.product_variant_id}`, fetchError);
          } else if (currentVariant) {
            const newStockQuantity = currentVariant.stock_quantity + item.quantity;
            
            const { error: updateError } = await req.db!
              .from('product_variants')
              .update({ stock_quantity: newStockQuantity })
              .eq('id', item.product_variant_id);

            if (updateError) {
              logger.error(`Failed to restore stock for variant ${item.product_variant_id}:`, updateError);
            } else {
              logger.info(`Stock restored for variant ${item.product_variant_id}: ${currentVariant.stock_quantity} -> ${newStockQuantity}`);
            }
          }
        }
      }
    }

    // Update delivery tracking status if order status changed
    if (updateData.status) {
      await db.deliveryTracking.updateWhere(
        { order_id: id },
        { current_status: updateData.status }
      );
    }

    // Send notification when order status changes to delivered
    if (updateData.status === 'delivered' && existingOrder.data.status !== 'delivered') {
      try {
        await NotificationService.notifyOrderStatus(
          existingOrder.data.user_id,
          id,
          existingOrder.data.order_number,
          'delivered',
          {
            previousStatus: existingOrder.data.status,
            updatedBy: req.userId,
            updatedAt: new Date().toISOString()
          }
        );
        logger.info(`Delivery notification sent for order ${id} to user ${existingOrder.data.user_id}`);
      } catch (notifError) {
        // Log error but don't fail the order update
        logger.error(`Failed to send delivery notification for order ${id}:`, notifError);
      }
    }

    // Fetch updated order details with product information
    const { data: updatedOrder } = await req.db!
      .from('orders')
      .select(`
        *,
        order_items(
          id, product_variant_id, quantity, unit_price, total_price, product_snapshot,
          product_variants(
            id, name, value, sku,
            products(id, name, description, product_images(id, url, position))
          )
        ),
        payments(id, provider, reference, status, amount),
        delivery_tracking(id, courier_name, tracking_number, current_status, estimated_delivery_date)
      `)
      .eq('id', id)
      .single();

    // Transform order_items to items for frontend compatibility
    const transformedOrder = updatedOrder ? {
      ...updatedOrder,
      items: updatedOrder.order_items || [],
      order_items: undefined
    } : null;

    logger.info(`Updated order: ${id}`, {
      userId: req.userId,
      changes: updateData
    });

    res.json({
      success: true,
      data: transformedOrder,
      message: 'Order updated successfully'
    } as ApiResponse<OrderDetails>);

  } catch (error) {
    logger.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update order'
    } as ApiResponse);
  }
});

/**
 * GET /api/orders/:id/items
 * Get order items
 */
router.get('/:id/items', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID',
        message: 'Order ID must be a valid UUID'
      } as ApiResponse);
    }

    // Check if order exists and user has access
    const order = await db.orders.findById(id);
    if (order.error || !order.data) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        message: 'The requested order does not exist'
      } as ApiResponse);
    }

    if (!req.isAdmin && order.data.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'You do not have access to this order'
      } as ApiResponse);
    }

    // Get order items with product details fallback
    const { data: items, error: itemsError } = await req.db!
      .from('order_items')
      .select(`
        id, product_variant_id, quantity, unit_price, total_price, product_snapshot,
        product_variants(
          id, name, value, sku,
          products(id, name, description, product_images(id, url, position))
        )
      `)
      .eq('order_id', id);

    if (itemsError) {
      logger.error('Failed to fetch order items:', itemsError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch order items',
        message: itemsError.message
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: items || []
    } as ApiResponse<OrderItem[]>);

  } catch (error) {
    logger.error('Error fetching order items:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch order items'
    } as ApiResponse);
  }
});

/**
 * GET /api/orders/:id/tracking
 * Get order delivery tracking information
 */
router.get('/:id/tracking', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID',
        message: 'Order ID must be a valid UUID'
      } as ApiResponse);
    }

    // Check if order exists and user has access
    const order = await db.orders.findById(id);
    if (order.error || !order.data) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        message: 'The requested order does not exist'
      } as ApiResponse);
    }

    if (!req.isAdmin && order.data.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'You do not have access to this order'
      } as ApiResponse);
    }

    // Get tracking information with updates
    const { data, error } = await req.db!
      .from('delivery_tracking')
      .select(`
        *,
        tracking_updates(id, status, note, timestamp)
      `)
      .eq('order_id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Tracking information not found',
        message: 'Delivery tracking information does not exist for this order'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data
    } as ApiResponse<DeliveryTracking>);

  } catch (error) {
    logger.error('Error fetching tracking information:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch tracking information'
    } as ApiResponse);
  }
});

/**
 * POST /api/orders/:id/tracking/update
 * Add tracking update (Admin only)
 */
router.post('/:id/tracking/update', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID',
        message: 'Order ID must be a valid UUID'
      } as ApiResponse);
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Status is required'
      } as ApiResponse);
    }

    // Get delivery tracking
    const tracking = await db.deliveryTracking.find({
      filters: { order_id: id }
    });

    if (tracking.error || !tracking.data || tracking.data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tracking not found',
        message: 'Delivery tracking does not exist for this order'
      } as ApiResponse);
    }

    const trackingId = tracking.data[0].id;

    // Create tracking update
    const result = await db.trackingUpdates.create({
      delivery_tracking_id: trackingId,
      status,
      note: note || null
    });

    if (result.error || !result.data) {
      logger.error('Failed to create tracking update:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to add tracking update',
        message: result.error
      } as ApiResponse);
    }

    // Update order status based on tracking status
    const statusMap: Record<string, string> = {
      'pending_payment': 'pending_payment',
      'processing': 'processing',
      'shipped': 'shipped',
      'out_for_delivery': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled',
      'returned': 'returned'
    };

    if (statusMap[status]) {
      await db.orders.updateById(id, {
        status: statusMap[status]
      });
    }

    logger.info(`Added tracking update for order: ${id}`, {
      userId: req.userId,
      status,
      note
    });

    res.status(201).json({
      success: true,
      data: result.data,
      message: 'Tracking update added successfully'
    } as ApiResponse);

  } catch (error) {
    logger.error('Error adding tracking update:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to add tracking update'
    } as ApiResponse);
  }
});

/**
 * POST /api/orders/:id/confirm-delivery
 * Confirm order delivery (user confirms they received the product)
 */
router.post('/:id/confirm-delivery', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID',
        message: 'Order ID must be a valid UUID'
      } as ApiResponse);
    }

    // Check if order exists and belongs to user
    const existingOrder = await db.orders.findById(id);
    if (existingOrder.error || !existingOrder.data) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        message: 'The requested order does not exist'
      } as ApiResponse);
    }

    if (!req.isAdmin && existingOrder.data.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'You do not have access to this order'
      } as ApiResponse);
    }

    // Check if order is in delivered status
    if (existingOrder.data.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        error: 'Cannot confirm delivery',
        message: 'Order must be in delivered status to confirm receipt'
      } as ApiResponse);
    }

    // Update order with confirmation
    const result = await db.orders.updateById(id, {
      delivery_confirmed_at: new Date().toISOString(),
      delivery_confirmed_by: req.userId
    });

    if (result.error) {
      logger.error('Failed to confirm delivery:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to confirm delivery',
        message: result.error
      } as ApiResponse);
    }

    // Update delivery tracking
    await db.deliveryTracking.updateWhere(
      { order_id: id },
      { 
        current_status: 'confirmed_by_customer',
        updated_at: new Date().toISOString()
      }
    );

    // The delivery notification no longer needs the customer's attention.
    // Mark it as read so it is excluded from the unread badge count.
    try {
      await NotificationService.markOrderStatusNotificationsAsRead(existingOrder.data.user_id, id);
    } catch (notifError) {
      // Confirmation is already stored; do not fail the request if the
      // notification acknowledgement cannot be persisted.
      logger.error('Failed to acknowledge delivery notification:', notifError);
    }

    logger.info(`Order delivery confirmed: ${id}`, {
      userId: req.userId,
      orderNumber: existingOrder.data.order_number
    });

    res.json({
      success: true,
      data: result.data,
      message: 'Delivery confirmed successfully. You can now review your products!'
    } as ApiResponse);

  } catch (error) {
    logger.error('Error confirming delivery:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to confirm delivery'
    } as ApiResponse);
  }
});

/**
 * GET /api/orders/stats/user
 * Get user order statistics
 */
router.get('/stats/user', requireAuth, async (req: Request, res: Response) => {
  try {
    // Get user stats from the user_profile_stats view
    const { data, error } = await req.db!
      .from('user_profile_stats')
      .select('total_orders, total_spent, review_count, wishlist_count')
      .eq('id', req.userId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'User stats not found',
        message: 'Could not retrieve user statistics'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: {
        total_orders: data.total_orders || 0,
        total_spent: data.total_spent || 0,
        average_order_value: data.total_orders > 0 ? data.total_spent / data.total_orders : 0,
        reviews: data.review_count || 0,
        wishlist_items: data.wishlist_count || 0
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch user statistics'
    } as ApiResponse);
  }
});

export default router;
