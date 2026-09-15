import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testProductAPI() {
  console.log('=== TESTING PRODUCT API QUERY ===\n');
  
  // Test the exact query used in the API
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories!inner(id, name, slug),
      product_images(id, url, position, is_primary),
      product_variants(id, name, value, price, stock_quantity)
    `)
    .eq('status', 'active')
    .limit(5);
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`✅ Found ${data?.length} products\n`);
  
  data?.forEach((product: any) => {
    console.log(`\n📦 ${product.name}`);
    console.log(`   ID: ${product.id}`);
    console.log(`   Status: ${product.status}`);
    console.log(`   Category ID: ${product.category_id}`);
    console.log(`   Category Object:`, product.categories);
    
    if (product.product_variants) {
      const totalStock = product.product_variants.reduce(
        (sum: number, v: any) => sum + (v.stock_quantity || 0),
        0
      );
      console.log(`   Variants: ${product.product_variants.length}`);
      console.log(`   Total Stock: ${totalStock}`);
      product.product_variants.forEach((v: any) => {
        console.log(`      - ${v.name} (${v.value}): ${v.stock_quantity} units`);
      });
    } else {
      console.log(`   ⚠️  NO VARIANTS DATA`);
    }
    
    if (product.product_images) {
      console.log(`   Images: ${product.product_images.length}`);
    }
  });
}

testProductAPI()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
