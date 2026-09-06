import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface APIError {
  code: string;
  message: string;
  status: number;
  details?: any;
  timestamp: string;
  requestId?: string;
}

// Custom error class
export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: any;
  
  constructor(message: string, status = 500, code = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Generate unique request ID
  const requestId = req.headers['x-request-id'] as string || 
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const errorResponse: APIError = {
    code: (error as AppError).code || 'INTERNAL_ERROR',
    message: error.message || 'An unexpected error occurred',
    status: (error as AppError).status || 500,
    timestamp: new Date().toISOString(),
    requestId
  };
  
  // Add details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = (error as AppError).details;
  }
  
  // Log error details
  logger.error('API Error', {
    error: {
      message: error.message,
      stack: error.stack,
      code: (error as AppError).code,
      status: (error as AppError).status
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    },
    requestId
  });
  
  res.status(errorResponse.status).json({
    error: errorResponse.message,
    code: errorResponse.code,
    timestamp: errorResponse.timestamp,
    requestId: errorResponse.requestId,
    ...(errorResponse.details && { details: errorResponse.details })
  });
};

// Async error wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error handler
export const handleValidationError = (error: any) => {
  if (error.name === 'ZodError') {
    const message = error.errors.map((err: any) => 
      `${err.path.join('.')}: ${err.message}`
    ).join(', ');
    
    throw new AppError(message, 400, 'VALIDATION_ERROR', error.errors);
  }
  
  throw error;
};