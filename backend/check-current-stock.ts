import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkStock() {
  console.log('Checking current stock levels...\n');

  const { data: variants, error } = await supabase
    .from('product_variants')
    .select(`
      id,
      name,
      value,
      sku,
      stock_quantity,
      products (
        id,
        name
      )
    `)
    .order('stock_quantity', { ascending: false });

  if (error) {
    console.error('Error fetching variants:', error);
    return;
  }

  console.log('Product Stock Levels:\n');
  console.log('='.repeat(80));
  
  variants?.forEach((variant: any) => {
    const productName = variant.products?.name || 'Unknown Product';
    const variantInfo = variant.name || variant.value || 'Standard';
    console.log(`${productName} (${variantInfo})`);
    console.log(`  SKU: ${variant.sku}`);
    console.log(`  Stock: ${variant.stock_quantity} available`);
    console.log('-'.repeat(80));
  });

  process.exit(0);
}

checkStock();
