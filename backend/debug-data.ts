import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function debugData() {
  console.log('=== CHECKING PRODUCTS AND CATEGORIES ===\n');
  
  const { data: products, error: pError } = await supabase
    .from('products')
    .select('id, name, category_id, status')
    .limit(6);
  
  if (pError) console.error('Products error:', pError);
  
  console.log('Products:');
  products?.forEach(p => {
    console.log(`  - ${p.name}`);
    console.log(`    category_id: ${p.category_id}`);
    console.log(`    status: ${p.status}`);
  });
  
  console.log('\n=== CHECKING CATEGORIES ===\n');
  const { data: categories, error: cError } = await supabase
    .from('categories')
    .select('id, name, slug');
  
  if (cError) console.error('Categories error:', cError);
  
  console.log('Categories in database:');
  categories?.forEach(c => {
    console.log(`  - ${c.name}`);
    console.log(`    slug: ${c.slug}`);
    console.log(`    id: ${c.id}`);
  });
  
  console.log('\n=== CHECKING VARIANTS WITH STOCK ===\n');
  const { data: variants, error: vError } = await supabase
    .from('product_variants')
    .select('product_id, name, value, stock_quantity');
  
  if (vError) console.error('Variants error:', vError);
  
  console.log('Variants:');
  variants?.forEach(v => {
    console.log(`  - Stock: ${v.stock_quantity} | ${v.name}: ${v.value}`);
  });
  
  console.log('\n=== MATCHING PRODUCTS TO CATEGORIES ===\n');
  if (products && categories) {
    products.forEach(p => {
      const matchedCat = categories.find(c => c.id === p.category_id);
      console.log(`${p.name} -> ${matchedCat ? matchedCat.name : 'NO MATCH'}`);
    });
  }
}

debugData()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
