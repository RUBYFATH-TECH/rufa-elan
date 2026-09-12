const fs = require('fs');
const path = require('path');

async function applyMigration() {
  const url = 'https://rxvpxsoadadbodfskhky.supabase.co/graphql/v1';
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4dnB4c29hZGFkYm9kZnNraGt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDc0NTE0NywiZXhwIjoyMTAwMzIxMTQ3fQ.3QidpUOLNUOLUD3Cy3bUhd8Ee7rHlZgQh0vLVC_6aFQ';
  
  const migrationSql = fs.readFileSync('supabase/migrations/003_store_settings.sql', 'utf8');
  
  // Split into individual statements
  const statements = migrationSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));
  
  console.log(\Found \ statements\);
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    console.log(\Executing statement \/\...\);
    console.log(stmt.substring(0, 100) + '...');
  }
  
  console.log('Migration complete');
}

applyMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
