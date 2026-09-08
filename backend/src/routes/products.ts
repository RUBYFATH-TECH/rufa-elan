/**
 * Products API routes for RUFA ELAN e-commerce application
 * Handles CRUD operations for products, variants, and images
 */

import express from 'express';
import { Request, Response } from 'express';
import { db, dbUtils } from '../utils/database';
import { requireAdmin, requireAuth, rateLimitMiddleware } from '../middleware/database';
import { logger } from '../utils/logger';
import {
  Product,
  ProductDetails,
  CreateProductRequest,
  UpdateProductRequest,
  ProductFilters,
  PaginatedResponse,
  ApiResponse
} from '../types/database';

const router = express.Router();

// Rate limiting for products API
const productsRateLimit = rateLimitMiddleware({
  maxRequests: 50,
  windowMs: 15 * 60 * 1000 // 15 minutes
});

router.use(productsRateLimit);

/**
 * GET /api/products
 * Get paginated list of products with filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      category_id,
      status,
      featured,
      min_price,
      max_price,
      brand,
      tags,
      search,
      in_stock,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query as any;

    // Build filters
    const filters: Record<string, any> = {};
    
    if (category_id) filters.category_id = category_id;
    if (brand) filters.brand = brand;
    if (featured !== undefined) filters.featured = featured === 'true';
    
    // Status filter - only show active products to non-admin users
    if (req.isAdmin) {
      if (status) filters.status = status;
    } else {
      filters.status = 'active';
    }

    // Build query options
    const queryOptions = {
      select: `
        *,
        categories!inner(name, slug),
        product_images(id, url, alt_text, is_primary, position),
        product_variants(id, name, value, price, stock_quantity, is_default)
      `,
      filters,
      orderBy: [{ column: sort_by, ascending: sort_order === 'asc' }],
      limit: Math.min(parseInt(limit), 100), // Max 100 items per page
      offset: dbUtils.calculateOffset(parseInt(page), parseInt(limit))
    };

    // Handle price range filter
    if (min_price || max_price) {
      // This would need custom query logic for price ranges
      // For now, we'll handle it in post-processing
    }

    // Handle search
    let searchQuery = '';
    if (search) {
      searchQuery = dbUtils.buildSearchQuery(search);
      // Would need to use full-text search or implement search logic
    }

    // Handle stock filter
    if (in_stock === 'true') {
      filters.total_stock = { gt: 0 };
    }

    // Execute query
    const result = await db.products.find(queryOptions);

    if (result.error) {
      logger.error('Failed to fetch products:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch products',
        message: result.error
      } as ApiResponse);
    }

    let products = result.data || [];

    // Apply additional filters that can't be done at database level
    if (min_price || max_price) {
      products = products.filter(product => {
        const price = product.sale_price || product.regular_price;
        if (min_price && price < parseFloat(min_price)) return false;
        if (max_price && price > parseFloat(max_price)) return false;
        return true;
      });
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      products = products.filter(product => 
        product.tags && product.tags.some(tag => tagArray.includes(tag))
      );
    }

    // Apply search filter if needed (simple text search)
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const pagination = dbUtils.calculatePagination(
      result.count || products.length,
      parseInt(page),
      parseInt(limit)
    );

    logger.info(`Fetched ${products.length} products`, {
      userId: req.userId,
      filters,
      page,
      limit
    });

    res.json({
      success: true,
      data: products,
      pagination
    } as ApiResponse<PaginatedResponse<ProductDetails>>);

  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch products'
    } as ApiResponse);
  }
});

/**
 * GET /api/products/:id
 * Get single product by ID with full details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
        message: 'Product ID must be a valid UUID'
      } as ApiResponse);
    }

    // Use the product_details view for complete information
    const { data, error } = await req.db!
      .from('product_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Failed to fetch product:', error);
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'The requested product does not exist'
      } as ApiResponse);
    }

    // Check if product is active or user is admin
    if (data.status !== 'active' && !req.isAdmin) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'The requested product does not exist'
      } as ApiResponse);
    }

    // Increment view count
    if (data.status === 'active') {
      await db.products.updateById(id, {
        view_count: (data.view_count || 0) + 1
      });
    }

    logger.info(`Fetched product: ${id}`, { userId: req.userId });

    res.json({
      success: true,
      data
    } as ApiResponse<ProductDetails>);

  } catch (error) {
    logger.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch product'
    } as ApiResponse);
  }
});

/**
 * POST /api/products
 * Create new product (Admin only)
 */
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const productData: CreateProductRequest = req.body;

    // Validate required fields
    if (!productData.name || !productData.category_id || !productData.sku || !productData.regular_price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Name, category_id, sku, and regular_price are required'
      } as ApiResponse);
    }

    // Generate slug if not provided
    const slug = productData.name ? dbUtils.generateSlug(productData.name) : '';

    // Check if SKU already exists
    const existingSku = await db.products.find({
      filters: { sku: productData.sku }
    });

    if (existingSku.data && existingSku.data.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'SKU already exists',
        message: 'A product with this SKU already exists'
      } as ApiResponse);
    }

    // Check if slug already exists
    const existingSlug = await db.products.find({
      filters: { slug }
    });

    if (existingSlug.data && existingSlug.data.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Product name already exists',
        message: 'A product with this name already exists'
      } as ApiResponse);
    }

    // Verify category exists
    const category = await db.categories.findById(productData.category_id);
    if (category.error || !category.data) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
        message: 'The specified category does not exist'
      } as ApiResponse);
    }

    // Prepare product data
    const newProduct = {
      ...productData,
      slug,
      status: productData.status || 'active',
      featured: productData.featured || false,
      popularity: 0,
      total_stock: 0,
      avg_rating: 0,
      review_count: 0,
      view_count: 0
    };

    // Create product
    const result = await db.products.create(newProduct);

    if (result.error || !result.data) {
      logger.error('Failed to create product:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create product',
        message: result.error
      } as ApiResponse);
    }

    const productId = result.data.id;

    // Create product images if provided
    if (productData.images && productData.images.length > 0) {
      const imagePromises = productData.images.map((image, index) => 
        db.productImages.create({
          ...image,
          product_id: productId,
          position: image.position || index,
          is_primary: image.is_primary || index === 0
        })
      );

      await Promise.all(imagePromises);
    }

    // Create product variants if provided
    if (productData.variants && productData.variants.length > 0) {
      const variantPromises = productData.variants.map((variant, index) =>
        db.productVariants.create({
          ...variant,
          product_id: productId,
          is_default: variant.is_default || index === 0,
          variant_type: variant.variant_type || 'standard'
        })
      );

      await Promise.all(variantPromises);
    } else {
      // Create default variant
      await db.productVariants.create({
        product_id: productId,
        name: 'Default',
        value: 'Standard',
        sku: `${productData.sku}-DEFAULT`,
        price: productData.regular_price,
        stock_quantity: 0,
        is_default: true,
        variant_type: 'standard',
        attributes: {}
      });
    }

    // Fetch the complete product details
    const { data: createdProduct } = await req.db!
      .from('product_details')
      .select('*')
      .eq('id', productId)
      .single();

    logger.info(`Created product: ${productId}`, { userId: req.userId });

    res.status(201).json({
      success: true,
      data: createdProduct,
      message: 'Product created successfully'
    } as ApiResponse<ProductDetails>);

  } catch (error) {
    logger.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create product'
    } as ApiResponse);
  }
});

/**
 * PUT /api/products/:id
 * Update existing product (Admin only)
 */
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateProductRequest = req.body;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
        message: 'Product ID must be a valid UUID'
      } as ApiResponse);
    }

    // Check if product exists
    const existingProduct = await db.products.findById(id);
    if (existingProduct.error || !existingProduct.data) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'The requested product does not exist'
      } as ApiResponse);
    }

    // Generate new slug if name is being updated
    if (updateData.name && updateData.name !== existingProduct.data.name) {
      const newSlug = dbUtils.generateSlug(updateData.name);
      
      // Check if new slug already exists
      const existingSlug = await db.products.find({
        filters: { slug: newSlug }
      });

      if (existingSlug.data && existingSlug.data.length > 0 && existingSlug.data[0].id !== id) {
        return res.status(409).json({
          success: false,
          error: 'Product name already exists',
          message: 'A product with this name already exists'
        } as ApiResponse);
      }

      updateData.slug = newSlug;
    }

    // Check SKU uniqueness if being updated
    if (updateData.sku && updateData.sku !== existingProduct.data.sku) {
      const existingSku = await db.products.find({
        filters: { sku: updateData.sku }
      });

      if (existingSku.data && existingSku.data.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'SKU already exists',
          message: 'A product with this SKU already exists'
        } as ApiResponse);
      }
    }

    // Verify category exists if being updated
    if (updateData.category_id && updateData.category_id !== existingProduct.data.category_id) {
      const category = await db.categories.findById(updateData.category_id);
      if (category.error || !category.data) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category',
          message: 'The specified category does not exist'
        } as ApiResponse);
      }
    }

    // Update product
    const result = await db.products.updateById(id, updateData);

    if (result.error || !result.data) {
      logger.error('Failed to update product:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update product',
        message: result.error
      } as ApiResponse);
    }

    // Fetch updated product details
    const { data: updatedProduct } = await req.db!
      .from('product_details')
      .select('*')
      .eq('id', id)
      .single();

    logger.info(`Updated product: ${id}`, { userId: req.userId });

    res.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    } as ApiResponse<ProductDetails>);

  } catch (error) {
    logger.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update product'
    } as ApiResponse);
  }
});

/**
 * DELETE /api/products/:id
 * Delete product (Admin only)
 */
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
        message: 'Product ID must be a valid UUID'
      } as ApiResponse);
    }

    // Check if product exists
    const existingProduct = await db.products.findById(id);
    if (existingProduct.error || !existingProduct.data) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'The requested product does not exist'
      } as ApiResponse);
    }

    // Check if product is referenced in orders
    const orderItems = await db.orderItems.find({
      filters: { product_variant_id: id }
    });

    if (orderItems.data && orderItems.data.length > 0) {
      // Soft delete - set status to discontinued
      await db.products.updateById(id, { status: 'discontinued' });
      
      logger.info(`Soft deleted product: ${id}`, { userId: req.userId });

      return res.json({
        success: true,
        message: 'Product marked as discontinued due to existing orders'
      } as ApiResponse);
    }

    // Hard delete - remove product and related data
    // Note: This will cascade due to foreign key constraints
    const result = await db.products.deleteById(id);

    if (result.error) {
      logger.error('Failed to delete product:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete product',
        message: result.error
      } as ApiResponse);
    }

    logger.info(`Deleted product: ${id}`, { userId: req.userId });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    } as ApiResponse);

  } catch (error) {
    logger.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete product'
    } as ApiResponse);
  }
});

/**
 * GET /api/products/:id/variants
 * Get product variants
 */
router.get('/:id/variants', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
        message: 'Product ID must be a valid UUID'
      } as ApiResponse);
    }

    // Check if product exists and is accessible
    const product = await db.products.findById(id);
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

    // Get variants
    const result = await db.productVariants.find({
      filters: { product_id: id },
      orderBy: [{ column: 'is_default', ascending: false }, { column: 'created_at', ascending: true }]
    });

    if (result.error) {
      logger.error('Failed to fetch product variants:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch variants',
        message: result.error
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: result.data || []
    } as ApiResponse);

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
 * POST /api/products/:id/variants
 * Add variant to product (Admin only)
 */
router.post('/:id/variants', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const variantData = req.body;

    if (!dbUtils.isValidUUID(id)) {
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
    const product = await db.products.findById(id);
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

    // Create variant
    const result = await db.productVariants.create({
      ...variantData,
      product_id: id,
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

    logger.info(`Created variant for product: ${id}`, { userId: req.userId, variantId: result.data.id });

    res.status(201).json({
      success: true,
      data: result.data,
      message: 'Variant created successfully'
    } as ApiResponse);

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
 * GET /api/products/search
 * Advanced product search with full-text search
 */
router.get('/search/advanced', async (req: Request, res: Response) => {
  try {
    const {
      q, // search query
      category,
      min_price,
      max_price,
      rating,
      page = 1,
      limit = 20
    } = req.query as any;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Missing search query',
        message: 'Search query parameter "q" is required'
      } as ApiResponse);
    }

    // Build search query using PostgreSQL full-text search
    const searchQuery = dbUtils.buildSearchQuery(q);
    
    // This would need to use a custom query or stored procedure for full-text search
    // For now, we'll use a simplified approach
    
    const result = await db.products.find({
      select: `
        *,
        categories!inner(name, slug),
        product_images(id, url, alt_text, is_primary, position),
        product_variants(id, name, value, price, stock_quantity, is_default)
      `,
      filters: {
        status: req.isAdmin ? undefined : 'active',
        ...(category && { category_id: category }),
        ...(rating && { avg_rating: { gte: parseFloat(rating) } })
      },
      orderBy: [{ column: 'popularity', ascending: false }],
      limit: Math.min(parseInt(limit), 100),
      offset: dbUtils.calculateOffset(parseInt(page), parseInt(limit))
    });

    if (result.error) {
      logger.error('Search failed:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Search failed',
        message: result.error
      } as ApiResponse);
    }

    // Apply client-side filtering for search term and price range
    let products = result.data || [];
    
    // Simple text search
    const searchLower = q.toLowerCase();
    products = products.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower) ||
      product.brand?.toLowerCase().includes(searchLower) ||
      product.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
    );

    // Price range filter
    if (min_price || max_price) {
      products = products.filter(product => {
        const price = product.sale_price || product.regular_price;
        if (min_price && price < parseFloat(min_price)) return false;
        if (max_price && price > parseFloat(max_price)) return false;
        return true;
      });
    }

    const pagination = dbUtils.calculatePagination(
      products.length,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: products,
      pagination,
      search_query: q
    } as ApiResponse);

  } catch (error) {
    logger.error('Error in product search:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Search failed'
    } as ApiResponse);
  }
});

export default router;