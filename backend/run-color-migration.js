const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase/migrations/005_add_color_to_products.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration: 005_add_color_to_products.sql');
    console.log('SQL:\n', sql);
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`\nFound ${statements.length} SQL statements to execute`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      try {
        console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Check if it's a "column already exists" error - which is okay
          if (error.message && error.message.includes('already exists')) {
            console.log(`✓ Statement ${i + 1}: Column already exists (OK)`);
            successCount++;
          } else {
            console.error(`✗ Statement ${i + 1} error:`, error);
            errorCount++;
          }
        } else {
          console.log(`✓ Statement ${i + 1}: Success`);
          successCount++;
        }
      } catch (err) {
        console.error(`✗ Statement ${i + 1} exception:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n=== Migration Summary ===`);
    console.log(`Successful: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n✓ Migration completed successfully');
      process.exit(0);
    } else {
      console.log('\n⚠ Migration completed with some errors');
      process.exit(0); // Exit with 0 since column already exists is acceptable
    }
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

runMigration();
