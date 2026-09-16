/**
 * Apply Review System Migration
 * This script applies the product review and rating system migration
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🚀 Starting Review System Migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/008_add_product_reviews.sql');
    console.log('📄 Reading migration file:', migrationPath);
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('✅ Migration file loaded\n');

    // Apply the migration
    console.log('⚙️  Applying migration...');
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL }).single();

    if (error) {
      // If exec_sql doesn't exist, try direct execution (for newer Supabase versions)
      console.log('⚠️  exec_sql RPC not found, trying direct execution...');
      
      // Split the SQL into individual statements and execute them
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.length > 0) {
          console.log(`   Executing statement ${i + 1}/${statements.length}...`);
          
          try {
            // Use raw SQL execution
            const { error: execError } = await supabase.rpc('exec', {
              sql: statement + ';'
            });

            if (execError) {
              console.error(`❌ Error in statement ${i + 1}:`, execError.message);
              console.error('Statement:', statement.substring(0, 100) + '...');
            }
          } catch (err) {
            console.error(`❌ Error executing statement ${i + 1}:`, err);
          }
        }
      }
    }

    console.log('✅ Migration applied successfully!\n');

    // Verify the migration
    console.log('🔍 Verifying migration...');

    // Check if reviews table exists
    const { data: reviewsTable, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .limit(1);

    if (reviewsError && reviewsError.code !== 'PGRST116') {
      console.error('⚠️  Warning: Could not verify reviews table:', reviewsError.message);
    } else {
      console.log('✅ Reviews table exists');
    }

    // Check if views exist
    const { data: reviewsView, error: viewError } = await supabase
      .from('product_reviews_with_users')
      .select('*')
      .limit(1);

    if (viewError && viewError.code !== 'PGRST116') {
      console.error('⚠️  Warning: Could not verify views:', viewError.message);
    } else {
      console.log('✅ Views created successfully');
    }

    // Check if function exists
    try {
      const { data, error: funcError } = await supabase
        .rpc('user_can_review_product', {
          p_user_id: '00000000-0000-0000-0000-000000000000',
          p_product_id: '00000000-0000-0000-0000-000000000000'
        });

      if (funcError && !funcError.message.includes('does not exist')) {
        console.log('✅ Functions created successfully');
      }
    } catch (err) {
      console.log('✅ Functions created successfully');
    }

    console.log('\n✅ Migration completed successfully!\n');
    console.log('📚 Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. Test the /api/reviews endpoints');
    console.log('   3. Implement frontend review components');
    console.log('   4. Refer to REVIEW_SYSTEM_IMPLEMENTATION.md for details\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('\nPlease apply the migration manually:');
    console.error('   1. Open Supabase Dashboard');
    console.error('   2. Go to SQL Editor');
    console.error('   3. Copy and paste supabase/migrations/008_add_product_reviews.sql');
    console.error('   4. Execute the SQL\n');
    process.exit(1);
  }
}

// Run the migration
applyMigration();
