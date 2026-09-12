const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://rxvpxsoadadbodfskhky.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4dnB4c29hZGFkYm9kZnNraGt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MzQ3NzAwMCwiZXhwIjoxOTI5MDk3MDAwfQ.nT0m-fgFd-k-6QBnYDVGlbC0EaMd6lRsLj-2YNCLVKc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migrationSql = fs.readFileSync('supabase/migrations/003_store_settings.sql', 'utf8');

supabase.rpc('exec_sql', { sql: migrationSql })
  .then(({ data, error }) => {
    if (error) {
      console.error('Error applying migration:', error);
    } else {
      console.log('Migration applied successfully');
    }
    process.exit(error ? 1 : 0);
  });
