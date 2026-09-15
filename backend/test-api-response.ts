import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testAPIResponse() {
  console.log('=== TESTING WHAT API RETURNS ===\n');
  
  // This mimics what the API does
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories!inner(id, name, slug),
      product_images(id, url, position, is_primary),
      product_variants(id, name, value, price, stock_quantity)
    `)
    .eq('status', 'active')
    .limit(3);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Products returned:\n');
  
  data?.forEach((product: any) => {
    // Calculate stock
    const totalStock = (product.product_variants || []).reduce(
      (sum: number, v: any) => sum + (v.stock_quantity || 0),
      0
    );
    
    console.log(`Product: ${product.name}`);
    console.log(`  category_id: ${product.category_id}`);
    console.log(`  categories object:`, product.categories);
    console.log(`  stock_quantity: ${totalStock}`);
    console.log(`  in_stock: ${totalStock > 0}`);
    console.log(`  low_stock: ${totalStock > 0 && totalStock < 20}`);
    console.log('');
  });
  
  console.log('\n=== WHAT FRONTEND SHOULD DISPLAY ===\n');
  
  data?.forEach((product: any) => {
    const totalStock = (product.product_variants || []).reduce(
      (sum: number, v: any) => sum + (v.stock_quantity || 0),
      0
    );
    
    const categoryName = product.categories?.name || 'Uncategorized';
    const categorySlug = product.categories?.slug || '';
    
    console.log(`${product.name}:`);
    console.log(`  Display Category: "${categoryName}"`);
    console.log(`  Category Slug: "${categorySlug}"`);
    console.log(`  Stock: ${totalStock} units`);
    console.log('');
  });
}

testAPIResponse()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
