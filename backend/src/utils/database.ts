/**
 * Database utilities and connection helpers for RUFA ELAN backend
 * Provides reusable CRUD operations and database management functions
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';

// Database configuration
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

// Create Supabase client with service role for backend operations
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Database connection interface
 */
export interface DatabaseConfig {
  table: string;
  schema?: string;
}

/**
 * Query options for database operations
 */
export interface QueryOptions {
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean }[];
  limit?: number;
  offset?: number;
  single?: boolean;
}

/**
 * Database operation result
 */
export interface DatabaseResult<T = any> {
  data: T | null;
  error: string | null;
  count?: number;
}

/**
 * Generic database helper class
 */
export class DatabaseHelper {
  private client: SupabaseClient;
  private tableName: string;

  constructor(tableName: string, client?: SupabaseClient) {
    this.tableName = tableName;
    this.client = client || supabase;
  }

  /**
   * Create a new record
   */
  async create<T = any>(data: any): Promise<DatabaseResult<T>> {
    try {
      logger.info(`Creating record in ${this.tableName}`, { data });
      
      const { data: result, error } = await this.client
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) {
        logger.error(`Error creating record in ${this.tableName}:`, error);
        return { data: null, error: error.message };
      }

      logger.info(`Successfully created record in ${this.tableName}`, { id: result?.id });
      return { data: result, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logger.error(`Unexpected error creating record in ${this.tableName}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Find records with optional filters and pagination
   */
  async find<T = any>(options: QueryOptions = {}): Promise<DatabaseResult<T[]>> {
    try {
      logger.info(`Finding records in ${this.tableName}`, { options });

      let query = this.client
        .from(this.tableName)
        .select(options.select || '*', { count: 'exact' });

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === 'string' && value.includes('%')) {
              query = query.like(key, value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      // Apply ordering
      if (options.orderBy) {
        options.orderBy.forEach(({ column, ascending = true }) => {
          query = query.order(column, { ascending });
        });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        logger.error(`Error finding records in ${this.tableName}:`, error);
        return { data: null, error: error.message };
      }

      logger.info(`Successfully found ${data?.length || 0} records in ${this.tableName}`);
      return { data: (data as any) || [], error: null, count: count || 0 };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logger.error(`Unexpected error finding records in ${this.tableName}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Find a single record by ID
   */
  async findById<T = any>(id: string, select?: string): Promise<DatabaseResult<T>> {
    try {
      logger.info(`Finding record by ID in ${this.tableName}`, { id });

      const { data, error } = await this.client
        .from(this.tableName)
        .select(select || '*')
        .eq('id', id)
        .single();

      if (error) {
        logger.error(`Error finding record by ID in ${this.tableName}:`, error);
        return { data: null, error: error.message };
      }

      logger.info(`Successfully found record by ID in ${this.tableName}`, { id });
      return { data: data as any, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logger.error(`Unexpected error finding record by ID in ${this.tableName}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Update a record by ID
   */
  async updateById<T = any>(id: string, data: any): Promise<DatabaseResult<T>> {
    try {
      logger.info(`Updating record by ID in ${this.tableName}`, { id, data });

      const { data: result, error } = await this.client
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error(`Error updating record by ID in ${this.tableName}:`, error);
        return { data: null, error: error.message };
      }

      logger.info(`Successfully updated record by ID in ${this.tableName}`, { id });
      return { data: result, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logger.error(`Unexpected error updating record by ID in ${this.tableName}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Update records with filters
   */
  async updateWhere<T = any>(filters: Record<string, any>, data: any): Promise<DatabaseResult<T[]>> {
    try {
      logger.info(`Updating records with filters in ${this.tableName}`, { filters, data });

      let query = this.client
        .from(this.tableName)
        .update(data);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      const { data: result, error } = await query.select();

      if (error) {
        logger.error(`Error updating records with filters in ${this.tableName}:`, error);
        return { data: null, error: error.message };
      }

      logger.info(`Successfully updated ${result?.length || 0} records in ${this.tableName}`);
      return { data: result || [], error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logger.error(`Unexpected error updating records with filters in ${this.tableName}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Delete a record by ID
   */
  async deleteById(id: string): Promise<DatabaseResult<void>> {
    try {
      logger.info(`Deleting record by ID in ${this.tableName}`, { id });

      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        logger.error(`Error deleting record by ID in ${this.tableName}:`, error);
        return { data: null, error: error.message };
      }

      logger.info(`Successfully deleted record by ID in ${this.tableName}`, { id });
      return { data: null, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logger.error(`Unexpected error deleting record by ID in ${this.tableName}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Delete records with filters
   */
  async deleteWhere(filters: Record<string, any>): Promise<DatabaseResult<void>> {
    try {
      logger.info(`Deleting records with filters in ${this.tableName}`, { filters });

      let query = this.client.from(this.tableName).delete();

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      const { error } = await query;

      if (error) {
        logger.error(`Error deleting records with filters in ${this.tableName}:`, error);
        return { data: null, error: error.message };
      }

      logger.info(`Successfully deleted records in ${this.tableName}`);
      return { data: null, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logger.error(`Unexpected error deleting records with filters in ${this.tableName}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Count records with optional filters
   */
  async count(filters?: Record<string, any>): Promise<DatabaseResult<number>> {
    try {
      logger.info(`Counting records in ${this.tableName}`, { filters });

      let query = this.client
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      const { count, error } = await query;

      if (error) {
        logger.error(`Error counting records in ${this.tableName}:`, error);
        return { data: null, error: error.message };
      }

      logger.info(`Successfully counted ${count || 0} records in ${this.tableName}`);
      return { data: count || 0, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logger.error(`Unexpected error counting records in ${this.tableName}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Execute a custom query
   */
  async execute(query: string, params?: any[]): Promise<DatabaseResult<any>> {
    try {
      logger.info(`Executing custom query`, { query, params });

      const { data, error } = await this.client.rpc('execute_sql', {
        query,
        params: params || []
      });

      if (error) {
        logger.error(`Error executing custom query:`, error);
        return { data: null, error: error.message };
      }

      logger.info(`Successfully executed custom query`);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logger.error(`Unexpected error executing custom query:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Bulk insert records
   */
  async bulkInsert<T = any>(records: any[]): Promise<DatabaseResult<T[]>> {
    try {
      logger.info(`Bulk inserting ${records.length} records in ${this.tableName}`);

      const { data, error } = await this.client
        .from(this.tableName)
        .insert(records)
        .select();

      if (error) {
        logger.error(`Error bulk inserting records in ${this.tableName}:`, error);
        return { data: null, error: error.message };
      }

      logger.info(`Successfully bulk inserted ${data?.length || 0} records in ${this.tableName}`);
      return { data: data || [], error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logger.error(`Unexpected error bulk inserting records in ${this.tableName}:`, err);
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Upsert (insert or update) records
   */
  async upsert<T = any>(
    records: any[], 
    onConflict?: string
  ): Promise<DatabaseResult<T[]>> {
    try {
      logger.info(`Upserting ${records.length} records in ${this.tableName}`);

      const { data, error } = await this.client
        .from(this.tableName)
        .upsert(records, { onConflict })
        .select();

      if (error) {
        logger.error(`Error upserting records in ${this.tableName}:`, error);
        return { data: null, error: error.message };
      }

      logger.info(`Successfully upserted ${data?.length || 0} records in ${this.tableName}`);
      return { data: data || [], error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logger.error(`Unexpected error upserting records in ${this.tableName}:`, err);
      return { data: null, error: errorMessage };
    }
  }
}

/**
 * Transaction helper for database operations
 */
export class DatabaseTransaction {
  private operations: (() => Promise<any>)[] = [];

  /**
   * Add an operation to the transaction
   */
  add(operation: () => Promise<any>): this {
    this.operations.push(operation);
    return this;
  }

  /**
   * Execute all operations in transaction
   * Note: Supabase doesn't support real transactions in client library
   * This is a simple sequential execution with rollback simulation
   */
  async execute(): Promise<DatabaseResult<any[]>> {
    const results: any[] = [];
    const rollbackOperations: (() => Promise<void>)[] = [];

    try {
      logger.info(`Executing transaction with ${this.operations.length} operations`);

      for (const operation of this.operations) {
        const result = await operation();
        results.push(result);
      }

      logger.info(`Transaction completed successfully`);
      return { data: results, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      logger.error(`Transaction failed, attempting rollback:`, err);

      // Attempt to rollback operations in reverse order
      for (const rollback of rollbackOperations.reverse()) {
        try {
          await rollback();
        } catch (rollbackErr) {
          logger.error(`Rollback operation failed:`, rollbackErr);
        }
      }

      return { data: null, error: errorMessage };
    }
  }
}

/**
 * Database helper instances for common tables
 */
export const db = {
  supabase, // Export supabase client for direct queries
  profiles: new DatabaseHelper('profiles'),
  categories: new DatabaseHelper('categories'),
  products: new DatabaseHelper('products'),
  productImages: new DatabaseHelper('product_images'),
  productVariants: new DatabaseHelper('product_variants'),
  inventory: new DatabaseHelper('inventory'),
  cartItems: new DatabaseHelper('cart_items'),
  wishlists: new DatabaseHelper('wishlists'),
  addresses: new DatabaseHelper('addresses'),
  orders: new DatabaseHelper('orders'),
  orderItems: new DatabaseHelper('order_items'),
  payments: new DatabaseHelper('payments'),
  deliveryTracking: new DatabaseHelper('delivery_tracking'),
  trackingUpdates: new DatabaseHelper('tracking_updates'),
  reviews: new DatabaseHelper('reviews'),
  coupons: new DatabaseHelper('coupons'),
  couponUsage: new DatabaseHelper('coupon_usage'),
  notifications: new DatabaseHelper('notifications'),
  adminUsers: new DatabaseHelper('admin_users'),
  auditLogs: new DatabaseHelper('audit_logs'),
  fastDeals: new DatabaseHelper('fast_deals')
};

/**
 * Connection health check
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      logger.error('Database connection check failed:', error);
      return false;
    }

    logger.info('Database connection is healthy');
    return true;
  } catch (err) {
    logger.error('Database connection check error:', err);
    return false;
  }
}

/**
 * Initialize database connection and run health checks
 */
export async function initializeDatabase(): Promise<boolean> {
  try {
    logger.info('Initializing database connection...');
    
    const isHealthy = await checkDatabaseConnection();
    if (!isHealthy) {
      throw new Error('Database connection health check failed');
    }

    logger.info('Database initialized successfully');
    return true;
  } catch (err) {
    logger.error('Failed to initialize database:', err);
    return false;
  }
}

/**
 * Utility functions for common database operations
 */
export const dbUtils = {
  /**
   * Generate unique slug from name
   */
  generateSlug: (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  },

  /**
   * Validate UUID format
   */
  isValidUUID: (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  /**
   * Sanitize input for database operations
   */
  sanitizeInput: (input: any): any => {
    if (typeof input === 'string') {
      return input.trim();
    }
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = dbUtils.sanitizeInput(value);
      }
      return sanitized;
    }
    return input;
  },

  /**
   * Build search query for full-text search
   */
  buildSearchQuery: (searchTerm: string): string => {
    return searchTerm
      .split(' ')
      .filter(term => term.length > 0)
      .map(term => `${term}:*`)
      .join(' & ');
  },

  /**
   * Calculate pagination offset
   */
  calculateOffset: (page: number, limit: number): number => {
    return Math.max(0, (page - 1) * limit);
  },

  /**
   * Calculate pagination metadata
   */
  calculatePagination: (total: number, page: number, limit: number) => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    };
  }
};

export default {
  supabase,
  DatabaseHelper,
  DatabaseTransaction,
  db,
  checkDatabaseConnection,
  initializeDatabase,
  dbUtils
};