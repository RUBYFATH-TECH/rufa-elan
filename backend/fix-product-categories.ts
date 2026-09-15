import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixProductCategories() {
  console.log('=== FIXING PRODUCT CATEGORIES ===\n');
  
  // Get all categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name, slug');
  
  if (catError) {
    console.error('Error fetching categories:', catError);
    return;
  }
  
  console.log('Available Categories:');
  categories?.forEach((cat, i) => {
    console.log(`  ${i + 1}. ${cat.name} (${cat.slug})`);
  });
  
  // Get all products
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name, category_id');
  
  if (prodError) {
    console.error('Error fetching products:', prodError);
    return;
  }
  
  console.log('\n=== CURRENT PRODUCT CATEGORIES ===\n');
  
  for (const product of products || []) {
    const currentCat = categories?.find(c => c.id === product.category_id);
    console.log(`${product.name} -> ${currentCat?.name || 'UNKNOWN'}`);
  }
  
  // Category mapping - adjust based on product type
  const categoryMapping: Record<string, string> = {
    // Map products to correct categories based on their names
    'Premium': 'handbags',           // Handbag
    'Premium bag': 'tote-bags',      // Already correct (Tote bags)
    'Elegant Dress': 'accessories',   // Already correct (Accessories)
    'kaman': 'ladies-cosmetics',     // Already correct (Ladies Cosmetics) 
    'glasses': 'accessories',         // Already correct (Accessories)
    'Wrist watches': 'accessories'    // Already correct (Accessories)
  };
  
  console.log('\n=== UPDATING PRODUCT CATEGORIES ===\n');
  
  for (const product of products || []) {
    const targetSlug = categoryMapping[product.name];
    
    if (!targetSlug) {
      console.log(`⚠️  No mapping for: ${product.name}`);
      continue;
    }
    
    const targetCat = categories?.find(c => c.slug === targetSlug);
    
    if (!targetCat) {
      console.log(`❌ Category not found for slug: ${targetSlug}`);
      continue;
    }
    
    // Check if already correct
    if (product.category_id === targetCat.id) {
      console.log(`✅ ${product.name} -> ${targetCat.name} (already correct)`);
      continue;
    }
    
    // Update the product
    const { error: updateError } = await supabase
      .from('products')
      .update({ category_id: targetCat.id })
      .eq('id', product.id);
    
    if (updateError) {
      console.log(`❌ Failed to update ${product.name}:`, updateError.message);
    } else {
      console.log(`✅ Updated ${product.name} -> ${targetCat.name}`);
    }
  }
  
  console.log('\n=== FINAL PRODUCT CATEGORIES ===\n');
  
  // Fetch updated products
  const { data: updatedProducts } = await supabase
    .from('products')
    .select('id, name, category_id');
  
  for (const product of updatedProducts || []) {
    const cat = categories?.find(c => c.id === product.category_id);
    console.log(`${product.name} -> ${cat?.name || 'UNKNOWN'}`);
  }
  
  console.log('\n✅ Category fix complete!');
}

fixProductCategories()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
