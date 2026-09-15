/**
 * Script to add stock to products for testing
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addStock() {
  console.log('📦 Adding stock to products...\n');

  // Get all product variants
  const { data: variants, error: variantsError } = await supabase
    .from('product_variants')
    .select('*');

  if (variantsError) {
    console.error('❌ Error fetching variants:', variantsError);
    return;
  }

  console.log(`Found ${variants?.length} variants\n`);

  // Update stock for each variant with random amounts
  const stockLevels = [
    5,   // Low stock (< 20)
    15,  // Low stock
    25,  // Normal stock
    50,  // Normal stock
    100, // High stock
    0    // Out of stock (to test out of stock display)
  ];

  let updated = 0;
  for (const variant of variants || []) {
    const stockQuantity = stockLevels[Math.floor(Math.random() * stockLevels.length)];
    
    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ stock_quantity: stockQuantity })
      .eq('id', variant.id);

    if (updateError) {
      console.error(`❌ Error updating variant ${variant.id}:`, updateError);
    } else {
      console.log(`✅ Updated ${variant.name} (${variant.value}): ${stockQuantity} units`);
      updated++;
    }
  }

  console.log(`\n✅ Updated ${updated} variants with stock`);

  // Now check the products to see their total stock
  console.log('\n📊 Product Stock Summary:\n');
  
  const { data: products } = await supabase
    .from('products')
    .select(`
      id,
      name,
      product_variants (
        stock_quantity
      )
    `)
    .limit(10);

  for (const product of products || []) {
    const totalStock = (product.product_variants || []).reduce(
      (sum: number, v: any) => sum + (v.stock_quantity || 0),
      0
    );
    
    const status = totalStock === 0 ? '🔴 OUT OF STOCK' : totalStock < 20 ? '🟡 LOW STOCK' : '🟢 IN STOCK';
    console.log(`${status} ${product.name}: ${totalStock} units`);
  }
}

addStock()
  .then(() => {
    console.log('\n✅ Stock update complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
