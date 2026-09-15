import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function updateCategories() {
  console.log('=== UPDATING CATEGORIES TO MATCH UI ===\n');
  
  // Expected categories based on your screenshot
  const expectedCategories = [
    { name: 'Ladies bags', slug: 'ladies-bags' },
    { name: 'Ladies Footwears', slug: 'ladies-footwears' },
    { name: 'Ladies Watches', slug: 'ladies-watches' },
    { name: 'Ladies dresses', slug: 'ladies-dresses' },
    { name: 'Ladies Cosmetics', slug: 'ladies-cosmetics' },
    { name: 'Ladies glasses', slug: 'ladies-glasses' },
    { name: 'Accessories', slug: 'accessories' }
  ];
  
  for (const category of expectedCategories) {
    // Check if category exists
    const { data: existing } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('slug', category.slug)
      .single();
    
    if (existing) {
      console.log(`✅ ${category.name} already exists`);
    } else {
      // Insert new category
      const { error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          slug: category.slug,
          description: `${category.name} category`,
          is_active: true
        });
      
      if (error) {
        console.error(`❌ Error creating ${category.name}:`, error.message);
      } else {
        console.log(`✅ Created ${category.name}`);
      }
    }
  }
  
  console.log('\n=== FINAL CATEGORIES LIST ===\n');
  
  const { data: allCategories } = await supabase
    .from('categories')
    .select('name, slug')
    .order('name');
  
  allCategories?.forEach((cat: any) => {
    console.log(`  ${cat.name} (${cat.slug})`);
  });
  
  process.exit(0);
}

updateCategories().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
