import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from './middleware/error';
import { databaseMiddleware, authMiddleware, queryLoggingMiddleware, databaseErrorHandler } from './middleware/database';
import { initializeDatabase } from './utils/database';
import { logger } from './utils/logger';
import routes from './routes';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      // Support comma-separated list of allowed origins
      const frontendUrls = process.env.FRONTEND_URL || 'http://localhost:3000';
      const allowedOrigins = frontendUrls.split(',').map(url => url.trim());
      
      // Also check CORS_ORIGIN for backward compatibility
      if (process.env.CORS_ORIGIN) {
        allowedOrigins.push(...process.env.CORS_ORIGIN.split(',').map(url => url.trim()));
      }
      
      // Log for debugging
      logger.info(`CORS check - Origin: ${origin}, Allowed: ${allowedOrigins.join(', ')}`);
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('CORS not allowed'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Basic middleware
app.use(compression() as any);
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database middleware
app.use(databaseMiddleware);

// Apply auth middleware to all routes except upload
app.use((req: Request, res: Response, next: NextFunction) => {
  // Skip auth middleware for upload endpoint
  if (req.path === '/api/upload' || req.path.startsWith('/upload')) {
    return next();
  }
  authMiddleware(req, res, next);
});

app.use(queryLoggingMiddleware);

// Request timeout
app.use((req: Request, res: Response, next: NextFunction) => {
  req.setTimeout(30000); // 30 seconds timeout
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealthy = await initializeDatabase();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: dbHealthy ? 'connected' : 'disconnected'
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'error'
    });
  }
});

// Debug endpoint to check auth status (remove in production)
app.get('/api/debug/auth', (req, res) => {
  res.json({
    userId: req.userId || null,
    isAdmin: req.isAdmin || false,
    authorization: req.headers.authorization ? 'Bearer token present' : 'No auth header',
    message: 'This is a debug endpoint - remove in production'
  });
});

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'RUFA ELAN API Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      admin: '/api/admin',
      payments: '/api/payments'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Database error handling
app.use(databaseErrorHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
