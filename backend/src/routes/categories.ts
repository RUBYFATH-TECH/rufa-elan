/**
 * Categories API routes for RUFA ELAN e-commerce application
 * Handles CRUD operations for product categories with hierarchical support
 */

import express from 'express';
import { Request, Response } from 'express';
import { db, dbUtils } from '../utils/database';
import { requireAdmin, rateLimitMiddleware } from '../middleware/database';
import { logger } from '../utils/logger';
import { Category, CategoryTree, PaginatedResponse, ApiResponse } from '../types/database';

const router = express.Router();

// Rate limiting for categories API
const categoriesRateLimit = rateLimitMiddleware({
  maxRequests: 30,
  windowMs: 15 * 60 * 1000 // 15 minutes
});

router.use(categoriesRateLimit);

/**
 * GET /api/categories
 * Get all categories with optional hierarchy
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 50,
      parent_id,
      hierarchy = 'false',
      active_only = 'true',
      sort_by = 'sort_order',
      sort_order = 'asc'
    } = req.query as any;

    // Build filters
    const filters: Record<string, any> = {};
    
    if (active_only === 'true') {
      filters.is_active = true;
    }
    
    if (parent_id) {
      filters.parent_id = parent_id;
    }

    // If hierarchy is requested, use the category tree view
    if (hierarchy === 'true') {
      const { data, error } = await req.db!
        .from('category_tree')
        .select('*')
        .order('sort_path', { ascending: true })
        .limit(Math.min(parseInt(limit), 500));

      if (error) {
        logger.error('Failed to fetch category tree:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch categories',
          message: error.message
        } as ApiResponse);
      }

      logger.info(`Fetched category tree with ${data?.length || 0} categories`, {
        userId: req.userId
      });

      return res.json({
        success: true,
        data: data || [],
        hierarchy: true
      } as ApiResponse<CategoryTree[]>);
    }

    // Regular category listing with pagination
    const queryOptions = {
      filters,
      orderBy: [{ column: sort_by, ascending: sort_order === 'asc' }],
      limit: Math.min(parseInt(limit), 100),
      offset: dbUtils.calculateOffset(parseInt(page), parseInt(limit))
    };

    const result = await db.categories.find(queryOptions);

    if (result.error) {
      logger.error('Failed to fetch categories:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch categories',
        message: result.error
      } as ApiResponse);
    }

    const pagination = dbUtils.calculatePagination(
      result.count || 0,
      parseInt(page),
      parseInt(limit)
    );

    logger.info(`Fetched ${result.data?.length || 0} categories`, {
      userId: req.userId,
      page,
      limit
    });

    res.json({
      success: true,
      data: result.data || [],
      pagination
    } as any);

  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch categories'
    } as ApiResponse);
  }
});

/**
 * GET /api/categories/:id
 * Get single category by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { include_children = 'false', include_products = 'false' } = req.query as any;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID',
        message: 'Category ID must be a valid UUID'
      } as ApiResponse);
    }

    // Get category details
    const category = await db.categories.findById(id);
    if (category.error || !category.data) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
        message: 'The requested category does not exist'
      } as ApiResponse);
    }

    // Check if user has access (non-active categories only for admins)
    if (!category.data.is_active && !req.isAdmin) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
        message: 'The requested category does not exist'
      } as ApiResponse);
    }

    const response: any = { ...category.data };

    // Include child categories if requested
    if (include_children === 'true') {
      const children = await db.categories.find({
        filters: { parent_id: id }
      });
      response.children = children.data || [];
    }

    // Include products if requested
    if (include_products === 'true') {
      const products = await db.products.find({
        filters: { category_id: id, status: req.isAdmin ? undefined : 'active' },
        limit: 10
      });
      response.products = products.data || [];
    }

    logger.info(`Fetched category: ${id}`, { userId: req.userId });

    res.json({
      success: true,
      data: response
    } as ApiResponse<Category>);

  } catch (error) {
    logger.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch category'
    } as ApiResponse);
  }
});

/**
 * GET /api/categories/:id/children
 * Get all child categories
 */
router.get('/:id/children', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query as any;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID',
        message: 'Category ID must be a valid UUID'
      } as ApiResponse);
    }

    // Check if parent category exists
    const parentCategory = await db.categories.findById(id);
    if (parentCategory.error || !parentCategory.data) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
        message: 'The requested category does not exist'
      } as ApiResponse);
    }

    // Get child categories
    const result = await db.categories.find({
      filters: { parent_id: id },
      orderBy: [{ column: 'sort_order', ascending: true }],
      limit: Math.min(parseInt(limit), 100),
      offset: dbUtils.calculateOffset(parseInt(page), parseInt(limit))
    });

    if (result.error) {
      logger.error('Failed to fetch child categories:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch child categories',
        message: result.error
      } as ApiResponse);
    }

    const pagination = dbUtils.calculatePagination(
      result.count || 0,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result.data || [],
      pagination
    } as any);

  } catch (error) {
    logger.error('Error fetching child categories:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch child categories'
    } as ApiResponse);
  }
});

/**
 * POST /api/categories
 * Create new category (Admin only)
 */
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const categoryData = req.body;

    // Validate required fields
    if (!categoryData.name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Category name is required'
      } as ApiResponse);
    }

    // Generate slug
    const slug = dbUtils.generateSlug(categoryData.name);

    // Check if slug already exists
    const existingSlug = await db.categories.find({
      filters: { slug }
    });

    if (existingSlug.data && existingSlug.data.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Category already exists',
        message: 'A category with this name already exists'
      } as ApiResponse);
    }

    // Verify parent category exists if specified
    if (categoryData.parent_id) {
      const parentCategory = await db.categories.findById(categoryData.parent_id);
      if (parentCategory.error || !parentCategory.data) {
        return res.status(400).json({
          success: false,
          error: 'Invalid parent category',
          message: 'The specified parent category does not exist'
        } as ApiResponse);
      }
    }

    // Get next sort order
    let nextSortOrder = 0;
    if (categoryData.parent_id) {
      const siblings = await db.categories.find({
        filters: { parent_id: categoryData.parent_id },
        orderBy: [{ column: 'sort_order', ascending: false }],
        limit: 1
      });
      nextSortOrder = (siblings.data?.[0]?.sort_order ?? -1) + 1;
    } else {
      const siblings = await db.categories.find({
        filters: { parent_id: null },
        orderBy: [{ column: 'sort_order', ascending: false }],
        limit: 1
      });
      nextSortOrder = (siblings.data?.[0]?.sort_order ?? -1) + 1;
    }

    // Create category
    const result = await db.categories.create({
      ...categoryData,
      slug,
      sort_order: nextSortOrder,
      is_active: categoryData.is_active !== false,
      parent_id: categoryData.parent_id || null
    });

    if (result.error || !result.data) {
      logger.error('Failed to create category:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create category',
        message: result.error
      } as ApiResponse);
    }

    logger.info(`Created category: ${result.data.id}`, {
      userId: req.userId,
      name: result.data.name
    });

    res.status(201).json({
      success: true,
      data: result.data,
      message: 'Category created successfully'
    } as ApiResponse<Category>);

  } catch (error) {
    logger.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create category'
    } as ApiResponse);
  }
});

/**
 * PUT /api/categories/:id
 * Update category (Admin only)
 */
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID',
        message: 'Category ID must be a valid UUID'
      } as ApiResponse);
    }

    // Check if category exists
    const existingCategory = await db.categories.findById(id);
    if (existingCategory.error || !existingCategory.data) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
        message: 'The requested category does not exist'
      } as ApiResponse);
    }

    // Generate new slug if name is being updated
    if (updateData.name && updateData.name !== existingCategory.data.name) {
      const newSlug = dbUtils.generateSlug(updateData.name);
      
      // Check if new slug already exists
      const existingSlug = await db.categories.find({
        filters: { slug: newSlug }
      });

      if (existingSlug.data && existingSlug.data.length > 0 && existingSlug.data[0].id !== id) {
        return res.status(409).json({
          success: false,
          error: 'Category already exists',
          message: 'A category with this name already exists'
        } as ApiResponse);
      }

      updateData.slug = newSlug;
    }

    // Validate parent category if being updated
    if (updateData.parent_id !== undefined && updateData.parent_id !== existingCategory.data.parent_id) {
      if (updateData.parent_id) {
        // Check for circular reference
        if (updateData.parent_id === id) {
          return res.status(400).json({
            success: false,
            error: 'Invalid parent category',
            message: 'A category cannot be its own parent'
          } as ApiResponse);
        }

        // Check if parent category exists
        const parentCategory = await db.categories.findById(updateData.parent_id);
        if (parentCategory.error || !parentCategory.data) {
          return res.status(400).json({
            success: false,
            error: 'Invalid parent category',
            message: 'The specified parent category does not exist'
          } as ApiResponse);
        }
      }
    }

    // Update category
    const result = await db.categories.updateById(id, updateData);

    if (result.error || !result.data) {
      logger.error('Failed to update category:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update category',
        message: result.error
      } as ApiResponse);
    }

    logger.info(`Updated category: ${id}`, { userId: req.userId });

    res.json({
      success: true,
      data: result.data,
      message: 'Category updated successfully'
    } as ApiResponse<Category>);

  } catch (error) {
    logger.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update category'
    } as ApiResponse);
  }
});

/**
 * DELETE /api/categories/:id
 * Delete category (Admin only)
 */
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { force = 'false' } = req.query as any;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID',
        message: 'Category ID must be a valid UUID'
      } as ApiResponse);
    }

    // Check if category exists
    const existingCategory = await db.categories.findById(id);
    if (existingCategory.error || !existingCategory.data) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
        message: 'The requested category does not exist'
      } as ApiResponse);
    }

    // Check if category has child categories
    const children = await db.categories.find({
      filters: { parent_id: id }
    });

    if (children.data && children.data.length > 0) {
      if (force !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'Category has children',
          message: 'Cannot delete category with child categories. Set force=true to move children to parent.',
          details: {
            child_count: children.data.length
          }
        } as ApiResponse);
      }

      // Move child categories to parent
      await db.categories.updateWhere(
        { parent_id: id },
        { parent_id: existingCategory.data.parent_id }
      );
    }

    // Check if category has products
    const products = await db.products.find({
      filters: { category_id: id }
    });

    if (products.data && products.data.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Category has products',
        message: 'Cannot delete category with products. Please move or delete products first.',
        details: {
          product_count: products.data.length
        }
      } as ApiResponse);
    }

    // Delete category
    const result = await db.categories.deleteById(id);

    if (result.error) {
      logger.error('Failed to delete category:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete category',
        message: result.error
      } as ApiResponse);
    }

    logger.info(`Deleted category: ${id}`, { userId: req.userId });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    } as ApiResponse);

  } catch (error) {
    logger.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete category'
    } as ApiResponse);
  }
});

/**
 * PUT /api/categories/:id/reorder
 * Reorder categories (Admin only)
 */
router.put('/:id/reorder', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sort_order } = req.body;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID',
        message: 'Category ID must be a valid UUID'
      } as ApiResponse);
    }

    if (typeof sort_order !== 'number' || sort_order < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid sort order',
        message: 'Sort order must be a non-negative number'
      } as ApiResponse);
    }

    // Check if category exists
    const existingCategory = await db.categories.findById(id);
    if (existingCategory.error || !existingCategory.data) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
        message: 'The requested category does not exist'
      } as ApiResponse);
    }

    // Update sort order
    const result = await db.categories.updateById(id, { sort_order });

    if (result.error || !result.data) {
      logger.error('Failed to reorder category:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to reorder category',
        message: result.error
      } as ApiResponse);
    }

    logger.info(`Reordered category: ${id} to position ${sort_order}`, {
      userId: req.userId
    });

    res.json({
      success: true,
      data: result.data,
      message: 'Category reordered successfully'
    } as ApiResponse<Category>);

  } catch (error) {
    logger.error('Error reordering category:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to reorder category'
    } as ApiResponse);
  }
});

/**
 * POST /api/categories/:id/products
 * Get products in category
 */
router.get('/:id/products', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query as any;

    if (!dbUtils.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID',
        message: 'Category ID must be a valid UUID'
      } as ApiResponse);
    }

    // Check if category exists and is accessible
    const category = await db.categories.findById(id);
    if (category.error || !category.data) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
        message: 'The requested category does not exist'
      } as ApiResponse);
    }

    if (!category.data.is_active && !req.isAdmin) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
        message: 'The requested category does not exist'
      } as ApiResponse);
    }

    // Get products in category
    const result = await db.products.find({
      select: `*,
        product_images(id, url, position),
        product_variants(id, name, value, price, stock_quantity)
      `,
      filters: {
        category_id: id,
        status: req.isAdmin ? undefined : 'active'
      },
      orderBy: [{ column: sort_by, ascending: sort_order === 'asc' }],
      limit: Math.min(parseInt(limit), 100),
      offset: dbUtils.calculateOffset(parseInt(page), parseInt(limit))
    });

    if (result.error) {
      logger.error('Failed to fetch category products:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch products',
        message: result.error
      } as ApiResponse);
    }

    const pagination = dbUtils.calculatePagination(
      result.count || 0,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result.data || [],
      pagination,
      category_id: id,
      category_name: category.data.name
    } as ApiResponse);

  } catch (error) {
    logger.error('Error fetching category products:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch products'
    } as ApiResponse);
  }
});

export default router;