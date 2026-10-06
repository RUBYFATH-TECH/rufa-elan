/**
 * Fix products with zero stock variants
 * Sets stock quantity to 100 for default variants that have 0 stock
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixZeroStock() {
  console.log('🔧 Fixing products with zero stock...\n');

  // Get all product variants with 0 stock
  const { data: zeroStockVariants, error: variantsError } = await supabase
    .from('product_variants')
    .select('id, product_id, name, stock_quantity, is_default')
    .eq('stock_quantity', 0);

  if (variantsError) {
    console.error('❌ Error fetching variants:', variantsError);
    process.exit(1);
  }

  if (!zeroStockVariants || zeroStockVariants.length === 0) {
    console.log('✅ No variants with zero stock found. All products are properly stocked.');
    process.exit(0);
  }

  console.log(`Found ${zeroStockVariants.length} variants with zero stock\n`);

  let updatedCount = 0;
  let errorCount = 0;

  for (const variant of zeroStockVariants) {
    try {
      // Get product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name')
        .eq('id', variant.product_id)
        .single();

      if (productError) {
        console.error(`❌ Error fetching product ${variant.product_id}:`, productError);
        errorCount++;
        continue;
      }

      console.log(`📦 Updating: ${product.name}`);
      console.log(`   Variant: ${variant.name} (${variant.is_default ? 'Default' : 'Custom'})`);
      console.log(`   Current stock: ${variant.stock_quantity}`);

      // Update stock to 100
      const { error: updateError } = await supabase
        .from('product_variants')
        .update({ stock_quantity: 100 })
        .eq('id', variant.id);

      if (updateError) {
        console.error(`   ❌ Failed to update: ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`   ✅ Stock updated to: 100\n`);
        updatedCount++;
      }
    } catch (error) {
      console.error(`   ❌ Unexpected error:`, error);
      errorCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Updated: ${updatedCount} variants`);
  if (errorCount > 0) {
    console.log(`   ❌ Errors: ${errorCount} variants`);
  }
  console.log('\n✅ Done!');
}

fixZeroStock().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
