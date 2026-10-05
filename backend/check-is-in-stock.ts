/**
 * Check if products have is_in_stock field set correctly
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIsInStock() {
  console.log('🔍 Checking is_in_stock field...\n');

  // Get all products with their is_in_stock status
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, is_in_stock, status')
    .limit(10);

  if (productsError) {
    console.error('❌ Error fetching products:', productsError);
    return;
  }

  console.log(`📦 Found ${products?.length} products\n`);

  for (const product of products || []) {
    console.log(`📦 ${product.name}`);
    console.log(`   Status: ${product.status}`);
    console.log(`   is_in_stock: ${product.is_in_stock ?? 'NULL (will default to true)'}`);

    // Get variants for this product
    const { data: variants } = await supabase
      .from('product_variants')
      .select('stock_quantity')
      .eq('product_id', product.id);

    const totalStock = (variants || []).reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
    console.log(`   Total stock from variants: ${totalStock}`);
    
    const hasStock = totalStock > 0;
    const isManuallyInStock = product.is_in_stock !== false;
    const shouldShowInStock = isManuallyInStock && hasStock;
    
    console.log(`   👉 Should show as: ${shouldShowInStock ? '✅ IN STOCK' : '❌ OUT OF STOCK'}`);
    console.log('');
  }
}

checkIsInStock()
  .then(() => {
    console.log('✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
