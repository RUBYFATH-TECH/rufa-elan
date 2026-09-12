import { supabaseAdmin } from './src/utils/supabase';
import { logger } from './src/utils/logger';
import fs from 'fs';
import path from 'path';

/**
 * Simple migration runner
 * Executes SQL migrations from the supabase/migrations directory
 */

async function applyMigration(migrationName: string) {
  try {
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationName);
    
    if (!fs.existsSync(migrationPath)) {
      logger.error(`Migration file not found: ${migrationPath}`);
      return false;
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    logger.info(`Applying migration: ${migrationName}`);
    
    // Split SQL into statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    logger.info(`Found ${statements.length} SQL statements`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      try {
        // Use Supabase admin client to execute SQL
        const { error } = await supabaseAdmin.rpc('exec_sql', { sql: statement });
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = table not found
          if (!error.message.includes('already exists')) {
            logger.error(`Error executing statement ${i + 1}:`, error);
          }
        }
      } catch (err: any) {
        logger.error(`Error executing statement ${i + 1}:`, err.message);
      }
    }
    
    logger.info(`Migration applied successfully: ${migrationName}`);
    return true;
  } catch (error) {
    logger.error('Migration failed:', error);
    return false;
  }
}

async function runMigrations() {
  try {
    logger.info('Starting migration runner...');
    
    // Apply migrations in order
    const migrations = [
      '003_store_settings.sql'
    ];
    
    for (const migration of migrations) {
      const success = await applyMigration(migration);
      if (!success) {
        logger.error(`Migration ${migration} failed`);
        // Continue with next migration
      }
    }
    
    logger.info('All migrations completed');
    process.exit(0);
  } catch (error) {
    logger.error('Migration runner failed:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations();
