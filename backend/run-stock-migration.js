const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Starting automatic stock deduction migration...\n');

  // Read the SQL file
  const sqlPath = path.join(__dirname, '../supabase/migrations/007_auto_stock_deduction.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  // Split into individual statements
  const statements = sqlContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => {
      // Filter out empty statements and comments
      return stmt.length > 0 && 
             !stmt.startsWith('--') && 
             stmt !== '';
    });

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let failCount = 0;

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    
    // Skip comment-only statements
    if (statement.trim().startsWith('COMMENT')) {
      console.log(`[${i + 1}/${statements.length}] Skipping comment...`);
      continue;
    }

    try {
      console.log(`[${i + 1}/${statements.length}] Executing statement...`);
      
      // Use the Supabase REST API to execute raw SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ sql: statement })
      });

      if (response.ok) {
        console.log(`  ✅ Success\n`);
        successCount++;
      } else {
        const error = await response.text();
        console.log(`  ⚠️  Failed: ${error}\n`);
        failCount++;
      }
    } catch (error) {
      console.log(`  ⚠️  Error: ${error.message}\n`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Migration completed: ${successCount} succeeded, ${failCount} failed`);
  console.log('='.repeat(60));

  if (failCount > 0) {
    console.log('\n⚠️  Some statements failed. You may need to run them manually.');
    console.log('📝 Go to: https://supabase.com/dashboard/project/rxvpxsoadadbodfskhky/sql');
    console.log('📄 Copy content from: supabase/migrations/007_auto_stock_deduction.sql');
  } else {
    console.log('\n✅ All triggers have been successfully created!');
    console.log('\n🎉 Stock deduction is now automatic!');
    console.log('   • Order items will automatically deduct stock');
    console.log('   • Cancelled orders will restore stock');
    console.log('   • Deleted order items will restore stock');
  }

  process.exit(failCount > 0 ? 1 : 0);
}

// Run the migration
runMigration().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
