/**
 * Script to apply the selected_image_url migration to cart_items table
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🔄 Applying migration: add selected_image_url to cart_items...\n');

  try {
    // Try to select the column to see if it already exists
    const { data: testData, error: testError } = await supabase
      .from('cart_items')
      .select('id, selected_image_url')
      .limit(1);
    
    if (!testError) {
      console.log('✅ Column already exists! Migration not needed.');
      console.log('✅ Verified: selected_image_url column exists in cart_items table');
      return;
    }

    console.log('Column does not exist yet. Please apply the migration manually.');
    console.log('\nOption 1: Run this SQL in your Supabase SQL Editor:');
    console.log('----------------------------------------');
    
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '017_add_selected_image_to_cart_items.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log(sql);
    console.log('----------------------------------------\n');
    
    console.log('Option 2: Use Supabase CLI:');
    console.log('  supabase db push\n');

  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

applyMigration();
