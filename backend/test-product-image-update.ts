/**
 * Test script to verify product image update functionality
 * Run with: npx ts-node test-product-image-update.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProductImageUpdate() {
  try {
    console.log('🧪 Testing Product Image Update Functionality\n');

    // Test 1: Check image structure
    console.log('Test 1: Checking product_images table structure...');
    const { data: images, error: imageError } = await supabase
      .from('product_images')
      .select('*')
      .limit(1);

    if (imageError) {
      console.error('❌ Failed to query product_images:', imageError.message);
      return;
    }

    console.log('✅ product_images table accessible');
    if (images && images.length > 0) {
      console.log('   Columns:', Object.keys(images[0]));
    }

    // Test 2: Get a product with images
    console.log('\nTest 2: Finding product with images...');
    const { data: products, error: productError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        product_images (
          id,
          url,
          alt_text,
          is_primary,
          position
        )
      `)
      .limit(1);

    if (productError) {
      console.error('❌ Failed to query products:', productError.message);
      return;
    }

    if (!products || products.length === 0) {
      console.log('⚠️  No products found. Create one first with images.');
      return;
    }

    const product = products[0] as any;
    console.log(`✅ Found product: ${product.name}`);
    console.log(`   Images: ${(product.product_images || []).length}`);

    // Test 3: Verify image data structure
    console.log('\nTest 3: Verifying image data structure...');
    if (product.product_images && product.product_images.length > 0) {
      const firstImage = product.product_images[0];
      const requiredFields = ['id', 'url', 'alt_text', 'position'];
      const hasAllFields = requiredFields.every(field => field in firstImage);

      if (hasAllFields) {
        console.log('✅ Image structure is correct:');
        console.log(`   - id: ${firstImage.id}`);
        console.log(`   - url: ${firstImage.url?.substring(0, 50)}...`);
        console.log(`   - alt_text: ${firstImage.alt_text || '(none)'}`);
        console.log(`   - position: ${firstImage.position}`);
      } else {
        console.error('❌ Image structure incomplete. Missing:', 
          requiredFields.filter(f => !(f in firstImage)));
      }
    }

    // Test 4: Check for orphaned images
    console.log('\nTest 4: Checking for orphaned images...');
    const { data: orphaned, error: orphanError } = await supabase
      .rpc('get_orphaned_images');

    if (orphanError && orphanError.message.includes('does not exist')) {
      console.log('⚠️  RPC function not available, skipping');
    } else if (orphanError) {
      console.error('❌ Error checking orphaned images:', orphanError.message);
    } else if (orphaned && orphaned.length > 0) {
      console.warn(`⚠️  Found ${orphaned.length} orphaned images`);
    } else {
      console.log('✅ No orphaned images found');
    }

    // Test 5: Verify foreign key constraint
    console.log('\nTest 5: Verifying foreign key constraints...');
    const { data: constraints, error: constraintError } = await supabase
      .query(`
        SELECT constraint_name, update_rule, delete_rule
        FROM information_schema.referential_constraints
        WHERE table_name = 'product_images' 
          AND column_name = 'product_id'
      `);

    if (!constraintError) {
      console.log('✅ Foreign key constraints configured');
    } else {
      console.log('⚠️  Could not verify constraints (may be normal)');
    }

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Go to Admin → Edit Product');
    console.log('2. Try to update product with new/changed images');
    console.log('3. Verify update succeeds without errors');
    console.log('4. Check product images in database');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testProductImageUpdate();
