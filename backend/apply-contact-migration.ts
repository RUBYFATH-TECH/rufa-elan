/**
 * Apply contact numbers migration to store_settings table
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🚀 Starting migration: Add contact numbers to store_settings');
  console.log('-----------------------------------------------------------');

  try {
    // Step 1: Check if columns already exist
    console.log('\n📋 Step 1: Checking existing table structure...');
    const { data: existingSettings, error: checkError } = await supabase
      .from('store_settings')
      .select('*')
      .limit(1)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking table:', checkError);
      throw checkError;
    }

    // Check if columns exist
    const hasWhatsappNumber = existingSettings && 'whatsapp_number' in existingSettings;
    const hasPhoneNumber = existingSettings && 'phone_number' in existingSettings;

    if (hasWhatsappNumber && hasPhoneNumber) {
      console.log('✅ Columns already exist! Checking if values need updating...');
      
      if (!existingSettings.whatsapp_number || !existingSettings.phone_number) {
        console.log('📝 Updating empty contact numbers with defaults...');
        const { error: updateError } = await supabase
          .from('store_settings')
          .update({
            whatsapp_number: existingSettings.whatsapp_number || '+905053783510',
            phone_number: existingSettings.phone_number || '+233241234567',
          })
          .eq('id', existingSettings.id);

        if (updateError) {
          console.error('❌ Error updating values:', updateError);
          throw updateError;
        }
        console.log('✅ Contact numbers updated successfully!');
      } else {
        console.log('✅ Contact numbers already configured:');
        console.log(`   - WhatsApp: ${existingSettings.whatsapp_number}`);
        console.log(`   - Phone: ${existingSettings.phone_number}`);
      }
      
      process.exit(0);
    }

    // Step 2: Add columns using raw SQL
    console.log('\n📝 Step 2: Adding whatsapp_number and phone_number columns...');
    
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE store_settings 
        ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20),
        ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
      `
    });

    // If RPC doesn't exist, we need to run SQL manually
    if (alterError) {
      console.log('⚠️  Cannot add columns automatically.');
      console.log('\n📋 Please run this SQL in your Supabase SQL Editor:');
      console.log('-----------------------------------------------------------');
      console.log(`
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

UPDATE store_settings 
SET 
  whatsapp_number = '+905053783510',
  phone_number = '+233241234567'
WHERE whatsapp_number IS NULL OR phone_number IS NULL;
      `);
      console.log('-----------------------------------------------------------');
      console.log('\n🔗 Go to: https://supabase.com/dashboard/project/rxvpxsoadadbodfskhky/sql/new');
      process.exit(1);
    }

    console.log('✅ Columns added successfully!');

    // Step 3: Update existing records with default values
    console.log('\n📝 Step 3: Setting default contact numbers...');
    const { data: settings, error: fetchError } = await supabase
      .from('store_settings')
      .select('id')
      .limit(1)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching settings:', fetchError);
      throw fetchError;
    }

    const { error: updateError } = await supabase
      .from('store_settings')
      .update({
        whatsapp_number: '+905053783510',
        phone_number: '+233241234567',
      })
      .eq('id', settings.id);

    if (updateError) {
      console.error('❌ Error updating values:', updateError);
      throw updateError;
    }

    console.log('✅ Default contact numbers set successfully!');

    // Step 4: Verify migration
    console.log('\n🔍 Step 4: Verifying migration...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('store_settings')
      .select('whatsapp_number, phone_number')
      .limit(1)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
      throw verifyError;
    }

    console.log('✅ Migration verified successfully!');
    console.log('\n📱 Contact Numbers:');
    console.log(`   - WhatsApp: ${verifyData.whatsapp_number}`);
    console.log(`   - Phone: ${verifyData.phone_number}`);
    console.log('\n✨ Migration completed successfully!');
    console.log('🎉 You can now manage contact numbers in Admin Settings.');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
applyMigration();
