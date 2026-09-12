import dotenv from "dotenv";
import path from "path";

// Load environment variables first, before importing other modules
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import app from './app';
import { logger } from './utils/logger';
import { validateServiceConfig } from './config/services';
import { testSupabaseConnection } from './utils/supabase';
import { initializeDatabaseHealth } from './middleware/database';

// The project keeps the Supabase URL under the Next.js-compatible public name.
// Mirror it for the backend's server-only validation and service integrations.
if (!process.env.SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
}

const PORT = process.env.PORT || 8000;

// Initialize server
const startServer = async () => {
  try {
    // Validate service configuration
    validateServiceConfig();
    
    // Initialize database health check
    const dbHealthy = await initializeDatabaseHealth();
    if (!dbHealthy) {
      logger.warn('Database is not healthy on startup, but server will continue');
    }
    
    // Test Supabase connection (optional - don't block server startup)
    testSupabaseConnection().catch(error => {
      logger.warn('Supabase connection test failed, but server will continue:', error.message);
    });
    
    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 RUFA ELAN Backend Server running on port ${PORT}`, {
        environment: process.env.NODE_ENV,
        port: PORT,
        timestamp: new Date().toISOString(),
        supabase: {
          url: process.env.SUPABASE_URL,
          project: process.env.PROJECT_ID
        }
      });
    });

    // Graceful shutdown handlers
    const shutdown = (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully`);
      
      server.close((err) => {
        if (err) {
          logger.error('Error during server shutdown:', err);
          process.exit(1);
        }
        
        logger.info('Server shut down successfully');
        process.exit(0);
      });
      
      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    return server;
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;
