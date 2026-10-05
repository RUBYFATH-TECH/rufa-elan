/**
 * Script to update variant stock quantities for testing
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateVariantStock() {
  console.log('🔄 Updating variant stock quantities...\n');

  // Get all product variants with 0 stock
  const { data: variants, error: variantsError } = await supabase
    .from('product_variants')
    .select('id, name, product_id, stock_quantity, products(id, name)')
    .eq('stock_quantity', 0)
    .limit(20);

  if (variantsError) {
    console.error('❌ Error fetching variants:', variantsError);
    return;
  }

  if (!variants || variants.length === 0) {
    console.log('✅ All variants already have stock!');
    return;
  }

  console.log(`Found ${variants.length} variants with 0 stock\n`);

  for (const variant of variants) {
    const product = (variant as any).products;
    const productName = product?.name || 'Unknown Product';
    
    console.log(`Updating: ${productName} - ${variant.name}`);
    
    // Set a default stock quantity of 50 for each variant
    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ stock_quantity: 50 })
      .eq('id', variant.id);

    if (updateError) {
      console.error(`  ❌ Error updating variant ${variant.id}:`, updateError);
    } else {
      console.log(`  ✅ Stock updated: 0 → 50`);
    }
  }

  console.log('\n✅ Stock update complete!');
  console.log('\n💡 Tip: Run "node -r ts-node/register check-is-in-stock.ts" to verify');
}

updateVariantStock()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
