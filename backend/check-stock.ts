/**
 * Debug script to check product stock in database
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStock() {
  console.log('🔍 Checking product stock...\n');

  // Get all products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, slug, status')
    .limit(10);

  if (productsError) {
    console.error('❌ Error fetching products:', productsError);
    return;
  }

  console.log(`📦 Found ${products?.length} products\n`);

  for (const product of products || []) {
    console.log(`\n📦 Product: ${product.name} (${product.status})`);
    console.log(`   ID: ${product.id}`);
    console.log(`   Slug: ${product.slug}`);

    // Get variants for this product
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id);

    if (variantsError) {
      console.error('   ❌ Error fetching variants:', variantsError);
      continue;
    }

    if (!variants || variants.length === 0) {
      console.log('   ⚠️  NO VARIANTS FOUND');
      continue;
    }

    console.log(`   ✅ ${variants.length} variant(s):`);
    
    let totalStock = 0;
    variants.forEach((v, i) => {
      console.log(`      ${i + 1}. ${v.name} (${v.value}): ${v.stock_quantity || 0} units`);
      totalStock += v.stock_quantity || 0;
    });

    console.log(`   📊 Total Stock: ${totalStock}`);

    // Get category
    const { data: category } = await supabase
      .from('categories')
      .select('name')
      .eq('id', product.category_id)
      .single();

    if (category) {
      console.log(`   🏷️  Category: ${category.name}`);
    }
  }
}

checkStock()
  .then(() => {
    console.log('\n✅ Stock check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
