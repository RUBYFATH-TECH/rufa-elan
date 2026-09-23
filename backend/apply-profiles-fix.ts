import { supabaseAdmin } from './src/utils/supabase';
import fs from 'fs';
import path from 'path';

/**
 * Apply the profiles policy recursion fix migration
 */

async function applyMigration() {
  try {
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '014_fix_profiles_policy_recursion.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`Migration file not found: ${migrationPath}`);
      return false;
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Applying migration: 014_fix_profiles_policy_recursion.sql');
    console.log('---');
    
    // Execute the SQL directly
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Migration failed:', error);
      
      // Try executing statements one by one if bulk execution fails
      console.log('\nTrying to execute statements individually...');
      
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      console.log(`Found ${statements.length} SQL statements`);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';';
        console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
        
        try {
          const { error: stmtError } = await supabaseAdmin.rpc('exec_sql', { sql: statement });
          
          if (stmtError) {
            console.error(`Statement ${i + 1} error:`, stmtError.message);
            // Continue with next statement
          } else {
            console.log(`✓ Statement ${i + 1} executed successfully`);
          }
        } catch (err: any) {
          console.error(`Statement ${i + 1} exception:`, err.message);
        }
      }
    } else {
      console.log('✓ Migration applied successfully');
    }
    
    console.log('\nMigration process completed');
    return true;
  } catch (error) {
    console.error('Migration runner failed:', error);
    return false;
  }
}

// Run migration
applyMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
