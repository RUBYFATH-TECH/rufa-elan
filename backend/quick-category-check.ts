import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function quickCheck() {
  const { data, error } = await supabase
    .from('categories')
    .select('name, slug')
    .order('name');
  
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  
  console.log('Current categories:');
  data?.forEach((c: any) => console.log(`  ${c.name}`));
  
  process.exit(0);
}

quickCheck();
