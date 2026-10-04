/**
 * Apply migration to add is_in_stock column to products table
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🚀 Applying is_in_stock migration...\n');

    // Read the migration SQL file
    const migrationSQL = readFileSync(
      join(__dirname, 'migrations', 'add_is_in_stock_to_products.sql'),
      'utf8'
    );

    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // If RPC doesn't exist, try direct execution (for older Supabase versions)
      console.log('⚠️  RPC method not available, trying direct execution...');
      
      // Split by semicolon and execute each statement
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        if (statement.toLowerCase().includes('comment on')) {
          console.log('ℹ️  Skipping comment statement (not supported via client)');
          continue;
        }
        
        const { error: execError } = await supabase.rpc('exec', { sql: statement });
        if (execError) {
          throw execError;
        }
      }
    }

    console.log('✅ Migration applied successfully!');
    console.log('\nColumn "is_in_stock" has been added to the products table.');
    console.log('All existing products have been set to is_in_stock = true by default.\n');

    // Verify the migration
    const { data, error: verifyError } = await supabase
      .from('products')
      .select('id, name, is_in_stock')
      .limit(3);

    if (verifyError) {
      console.log('⚠️  Could not verify migration:', verifyError.message);
    } else {
      console.log('✅ Verification successful - sample products:');
      console.table(data);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('\n⚠️  Please apply the migration manually using Supabase SQL Editor:');
    console.error('   1. Go to your Supabase project dashboard');
    console.error('   2. Navigate to SQL Editor');
    console.error('   3. Run the contents of: backend/migrations/add_is_in_stock_to_products.sql\n');
    process.exit(1);
  }
}

applyMigration();
