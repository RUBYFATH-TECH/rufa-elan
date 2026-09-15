import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function assignCategories() {
  console.log('=== ASSIGNING PRODUCTS TO CORRECT CATEGORIES ===\n');
  
  // Get all products
  const { data: products } = await supabase
    .from('products')
    .select('id, name, category_id')
    .eq('status', 'active');
  
  if (!products) {
    console.log('No products found');
    return;
  }
  
  console.log(`Found ${products.length} products\n`);
  
  // Get category IDs
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug');
  
  const catMap = new Map(categories?.map(c => [c.slug, c.id]) || []);
  
  // Product to category mapping based on product names
  const assignments: { [key: string]: string } = {
    'Premium': 'ladies-bags',
    'Premium bag': 'ladies-bags',
    'kaman': 'ladies-cosmetics',
    'glasses': 'ladies-glasses',
    'Elegant Dress': 'ladies-dresses',
    'Wrist watches': 'ladies-watches'
  };
  
  for (const product of products) {
    const categorySlug = assignments[product.name];
    
    if (categorySlug) {
      const categoryId = catMap.get(categorySlug);
      
      if (categoryId) {
        const { error } = await supabase
          .from('products')
          .update({ category_id: categoryId })
          .eq('id', product.id);
        
        if (error) {
          console.log(`❌ ${product.name}: Error - ${error.message}`);
        } else {
          console.log(`✅ ${product.name} → ${categorySlug.replace(/-/g, ' ')}`);
        }
      }
    } else {
      console.log(`⚠️  ${product.name}: No category mapping defined`);
    }
  }
  
  console.log('\n=== VERIFICATION ===\n');
  
  const { data: updatedProducts } = await supabase
    .from('products')
    .select(`
      name,
      categories!inner(name)
    `)
    .eq('status', 'active');
  
  updatedProducts?.forEach((p: any) => {
    console.log(`${p.name} → ${p.categories.name}`);
  });
  
  process.exit(0);
}

assignCategories().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
