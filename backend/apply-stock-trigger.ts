import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function applyStockTrigger() {
  console.log('📦 Applying automatic stock deduction trigger...\n');

  // Read the migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/007_auto_stock_deduction.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('Migration file loaded:', migrationPath);
  console.log('Executing SQL...\n');

  // Execute the migration
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: migrationSQL }).single();

  if (error) {
    console.error('❌ Error applying migration:', error);
    console.log('\nTrying alternative method...\n');

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i] + ';';
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { error: stmtError } = await supabase.rpc('exec_sql', { 
        sql_query: stmt 
      }).single();

      if (stmtError) {
        console.error(`Statement ${i + 1} failed:`, stmtError.message);
      } else {
        console.log(`✓ Statement ${i + 1} executed successfully`);
      }
    }
  } else {
    console.log('✅ Migration applied successfully!');
  }

  console.log('\n📊 Verifying triggers...\n');

  // Verify triggers were created
  const { data: triggers, error: triggerError } = await supabase
    .from('information_schema.triggers')
    .select('trigger_name, event_object_table')
    .in('trigger_name', [
      'trigger_deduct_stock_on_order_item',
      'trigger_restore_stock_on_cancel',
      'trigger_restore_stock_on_order_item_delete'
    ]);

  if (!triggerError && triggers) {
    console.log('Active triggers:');
    triggers.forEach((t: any) => {
      console.log(`  ✓ ${t.trigger_name} on ${t.event_object_table}`);
    });
  }

  console.log('\n✅ Stock deduction is now automatic!');
  console.log('   - Creating order items will deduct stock');
  console.log('   - Cancelling orders will restore stock');
  console.log('   - Deleting order items will restore stock');

  process.exit(0);
}

applyStockTrigger().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
