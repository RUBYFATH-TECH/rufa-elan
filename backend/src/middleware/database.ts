/**
 * Database middleware for RUFA ELAN backend
 * Handles database initialization, connection pooling, and request-level database context
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { checkDatabaseConnection, supabase } from '../utils/database';

// Extend Express Request interface to include database context
declare global {
  namespace Express {
    interface Request {
      db?: typeof supabase;
      userId?: string;
      isAdmin?: boolean;
    }
  }
}

/**
 * Database connection middleware
 * Ensures database is available and adds db instance to request
 */
export const databaseMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if database is healthy
    const isHealthy = await checkDatabaseConnection();
    
    if (!isHealthy) {
      logger.error('Database connection is not healthy');
      res.status(503).json({
        success: false,
        error: 'Database service unavailable',
        message: 'Please try again later'
      });
      return;
    }

    // Add database instance to request
    req.db = supabase;
    
    next();
  } catch (error) {
    logger.error('Database middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Database configuration error'
    });
  }
};

/**
 * Authentication middleware
 * Extracts user information from JWT token and adds to request context
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue as anonymous user
      req.userId = undefined;
      req.isAdmin = false;
      return next();
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!req.db) {
      res.status(500).json({
        success: false,
        error: 'Database not available'
      });
      return;
    }

    // Verify token with Supabase
    const { data: { user }, error } = await req.db.auth.getUser(token);
    
    if (error || !user) {
      logger.warn('Invalid authentication token:', error?.message);
      req.userId = undefined;
      req.isAdmin = false;
      return next();
    }

    // Get user profile to check admin status
    const { data: profile, error: profileError } = await req.db
      .from('profiles')
      .select('id, is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      logger.warn('Failed to fetch user profile:', profileError.message);
      req.userId = user.id;
      req.isAdmin = false;
    } else {
      req.userId = user.id;
      req.isAdmin = profile?.is_admin || false;
    }

    logger.info(`Authenticated user: ${user.id}, Admin: ${req.isAdmin}`);
    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    req.userId = undefined;
    req.isAdmin = false;
    next(); // Continue as anonymous user
  }
};

/**
 * Admin authorization middleware
 * Ensures the user is authenticated and has admin privileges
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.userId) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
    return;
  }

  if (!req.isAdmin) {
    res.status(403).json({
      success: false,
      error: 'Insufficient privileges',
      message: 'Admin access required'
    });
    return;
  }

  next();
};

/**
 * User authorization middleware
 * Ensures the user is authenticated
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.userId) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
    return;
  }

  next();
};

/**
 * Transaction middleware
 * Provides database transaction context for complex operations
 * Note: Supabase doesn't support real transactions in client library
 * This is a placeholder for future implementation with connection pooling
 */
export const transactionMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // For now, just pass through the regular database connection
  // In a real implementation, this would start a database transaction
  req.db = supabase;
  
  // Add transaction helpers to request
  (req as any).transaction = {
    commit: async () => {
      // Placeholder for transaction commit
      logger.info('Transaction commit (placeholder)');
    },
    rollback: async () => {
      // Placeholder for transaction rollback
      logger.info('Transaction rollback (placeholder)');
    }
  };

  next();
};

/**
 * Rate limiting middleware for database operations
 * Prevents abuse of database resources
 */
export const rateLimitMiddleware = (options: {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
}) => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const identifier = req.userId || req.ip;
    const now = Date.now();
    
    // Clean up expired entries
    for (const [key, value] of requests.entries()) {
      if (now > value.resetTime) {
        requests.delete(key);
      }
    }
    
    const userRequests = requests.get(identifier) || {
      count: 0,
      resetTime: now + options.windowMs
    };
    
    if (now > userRequests.resetTime) {
      userRequests.count = 0;
      userRequests.resetTime = now + options.windowMs;
    }
    
    if (userRequests.count >= options.maxRequests) {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again in ${Math.ceil((userRequests.resetTime - now) / 1000)} seconds.`
      });
      return;
    }
    
    userRequests.count++;
    requests.set(identifier, userRequests);
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', options.maxRequests);
    res.setHeader('X-RateLimit-Remaining', options.maxRequests - userRequests.count);
    res.setHeader('X-RateLimit-Reset', Math.ceil(userRequests.resetTime / 1000));
    
    next();
  };
};

/**
 * Database query logging middleware
 * Logs database queries for debugging and monitoring
 */
export const queryLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (process.env.NODE_ENV === 'development') {
    // Wrap the original db methods to add logging
    if (req.db) {
      const originalFrom = req.db.from.bind(req.db);
      
      req.db.from = (table: string) => {
        logger.debug(`Database query on table: ${table}`, {
          userId: req.userId,
          method: req.method,
          path: req.path
        });
        return originalFrom(table);
      };
    }
  }
  
  next();
};

/**
 * Database error handling middleware
 * Standardizes database error responses
 */
export const databaseErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Database operation error:', error);
  
  // Check for specific database errors
  if (error?.code === 'PGRST116') {
    res.status(404).json({
      success: false,
      error: 'Resource not found',
      message: 'The requested resource does not exist'
    });
    return;
  }
  
  if (error?.code === '23505') {
    res.status(409).json({
      success: false,
      error: 'Resource conflict',
      message: 'A resource with this data already exists'
    });
    return;
  }
  
  if (error?.code === '23503') {
    res.status(400).json({
      success: false,
      error: 'Invalid reference',
      message: 'Referenced resource does not exist'
    });
    return;
  }
  
  if (error?.code === '42501') {
    res.status(403).json({
      success: false,
      error: 'Access denied',
      message: 'Insufficient privileges to perform this operation'
    });
    return;
  }
  
  // Generic database error
  res.status(500).json({
    success: false,
    error: 'Database error',
    message: 'An error occurred while processing your request'
  });
};

/**
 * Request validation middleware for database operations
 */
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body against schema
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });
      
      if (error) {
        const errors = error.details.map((detail: any) => ({
          field: detail.path.join('.'),
          message: detail.message
        }));
        
        res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid request data',
          details: errors
        });
        return;
      }
      
      // Replace request body with validated/sanitized data
      req.body = value;
      next();
    } catch (err) {
      logger.error('Request validation error:', err);
      res.status(500).json({
        success: false,
        error: 'Validation error',
        message: 'Failed to validate request'
      });
    }
  };
};

export default {
  databaseMiddleware,
  authMiddleware,
  requireAdmin,
  requireAuth,
  transactionMiddleware,
  rateLimitMiddleware,
  queryLoggingMiddleware,
  databaseErrorHandler,
  validateRequest
};