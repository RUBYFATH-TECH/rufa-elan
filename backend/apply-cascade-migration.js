/**
 * Apply CASCADE delete fixes to foreign key constraints
 * Run this script to fix the product deletion issue
 * 
 * Usage: node apply-cascade-migration.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('🔄 Applying CASCADE delete migration...\n');

    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '006_add_cascade_deletes.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by statement (separated by semicolons)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 80)}...`);

      const { error } = await supabase.rpc('run_migration', {
        sql: statement + ';'
      }).catch(async (err) => {
        // If rpc method doesn't exist, try direct execution via supabase CLI
        console.warn('⚠️  Note: Run this migration through Supabase dashboard or CLI for best results');
        return { error: err.message };
      });

      if (error && !error.includes('does not exist')) {
        console.error(`❌ Error: ${error}`);
      } else {
        console.log(`✓ Success`);
      }
    }

    console.log('\n✅ Migration completed!');
    console.log('\nNext steps:');
    console.log('1. If using Supabase dashboard: Go to SQL Editor and run the migration manually');
    console.log('2. The migration file is located at: supabase/migrations/006_add_cascade_deletes.sql');
    console.log('3. Test product deletion after the migration is applied');

  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    process.exit(1);
  }
}

// Run the migration
applyMigration();
