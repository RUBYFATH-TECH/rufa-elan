import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkCategories() {
  console.log('\n📦 Checking Categories\n');
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }
  
  if (data && data.length > 0) {
    console.log(`✅ Found ${data.length} categories:\n`);
    data.forEach((cat: any, idx: number) => {
      console.log(`${idx + 1}. ${cat.name}`);
      console.log(`   ID: ${cat.id}`);
      console.log(`   Slug: ${cat.slug}`);
      console.log();
    });
  } else {
    console.log('❌ No categories found - need to create them!\n');
    console.log('Use this SQL to create categories:');
    console.log(`
INSERT INTO categories (name, slug, description, sort_order, is_active)
VALUES
  ('Handbags', 'handbags', 'Handbags collection', 1, true),
  ('Tote bags', 'tote-bags', 'Tote bags collection', 2, true),
  ('Crossbags', 'crossbags', 'Crossbags collection', 3, true),
  ('Purse', 'purse', 'Purse collection', 4, true),
  ('Wallet', 'wallet', 'Wallet collection', 5, true),
  ('Accessories', 'accessories', 'Accessories collection', 6, true);
    `);
  }
}

checkCategories();
