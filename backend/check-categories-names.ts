import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkCategories() {
  console.log('=== CHECKING CATEGORIES IN DATABASE ===\n');
  
  // Get all categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (catError) {
    console.error('Error fetching categories:', catError);
    return;
  }
  
  console.log('Categories in database:\n');
  categories?.forEach((cat: any) => {
    console.log(`  - ${cat.name} (slug: ${cat.slug})`);
  });
  
  console.log('\n=== EXPECTED CATEGORIES ===\n');
  const expectedCategories = [
    'Ladies bags',
    'Ladies Footwears',
    'Ladies Watches',
    'Ladies dresses',
    'Ladies Cosmetics',
    'Ladies glasses',
    'Accessories'
  ];
  
  expectedCategories.forEach(name => {
    const exists = categories?.find((c: any) => c.name === name);
    if (exists) {
      console.log(`  ✅ ${name} - EXISTS`);
    } else {
      console.log(`  ❌ ${name} - MISSING`);
    }
  });
  
  console.log('\n=== PRODUCTS AND THEIR CATEGORIES ===\n');
  
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select(`
      name,
      category_id,
      categories!inner(name, slug)
    `)
    .eq('status', 'active');
  
  if (prodError) {
    console.error('Error fetching products:', prodError);
    return;
  }
  
  products?.forEach((prod: any) => {
    console.log(`Product: ${prod.name}`);
    console.log(`  Category: ${prod.categories.name}`);
    console.log('');
  });
}

checkCategories()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
