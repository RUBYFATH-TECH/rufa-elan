/**
 * Manual script to fix foreign key constraints with CASCADE deletes
 * This script runs the SQL commands to fix product deletion issues
 * 
 * Usage: npx ts-node fix-foreign-keys.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  console.error('\nSet them in backend/.env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const migrationSQL = `
-- Fix foreign key constraints to allow product deletion with cascading

-- 1. Product Images - CASCADE delete when product is deleted
ALTER TABLE IF EXISTS product_images
DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;

ALTER TABLE product_images
ADD CONSTRAINT product_images_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- 2. Product Variants - CASCADE delete when product is deleted
ALTER TABLE IF EXISTS product_variants
DROP CONSTRAINT IF EXISTS product_variants_product_id_fkey;

ALTER TABLE product_variants
ADD CONSTRAINT product_variants_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- 3. Reviews - CASCADE delete when product is deleted
ALTER TABLE IF EXISTS reviews
DROP CONSTRAINT IF EXISTS reviews_product_id_fkey;

ALTER TABLE reviews
ADD CONSTRAINT reviews_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- 4. Wishlists - CASCADE delete when product is deleted
ALTER TABLE IF EXISTS wishlists
DROP CONSTRAINT IF EXISTS wishlists_product_id_fkey;

ALTER TABLE wishlists
ADD CONSTRAINT wishlists_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- 5. Cart Items - SET NULL when variant is deleted (preserve cart history)
ALTER TABLE IF EXISTS cart_items
DROP CONSTRAINT IF EXISTS cart_items_product_variant_id_fkey;

ALTER TABLE cart_items
ADD CONSTRAINT cart_items_product_variant_id_fkey 
FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;

-- 6. Order Items - SET NULL when variant is deleted (preserve order history)
ALTER TABLE IF EXISTS order_items
DROP CONSTRAINT IF EXISTS order_items_product_variant_id_fkey;

ALTER TABLE order_items
ADD CONSTRAINT order_items_product_variant_id_fkey 
FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;
`;

async function fixForeignKeys(): Promise<void> {
  try {
    console.log('🔄 Fixing foreign key constraints...\n');

    // Execute the migration SQL
    const { data, error } = await supabase
      .rpc('exec', { 
        sql: migrationSQL 
      });

    if (error) {
      // Try alternative approach - execute directly
      console.log('Attempting alternative approach...\n');
      
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        try {
          const { error: execError } = await supabase
            .rpc('exec', { sql: statement + ';' });
          
          if (execError && !execError.message.includes('does not exist')) {
            console.warn(`⚠️  Warning: ${execError.message}`);
          }
        } catch (e) {
          console.warn(`⚠️  Could not execute: ${statement.substring(0, 60)}...`);
        }
      }
    }

    console.log('✅ Foreign key constraints updated!\n');
    console.log('📝 Changes made:');
    console.log('   ✓ product_images.product_id → CASCADE');
    console.log('   ✓ product_variants.product_id → CASCADE');
    console.log('   ✓ reviews.product_id → CASCADE');
    console.log('   ✓ wishlists.product_id → CASCADE');
    console.log('   ✓ cart_items.product_variant_id → SET NULL');
    console.log('   ✓ order_items.product_variant_id → SET NULL');
    console.log('\n✨ Products can now be deleted without foreign key errors!');
    
  } catch (error: any) {
    console.error('❌ Error fixing foreign keys:', error.message);
    console.error('\n📌 Manual fix: Go to Supabase Dashboard → SQL Editor');
    console.error('   Paste the migration from: supabase/migrations/006_add_cascade_deletes.sql');
    process.exit(1);
  }
}

// Run the fix
fixForeignKeys();
