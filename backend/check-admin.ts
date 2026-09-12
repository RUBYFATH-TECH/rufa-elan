/**
 * Admin Status Checker
 * Run with: npx ts-node backend/check-admin.ts
 * 
 * This script checks:
 * 1. Connection to Supabase
 * 2. All users in the system
 * 3. All admin users in admin_users table
 * 4. Helps troubleshoot admin access issues
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminStatus() {
  console.log('\n🔍 ADMIN STATUS CHECKER\n');
  console.log('=' .repeat(60));

  try {
    // Check 1: Connection
    console.log('\n✓ Connected to Supabase');
    console.log(`  Project: ${supabaseUrl?.split('.supabase.co')[0]}\n`);

    // Check 2: Get all users from auth
    console.log('📋 All Users in Supabase Auth:');
    console.log('-'.repeat(60));
    
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
    } else if (users && users.length > 0) {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Created: ${user.created_at}`);
        console.log(`   Last sign in: ${user.last_sign_in_at || 'Never'}`);
        console.log();
      });
    } else {
      console.log('   (No users found)');
    }

    // Check 3: Get admin users from database
    console.log('\n📋 Admin Users in Database:');
    console.log('-'.repeat(60));
    
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*');

    if (adminError) {
      console.error('❌ Error fetching admin users:', adminError.message);
    } else if (adminUsers && adminUsers.length > 0) {
      adminUsers.forEach((admin: any, index: number) => {
        console.log(`${index + 1}. ${admin.email}`);
        console.log(`   Full Name: ${admin.full_name}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Created: ${admin.created_at}`);
        console.log();
      });
    } else {
      console.log('   (No admin users found - THIS IS THE PROBLEM!)');
      console.log('   → Run this SQL in Supabase to add an admin:');
      console.log('   INSERT INTO admin_users (email, full_name, role)');
      console.log('   VALUES (\'your-email@example.com\', \'Your Name\', \'admin\');');
    }

    // Check 4: Match check
    console.log('\n✓ ADMIN MATCHING CHECK:');
    console.log('-'.repeat(60));
    
    if (users && users.length > 0 && adminUsers && adminUsers.length > 0) {
      const adminEmails = new Set(adminUsers.map((a: any) => a.email.toLowerCase()));
      const matchedUsers = users.filter(u => adminEmails.has(u.email?.toLowerCase()));
      
      if (matchedUsers.length > 0) {
        console.log(`✅ Found ${matchedUsers.length} admin user(s):`);
        matchedUsers.forEach(u => {
          console.log(`   → ${u.email} (ADMIN ACCESS ✓)`);
        });
      } else {
        console.log('❌ No users match the admin emails!');
        console.log('   Registered users:');
        users.forEach(u => {
          console.log(`   → ${u.email} (not in admin_users table)`);
        });
        console.log('\n   → You need to add these emails to admin_users table:');
        console.log('   INSERT INTO admin_users (email, full_name, role) VALUES');
        users.map((u, i) => `('${u.email}', '${u.email}', 'admin')${i < users.length - 1 ? ',' : ';'}`).forEach(line => console.log(`   ${line}`));
      }
    } else if (!users || users.length === 0) {
      console.log('❌ No users registered yet');
      console.log('   → Create an account first');
    } else if (!adminUsers || adminUsers.length === 0) {
      console.log('❌ No admin users configured');
      console.log('   → Add admin users to the admin_users table');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

checkAdminStatus();
